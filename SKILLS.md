# PIXVAULT Design System

> **For AI Agents**: Copy and paste the prompt below into your conversation to replicate the PIXVAULT design system.

---

## 🤖 Agent Prompt (Copy & Paste This)

```
You are building a web application using the PIXVAULT design system. Follow these design rules strictly:

THEME: Dark cyberpunk aesthetic with neon accents

COLORS (use HSL format):
- Background: hsl(240 20% 3.5%) - Void Black
- Text: hsl(240 20% 96%) - Ice White
- Primary: hsl(190 100% 50%) - Neon Cyan (main actions, links)
- Secondary: hsl(263 70% 50%) - Electric Violet (secondary actions)
- Accent: hsl(348 100% 65%) - Hot Coral (highlights, tags)
- Card: hsl(240 20% 6%) - Night Panel
- Muted: hsl(240 15% 12%) - Muted backgrounds
- Border: hsl(240 15% 15%) - Ghost Line
- Muted Text: hsl(260 20% 72%) - Lavender Fog

TYPOGRAPHY:
- Headings/Buttons: font-display (Space Grotesk, bold)
- Body text: font-body (Inter, normal)
- Technical labels/tags: font-mono (JetBrains Mono, uppercase)

COMPONENT PATTERNS:
- Buttons: rounded-full, px-6 py-3, font-display text-sm font-semibold
- Cards: rounded-md, border border-border, bg-card, p-4
- Badges: rounded-full, px-2 py-0.5, font-mono text-[10px] font-bold
- Inputs: rounded-xl, border border-border, bg-muted/50, focus:border-primary
- Sections: py-24, container mx-auto px-4

VISUAL EFFECTS:
- Gradient text: bg-clip-text text-transparent with linear-gradient(135deg, cyan, violet)
- Glow: box-shadow with primary color at 30% opacity
- Hover: scale-105 or border-primary transition
- Loading: shimmer animation with gradient background

SPACING:
- Section padding: py-24
- Component gaps: gap-4 (standard), gap-2 (tight), gap-6 (loose)
- Container: container mx-auto px-4 (max-width 1400px)

RESPONSIVE:
- Mobile-first: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
- Text: text-4xl sm:text-5xl lg:text-7xl
- Hide/show: hidden md:flex or md:hidden

Always use Tailwind CSS classes. Always include hover states. Always use semantic color names (bg-primary not bg-cyan-500).
```

---

## 📚 Detailed Reference

