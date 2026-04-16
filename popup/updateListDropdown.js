async function getWishLists() {
    // stubbed out getLists function
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
    wishLists = await getWishLists();

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
