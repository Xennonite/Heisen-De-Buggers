from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import httpx
import json
import asyncio

def _fetch_page_content(url: str):
    import sys
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.evaluate("window.scrollBy(0, 1500)")
        page.wait_for_timeout(3000)
        visible_text = page.evaluate("document.body.innerText")
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(1000)
        page_screenshot = page.screenshot(full_page=False)
        html_content = page.content()
        browser.close()
        
    return visible_text, page_screenshot, html_content


async def scrape_ecommerce_listing(url: str):
    """
    Navigates to the URL, extracts visible text, structured metadata, and downloads product images.
    """
    # Run playwright in a background thread to bypass Uvicorn's SelectorEventLoop on Windows
    visible_text, page_screenshot, html_content = await asyncio.to_thread(_fetch_page_content, url)

    soup = BeautifulSoup(html_content, "html.parser")
    
    # Extract metadata
    metadata = []
    for script_tag in soup.find_all("script", type="application/ld+json"):
        try:
            if script_tag.string:
                metadata.append(json.loads(script_tag.string))
        except:
            pass

    # Extract Product Images (Basic heuristic: grab large images or specific gallery classes)
    import re
    image_urls = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src and ('jpg' in src.lower() or 'png' in src.lower() or 'jpeg' in src.lower()) and 'sprite' not in src.lower() and 'icon' not in src.lower():
            # Convert Amazon thumbnails to full high-res images by stripping modifiers
            if 'media-amazon.com' in src:
                src = re.sub(r'\._[A-Za-z0-9_,-]+_\.', '.', src)
            # Convert Flipkart thumbnails to larger resolution
            elif 'flixcart.com' in src:
                src = re.sub(r'/image/\d+/\d+/', '/image/1000/1000/', src)
            image_urls.append(src)
            
    # Remove duplicates and limit to top 5 images
    # preserve order by using dict.fromkeys
    image_urls = list(dict.fromkeys(image_urls))[:5]
    
    downloaded_images = []
    async with httpx.AsyncClient(timeout=10.0) as client:
        for img_url in image_urls:
            # Handle relative URLs if necessary
            if not img_url.startswith('http'):
                continue
            try:
                resp = await client.get(img_url)
                if resp.status_code == 200:
                    downloaded_images.append(resp.content)
            except Exception as e:
                print(f"Failed to download image {img_url}: {e}")

    return {
        "url": url,
        "text": visible_text,
        "metadata": metadata,
        "page_screenshot": page_screenshot,
        "product_images": downloaded_images
    }
