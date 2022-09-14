# Vite-React Devtools Extension

> These instructions assume you're familiar with Chrome Extension development.
> If this is new to you, take a quick look at this article:
>
> [Create a Vite-React Chrome Extension in 90 seconds](https://dev.to/jacksteamdev/create-a-vite-react-chrome-extension-in-90-seconds-3df7).

## Getting started

### In the terminal

1. Run `npm install`
2. Run `npm run dev` to start building

### In the browser

3. Navigate to `chrome://extensions`
4. Enable developer mode
5. Drag the folder `dist/` onto `chrome://extensions`
6. Click the "service worker" link in the extension panel

![service worker link](./worker-link.png)

1. Open a page for development
2. Open the devtools inspector
3. Click "React Counter" in the devtools panel tabs

![devtools panel](./devtools-panel.png)

4.  Click the "devtools://..." link in the extension panel to inspect the devtools page

![devtools link](./devtools-link.png)

## Development Tips

Sometimes during development the devtools inspector link does not show in the extension dashboard. If this is the case, navigate to `chrome://inspect` and click the "Other" tab.

Vite must be running for the developement build of the extension to work. When you're ready to share your work, run `pnpm build` to output a production build of the extension.

## Architecture

This boilerplate puts the manifest in `vite.config.ts`. It declares two entry points: a devtools page and a content script.

```javascript
// vite.config.ts

const manifest = defineManifest({
  manifest_version: 3,
  name: "CRX devtools extension",
  version,
  content_scripts: [
    {
      js: ["src/content-script.ts"],
      matches: ["<all_urls>"],
      run_at: "document_start",
    },
  ],
  devtools_page: "src/devtools.html",
});
```

`content_scripts`: This content script injects a main world script. You can use this this main world script to access the JavaScript execution environment of the host page. Note the query string `?script&module`. It designates that the main world script import should output a file in ES module format and only import the script path.

```javascript
import mainWorld from "./content-main-world?script&module";
const script = document.createElement("script");
script.src = chrome.runtime.getURL(mainWorld);
```

`devtools_page`: You won't see this page, but you can inspect it in the "devtools://..." inspector. The devtools page has access to the [Chrome Devtools Panel API](https://developer.chrome.com/docs/extensions/reference/devtools_panels/), which you can use to create a visible panel in the inspector.

Working in the devtools page is different than a normal HTML page. While HMR will work as expected in the panel (`src/panel.html`), the devtools page (`src/devtools.html`) behaves differently.

Once the devtools page creates a panel, it can't be destroyed using the Chrome API, even after a full page reload. This means that when you make major changes to `src/devtools.ts`, you may need to close the inspector and reload the page you're using for development.
