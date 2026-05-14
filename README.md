# PIXVAULT Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Technology Stack](#technology-stack)
6. [Getting Started](#getting-started)
7. [Project Structure](#project-structure)
8. [Components](#components)
9. [Development Guide](#development-guide)
10. [Testing](#testing)
11. [Build & Deployment](#build--deployment)
12. [Contributing](#contributing)
13. [License](#license)

---

## Introduction

PIXVAULT is a web application designed to provide developers and designers with a curated collection of design resources. It serves as a centralized hub for discovering trending GIFs, exploring icon sets, accessing ready-to-use UI components, and finding design inspiration — all through live API integrations.

The application is built with modern web technologies, emphasizing performance, accessibility, and developer experience.

---

## Project Overview

**PIXVAULT** — Free Design Resources, GIFs & UI Components

| Property | Value |
|----------|-------|
| Project Name | PIXVAULT |
| Type | Single Page Application (SPA) |
| License | MIT |
| Repository | [github.com/DominceAseberos/live-pixvault](https://github.com/DominceAseberos/live-pixvault) |

### Purpose

The primary purpose of PIXVAULT is to streamline the workflow of developers and designers by providing:

- A single source for design assets
- Copy-paste ready UI components
- Real-time content from live APIs
- Inspiration for creative projects

---

## Features

### 1. GIF Showcase
Browse and discover trending GIFs sourced from live API integrations. Features include search functionality, category filtering, and preview capabilities.

### 2. Icon Gallery
Explore a comprehensive collection of icons suitable for web and mobile applications. Icons are organized by style, category, and usage context.

### 3. UI Components
Access a library of pre-built, customizable UI components built with shadcn/ui. Each component is:
- Fully typed with TypeScript
- Accessible (WCAG compliant)
- Customizable via Tailwind CSS
- Ready for copy-paste integration

### 4. Illustration Gallery
Discover free illustrations for use in projects. The gallery includes various styles from minimalist to detailed artwork.

### 5. Inspiration Feed
Stay updated with curated design inspiration from across the web. The feed aggregates content from multiple sources to spark creativity.

---

## Architecture

### Application Architecture

PIXVAULT follows a modern React application architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / DOM                         │
├─────────────────────────────────────────────────────────┤
│                    React Application                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │  Components │  │   Hooks     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│  ┌─────────────────────────────────────────────────┐   │
│  │              TanStack Query (State)              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              React Router (Routing)              │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    External APIs                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** — User navigates to a page or interacts with a component
2. **Component Render** — React renders the appropriate component
3. **Data Fetching** — TanStack Query handles API requests and caching
4. **State Update** — UI updates based on fetched data
5. **User Feedback** — Loading states, error handling, and animations provide feedback

---

## Technology Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 18.3.1 | UI library |
| **Build Tool** | Vite | 5.4.19 | Development server & bundler |
| **Language** | TypeScript | 5.8.3 | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS framework |

### Key Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| shadcn/ui (Radix UI) | Various | Accessible UI primitives |
| TanStack Query | 5.83.0 | Server state management |
| React Router | 6.30.1 | Client-side routing |
| Framer Motion | 12.35.1 | Animations |
| Lucide React | 0.462.0 | Icon library |
| Zod | 3.25.76 | Schema validation |
| React Hook Form | 7.61.1 | Form management |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.32.0 | Code linting |
| Vitest | 3.2.4 | Unit testing |
| Testing Library | 16.0.0 | React testing utilities |

---

## Getting Started

### Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0 or bun >= 1.0.0

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Create production build |
| `npm run build:dev` | Create development build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run test` | Execute test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## Project Structure

```
live-pixvault/
│
├── public/                    # Static assets served directly
│   ├── favicon.ico           # Application favicon
│   ├── placeholder.svg       # Placeholder images
│   └── robots.txt            # Search engine directives
│
├── src/                       # Source code
│   │
│   ├── components/            # Reusable React components
│   │   ├── ui/               # shadcn/ui primitive components
│   │   ├── Footer.tsx        # Application footer
│   │   ├── GifShowcase.tsx   # GIF display component
│   │   ├── HeroSection.tsx   # Landing page hero
│   │   ├── IconShowcase.tsx  # Icon gallery component
│   │   ├── IllustrationGallery.tsx
│   │   ├── InspirationFeed.tsx
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── NavLink.tsx       # Navigation link component
│   │   ├── StatsBar.tsx      # Statistics display
│   │   └── UIComponents.tsx  # Component showcase
│   │
│   ├── hooks/                 # Custom React hooks
│   │
│   ├── lib/                   # Utility functions and helpers
│   │
│   ├── pages/                 # Page-level components
│   │   ├── Index.tsx         # Home page
│   │   └── NotFound.tsx      # 404 error page
│   │
│   ├── test/                  # Test files
│   │
│   ├── App.css               # Application-specific styles
│   ├── App.tsx               # Root application component
│   ├── index.css             # Global styles
│   ├── main.tsx              # Application entry point
│   └── vite-env.d.ts         # Vite type declarations
│
├── index.html                 # HTML template
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TypeScript config
├── tsconfig.node.json        # Node-specific TypeScript config
├── postcss.config.js         # PostCSS configuration
├── eslint.config.js          # ESLint configuration
├── components.json           # shadcn/ui configuration
└── package.json              # Project dependencies
```

---

## Components

### Page Components

#### Index.tsx
The main landing page that orchestrates all feature components in a single-page layout.

```tsx
Component Structure:
├── Navbar
├── HeroSection
├── StatsBar
├── GifShowcase
├── IconShowcase
├── UIComponents
├── IllustrationGallery
├── InspirationFeed
└── Footer
```

#### NotFound.tsx
Handles 404 errors for undefined routes. Provides a user-friendly error message and navigation back to the home page.

### Feature Components

| Component | File | Description |
|-----------|------|-------------|
| Navbar | `Navbar.tsx` | Primary navigation with responsive design |
| HeroSection | `HeroSection.tsx` | Landing page hero with call-to-action |
| GifShowcase | `GifShowcase.tsx` | GIF gallery with search and filtering |
| IconShowcase | `IconShowcase.tsx` | Icon collection display |
| UIComponents | `UIComponents.tsx` | Component library preview |
| IllustrationGallery | `IllustrationGallery.tsx` | Illustration collection |
| InspirationFeed | `InspirationFeed.tsx` | Design inspiration aggregator |
| StatsBar | `StatsBar.tsx` | Statistics and metrics display |
| Footer | `Footer.tsx` | Application footer with links |

---

## Development Guide

### Code Standards

#### TypeScript
- Strict mode enabled
- All components must be properly typed
- Use interfaces for object shapes
- Use type aliases for unions and primitives

#### Component Structure
```tsx
// Imports
import { Component } from "library";

// Types
interface ComponentProps {
  property: string;
}

// Component
const Component = ({ property }: ComponentProps) => {
  return (
    // JSX
  );
};

export default Component;
```

#### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use the `cn()` utility for conditional class merging

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/description

# Make changes and commit
git add .
git commit -m "type: description"

# Push changes
git push origin feature/description
```

#### Commit Message Convention
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes
- `refactor:` — Code refactoring
- `test:` — Adding tests
- `chore:` — Maintenance tasks

---

## Testing

### Test Structure
```
src/test/
├── components/    # Component tests
├── hooks/         # Hook tests
└── utils/         # Utility tests
```

### Writing Tests

```tsx
import { render, screen } from "@testing-library/react";
import Component from "../Component";

describe("Component", () => {
  it("renders correctly", () => {
    render(<Component />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## Build & Deployment

### Production Build

```bash
# Create optimized production build
npm run build
```

The build output is generated in the `dist/` directory.

### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js    # Bundled JavaScript
│   └── index-[hash].css   # Bundled CSS
└── index.html             # Entry HTML file
```

### Deployment Options

| Platform | Configuration |
|----------|---------------|
| Vercel | Zero-config deployment |
| Netlify | Zero-config deployment |
| Cloudflare Pages | Zero-config deployment |
| GitHub Pages | Requires base path configuration |
| AWS Amplify | Requires build settings |

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_URL=your_api_url
VITE_API_KEY=your_api_key
```

---

## Contributing

### Contribution Process

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Commit** with descriptive messages
7. **Push** to your fork
8. **Open** a Pull Request

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] TypeScript types are correct
- [ ] Components are accessible
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console errors or warnings

---

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 Domince Aseberos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## Author

**Domince Aseberos**

- GitHub: [@DominceAseberos](https://github.com/DominceAseberos)

---

*Last Updated: May 2026*
