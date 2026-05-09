# PWA Install Guide

The app works from a tablet or phone only after it is deployed to a public HTTPS URL, for example on Vercel.

Local `localhost` works only on the computer where `npm run dev` is running. If that computer is off, a phone or tablet cannot open the local app.

## Android Tablet

Use Chrome or Yandex Browser:

1. Open the Vercel production URL.
2. Wait until the page loads.
3. Open the browser menu.
4. Tap `Install app` or `Add to Home screen`.
5. Confirm the install.
6. Open `Kids English Trainer` from the home screen.

If the install option does not appear:

- refresh the page;
- check that the URL starts with `https://`;
- check that you are not using `localhost`;
- open the site in Chrome if another browser hides PWA install.

## iPhone / iPad

Use Safari:

1. Open the Vercel production URL in Safari.
2. Tap the Share button.
3. Tap `Add to Home Screen`.
4. Confirm the name.
5. Open the app icon from the home screen.

Notes:

- iPhone uses Safari for PWA install.
- SpeechSynthesis usually needs the child to tap `Listen`; autoplay speech is not expected.

## Windows Laptop

Use Chrome, Edge, or Yandex Browser:

1. Open the Vercel production URL.
2. Look for the install icon in the address bar.
3. If there is no icon, open the browser menu.
4. Choose `Install app` or `Apps` -> `Install this site as an app`.
5. Pin the app to taskbar or Start menu if useful.

## What Works Offline

The PWA shell and cached static files may open after first load, depending on browser cache and service worker state.

Learning history, login, cards, and statistics depend on Supabase and require internet. For real practice syncing, keep the device online.

## What Requires Vercel

Use the Vercel production URL for:

- tablet access while the computer is off;
- iPhone access outside the local network;
- PWA install over HTTPS;
- production Supabase Auth redirects.

Use `localhost` only for development on the Windows computer.
