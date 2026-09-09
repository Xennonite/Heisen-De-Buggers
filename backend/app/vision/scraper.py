from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import httpx
import json

async def scrape_ecommerce_listing(url: str):
    """
    Navigates to the URL, extracts visible text, structured metadata, and downloads product images.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Use a realistic User-Agent to prevent anti-bot blocking (e.g. Amazon 404s)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        # Use domcontentloaded instead of networkidle, as e-commerce sites often have long-polling trackers
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        # Scroll down slightly to trigger lazy loading of product images
        await page.evaluate("window.scrollBy(0, 1500)")
        # Give JS a moment to render the product details and lazy-load images
        await page.wait_for_timeout(3000)
        
        # Extract rendered text directly from the browser's DOM (ignores hidden junk)
        visible_text = await page.evaluate("document.body.innerText")
        
        await page.evaluate("window.scrollTo(0, 0)") # Scroll back up for the screenshot
        await page.wait_for_timeout(1000)
        
        # Take a screenshot to show the overall page
        page_screenshot = await page.screenshot(full_page=False)
        html_content = await page.content()
        await browser.close()

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
