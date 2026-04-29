document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('addItemToList');
    if (!btn) return;

    btn.addEventListener('click', async function () {
        // get the current url and selected list
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});  // fails tests for some reason with 'browser.tabs.query...'
        const dropdown = document.getElementById('list-select');
        console.log("Adding item to list from URL:", tab.url, "and wish list ID:", dropdown.value);

        // construct message to send to the service worker
        let message = {
            action: 'addItemToWishList',
            url: tab.url,
            wishList: dropdown.value
        };

        // send a message to the service worker to add the item to the list
        try {
            const response = await browser.runtime.sendMessage(message);
            // check response
            if (response.status === 'adding')
                console.log(`Received response '${response.status}' from service worker.`);
            else
                throw new Error(`Got response '${response.status}'.`);
        } catch (error) {
            console.error('Got an error when sending message to service worker:', error);
            return;
        }

        // after the script runs, disable the button and change its text
        this.disabled = true;
        this.textContent = 'Added to list';
    });
});