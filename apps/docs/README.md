# Zeity Documentation

Modern documentation site for Zeity built with [Docus](https://docus.dev/).

## Development

Start the development server:

```bash
# From root
pnpm start:docs

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
│   └── 2.guide/            # User guides
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
  icon: i-lucide-rocket
```

### Use MDC components

Nuxt Content supports [MDC syntax](https://content.nuxt.com/docs/files/markdown):

```markdown
::tip
This is a tip alert
::

::note
This is an info alert
::

::warning
This is a warning alert
::
```

### Static Hosting

```bash
pnpm generate
```

Deploy the `.output/public` directory to any static hosting provider.
