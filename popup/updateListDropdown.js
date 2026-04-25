/**
 * Tell the service worker to fetch the wish lists from the server.
 * Note that fetching continues after this function finishes.
 */
async function triggerFetchWishLists() {
    try {
        const response = await chrome.runtime.sendMessage({action: 'fetchWishLists'});
        console.log(response); //DEBUG
    } catch (error) {
        console.error('Failed to send message to service worker:', error);
    }
}

/**
 * Get the wish lists stored in memory and return them.
 */
async function getWishLists() {
    // try to fetch wish list data from memory
    let wishListsData;
    try {
        wishListsData = (await chrome.storage.session.get(['wishLists'])).wishLists;
    } catch (error) {
        wishListsData = {} //STUBBED
    }
    console.log(wishListsData); //DEBUG

    return wishListsData;
}

/**
 * Update the dropdown in the HTML page with the list of wish lists from memory.
 */
async function updateListDropdown() {
    // get the dropdown menu from the HTML DOM
    const dropdown = document.getElementById('list-select');

    // get the wish lists from the server
    const wishLists = await getWishLists();

    // replace options with wish lists fetched from the server
    while (dropdown.options.length > 0) {
        dropdown.remove(0);
    }
    for (const id in wishLists) {
        let newOption = document.createElement('option');
        newOption.value = id;
        newOption.text = wishLists[id];
        dropdown.appendChild(newOption);
    }
}

/*
This script runs every time the pop-up window is opened. When it runs, the following things happen:
1. The script registers to receive messages so that the list dropdown can be updated if the service
worker sends a message that new wish lists have been fetched.
2. The service worker is triggered to fetch wish lists from the server so that the wish lists the user
looks at will be up-to-date. The service worker is the process that fetches the lists so that fetching
continues properly if the pop-up window closes.
3. The list dropdown is updated according to the current wish lists stored in memory. These will usually
be accurate, but sometimes there may have been a change on the server not yet reflected locally. This
is fine because the service worker is already fetching the up-to-date lists, and the dropdown will
be updated by the listener once the lists have been fetched. This will probably happen before the user
even clicks the dropdown, so everything will be accurate. If all else fails, the lists stored in
memory will be accurate the next time the user opens the pop-up window, which this script pulls from.
*/

// register a listener for when messages are sent from the service worker
chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message.action === 'wishListsFetched') {
        // update wish list dropdown
        console.log("Updating the wish list dropdown."); //STUBBED
        return true;
    } else {
        console.log("Received unexpected message:", message);
        return;
    }
});

// trigger the service worker to fetch wish lists from the server
triggerFetchWishLists()

// update the wish list dropdown from memory
updateListDropdown();
