// everything below handles storing an API key within the "API Key input field and the "Save API Key button logic"

// define a function called '$' which takes an HTML element id and returns the element
// this is a shortcut to 'document.getElementByID(id)', used like '$(id)'
const $ = (id) => document.getElementById(id);

// retrieving a saved APIkey from Chrome Storage to check if a user already entered and saved one
// Solely Needed for debugging purposes
chrome.storage.local.get("apiKey", ({ apiKey }) => {
    if (apiKey) {
        //SANITY CHECKER CHECKING TO SEE IF A API KEY SAVED PRIOR TO CHROME STORAGE IS VISIBLE IN THE INPUT FIELD
        // basically if you close the extension and reopen it the idea is that the api key should still be visible in the "api key input field"
        // This is to make sure an api key saved to storage is actually saved.
        //  if a user has already entered an api key
        // the api key input box should already have the api key stored (may be read as "......")
        $("apiKey").value = apiKey;
    }
});

// when the save button is clicked, get the API key from the input box (make sure to trim for any
// whitespace so we just get the api key).
$("saveApiKey").addEventListener("click", async () => {
    const apiKey = $("apiKey").value.trim();

    if (!apiKey) {
        // if the user didn't enter anything into the API key field, indicate to the user to enter an API key.
        $("apiKeyStatus").textContent = "Enter an API key first";
        return;
    }

    // a valid API key was entered, save it in chrome local storage
    await chrome.storage.local.set({ apiKey });
    console.log("Saved API key to Chrome local storage.");

    // display a 'Saved' status message for 1.5 seconds
    $("apiKeyStatus").textContent = "Saved API key";
    setTimeout(() => {
        $("apiKeyStatus").textContent = "";
    }, 1500);
});

chrome.storage.local.get("hostAddress", ({ hostAddress }) => {
    if (hostAddress) {
        $("hostAddress").value = hostAddress;
    }
});

// add an event listener for the 'saveHostAddress' button which runs the following function when
// clicked to save the host address to chrome local storage
$('saveHostAddress').addEventListener('click', async () => {
    // get the host address value in the input field
    const hostAddress = $('hostAddress').value.trim();

    if (!hostAddress) {
        // if the user clicked the button without entering anything into the API key field, show a message
        $('hostAddressStatus').textContent = "Enter a host address first";
        return;
    }

    // a valid host address was entered, save it in chrome local storage
    await chrome.storage.local.set({hostAddress: hostAddress});
    console.log(`Saved host address '${hostAddress}' to Chrome local storage.`);

    // display a 'Saved' status message for 1.5 seconds
    $('hostAddressStatus').textContent = "Saved host address";
    setTimeout(() => {
        $('hostAddressStatus').textContent = "";
    }, 1500);
});