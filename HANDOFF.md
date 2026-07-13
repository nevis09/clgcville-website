# CLG Cville Website — Build Handoff

## What Was Built (Last 24 Hours)

A complete, production-ready church website for **Church Of The Living God** (Charlottesville, VA) — deployed and live at **clgcville.org**.

---

## Stack

- **Frontend:** Plain HTML/CSS/vanilla JS — no framework, no build step
- **Hosting:** Cloudflare Pages (auto-deploys on every `git push` to `main`)
- **Repo:** `github.com/nevis09/clgcville-website`, branch `main`
- **Domain:** `clgcville.org` + `www.clgcville.org` — both active with SSL via Cloudflare
- **Backend:** Cloudflare Pages Functions (`functions/api/`) — serverless, no separate server
- **Content storage:** JSON files in `_data/` committed to GitHub via the GitHub Contents API

---

## Design Tokens

```
Primary:  #1B4332  (dark green)
Accent:   #C9A84C  (gold)
Dark BG:  #0D1F17
Fonts:    Playfair Display, Inter, Cormorant Garamond (Google Fonts)
```

---

## Site Pages

| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | About |
| `pastor.html` | Pastor |
| `sermons.html` | Sermons |
| `events.html` | Events |
| `ministries.html` | Ministries |
| `contact.html` | Contact |
| `give.html` | Give/Donate |
| `admin/index.html` | Decap CMS (GitHub PKCE auth) |
| `admin-portal/index.html` | **Custom Admin Portal** (username/password) |

---

## Content Data Files (`_data/`)

| File | Used For |
|------|----------|
| `settings.json` | Church name, phone, email, address, service times, social links |
| `home.json` | Hero tagline, welcome text, mission statement |
| `pastor.json` | Pastor name, title, photo, bio, quote |
| `sermons/*.json` | Individual sermon entries |
| `events/*.json` | Individual event entries |
| `announcements/*.json` | Individual announcement entries |
| `ministries/*.json` | Ministry entries |
| `gallery/*.json` | Gallery image entries |

---

## Custom Admin Portal (`/admin-portal`)

A single-page admin dashboard built entirely in `admin-portal/index.html`. No framework — pure JS.

### Auth Flow
- Login POSTs `{ username, password }` to `/api/login`
- Server verifies against Cloudflare env vars, returns `ADMIN_TOKEN`
- Token stored in `sessionStorage`, sent with every subsequent API call

### Credentials
- **Username:** `admin`
- **Password:** `Christ`
- **URL:** `clgcville.org/admin-portal`

### Dashboard Sections
- **Site Settings** — church info + social media links
- **Home Page** — hero/welcome content
- **Pastor** — pastor bio and photo
- **Sermons** — CRUD collection
- **Events** — CRUD collection
- **Announcements** — CRUD collection

### Key JS Globals
```javascript
APP = { token, section, collectionCache }
switchSection(name)     // nav between sections
loadSection(name)       // fetch + render a section
saveForm(section)       // PUT single-file section
saveCollectionItem()    // PUT collection item
```

---

## Cloudflare Pages Functions

### `functions/api/login.js`
- `POST /api/login` — verifies credentials, returns session token
- Reads: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_TOKEN` from env

### `functions/api/content.js`
- `GET /api/content?section=settings` — reads single JSON file from GitHub raw
- `GET /api/content?section=sermons` — lists all items in `_data/sermons/`
- `PUT /api/content` `{ token, section, data, ?fileName }` — commits file to GitHub
- `DELETE /api/content` `{ token, filePath }` — deletes file from GitHub
- Reads: `ADMIN_TOKEN`, `GITHUB_TOKEN` from env

---

## Cloudflare Environment Variables (all set)

| Name | Value | Type |
|------|-------|------|
| `ADMIN_USERNAME` | `admin` | Plaintext |
| `ADMIN_PASSWORD` | `Christ` | Plaintext |
| `ADMIN_TOKEN` | `clg-cville-2024-K7mP3xQ9rZ` | Plaintext |
| `GITHUB_TOKEN` | *(fine-grained PAT)* | Secret (encrypted) |

**GitHub PAT:** "CLG Admin Content" — fine-grained, scoped to `clgcville-website` repo, Contents: Read+Write. Expires Aug 11, 2026.

---

## Decap CMS (`/admin`)

Configured at `admin/config.yml` with GitHub PKCE backend.
- **OAuth App Client ID:** `0v23li6fVtdxmGawuxbg`
- Requires GitHub login (separate from the custom admin portal)
- Media uploads go to `assets/images/`

---

## Content Still Needed (Placeholders)

The following are still `[PLACEHOLDER]` values in `_data/`:
- Church phone number
- Tagline / motto
- Pastor name, title, photo, bio
- Home page hero image, welcome text, mission statement
- Any sermons, events, announcements

All can be updated via the admin portal at `clgcville.org/admin-portal`.

---

## How Saves Work

1. Admin edits a field in the dashboard → clicks Save
2. `PUT /api/content` → Cloudflare Function calls GitHub Contents API → commits JSON to `main`
3. Cloudflare Pages detects new commit → auto-redeploys (~60 seconds)
4. Site reflects updated content

---

## Files of Note

```
clgcville-website/
├── admin-portal/index.html     # Complete SPA admin dashboard
├── functions/
│   └── api/
│       ├── login.js            # Auth endpoint
│       └── content.js          # Content CRUD endpoint
├── _data/                      # JSON content files
├── assets/
│   ├── css/style.css
│   └── js/main.js
├── admin/config.yml            # Decap CMS config
└── HOSTING-GUIDE.md            # ELI5 hosting guide for the client
```
