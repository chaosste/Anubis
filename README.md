<div align="center">

# 𓂀 Anubis

**Voice-Driven Neurophenomenology for Psychedelic Experience**

*Granular trip report interviews powered by real-time AI voice interaction*

[![Live on Google Cloud](https://img.shields.io/badge/Live-Google%20Cloud-4285F4?style=flat-square&logo=google-cloud)](https://cloud.google.com)

</div>

---

## About

Anubis is a voice-driven neurophenomenology application designed for conducting granular psychedelic trip report interviews. Using Google's Gemini Live API, it engages users in real-time spoken dialogue to explore and document the micro-dynamics of psychedelic experiences with unprecedented detail.

The system features ancient deity-themed voices — deliberately kitsch and theatrical — creating a unique interview atmosphere that sits between the sacred and the absurd.

## Key Features

- **Real-Time Voice Interaction** — Gemini Live API for fluid, natural conversation
- **Self-Annealing Directive System** — Learns from errors and refines its approach over time
- **3-Layer Architecture** — Directives / Orchestration / Execution for robust interview management
- **Privacy-First Design** — No data persistence by default; local save optional with auth
- **Deity-Themed Voices** — Ancient character voices for a theatrical interview experience
- **Auth System** — Optional authentication for local conversation recording
- **Granular Phenomenology** — Probes the fine structure of subjective psychedelic experience

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
  <img src="Images/a1.jpg" width="250" />
  <img src="Images/a2.jpg" width="250" />
  <img src="Images/a3.jpg" width="250" />
</p>
<p align="center">
  <img src="Images/a4.jpg" width="250" />
  <img src="Images/a5.jpg" width="250" />
</p>

## Tech Stack

- **Frontend:** React + TypeScript, Vite
- **AI:** Google Gemini Live API
- **Deployment:** Google Cloud
- **Auth:** Built-in authentication system

## Getting Started

```bash
# Clone the repository
git clone https://github.com/chaosste/Anubis.git
cd Anubis

# Install dependencies
npm install

# Set up environment
# Requires a Google Gemini API key

# Run development server
npm run dev
```

## ⚠️ Important Disclaimer

**Anubis is NOT a therapist, counsellor, or medical professional.** It is a research and documentation tool for exploring subjective experience through structured interview techniques.

- This application does not provide medical, psychological, or therapeutic advice
- It is not a substitute for professional mental health support
- If you are in crisis, please contact your local emergency services or a crisis helpline
- The developers assume no responsibility for how this tool is used
- Use of psychedelic substances may be illegal in your jurisdiction

---

<div align="center">

**Built by [Steve Beale](https://newpsychonaut.com)**

[newpsychonaut.com](https://newpsychonaut.com)

</div>
