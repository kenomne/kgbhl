# HL1 Old-School Responsive Template

Fan-made, responsive template with **Half-Life 1** vibes (no official Valve assets).  
All features are front-end only. To enable real auth/chat/forum/stats, connect a backend.

## Pages
- Home (`index.html`)
- News (`news.html`)
- Downloads (`downloads.html`)
- Forum (`forum.html`)
- Contact (`contact.html`)
- Login (`login.html`) — Google/Facebook buttons are **UI only**
- Game Redirect (`redirect.html`) — edit IP:PORT via the page UI

## Features
- Sidebar menu with icons, hazard stripes, grunge background
- Live clock, mini calendar
- Gaming radio (HTML5 audio, swap the stream URL)
- Bottom chat (local-storage demo)
- Poll (rating), saved locally
- Stats (approx online via heartbeats, per-page + total views via localStorage)
- Client-side search with `assets/js/search-index.json`
- Responsive layout with mobile sidebar toggle

## Install
1. Unzip this folder on your host (e.g., `/var/www/html/hlsite/`).
2. Open `index.html` to preview.
3. Set your server IP on `redirect.html` (or edit to hardcode your IP).

## Notes
- Replace the radio stream URL with your preferred gaming radio stream.
- To use real OAuth login, hook these buttons to a backend.
- To add a real forum, integrate a forum engine (phpBB/Discourse) or embed an iframe.

## License
MIT — keep the license, don’t imply Valve endorsement.
