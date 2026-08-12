# Daymark

Daymark is a private, account-based to-do web app. Visitors sign in with ChatGPT and receive an isolated task list backed by a Cloudflare D1 database.

## Features

- Account sign-in and sign-out
- Private tasks per user
- Add, edit, complete, filter, and delete tasks
- Priority and due-date fields
- Responsive mobile and desktop design

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The hosted version supplies identity headers and provisions the D1 database. The generated database migration is in `drizzle/`.

## Validation

```bash
npm test
```
