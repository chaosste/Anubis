# 3-Layer Architecture Quick Reference

## Directory Structure

```
directives/     # What to do (Markdown SOPs)
execution/      # How to do it (Python scripts)
.tmp/          # Intermediate files (gitignored)
.env           # Environment variables (gitignored)
```

## My Role (AI Orchestration)

1. ✅ Read directives
2. ✅ Call execution scripts
3. ✅ Handle errors
4. ✅ Update directives with learnings
5. ❌ Don't do everything myself

## When to Create

### Directive (`directives/*.md`)

- Repeatable task with clear steps
- Complex workflow needing documentation
- Task that might be done again

### Execution Script (`execution/*.py`)

- Deterministic operation (API calls, data processing)
- Task requiring reliability and testing
- Operation using external services/credentials

## Self-Annealing Loop

```
Error → Fix → Test → Update Directive → Stronger System
```

## File Organization

**Deliverables** (cloud-based):

- Google Sheets, Slides
- Deployed apps
- Cloud services

**Intermediates** (`.tmp/`):

- Scraped data
- Temp exports
- Processing artifacts

## Key Principles

1. **Check for tools first** - Don't reinvent the wheel
2. **Self-anneal when things break** - Learn from errors
3. **Update directives as you learn** - Living documentation
4. **Deliverables in cloud, intermediates in .tmp** - Clear separation

## Example Workflow

**User**: "Scrape data from example.com"

**My steps**:

1. Read `directives/scrape_website.md`
2. Identify inputs: URL
3. Call `execution/scrape_single_site.py --url https://example.com`
4. Review output in `.tmp/scraped_data.json`
5. Report to user

**If error**: Check directive → Fix script → Test → Update directive

---

**Full guide**: See [ARCHITECTURE.md](ARCHITECTURE.md)
