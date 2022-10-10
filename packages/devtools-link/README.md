# tRPC Client Devtools Link

> A neat link to use the tRPC Client Devtools extension with your tRPC app

This link lets your app communicate with the tRPC Client Devtools extension. You can download it for [Chrome](https://chrome.google.com/webstore/detail/trpc-client-devtools/ocolkjnalnkdaclepjmkigefcgngkadb?hl=en&authuser=1) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/trpc-client-devtools/).

## Installation

```
npm install trpc-client-devtools-link
```

## Example

```ts
import { devtoolsLink } from "trpc-client-devtools-link"
...
links: [
  devtoolsLink({
    // `enabled` is true by default
    // If you want to use the devtools extension just for development, do the following
    enabled: process.env.NODE_ENV === 'development'
  }),
  httpLink({
    url,
  })
],
...
```

## Requirements

Peer dependencies:

- tRPC Client v9 (`@trpc/client@^9.27.2`) must be installed.
- tRPC Server v9 (`@trpc/server@^9.27.2`) must be installed.

## Credits

- This link is a modified version of the original `loggerLink` implemented in tRPC. You can check it out [here](https://github.com/trpc/trpc/blob/main/packages/client/src/links/loggerLink.ts).
- This library took heavily from the concepts to communicate between a library and a Chrome extension found in [this article](https://patrickdesjardins.com/blog/how-to-communicate-from-your-website-to-a-chrome-extension) from [Patrick Desjardins](https://github.com/MrDesjardins).
