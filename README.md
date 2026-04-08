# Astikan Superadmin Portal

Superadmin React app for corporates, doctors, hospitals, labs, AI governance, logs, support CRM, and operational controls.

## Local

```bash
npm install
npm run dev
```

Default dev URL:
- `http://localhost:5176`

## Production

Live URL:
- `https://superadmin.astikan.tech`

SSL is handled on the VPS through Let’s Encrypt and nginx.

## Backend integration

All backend calls go through:
- `/api/*`

The platform logs page can surface:
- frontend browser logs
- backend logs

## Deploy

Published on the VPS under:
- `/srv/astikan/apps/superadmin/current`

