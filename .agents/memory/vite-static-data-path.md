---
name: Vite static data fetch path
description: How to correctly build fetch URLs for static JSON files in Vite apps with BASE_URL.
---

**Rule:** Strip the trailing slash from `import.meta.env.BASE_URL` before concatenating a path.

**Why:** `BASE_URL` often ends with `/` (e.g. `"/"`). Concatenating `"/data/file.json"` gives `"//data/file.json"` — a protocol-relative URL that breaks in some environments.

**How to apply:**
```ts
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const res = await fetch(`${BASE}/data/dashboard.json`);
```

This works whether BASE_URL is `/`, `/my-app/`, or `https://cdn.example.com/app/`.
