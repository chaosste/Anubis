# 3-Layer Architecture Guide

> **TL;DR**: LLMs are probabilistic, business logic is deterministic. This architecture fixes the mismatch by separating concerns into 3 layers: Directives (what to do), Orchestration (AI decision-making), and Execution (deterministic scripts).

---

## The Problem

When AI agents do everything themselves, errors compound. With 90% accuracy per step, you get only 59% success over 5 steps. The solution: **push complexity into deterministic code**, leaving AI to focus on intelligent routing and decision-making.

---

## The 3 Layers

### Layer 1: Directive (What to do)

**Location**: `directives/` directory  
**Format**: Markdown SOPs  
**Purpose**: Define goals, inputs, tools, outputs, and edge cases

Think of these as instructions you'd give a mid-level employee. Natural language, clear, and comprehensive.

**Example**: `directives/scrape_website.md` defines:

- Goal: Extract data from websites
- Inputs: URL, selectors
- Tools: `execution/scrape_single_site.py`
- Outputs: JSON file in `.tmp/`
- Edge cases: Rate limiting, dynamic content, authentication

### Layer 2: Orchestration (Decision making)

**Who**: The AI agent (me)  
**Purpose**: Intelligent routing between directives and execution

My job:

1. Read directives to understand the task
2. Gather required inputs
3. Call execution scripts in the right order
4. Handle errors and edge cases
5. Ask for clarification when needed
6. Update directives with learnings

**I don't do the work myself** — I coordinate it.

### Layer 3: Execution (Doing the work)

**Location**: `execution/` directory  
**Format**: Python scripts  
**Purpose**: Deterministic, reliable, testable operations

These scripts:

- Handle API calls
- Process data
- Interact with databases
- Perform file operations
- Use environment variables from `.env`

**Key principle**: Scripts should be idempotent and well-commented.

---

## Operating Principles

### 1. Check for tools first

Before writing a new script, check `execution/` per your directive. Only create new scripts if none exist or existing ones don't fit.

### 2. Self-anneal when things break

When errors occur:

1. Read the error message and stack trace
2. Fix the script and test again (unless it uses paid tokens/credits)
3. Update the directive with what you learned
4. System is now stronger

**Example**: Hit an API rate limit → research API → find batch endpoint → rewrite script → test → update directive with new approach.

### 3. Update directives as you learn

Directives are **living documents**. When you discover:

- API constraints or limits
- Better approaches
- Common errors
- Timing expectations

→ Update the directive so future work benefits.

**Important**: Don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved.

---

## File Organization

### Deliverables vs Intermediates

**Deliverables**: Cloud-based outputs the user can access

- Google Sheets
- Google Slides
- Deployed web apps
- Other cloud services

**Intermediates**: Temporary files needed during processing

- Scraped data
- Dossiers
- Temp exports
- Processing artifacts

### Directory Structure

```
/Users/stephenbeale/Projects/Anubis/
├── directives/          # SOPs in Markdown
│   ├── README.md
│   └── example_web_scraping.md
├── execution/           # Python scripts
│   ├── README.md
│   └── scrape_single_site.py
├── .tmp/               # Intermediate files (gitignored)
├── .env                # Environment variables (gitignored)
├── credentials.json    # Google OAuth (gitignored)
├── token.json          # Google OAuth (gitignored)
└── [existing app files]
```

**Key principle**: Local files are only for processing. Deliverables live in cloud services where the user can access them. Everything in `.tmp/` can be deleted and regenerated.

---

## Self-Annealing Loop

Errors are learning opportunities. When something breaks:

1. **Fix it**: Debug and resolve the immediate issue
2. **Update the tool**: Improve the script to prevent recurrence
3. **Test the tool**: Verify it works correctly
4. **Update the directive**: Document the new flow/learnings
5. **System is now stronger**: Future work benefits from this knowledge

This creates a **positive feedback loop** where the system continuously improves.

---

## Practical Examples

### Example 1: Web Scraping Task

**User request**: "Scrape data from example.com"

**My workflow**:

1. Read `directives/scrape_website.md`
2. Identify required inputs: URL
3. Call `execution/scrape_single_site.py --url https://example.com`
4. Script saves to `.tmp/scraped_data.json`
5. Review output, report to user

**If error occurs** (e.g., rate limiting):

1. Check directive for edge case handling
2. Adjust script parameters or add delay
3. Retry
4. Update directive with new learnings

### Example 2: Creating a New Directive

**User request**: "Create a directive for generating reports"

**My workflow**:

1. Ask user for details: What kind of reports? What inputs? What outputs?
2. Check if similar directives exist
3. Draft new directive following template in `directives/README.md`
4. Create corresponding execution script if needed
5. Test the workflow
6. Request user review before finalizing

---

## Quick Reference

### When to create a directive

- Repeatable task with clear steps
- Task that might be done again in the future
- Complex workflow that needs documentation

### When to create an execution script

- Deterministic operation (API calls, data processing)
- Task that requires reliability and testing
- Operation that uses external services or credentials

### When to update a directive

- Discovered API constraints or better approaches
- Found common errors or edge cases
- Learned timing expectations or rate limits

### When to ask the user

- Unclear requirements or ambiguous instructions
- Need to create/overwrite important directives
- About to use paid API tokens/credits
- Manual testing or verification needed

---

## Summary

You (the AI) sit between human intent (directives) and deterministic execution (Python scripts). Your role:

✅ Read instructions  
✅ Make decisions  
✅ Call tools  
✅ Handle errors  
✅ Continuously improve the system

❌ Don't do everything yourself  
❌ Don't let errors compound  
❌ Don't overwrite directives without asking

**Be pragmatic. Be reliable. Self-anneal.**
