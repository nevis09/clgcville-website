# Church Of The Living God — Complete Hosting & Admin Guide
### Step-by-step. Nothing excluded.

---

## WHAT WE'RE DOING (Big Picture)

1. Put your website files on GitHub (free storage in the cloud)
2. Connect GitHub to Cloudflare Pages (free hosting that goes live)
3. Point your Spaceship domain (clgcville.org) to Cloudflare
4. Set up the Admin panel so you can update content without touching code

---

## PART 1 — PUSH YOUR SITE TO GITHUB

> You said you're already logged into GitHub in your browser. Good.

### Step 1 — Create a New GitHub Repository

1. Open your browser and go to: **https://github.com/new**
2. In the "Repository name" field, type: `clgcville-website`
3. Leave it set to **Public** (required for free Cloudflare Pages)
4. Do NOT check any of the "Initialize" boxes — leave them all unchecked
5. Click the green **"Create repository"** button
6. You'll see a page with setup instructions — leave this tab open

### Step 2 — Open Terminal on Your Mac

1. Press **Command + Space** on your keyboard
2. Type `Terminal` and press Enter
3. A black/white window will open — this is Terminal

### Step 3 — Navigate to Your Project Folder

Type this exactly and press Enter:
```
cd "/Users/nevis09/Documents/Build Projects/Websites/clgcville-website"
```

### Step 4 — Initialize Git (one-time setup)

Type each line below and press Enter after each one:

```
git init
git add .
git commit -m "Initial commit — Church Of The Living God website"
```

You'll see a bunch of text scroll by. That's normal.

### Step 5 — Connect to GitHub and Push

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username, then run:

```
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/clgcville-website.git
git branch -M main
git push -u origin main
```

- It may ask for your GitHub username and password
- For the password: GitHub no longer accepts regular passwords — you need a **Personal Access Token**
  - Go to: https://github.com/settings/tokens/new
  - Note: "clgcville push"
  - Expiration: 90 days (or No expiration)
  - Check the box: **repo** (full control)
  - Click "Generate token"
  - Copy the token — use it as your password in Terminal

### Step 6 — Verify It Worked

Go to `https://github.com/YOUR_GITHUB_USERNAME/clgcville-website` in your browser. You should see all your website files listed there.

---

## PART 2 — HOST ON CLOUDFLARE PAGES (FREE)

### Step 7 — Create a Cloudflare Account (if you don't have one)

1. Go to: **https://cloudflare.com**
2. Click **"Sign Up"**
3. Enter your email and create a password
4. Verify your email

### Step 8 — Add Cloudflare Pages

1. Once logged into Cloudflare, click **"Workers & Pages"** in the left sidebar
2. Click **"Pages"** tab at the top
3. Click the blue **"Create a project"** button
4. Click **"Connect to Git"**

### Step 9 — Connect GitHub to Cloudflare

1. Click **"GitHub"**
2. Click **"Connect GitHub"**
3. A popup will appear — log in to GitHub if asked
4. It will ask which repos to give access to — choose **"Only select repositories"**
5. Select `clgcville-website` from the list
6. Click **"Install & Authorize"**
7. Back in Cloudflare, you should see your `clgcville-website` repo listed
8. Click on it to select it
9. Click **"Begin setup"**

### Step 10 — Configure the Build Settings

On the setup screen:
- **Project name:** `clgcville-website` (auto-filled)
- **Production branch:** `main`
- **Framework preset:** None
- **Build command:** *(leave blank)*
- **Build output directory:** `/` (just a forward slash)

Click **"Save and Deploy"**

### Step 11 — Wait for Deployment

- Cloudflare will show a progress bar
- Takes about 1–2 minutes
- When done, you'll see a green checkmark and a URL like: `clgcville-website.pages.dev`
- Click that URL — your site is live on the internet! 🎉

---

## PART 3 — CONNECT YOUR DOMAIN (clgcville.org → Cloudflare)

### Step 12 — Add Your Domain to Cloudflare

1. In Cloudflare, click **"Add a site"** (or click your account name in the top left → "Add a domain")
2. Type: `clgcville.org`
3. Click **"Continue"**
4. Select the **Free** plan
5. Click **"Continue"**
6. Cloudflare will scan for DNS records — click **"Continue"** again
7. Cloudflare will give you **2 nameserver addresses** — they look like:
   - `xxxxx.ns.cloudflare.com`
   - `xxxxx.ns.cloudflare.com`
   - **Copy both of these — you'll need them in the next step**

### Step 13 — Update Nameservers on Spaceship

