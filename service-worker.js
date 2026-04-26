/**
 * Fetch a list of the user's wish lists from the server and store them in memory.
 * Requires the user's API key and endpoint to be accessible.
 */

 // reference the URL to the Wish List web application actively running
const API_BASE_URL = "http://192.168.1.181:3280";

async function getSavedApiKey() {
    // fetching the user's saved apikey
    const { apiKey } = await chrome.storage.local.get("apiKey");

    if (!apiKey) {
        throw new Error("No API key saved.");
    }

    return apiKey;
}

async function fetchWishLists() {
    // make fetch request for wish lists to the server
    // fetching a user's API key
    const apiKey = await getSavedApiKey();
    // await new Promise(resolve => setTimeout(resolve, 5000));  // STUBBED
    // Making a GET call to the server
    const response = await fetch(`${API_BASE_URL}/api/lists`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
    });
    // returning the user's list(s) as json
    const listsFromApi = await response.json();
    // convert API list data into dictionary of list IDs to names
    const lists = {};

    for (const list of listsFromApi) {
        lists[list.id] = list.name;
    }

    // extract dictionary of wish list IDs to names from fetch request
    //let lists = {
    //    1: 'birthday',
    //    2: 'mom',
    //    3: 'christmas'
    //}; //STUBBED

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
 */
async function addItemToWishList(url, wishList) {
    // construct post request to the wish list server
    // getting the user's api key to make the post call
    const apiKey = await getSavedApiKey();
    //let postRequest = `Post request with ${url} and ${wishList}`; //STUBBED

    // make post request to the server with the URL and wish list
    //console.log("Making post request with post request:", postRequest); //STUBBED

    // make POST request to add item to selected wish list
    const response = await fetch(`${API_BASE_URL}/api/lists/${wishList}/items`, {
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
        // TODO: add checks that fetching can occur (API key & endpoint are accessible)

        // send response that fetching is occurring
        sendResponse({status: 'fetching'});

        // fetch wish lists from the server
        await fetchWishLists();
        return true;
    } else if (message.action === 'addItemToWishList') {
        // TODO: add checks that adding can occur (API key & endpoint are accessible)

        // send response that adding is occurring
        sendResponse({status: 'adding'});

        // add url to the wish list on the server
        await addItemToWishList(message.url, message.wishList);
    } else {
        console.log("Received unexpected message:", message); //DEBUG
        return;
    }
});