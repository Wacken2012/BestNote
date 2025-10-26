Run accessibility tests (Playwright + axe)

1. Install dependencies:

```bash
npm install
npm run playwright:install
```

2. Start the dev server in another terminal:

```bash
npm run dev
```

3. Run the tests:

```bash
npm run test:accessibility
```

Notes:
- Tests expect the app to be available at http://localhost:5173
- axe reports are printed to the console; you can extend tests to write HTML reports