1. Go to: **https://spaceship.com** and log in
2. Click on your domain **clgcville.org**
3. Find the section called **"Nameservers"** or **"DNS"**
4. Click **"Change Nameservers"** or **"Custom Nameservers"**
5. Delete the existing nameservers
6. Enter the two nameservers Cloudflare gave you (from Step 12)
7. Save the changes

> ⏱ **Wait 15 minutes to 24 hours** for this to take effect. Usually it's fast (15–30 min).

### Step 14 — Connect Your Domain to Cloudflare Pages

1. Go back to Cloudflare → **Workers & Pages** → click your `clgcville-website` project
2. Click the **"Custom domains"** tab
3. Click **"Set up a custom domain"**
4. Type: `clgcville.org`
5. Click **"Continue"** then **"Activate domain"**
6. Do it again for `www.clgcville.org` (so both work)

> Cloudflare handles SSL (the padlock 🔒) automatically — free and automatic.

---

## PART 4 — SET UP THE ADMIN PANEL (Decap CMS)

This lets a non-technical person log in at `clgcville.org/admin` and update content, images, sermons, events, and more — without touching any code.

### Step 15 — Create a GitHub OAuth App

This is what lets the admin log in with GitHub credentials.

1. Go to: **https://github.com/settings/applications/new**
2. Fill in:
   - **Application name:** `CLG Cville Admin`
   - **Homepage URL:** `https://clgcville.org`
   - **Authorization callback URL:** `https://clgcville.org/admin/`
3. Click **"Register application"**
4. On the next page, you'll see a **Client ID** — copy it
5. Click **"Generate a new client secret"** → copy that too

> ⚠️ Save both the Client ID and Client Secret somewhere safe (like Notes app). You only see the secret once.

### Step 16 — Add Your Client ID to the Admin Config

1. Open this file in your project:
   `clgcville-website/admin/config.yml`
2. Find this line:
   ```
   app_id: REPLACE_WITH_YOUR_GITHUB_OAUTH_APP_CLIENT_ID
   ```
3. Replace `REPLACE_WITH_YOUR_GITHUB_OAUTH_APP_CLIENT_ID` with the Client ID you copied
4. Also find this line and put your GitHub username:
   ```
   repo: REPLACE_WITH_YOUR_GITHUB_USERNAME/clgcville-website
   ```
5. Save the file

### Step 17 — Push the Config Update to GitHub

In Terminal (make sure you're in the clgcville-website folder), run:

```
git add .
git commit -m "Add admin CMS config"
git push
```

Cloudflare will automatically redeploy in about 1 minute.

### Step 18 — Test the Admin Panel

1. Go to: **https://clgcville.org/admin**
2. You'll see a login screen saying "Login with GitHub"
3. Click it — log in with your GitHub account
4. You're in! You'll see a dashboard with sections for:
   - **Site Settings** — update tagline, phone, address, social links
   - **Home Page** — update hero image, welcome text
   - **Pastor Page** — update pastor name, photo, bio
   - **Sermons** — add/edit sermons
   - **Ministries** — add/edit ministries
   - **Events** — add/edit calendar events
   - **Gallery** — upload photos
   - **Announcements** — post news/updates

### How Editing Works

1. Admin logs in at `clgcville.org/admin`
2. Makes changes in the visual editor (like Google Docs for your website)
3. Clicks **"Publish"** or **"Save"**
4. Change saves to GitHub automatically
5. Cloudflare sees the change and redeploys the site in ~60 seconds
6. Changes are live on the website

---

## PART 5 — FUTURE UPDATES (Every Time You Change the Site via Code)

Whenever you (or Claude Code) make changes to the website files:

```
cd "/Users/nevis09/Documents/Build Projects/Websites/clgcville-website"
git add .
git commit -m "Describe what you changed"
git push
```

Cloudflare automatically picks it up and republishes the site. Takes about 60 seconds.

---

## QUICK REFERENCE CHEAT SHEET

| What | Where |
|---|---|
| View your live site | https://clgcville.org |
| Admin panel | https://clgcville.org/admin |
| GitHub repo | https://github.com/YOUR_USERNAME/clgcville-website |
| Cloudflare dashboard | https://dash.cloudflare.com |
| Spaceship (domain) | https://spaceship.com |
| Push code update | `git add . && git commit -m "update" && git push` |

---

## TROUBLESHOOTING

**Site not showing after domain change?**
Wait up to 24 hours. DNS changes take time to spread worldwide.

**Admin panel shows error?**
Make sure your GitHub OAuth App callback URL is exactly: `https://clgcville.org/admin/` (with the trailing slash)

**Changes not showing on live site?**
Go to Cloudflare → Workers & Pages → your project → check the "Deployments" tab to see if a new deploy triggered.

**Forgot to push changes?**
Run `git push` in Terminal from your project folder.
