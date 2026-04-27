/**
 * Get the user's saved API key from Chrome local storage and return it.
 * @returns {string} The user's API key.
 */
async function getSavedApiKey() {
    // get the API key from Chrome local storage
    const { apiKey } = await chrome.storage.local.get("apiKey");

    if (!apiKey) {
        throw new Error("No API key saved.");
    }

    return apiKey;
}

/**
 * Get the user's saved host address from Chrome local storage and return it.
 * @returns {string} The user's host address.
 */
async function getSavedHostAddress() {
    // get the host address from Chrome local storage
    const { hostAddress } = await chrome.storage.local.get("hostAddress");

    if (!hostAddress) {
        throw new Error("No host address saved.");
    }

    return hostAddress;
}

/**
 * Fetch a list of the user's wish lists from the server and store them in memory.
 * Requires the user's API key and endpoint to be accessible.
 * @param {string} apiKey The user's API key.
 * @param {string} hostAddress The user's host address.
 */
async function fetchWishLists(apiKey, hostAddress) {
    // make a GET call to the server
    const response = await fetch(`${hostAddress}/api/lists`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
    });

    // return the user's list(s) as json
    const listsFromApi = await response.json();

    // convert API list data into dictionary of list IDs to names
    const lists = {};
    for (const list of listsFromApi) {
        lists[list.id] = list.name;
    }

    // store fetched wish lists in memory
    await chrome.storage.session.set({wishLists: lists})

    // alert the pop-up that new wish lists have been fetched and stored
    await chrome.runtime.sendMessage({action: 'wishListsFetched'});
}

/**
 * Add the user's current URL to the wish list on the server.
 * Requires the user's API key and endpoint to be accessible.
 * @param {string} url The URL of the item to add to a list.
 * @param {string} wishList The wish list to add the URL to.
 * @param {string} apiKey The user's API key.
 * @param {string} hostAddress The user's host address.
 */
async function addItemToWishList(url, wishList, apiKey, hostAddress) {
    // make POST request to add item to selected wish list
    const response = await fetch(`${hostAddress}/api/lists/${wishList}/items`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        // get URL in json formatting for API calling purposes
        body: JSON.stringify({
            url: url,
        }),
    });
}

// register a listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("Installed the Universal Wish List extension.");
});

// register a listener for when messages are sent from other parts of the extension
chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message.action === 'fetchWishLists') {
        let apiKey;
        let hostAddress;

        // check that the API key and host address are accessible
        try {
            apiKey = await getSavedApiKey();
        } catch (error) {
            console.error("Failed to get saved API key:", error);
            sendResponse({status: 'failed'});
        }
        try {
            hostAddress = await getSavedHostAddress();
        } catch (error) {
            console.error("Failed to get saved host address:", error);
            sendResponse({status: 'failed'});
        }

        // send response that fetching is occurring
        sendResponse({status: 'fetching'});

        console.log("apiKey:", apiKey); //DEBUG
        console.log("hostAddress:", hostAddress); //DEBUG

        // fetch wish lists from the server
        await fetchWishLists(apiKey, hostAddress);
        return true;
    } else if (message.action === 'addItemToWishList') {
        let apiKey;
        let hostAddress;

        // check that the API key and host address are accessible
        try {
            apiKey = await getSavedApiKey();
        } catch (error) {
            console.error("Failed to get saved API key:", error);
            sendResponse({status: 'failed'});
        }
        try {
            hostAddress = await getSavedHostAddress();
        } catch (error) {
            console.error("Failed to get saved host address:", error);
            sendResponse({status: 'failed'});
        }

        // send response that adding is occurring
        sendResponse({status: 'adding'});

        // add url to the wish list on the server
        await addItemToWishList(message.url, message.wishList, apiKey, hostAddress);
    } else {
        console.log("Received unexpected message:", message); //DEBUG
        return;
    }
});