# Initial Frontend - 13 Connected Screens

This project contains 13 HTML screens:

- screen1/code.html
- screen2/code.html
- screen3/code.html
- screen4/code.html
- screen5/code.html
- screen6/code.html
- screen7/code.html
- screen8/code.html
- screen9/code.html (Auth)
- screen10/code.html (Profile)
- screen11/code.html (Messaging)
- screen12/code.html (Resource Sharing)
- screen13/code.html (Feedback)

## How To Run

1. Open terminal at the project root.
2. Run:

```bash
python -m http.server 5500
```

3. Open:

- http://localhost:5500/screen9/code.html (recommended entry)
- or any other screen URL listed below.

## Backend API Base URL

Edit `shared/runtime-config.js` and set:

- `window.APP_API_BASE = "http://localhost:8080"` (or your gateway URL)

The frontend uses real API calls with `credentials: include` for JWT cookie session handling when demo mode is off.

## Demo Defaults (No Backend Needed)

By default, demo mode is enabled in `shared/runtime-config.js`:

- `window.APP_DEMO_MODE = true`

Use these credentials on screen 9:

- Student: `student01` / `demo123`
- Faculty: `faculty01` / `demo123`
- Admin: `admin01` / `demo123`
- Warden: `warden01` / `demo123`

To use your real backend instead:

- Set `window.APP_DEMO_MODE = false`
- Keep `window.APP_API_BASE` pointing to your backend gateway

## How To Run Individual Screens Quickly

Use any one of these URLs directly after starting the server:

- http://localhost:5500/screen1/code.html
- http://localhost:5500/screen2/code.html
- http://localhost:5500/screen3/code.html
- http://localhost:5500/screen4/code.html
- http://localhost:5500/screen5/code.html
- http://localhost:5500/screen6/code.html
- http://localhost:5500/screen7/code.html
- http://localhost:5500/screen8/code.html
- http://localhost:5500/screen9/code.html
- http://localhost:5500/screen10/code.html
- http://localhost:5500/screen11/code.html
- http://localhost:5500/screen12/code.html
- http://localhost:5500/screen13/code.html

## What Is Connected

All screens include a shared floating navigator in the bottom-right corner:

- Prev button
- Next button
- Screen number dropdown (1-13)
- Keyboard navigation with Left/Right arrow keys

Flow behavior:

- Prev on screen 1 goes to screen 13
- Next on screen 13 goes to screen 1

## Functional Button System

Buttons are now wired through a shared script in `shared/app-shell.js`.

- Navigation links now route to relevant screens.
- Core actions (leave, transcript request, assignment upload, complaint, enrollment, review, support) are interactive.
- API and DB insertion points are clearly marked in code comments.
- Role-based visibility is enforced for Student, Faculty, Admin, and Warden.

## Backend Mapping

See `BACKEND_INTEGRATION.md` for endpoint and database mapping extracted from `final.pdf`.
