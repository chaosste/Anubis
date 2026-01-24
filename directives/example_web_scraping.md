# Web Scraping Directive

## Goal

Extract structured data from a single website and save it to a JSON file in `.tmp/`.

## Inputs

- **URL**: The target website URL
- **Selectors**: CSS selectors for data extraction (optional, script can auto-detect)
- **Output filename**: Name for the JSON file (default: `scraped_data.json`)

## Tools/Scripts

- `execution/scrape_single_site.py`: Main scraping script using BeautifulSoup/Playwright
- External: None (uses standard Python libraries)

## Process

1. Validate the URL format
2. Call `execution/scrape_single_site.py` with URL and selectors
3. Script saves output to `.tmp/[filename].json`
4. Review the output for completeness
5. If errors occur, check the error log and retry with adjusted selectors

## Outputs

- **JSON file**: `.tmp/scraped_data.json` containing structured data
- **Log file**: `.tmp/scrape_log.txt` with execution details

## Edge Cases

- **Rate limiting**: Script includes 2-second delays between requests
- **Dynamic content**: If content is JavaScript-rendered, use Playwright mode (add `--playwright` flag)
- **Authentication required**: Not currently supported, needs manual cookie injection
- **Invalid selectors**: Script will return empty results with warning in log

## Learnings

- *2026-01-24*: Discovered that some sites block requests without User-Agent header. Updated script to include realistic User-Agent.
- *Example*: Found that batch processing is more efficient for multiple pages from same domain. Consider creating batch version.
