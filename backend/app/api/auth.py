import os
import requests
import jwt
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

security = HTTPBearer(auto_error=False)

_cached_public_keys = {}

def get_public_keys():
    global _cached_public_keys
    if _cached_public_keys:
        return _cached_public_keys
        
    if not CLERK_SECRET_KEY:
        raise ValueError("CLERK_SECRET_KEY is missing from .env")
        
    headers = {"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
    resp = requests.get("https://api.clerk.com/v1/jwks", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Could not fetch JWKS from Clerk.")
    
    jwks_data = resp.json()
    keys = {}
    for jwk in jwks_data.get("keys", []):
        kid = jwk.get("kid")
        keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
        
    _cached_public_keys = keys
    return keys

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not CLERK_SECRET_KEY:
        # Seamless offline development mode
        import logging
        logging.warning("CLERK_SECRET_KEY is missing. Operating in offline DEV_MODE with mock authentication.")
        # We can extract a role from headers if the frontend sends a mock one, 
        # but defaulting to ADMIN is safest for dev. Or we can let the frontend send it via a custom header.
        return {"public_metadata": {"role": "ADMIN"}, "role": "ADMIN"}

    if not credentials:
        raise HTTPException(status_code=403, detail="Not authenticated")

    token = credentials.credentials
    try:
        public_keys = get_public_keys()

        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        # If kid is missing or not in cache, refresh the cache once just in case the key was rolled
        if not kid or kid not in public_keys:
            global _cached_public_keys
            _cached_public_keys = {} # clear cache
            public_keys = get_public_keys()
            
        if not kid or kid not in public_keys:
            raise HTTPException(status_code=401, detail="Invalid token signature.")
        
        public_key = public_keys[kid]
        
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False} # Frontend app handles audience
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def require_role(allowed_roles: List[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        # Check Clerk's standard metadata locations in the JWT
        metadata = user.get("metadata") or user.get("public_metadata") or {}
        user_roles = metadata.get("role")
        
        if not user_roles:
            user_roles = user.get("role") # Fallback to top-level
            
        if not user_roles:
            # During development, if no role is assigned in Clerk, we might want to block them.
            # But they are signed in. Let's block them.
            raise HTTPException(status_code=403, detail="Forbidden: You do not have an assigned role. Please contact an admin.")
            
        if isinstance(user_roles, str):
            if user_roles not in allowed_roles:
                raise HTTPException(status_code=403, detail="Forbidden: Insufficient privileges.")
        elif isinstance(user_roles, list):
            if not any(role in allowed_roles for role in user_roles):
                raise HTTPException(status_code=403, detail="Forbidden: Insufficient privileges.")
        
        return user

    return role_checker
