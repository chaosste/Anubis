# Anubis - Neurophenomenology App

Anubis is a React + TypeScript voice interaction app using Google's Gemini Live API for real-time conversations. It features a unique 3-layer architecture for AI-assisted development.

## Build, Test, and Development Commands

```bash
# Install dependencies
npm install

# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build (port 8080, or $PORT on Cloud Run)
npm run preview
# Or start the preview server
npm start
```

## Architecture

### Hybrid Architecture: React App + 3-Layer AI Development System

This project combines two distinct systems:

1. **React Application**: A voice interaction UI (React 19 + Vite + TypeScript)
2. **3-Layer AI Development System**: For building/maintaining the app with AI assistance

#### React App Structure

```
components/         # React components (Visualizer, Controls, Transcript, etc.)
services/          # Business logic (geminiLiveService, audioUtils, userService)
hooks/             # Custom React hooks (useDraggableScroll)
types.ts           # TypeScript type definitions
constants.ts       # App constants
```

**Key React patterns:**
- Uses `useGeminiLive` custom hook for managing Gemini Live API connection
- Lazy state initialization with `useState(() => userService.getCurrentUser())` to persist login
- Audio visualization with real-time volume tracking
- Modal-based UI for settings, auth, and history

#### 3-Layer Development Architecture

**Purpose**: Separates AI decision-making from deterministic execution to improve reliability.

**Layer 1: Directives** (`directives/` directory)
- Markdown SOPs defining "what to do"
- Structure: Goal, Inputs, Tools/Scripts, Process, Outputs, Edge Cases, Learnings
- Living documents - update with new discoveries
- Template available in `directives/README.md`

**Layer 2: Orchestration** (AI's role)
- Read directives to understand tasks
- Call execution scripts in the right order
- Handle errors and edge cases
- Update directives with learnings (self-annealing)
- **Don't do the work yourself** - coordinate it

**Layer 3: Execution** (`execution/` directory)
- Deterministic Python scripts for reliable operations
- Use `.env` for API keys and configuration
- Save intermediate outputs to `.tmp/` (gitignored)
- Guidelines in `execution/README.md`

**Key principles:**
1. **Check for tools first** - Don't reinvent the wheel; check `execution/` before creating new scripts
2. **Self-anneal when things break** - Error → Fix → Test → Update Directive → Stronger System
3. **Deliverables in cloud, intermediates in .tmp** - Local files are temporary; deliverables live in cloud services (Google Sheets, etc.)

See `ARCHITECTURE.md` for complete guide, `QUICK_REFERENCE.md` for quick lookup.

## Key Conventions

### Environment Variables

- **Build time**: `API_KEY` (Gemini API key) must be set for production builds
- **Development**: Create `.env.local` with `GEMINI_API_KEY` (see `.env.example`)
- Vite config prioritizes system `PORT` variable for Cloud Run deployment
- System variables merged into build via `vite.config.ts` define block

### TypeScript

- Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- Module resolution: `bundler` (Vite-specific)
- No emit - Vite handles compilation

### File Organization

**React app files** (committed to git):
- `components/` - UI components
- `services/` - Business logic and API integration
- `hooks/` - Reusable React hooks

**3-layer system files**:
- `directives/` - SOPs (committed)
- `execution/` - Python scripts (committed)
- `.tmp/` - Temporary processing files (gitignored)
- `.env`, `credentials.json`, `token.json` - Secrets (gitignored)

### Working with Directives

**When creating directives:**
- Ask user for confirmation before creating/overwriting
- Follow template in `directives/README.md`
- Include edge cases and error handling
- Create corresponding execution script if needed

**When updating directives:**
- Add learnings to existing "Learnings" section
- Document API constraints, rate limits, better approaches
- Update edge cases as you discover them

### Python Scripts

**Required structure:**
```python
#!/usr/bin/env python3
"""Script description and usage"""
from dotenv import load_dotenv
load_dotenv()
# Use argparse for arguments
# Save outputs to .tmp/
# Return proper exit codes
```

**Common dependencies** (install as needed):
```bash
pip install python-dotenv requests beautifulsoup4 playwright
```

## Docker Deployment

- Dockerfile uses nginx for production serving
- Cloud Run deployment via `cloudbuild.yaml`
- Nginx config in `nginx.conf`

## Important Notes

- **Paid API usage**: Always ask before using execution scripts that consume paid tokens/credits
- **Self-annealing**: When errors occur, fix the script, test (unless it uses paid resources), then update the directive
- **Directory awareness**: Project root is `/Users/stephenbeale/Projects/Anubis/`
- **Don't overwrite directives** without asking - they're your instruction set
