# Zeity Documentation

Modern documentation site for Zeity built with [Nuxt Content](https://content.nuxt.com) and [Nuxt UI](https://ui.nuxt.com).

## Features

- 📖 **Full-text search** - Find documentation quickly
- 🌙 **Dark mode** - Automatic theme switching
- 🌐 **i18n support** - English and German
- 🤖 **AI integration** - MCP server and llms.txt
- 📱 **Responsive** - Works on all devices
- ⚡ **Fast** - Static site generation

## Development

Start the development server:

```bash
# From root
pnpm docs:dev

# Or from docs directory
cd apps/docs
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Structure

```
apps/docs/
├── app/
│   └── app.config.ts       # Site configuration
├── content/
│   ├── index.md            # Landing page
│   ├── 1.getting-started/  # Getting started guides
│   ├── 2.guide/            # User guides
│   └── 3.api/              # API reference
├── i18n/                   # Translations
├── public/                 # Static assets
└── nuxt.config.ts          # Nuxt configuration
```

## Adding Content

### Create a new page

1. Add a markdown file in `content/`
2. Use frontmatter for metadata:

```markdown
---
title: Page Title
description: Page description
---

## Your content here
```

### Add to navigation

Create or update `.navigation.yml` in the section folder:

```yaml
- title: Getting Started
  children:
    - title: Introduction
      to: /getting-started/introduction
    - title: Installation
      to: /getting-started/installation
```

### Use MDC components

Nuxt Content supports [MDC syntax](https://content.nuxt.com/usage/markdown):

```markdown
::alert{type="info"}
This is an info alert
::

::code-group
```bash [npm]
npm install
```
```bash [pnpm]
pnpm install
```
::
```

## Deployment

### Vercel

```bash
vercel --prod
```

### Netlify

```bash
pnpm generate
# Deploy .output/public
```

### Static Hosting

```bash
pnpm generate
```

Deploy the `.output/public` directory to any static hosting provider.

## License

MIT
