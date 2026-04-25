/**
 * Fetch a list of the user's wish lists from the server and store them in memory.
 */
async function fetchWishLists() {
    // make fetch request for wish lists to the server
    await new Promise(resolve => setTimeout(resolve, 2000));  // STUBBED
    let lists = {
        1: 'birthday',
        2: 'mom',
        3: 'christmas'
    }; //STUBBED

    // store fetched wish lists in memory
    await chrome.storage.session.set({wishLists: lists})

    // alert the pop-up that new wish lists have been fetched and stored
    await chrome.runtime.sendMessage({action: 'wishListsFetched'});
}

// register a listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("Installed the Universal Wish List extension.");
});

// register a listener for when messages are sent from other parts of the extension
chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message.action === 'fetchWishLists') {
        // send response that fetching is occurring
        // TODO: add checks that fetching can occur (API key & endpoint are accessible)
        sendResponse({status: 'fetching'});
        // fetch wish lists from the server
        fetchWishLists();
        return true;
    } else {
        console.log("Received unexpected message:", message);
        return;
    }
});