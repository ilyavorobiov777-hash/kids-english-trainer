# PWA Install Guide

The app can be installed on phones, tablets and Windows after it is deployed to a public HTTPS URL, for example Vercel.

Local `localhost` works only while the Windows computer is turned on and the dev server is running. After Vercel deploy, the tablet/iPhone/Windows laptop can open the app from the production URL even when the local computer is off.

## Android Tablet

Use Chrome or Yandex Browser:

1. Open the Vercel production URL.
2. Wait until the app loads.
3. Open the browser menu.
4. Tap `Install app` or `Add to Home screen`.
5. Confirm install.
6. Open `Kids English Trainer` from the home screen.

## iPhone / iPad

Use Safari:

1. Open the Vercel production URL in Safari.
2. Tap the Share button.
3. Tap `Add to Home Screen`.
4. Confirm the app name.
5. Open the app from the home screen.

iPhone installs PWAs through Safari. Chrome on iPhone cannot install the app in the same way.

## Windows

Use Yandex Browser, Chrome, or Edge:

1. Open the Vercel production URL.
2. Look for the install icon in the address bar.
3. If there is no icon, open the browser menu.
4. Choose `Install app`, `Apps`, or `Install this site as an app`.
5. Pin the app to Start or taskbar if useful.

## Data And Offline Notes

- Lesson history is saved through Supabase.
- Cards, texts, attempts and statistics need internet for full sync.
- Production sync goes through the Vercel API proxy, so mobile browsers should not need direct access to the Supabase host.
- Full offline learning mode is not implemented yet.
- The PWA shell/static files may open from browser cache after first load, but login and progress sync require network.
- Browser SpeechSynthesis can sound different on Windows, Android and iPhone.
- Mobile browsers may require the child to tap `Listen` before speech starts.

## If Install Option Does Not Appear

Check:

- URL starts with `https://`;
- `/manifest.webmanifest` loads;
- `public/sw.js` exists in the deployed app;
- icons exist in `public/icons`;
- browser supports PWA install;
- you are not opening another computer's `localhost`.