Below is the complete design system documentation for deeper understanding.

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Component Styles](#component-styles)
5. [Visual Effects](#visual-effects)
6. [Responsive Design](#responsive-design)
7. [Design Tokens](#design-tokens)

---

## Color System

### Theme: Dark Cyberpunk

PIXVAULT uses a dark-themed cyberpunk aesthetic with vibrant neon accents.

### Primary Palette

```css
/* Base Colors */
--background: 240 20% 3.5%;        /* Void Black - Main background */
--foreground: 240 20% 96%;         /* Ice White - Main text */

/* Brand Colors */
--primary: 190 100% 50%;           /* Neon Cyan - Primary actions, links */
--secondary: 263 70% 50%;          /* Electric Violet - Secondary actions */
--accent: 348 100% 65%;            /* Hot Coral - Accents, highlights, tags */

/* Surface Colors */
--card: 240 20% 6%;                /* Night Panel - Card backgrounds */
--muted: 240 15% 12%;              /* Muted backgrounds, disabled states */
--border: 240 15% 15%;             /* Ghost Line - Borders, dividers */

/* Text Colors */
--muted-foreground: 260 20% 72%;  /* Lavender Fog - Secondary text */

/* Semantic Colors */
--destructive: 0 84% 60%;          /* Error states, delete actions */
--amber-tag: 38 92% 50%;           /* Warning tags, labels */
```

### Named Color Tokens

```css
--void-black: 240 20% 3.5%;       /* Deep background */
--night-panel: 240 25% 5.5%;      /* Elevated surfaces */
--ghost-line: 240 18% 15%;        /* Subtle borders */
--neon-cyan: 190 100% 50%;        /* Primary brand color */
--electric-violet: 263 70% 50%;   /* Secondary brand color */
--hot-coral: 348 100% 65%;        /* Accent color */
--ice-white: 240 100% 97%;        /* Pure white text */
--lavender-fog: 260 20% 72%;      /* Muted text */
--amber-tag: 38 92% 50%;          /* Warning/tag color */
```

### Color Usage Guidelines

**Backgrounds:**
- Main background: `bg-background` (Void Black)
- Card/Panel: `bg-card` (Night Panel)
- Muted areas: `bg-muted` (Muted)
- Hover states: `bg-muted/50` (50% opacity)

**Text:**
- Primary text: `text-foreground` (Ice White)
- Secondary text: `text-muted-foreground` (Lavender Fog)
- Brand text: `text-primary` (Neon Cyan)
- Accent text: `text-accent` (Hot Coral)

**Borders:**
- Default: `border-border` (Ghost Line)
- Hover: `hover:border-primary` (Neon Cyan)
- Focus: `focus:border-primary` (Neon Cyan)

**Interactive Elements:**
- Primary button: `bg-primary text-primary-foreground`
- Secondary button: `border-border bg-muted/50`
- Destructive: `bg-destructive text-destructive-foreground`

---

## Typography

### Font Families

```css
--font-display: 'Space Grotesk', sans-serif;  /* Headings, titles, buttons */
--font-mono: 'JetBrains Mono', monospace;     /* Code, tags, technical labels */
--font-body: 'Inter', sans-serif;             /* Body text, paragraphs */
```

### Font Loading

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Typography Scale

**Headings (Space Grotesk):**
```tsx
<h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold">
  Hero Title
</h1>

<h2 className="font-display text-4xl sm:text-5xl font-bold">
  Section Title
</h2>

<h3 className="font-display text-lg font-semibold">
  Card Title
</h3>
```

**Body Text (Inter):**
```tsx
<p className="text-lg text-muted-foreground">
  Large body text for descriptions
</p>

<p className="text-sm text-muted-foreground">
  Standard body text
</p>

<p className="text-xs text-muted-foreground">
  Small text for captions
</p>
```

**Technical Text (JetBrains Mono):**
```tsx
<span className="font-mono text-xs uppercase tracking-widest text-primary">
  LIVE · STATUS · LABEL
</span>

<span className="font-mono text-[10px] font-bold">
  TAG
</span>

<code className="font-mono text-sm">
  code snippet
</code>
```

### Font Weights

- Regular: `font-normal` (400)
- Medium: `font-medium` (500)
- Semibold: `font-semibold` (600)
- Bold: `font-bold` (700)

---

## Spacing & Layout

### Container

```tsx
<div className="container mx-auto px-4">
  {/* Max-width: 1400px (2xl breakpoint), centered, 16px horizontal padding */}
</div>
```

### Section Spacing

```tsx
<section className="py-24">
  {/* 96px vertical padding (24 * 4px) */}
</section>

<section className="relative py-24 bg-background">
  {/* Standard section with background */}
</section>
```

### Component Spacing

**Gap Utilities:**
- `gap-2` (8px) - Tight spacing (icon + text, small elements)
- `gap-4` (16px) - Standard spacing (buttons, form fields)
- `gap-6` (24px) - Loose spacing (cards in grid)
- `gap-8` (32px) - Section-level spacing

**Margin/Padding:**
- `mb-4` (16px) - Small bottom margin
- `mb-6` (24px) - Medium bottom margin
- `mb-12` (48px) - Large bottom margin (section headers)
- `mt-4` (16px) - Small top margin
- `mt-10` (40px) - Large top margin

### Border Radius

```css
--radius: 0.5rem;  /* Base radius (8px) */
```

**Usage:**
- `rounded-md` (8px) - Cards, panels, images
- `rounded-lg` (12px) - Large cards
- `rounded-xl` (16px) - Inputs, search bars
- `rounded-full` - Buttons, badges, tags, avatars

---

## Component Styles

### Section Header Pattern

```tsx
<div className="mb-12 text-center">
  {/* Status indicator */}
  <div className="mb-4 inline-flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
    <span className="font-mono text-xs uppercase tracking-widest text-primary">
      LIVE · LABEL · STATUS
    </span>
  </div>
  
  {/* Title */}
  <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
    Section Title with <span className="text-gradient-cyan">Gradient</span>
  </h2>
  
  {/* Description */}
  <p className="mt-4 text-muted-foreground">
    Description text explaining the section content
  </p>
</div>
```

### Card Styles

**Basic Card:**
```tsx
<div className="overflow-hidden rounded-md border border-border bg-card p-4">
  {/* Card content */}
</div>
```

**Interactive Card with Hover:**
```tsx
<div className="group relative overflow-hidden rounded-md border border-border bg-card p-4 card-hover-cyan transition-all">
  {/* Card content */}
  
  {/* Hover overlay */}
  <div className="absolute inset-0 flex flex-col justify-end bg-background/75 p-3 opacity-0 transition-opacity group-hover:opacity-100">
    {/* Hover content */}
  </div>
</div>
```

**Card with Image:**
```tsx
<div className="overflow-hidden rounded-md border border-border bg-card">
  <img src={url} alt={title} className="w-full h-48 object-cover" />
  <div className="p-4">
    <h3 className="font-display text-lg font-semibold text-foreground">Title</h3>
  </div>
</div>
```

### Button Styles

**Primary Button:**
```tsx
<button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-105 glow-cyan">
  <Icon className="h-4 w-4" />
  Button Text
</button>
```

**Secondary Button:**
```tsx
<button className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 font-display text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-muted">
  <Icon className="h-4 w-4" />
  Button Text
</button>
```

**Small Button:**
```tsx
<button className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
  <Icon className="h-3 w-3" />
  Copy
</button>
```

**Icon Button:**
```tsx
<button className="rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors">
  <Icon className="h-4 w-4" />
</button>
```

### Badge/Tag Styles

**Accent Badge:**
```tsx
<span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-accent-foreground">
  🔥 HOT
</span>
```

**Muted Badge:**
```tsx
<span className="rounded-full bg-muted/80 px-2 py-0.5 font-mono text-[10px] text-foreground">
  r/subreddit
</span>
```

**Status Badge:**
```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2">
  <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
  <span className="font-mono text-xs text-primary">LIVE</span>
</div>
```

### Input Styles

**Search Input:**
```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <input
    type="text"
    placeholder="Search..."
    className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
  />
</div>
```

**Tab Buttons:**
```tsx
<button className="rounded-full px-4 py-2 font-mono text-xs transition-all bg-accent text-accent-foreground">
  Active Tab
</button>

<button className="rounded-full px-4 py-2 font-mono text-xs transition-all border border-border text-muted-foreground hover:border-accent hover:text-foreground">
  Inactive Tab
</button>
```

### Navigation Styles

**Navbar:**
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
  <div className="container mx-auto flex h-16 items-center justify-between px-4">
    {/* Logo */}
    <a href="#" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
        <Zap className="h-4 w-4 text-primary-foreground" />
      </div>
      <span className="font-display text-xl font-bold text-foreground">
        PIX<span className="text-primary">VAULT</span>
      </span>
    </a>
    
    {/* Nav links */}
    <a href="#section" className="font-mono text-sm text-muted-foreground transition-colors hover:text-primary">
      Link
    </a>
  </div>
</nav>
```

**Footer:**
```tsx
<footer className="border-t border-border bg-card py-12">
  <div className="container mx-auto px-4">
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Logo */}
      {/* Description */}
      {/* Links */}
      <div className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} PIXVAULT
      </div>
    </div>
  </div>
</footer>
```

---

## Visual Effects

### Gradient Text

```tsx
<span className="text-gradient-cyan">
  Cyan to Violet Gradient
</span>

<span className="text-gradient-coral">
  Coral to Amber Gradient
</span>
```

**CSS Definition:**
```css
.text-gradient-cyan {
  @apply bg-clip-text text-transparent;
  background-image: linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--electric-violet)));
}

