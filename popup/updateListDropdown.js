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
    const wishLists = [];

    // push fetched wish lists to the list
    wishLists.push('birthday');
    wishLists.push('mom');
    wishLists.push('christmas');

    return wishLists;
}

/**
 * Update the dropdown in the HTML page with the correct list of wish lists.
*/
async function updateDropdown() {
    // get the dropdown menu from the HTML DOM
    const dropdown = document.getElementById('list-select');

    // get the wish lists from the server
    const wishLists = await getWishLists();

    // replace options with wish lists fetched from the server
    while (dropdown.options.length > 0) {
        dropdown.remove(0);
    }
    for (var i = 0; i < wishLists.length; i++) {
        let newOption = document.createElement('option');
        newOption.value = wishLists[i];
        newOption.text = wishLists[i];
        dropdown.appendChild(newOption);
    }
}

console.log("Attempting to update the dropdown list from the server.");

updateDropdown();
