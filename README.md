# SciSciNet Frontend

Interactive D3.js visualization of research networks with drag, zoom, and community colors.

## Quick Start

```bash
# Install
pnpm install

# Run
pnpm dev
```

Open http://localhost:5173

**Important:** Backend must be running at http://localhost:8000

## What It Shows

Two force-directed network graphs:

1. **Paper Citation Network** - Papers citing each other
   - Node size = citation count
   - Colors = community clusters
   - Hover for paper titles

2. **Author Collaboration Network** - Co-authorship relationships
   - Edge thickness = collaboration strength
   - Colors = community clusters

## Features

- Drag nodes around
- Zoom and pan (scroll/drag)
- Hover tooltips with details
- Community-based colors (Louvain algorithm)
- Legend with stats

## Tech Stack

- React 19 + TypeScript
- Vite
- D3.js v7
- Dark theme UI

## Build for Production

```bash
pnpm build
pnpm preview
```
