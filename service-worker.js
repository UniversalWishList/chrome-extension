

// register a listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("Installed the Universal Wish List extension.");
});

// register a listener for when messages are sent from other parts of the extension
chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
//   const response = await fetch('https://example.com');
//   if (!response.ok) {
//     // rejects the promise returned by `async function`.
//     throw new Error(`Fetch failed: ${response.status}`);
//   }
//   // resolves the promise returned by `async function`.
//   return {statusCode: response.status};
    if (message.action === 'fetchWishLists') {
        // fetch wish lists from the server
        console.log("Fetching wish lists from the server.");
        sendResponse({status: "fetching"});
        return true;
    } else {
        console.log("Received unexpected message:", message);
        return;
    }
});