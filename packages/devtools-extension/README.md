# tRPC Client Devtools Chrome Extension

There are two main pieces to this project: the extension itself, and a React app. The extension folder is where we put all the things related to make the extension communicate with the browser and the Devtools link. The React app powers the experience of the Devtools panel.

# Credits and Prior Art

- The basis for this project were originally forked from [crx-react-devtools](https://github.com/jacksteamdev/crx-react-devtools)
- The folder structure and README, and UI were heavily inspired by [apollo-client-devtools](https://github.com/apollographql/apollo-client-devtools)
- The architecture to communicate between the client and the extension via the content and background scripts were taken from [Patrick Desjardins](https://github.com/MrDesjardins)' [Data Access Gateway Chrome Extension](https://github.com/MrDesjardins/dataaccessgatewaychromeextension). Here's [an article](https://patrickdesjardins.com/blog/how-to-communicate-from-your-website-to-a-chrome-extension) in which he explains how the communication process works.
