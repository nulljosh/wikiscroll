# 📚 WikiScroll

**TikTok for Wikipedia** — endlessly scroll through random Wikipedia articles in a sleek, dark-mode interface.

## What is it?

WikiScroll is a full-screen, vertical-scrolling app that serves you random Wikipedia articles one at a time — just like TikTok, but for learning. Swipe up for the next article, swipe down to go back.

## Features

- 🎯 **Snap scrolling** — full-page vertical snap, one article at a time
- 🌙 **Dark mode** — sleek dark theme with purple accents
- 📸 **Thumbnails** — article images with blurred backdrop
- ♾️ **Infinite scroll** — keeps loading more as you go
- ▶️ **Auto-scroll** — optional 3-second auto-advance (floating play/pause button)
- 🔄 **Error handling** — retry logic, offline detection, user-friendly error messages
- 📱 **Mobile-friendly** — responsive, works great on phones
- 🔗 **Read more** — tap to open the full Wikipedia article

## Tech

- React + Vite (builds to static files)
- Wikipedia REST API (no backend needed)
- Vitest for testing (20 tests)

## Run locally

```bash
cd wikiscroll
npm install
npm run dev
```

Opens at http://localhost:5173

## Live

https://nulljosh.github.io/wikiscroll

## License

MIT
