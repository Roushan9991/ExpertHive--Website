# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Google Sheets backend integration

This project now includes a simple backend server in `backend/server.mjs` that can persist student and expert records into Google Sheets.

To use it:

1. Create a Google service account and download its JSON credentials.
2. Share your Google Sheet with the service account email.
3. Set `GOOGLE_SHEET_ID` in a local `.env` file or your environment.
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the service account JSON file path.
5. Start the backend with `npm run server`.
6. The frontend will post student registrations to `/api/students` and expert applications to `/api/experts`.
