<div align="center">

# 𓂀 Anubis

**Voice-Driven Neurophenomenology for Psychedelic Experience**

*Real-time AI voice interviews that probe the fine structure of subjective psychedelic experience*

<img src="Images/a1.jpg" width="600" alt="Anubis — voice interview interface with deity-themed character selection" />

[![Live on Google Cloud](https://img.shields.io/badge/Live-Google%20Cloud-4285F4?style=flat-square&logo=google-cloud)](https://cloud.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## Why Anubis?

Trip reports are usually written after the fact — flattened by memory, shaped by narrative. Anubis takes a different approach: real-time voice dialogue that catches the granular phenomenological detail while it's still fresh. The result is richer, more structurally faithful documentation of psychedelic experience.

The interview methodology draws on the micro-phenomenological tradition and the integration therapy approach championed by practitioners like Marc Aixalà at [ICEERS](https://www.iceers.org/). Anubis covers **vision reports and experience integration** — not crisis intervention.

## About

Anubis uses Google's Gemini Live API to conduct fluid, spoken interviews exploring the micro-dynamics of psychedelic experience. Its voices are based on ancient deities — somewhere between the sacred and the absurd. Some call it kitsch. Others say the theatrical atmosphere opens up conversation in unexpected ways.

Under the hood, a **self-annealing directive system** learns from its own errors and continuously refines its conversational approach.

## Features

- 🎙️ **Real-Time Voice Interaction** — Gemini Live API for natural, flowing dialogue
- 🔄 **Self-Annealing Directives** — The system learns from errors and refines its interview technique over time
- 🏗️ **3-Layer Architecture** — Clean separation of strategy (Directives), flow (Orchestration), and I/O (Execution)
- 🔒 **Privacy-First** — No data persistence by default; optional local save with authentication
- 🎭 **Deity-Themed Voices** — Ancient character voices that set a unique interview tone
- 🔬 **Granular Phenomenology** — Probes pre-reflective experience structure at fine resolution

## Architecture

```
┌─────────────────┐
│   Directives    │  ← Interview strategy & self-annealing rules
├─────────────────┤
│  Orchestration  │  ← Session flow, state management
├─────────────────┤
│   Execution     │  ← Gemini Live API, voice I/O, recording
└─────────────────┘
```

## Screenshots

<p align="center">
  <img src="Images/a2.jpg" width="280" alt="Anubis character selection screen" />
  <img src="Images/a3.jpg" width="280" alt="Anubis live interview session" />
  <img src="Images/a4.jpg" width="280" alt="Anubis interview transcript view" />
</p>
<p align="center">
  <img src="Images/a5.jpg" width="280" alt="Anubis session summary" />
</p>

<!-- Add a demo GIF when available:
<p align="center">
  <img src="Images/demo.gif" width="600" alt="Anubis demo — live voice interview" />
</p>
-->

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript, Vite |
| AI | Google Gemini Live API |
| Deployment | Gemini Conversational lane (Vite) + Azure App Service lane (Node server + static dist) |
| Auth | Built-in authentication system |

## Installation

```bash
git clone https://github.com/chaosste/Anubis.git
cd Anubis
npm install
npm run dev
```

Open **Settings** in the app and paste your Gemini API key. The key is stored locally in your browser profile.

## Deployment Lanes

- `Gemini Conversational (OG)`: unchanged voice-first Gemini Live interview flow.
- `Azure App Service`: uses `server.js` for static hosting and `/api/health` operational checks.
- GitHub Actions Azure workflow: `.github/workflows/azure_webapp_workflow.yml`.

## ⚠️ Disclaimer

> **Anubis is NOT a therapist, counsellor, or mental health professional.** It is a research and documentation tool for exploring subjective experience through structured voice interviews.

- Not a substitute for professional mental health support
- Designed for experience reports and integration, not crisis intervention
- If you are in crisis, contact your local emergency services or a crisis helpline
- The developers assume no responsibility for how this tool is used
- Use of psychedelic substances may be illegal in your jurisdiction

## Related Projects

- **[MicroPhenom AI](https://github.com/chaosste/MicroPhenom-AI-1)** — The vanilla edition for granular reports on wider lived experience
- **[NeuroPhenom AI](https://github.com/chaosste/NeuroPhenom-AI)** — High-fidelity clinical interface for mapping pre-reflective subjective experience
- **[Facilitator-AI](https://github.com/chaosste/Facilitator-AI)** — AI-assisted facilitation tools

---

<div align="center">

**Built by [Steve Beale](https://newpsychonaut.com)**

© 2026 Stephen Beale · MIT License

</div>
