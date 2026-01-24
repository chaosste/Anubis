#!/usr/bin/env python3
"""
Web scraping script for extracting data from a single website.

Usage:
    python scrape_single_site.py --url https://example.com --output scraped_data.json

Arguments:
    --url: Target URL to scrape
    --output: Output filename (saved to .tmp/)
    --playwright: Use Playwright for JavaScript-rendered content (optional)
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Error: Missing required package. Run: pip install requests beautifulsoup4 python-dotenv")
    sys.exit(1)

# Load environment variables
load_dotenv()

def scrape_with_requests(url):
    """Scrape using requests + BeautifulSoup (for static content)."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract basic data (customize based on needs)
        data = {
            'url': url,
            'title': soup.title.string if soup.title else None,
            'headings': [h.get_text(strip=True) for h in soup.find_all(['h1', 'h2', 'h3'])],
            'paragraphs': [p.get_text(strip=True) for p in soup.find_all('p')],
            'links': [a.get('href') for a in soup.find_all('a', href=True)]
        }
        
        return data
        
    except requests.RequestException as e:
        print(f"Error fetching URL: {e}")
        return None

def scrape_with_playwright(url):
    """Scrape using Playwright (for JavaScript-rendered content)."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Error: Playwright not installed. Run: pip install playwright && playwright install")
        sys.exit(1)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        page.wait_for_load_state('networkidle')
        
        content = page.content()
        browser.close()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        data = {
            'url': url,
            'title': soup.title.string if soup.title else None,
            'headings': [h.get_text(strip=True) for h in soup.find_all(['h1', 'h2', 'h3'])],
            'paragraphs': [p.get_text(strip=True) for p in soup.find_all('p')],
            'links': [a.get('href') for a in soup.find_all('a', href=True)]
        }
        
        return data

def main():
    parser = argparse.ArgumentParser(description='Scrape a single website')
    parser.add_argument('--url', required=True, help='Target URL to scrape')
    parser.add_argument('--output', default='scraped_data.json', help='Output filename')
    parser.add_argument('--playwright', action='store_true', help='Use Playwright for JS content')
    
    args = parser.parse_args()
    
    # Create .tmp directory if it doesn't exist
    tmp_dir = Path('.tmp')
    tmp_dir.mkdir(exist_ok=True)
    
    print(f"Scraping: {args.url}")
    
    # Choose scraping method
    if args.playwright:
        print("Using Playwright (JavaScript-enabled)...")
        data = scrape_with_playwright(args.url)
    else:
        print("Using requests (static content)...")
        data = scrape_with_requests(args.url)
    
    if data is None:
        print("Scraping failed.")
        sys.exit(1)
    
    # Save to .tmp directory
    output_path = tmp_dir / args.output
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Data saved to: {output_path}")
    print(f"✓ Extracted {len(data.get('paragraphs', []))} paragraphs")
    print(f"✓ Found {len(data.get('links', []))} links")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