.text-gradient-coral {
  @apply bg-clip-text text-transparent;
  background-image: linear-gradient(135deg, hsl(var(--hot-coral)), hsl(var(--amber-tag)));
}
```

### Glow Effects

```tsx
<div className="glow-cyan">Cyan glow shadow</div>
<div className="glow-violet">Violet glow shadow</div>
<div className="glow-coral">Coral glow shadow</div>
```

**CSS Definition:**
```css
.glow-cyan {
  box-shadow: 0 0 20px hsl(var(--neon-cyan) / 0.3), 0 0 60px hsl(var(--neon-cyan) / 0.1);
}

.glow-violet {
  box-shadow: 0 0 20px hsl(var(--electric-violet) / 0.3), 0 0 60px hsl(var(--electric-violet) / 0.1);
}

.glow-coral {
  box-shadow: 0 0 20px hsl(var(--hot-coral) / 0.3);
}
```

### Card Hover Effects

```tsx
<div className="card-hover-cyan">Hover for cyan border</div>
<div className="card-hover-violet">Hover for violet border</div>
<div className="card-hover-coral">Hover for coral border</div>
```

**CSS Definition:**
```css
.card-hover-cyan:hover {
  border-color: hsl(var(--neon-cyan));
}

.card-hover-violet:hover {
  border-color: hsl(var(--electric-violet));
}

