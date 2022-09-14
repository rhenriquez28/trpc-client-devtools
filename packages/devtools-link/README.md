# tRPC Client Devtools Link

> A neat link to use the tRPC Client Devtools Chrome extension with your tRPC app

This link lets your app communicate with the tRPC Client Devtools Chrome extension, which you can [download here.]()

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

## Credits

- This link is a modified version of the original `loggerLink` implemented in tRPC. You can check it out [here](https://github.com/trpc/trpc/blob/main/packages/client/src/links/loggerLink.ts).
- This library took heavily from the concepts to communicate between a library and a Chrome extension found in [this article](https://patrickdesjardins.com/blog/how-to-communicate-from-your-website-to-a-chrome-extension) from [Patrick Desjardins](https://github.com/MrDesjardins).
