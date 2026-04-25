/**
 * Get the wish lists stored in memory
*/
async function getWishLists() {
    // stubbed out getLists function
    try {
        const response = await chrome.runtime.sendMessage({greeting: "hello"});
        console.log(response);
    } catch (error) {
        console.error('Message sending failed:', error);
    }

    const wishLists = [];

    // push fetched wish lists to the list
    wishLists.push('birthday');
    wishLists.push('mom');
    wishLists.push('christmas');

    return wishLists;
}

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
    
    // pre-select the default list from settings
    const { defaultList } = await chrome.storage.sync.get('defaultList');
      if (defaultList) {
          dropdown.value = defaultList;
    }
}

console.log("Attempting to update the dropdown list from the server.");

updateDropdown();