.card-hover-coral:hover {
  border-color: hsl(var(--hot-coral));
}
```

### Loading Shimmer

```tsx
<div className="shimmer h-32 w-full rounded-md" />
```

**CSS Definition:**
```css
.shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--ghost-line)) 0%,
    hsl(var(--muted)) 50%,
    hsl(var(--ghost-line)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Background Effects

**Grid Pattern:**
```tsx
<div 
  className="absolute inset-0 opacity-[0.03]"
  style={{
    backgroundImage: `linear-gradient(hsl(var(--neon-cyan)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-cyan)) 1px, transparent 1px)`,
    backgroundSize: '60px 60px'
  }}
/>
```

**Gradient Orbs:**
```tsx
<div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
<div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />
```

### Animations

**Pulse Glow:**
```tsx
<div className="animate-pulse-glow">Pulsing element</div>
```

**Float:**
```tsx
<div className="animate-float">Floating element</div>
```

**Tailwind Config:**
```ts
keyframes: {
  "pulse-glow": {
    "0%, 100%": { opacity: "1" },
    "50%": { opacity: "0.5" },
  },
  "float": {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-10px)" },
  },
}
```

### Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--void-black));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--ghost-line));
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}
```

---

## Responsive Design

### Breakpoints

```ts
screens: {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices
  '2xl': '1400px' // Container max-width
}
```

### Mobile-First Approach

```tsx
{/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>

{/* Responsive text sizes */}
<h1 className="text-5xl sm:text-6xl lg:text-7xl">
  Responsive Heading
</h1>

{/* Hide/show on breakpoints */}
<div className="hidden md:flex">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

### Responsive Spacing

```tsx
{/* Responsive padding */}
<section className="py-12 md:py-24">

{/* Responsive gap */}
<div className="flex gap-2 md:gap-4 lg:gap-6">

{/* Responsive container padding */}
<div className="container mx-auto px-4 md:px-6 lg:px-8">
```

---

## Design Tokens

### Complete Token Reference

```css
:root {
  /* Colors */
  --background: 240 20% 3.5%;
  --foreground: 240 20% 96%;
  --card: 240 20% 6%;
  --card-foreground: 240 20% 96%;
  --popover: 240 20% 6%;
  --popover-foreground: 240 20% 96%;
  --primary: 190 100% 50%;
  --primary-foreground: 240 20% 3.5%;
  --secondary: 263 70% 50%;
  --secondary-foreground: 0 0% 100%;
  --muted: 240 15% 12%;
  --muted-foreground: 260 20% 72%;
  --accent: 348 100% 65%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 15% 15%;
  --input: 240 15% 15%;
  --ring: 190 100% 50%;

  /* Custom tokens */
  --void-black: 240 20% 3.5%;
  --night-panel: 240 25% 5.5%;
  --ghost-line: 240 18% 15%;
  --neon-cyan: 190 100% 50%;
  --electric-violet: 263 70% 50%;
  --hot-coral: 348 100% 65%;
  --ice-white: 240 100% 97%;
  --lavender-fog: 260 20% 72%;
  --amber-tag: 38 92% 50%;

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-body: 'Inter', sans-serif;

  /* Spacing */
  --radius: 0.5rem;
}
```

### Icon Sizing

```tsx
{/* Inline icons (with text) */}
<Icon className="h-4 w-4" />

{/* Standalone icons */}
<Icon className="h-5 w-5" />

{/* Small icons (badges, tags) */}
<Icon className="h-3 w-3" />

{/* Large icons (hero sections) */}
<Icon className="h-6 w-6" />
```

---

## Design Principles

### Visual Hierarchy

1. **Primary Focus**: Neon cyan (`--primary`) for main CTAs and important actions
2. **Secondary Focus**: Electric violet (`--secondary`) for secondary actions
3. **Accents**: Hot coral (`--accent`) for highlights, tags, and special elements
4. **Content**: Ice white (`--foreground`) for primary text
5. **Supporting**: Lavender fog (`--muted-foreground`) for secondary text

### Consistency Rules

- Always use `font-display` for headings and buttons
- Always use `font-mono` for technical labels and tags
- Always use `rounded-full` for buttons and badges
- Always use `rounded-md` for cards and images
- Always include hover states on interactive elements
- Always use `transition-*` classes for smooth animations
- Always use semantic color names (`bg-primary` not `bg-cyan-500`)

### Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Include focus states: `focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`
- Use semantic HTML elements
- Include ARIA labels for icon-only buttons
- Ensure keyboard navigation works

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Maintainer:** Domince Aseberos
