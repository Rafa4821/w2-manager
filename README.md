# W2 Manager

A client-side W2 tax document management application built with React, Vite, and JavaScript. The application runs entirely in the browser — no backend, APIs, or database required.

## Tech Stack

| Category       | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | React 19 + Vite 8                   |
| Language       | JavaScript (ES2024, no TypeScript)  |
| Styling        | Bootstrap 5 + Tailwind CSS v4       |
| Routing        | React Router v6                     |
| State          | Zustand                             |
| Validation     | Zod                                 |
| Icons          | Lucide React                        |
| Linting        | ESLint                              |
| Testing        | Vitest + Testing Library            |
| Deployment     | Vercel (SPA with client-side routing) |

## Tailwind CSS Prefix

Tailwind CSS v4 is configured with the `tw` prefix to avoid conflicts with Bootstrap 5 classes.

```css
/* Use Tailwind with prefix */
<div className="tw:flex tw:items-center tw:gap-4">

/* Use Bootstrap as usual */
<button className="btn btn-primary">
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation of the project structure.

## Deployment

### Vercel

The project includes `vercel.json` for zero-config deployment:

1. Connect the repository to Vercel
2. Vercel auto-detects Vite and deploys

### GitHub

The project is initialized with `.gitignore` and ready for GitHub:

```bash
git init
git add .
git commit -m "Initial commit: W2 Manager project setup"
git remote add origin <your-repo-url>
git push -u origin main
```

## License

Private project.
