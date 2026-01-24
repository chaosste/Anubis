# Execution Scripts

This directory contains deterministic Python scripts that handle the actual work. These scripts are:

- **Reliable**: Tested, error-handled, and predictable
- **Reusable**: Can be called multiple times with different inputs
- **Well-documented**: Clear comments explaining logic and parameters
- **Environment-aware**: Use `.env` for API keys and configuration

## Script Guidelines

### Structure

```python
#!/usr/bin/env python3
"""
Script description and purpose.

Usage:
    python script_name.py --arg1 value1 --arg2 value2

Arguments:
    --arg1: Description
    --arg2: Description
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    # Script logic here
    pass

if __name__ == "__main__":
    main()
```

### Best Practices

1. **Use argparse** for command-line arguments
2. **Load .env** at the start for API keys
3. **Add error handling** with try/except blocks
4. **Log important steps** to help with debugging
5. **Save outputs** to `.tmp/` directory
6. **Return exit codes**: 0 for success, non-zero for errors

### Dependencies

Install required packages:

```bash
pip install python-dotenv requests beautifulsoup4 playwright
```

## Example Scripts

See the example scripts in this directory to understand the pattern.
