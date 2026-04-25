// register a listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("Installed the Universal Wish List extension.");
});

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message.action === 'fetchWishLists') {
          console.log("Fetching wish lists from the server.");
          sendResponse({status: "fetching"});

          const { apiUrl } = await chrome.storage.sync.get('apiUrl');
          if (!apiUrl) {
              console.warn("No API URL set. Configure it in Settings.");
              return true;
          }

          const response = await fetch(apiUrl);
          if (!response.ok) {
              throw new Error(`Fetch failed: ${response.status}`);
          }
          return true;
      } else {
          console.log("Received unexpected message.");
          return;
      }
});