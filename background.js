chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      files: ['content.js'],
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { message: "refreshed" }, (response) => {
        console.log(response);
      });
    });
  }
});
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   chrome.tabs.sendMessage(tabs[0].id, { message: "installed" }, (response) => {
//     console.log(response)
//   });