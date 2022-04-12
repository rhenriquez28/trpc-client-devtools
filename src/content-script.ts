import mainWorld from "./content-main-world?script&module";

const script = document.createElement("script");
script.src = chrome.runtime.getURL(mainWorld);
script.type = "module";
script.addEventListener("load", () => {
  console.log("script loaded");
});
script.addEventListener("error", (err) => {
  console.log("script error");
  console.error(err);
});

console.log("starting script");
document.head.append(script);
