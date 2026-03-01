# UBL Builder Showcase

This project is a React + TypeScript showcase built to demonstrate how to use the [ubl-builder](https://www.npmjs.com/package/ubl-builder) library in a real frontend app.

Live site: https://pipesanta.github.io/ubl-builder-demo/

## Purpose

The goal of this repository is to provide a simple, practical reference for:

- Setting up a Vite + React app with ubl-builder
- Exploring the library through a dedicated Showcase page
- Using basic client-side routing for a clean demo flow
- Publishing the app to GitHub Pages

## Routes

- `/` → Home page
- `/showcase` → ubl-builder showcase page
- `*` → Not Found page

The app uses HashRouter to work correctly on GitHub Pages.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- ubl-builder

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Deployment (GitHub Pages)

This repository is configured to publish the `dist` folder using `gh-pages`.

```bash
npm run deploy
```

Notes:

- Vite `base` is set to `/ubl-builder-demo/`
- Router is configured with `HashRouter`

## Project Structure

- `src/pages/HomePage.tsx` → Home screen
- `src/pages/ShowcasePage.tsx` → ubl-builder showcase
- `src/pages/NotFoundPage.tsx` → 404 page
