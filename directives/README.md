# Directives

This directory contains Standard Operating Procedures (SOPs) written in Markdown. Each directive defines:

- **Goal**: What the directive accomplishes
- **Inputs**: What information/data is needed
- **Tools/Scripts**: Which execution scripts to use
- **Outputs**: What the directive produces
- **Edge Cases**: Known limitations, error conditions, and how to handle them

## Directive Template

When creating a new directive, use this structure:

```markdown
# [Directive Name]

## Goal
Brief description of what this directive accomplishes.

## Inputs
- Input 1: Description
- Input 2: Description

## Tools/Scripts
- `execution/script_name.py`: What it does
- External APIs or services used

## Process
1. Step-by-step instructions
2. Decision points and branching logic
3. Error handling procedures

## Outputs
- Output 1: Description and location
- Output 2: Description and location

## Edge Cases
- **Case 1**: How to handle
- **Case 2**: How to handle

## Learnings
(This section gets updated as you discover API constraints, better approaches, etc.)
- Learning 1: What was discovered and how it improved the process
```

## Example Directives

See the example directives in this directory to understand the pattern.
