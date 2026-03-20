# Family Gym Tracker — PWA Deployment

## Files
All 6 files must be in the same folder:
- `gym-tracker.html` — the app
- `manifest.json` — tells Android this is an installable app
- `sw.js` — service worker, enables offline use
- `icon.svg` — vector app icon
- `icon-192.png` — 192×192 app icon
- `icon-512.png` — 512×512 app icon

## Option A: GitHub Pages (free, public internet)

1. Create a GitHub account if you don't have one
2. Create a new repository (e.g. "gym-tracker")
3. Upload all 6 files to the repository root
4. Go to Settings → Pages → Source: "main" branch → Save
5. After ~1 minute, your app is live at: `https://yourusername.github.io/gym-tracker/gym-tracker.html`
6. Open that URL on the tablet in Chrome
7. Chrome will show an "Install app" banner — tap it
8. Done. App icon appears in the app drawer, launches fullscreen, works offline.

## Option B: Local network server (no internet needed)

On any computer on your wifi network:

### Mac/Linux:
```
cd /path/to/folder-with-all-6-files
python3 -m http.server 8080
```

### Windows:
```
cd C:\path\to\folder-with-all-6-files
python -m http.server 8080
```

Then find your computer's local IP (usually 192.168.x.x):
- Mac: System Settings → Wi-Fi → Details → IP Address
- Windows: `ipconfig` in Command Prompt, look for IPv4 Address
- Linux: `ip addr` or `hostname -I`

On the tablet, open Chrome and go to:
`http://192.168.x.x:8080/gym-tracker.html`

Tap the three-dot menu → "Install app" or "Add to Home Screen."

The app is now cached offline. You can stop the server.

## Option C: Cloudflare Pages (free, easiest)

1. Go to https://pages.cloudflare.com
2. Sign up, create a project via "Direct Upload"
3. Drag all 6 files into the upload area
4. Your app gets a URL like `https://gym-tracker-abc.pages.dev`
5. Open on tablet, install, done.

## Updating the app

When you change `gym-tracker.html`:
1. Upload/deploy the new file
2. Also change `CACHE_NAME` in `sw.js` (e.g. `gym-tracker-v2`)
3. Upload the new `sw.js`
4. Next time the app opens with internet, it downloads the update automatically

If you only changed the HTML and not sw.js, the service worker
won't know to update. Bumping the cache version string is what
triggers the refresh.

## Data

All workout data is stored in the browser's localStorage on the tablet.
It survives app restarts and tablet reboots.
It does NOT survive clearing Chrome's app data.
Use the in-app backup export regularly.
