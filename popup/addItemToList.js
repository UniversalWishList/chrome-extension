document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('addItemToList');
    if (!btn) return;

    btn.addEventListener('click', async function () {
        // get the current url
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        console.log("Adding item to list from URL:", tab.url);

        // after the script runs, disable the button and change its text
        this.disabled = true;
        this.textContent = 'Added to list';
    });
});