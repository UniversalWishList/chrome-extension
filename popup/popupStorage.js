// everything below handles storing an API key within the "API Key input field and the "Save API Key button logic"

//this line of code with '$' is a shortcut for getting elements by id like $("saveApiKey") instead of manually calling:
//"document.getElementById("apiKeyStatus")"
const $ = (id) => document.getElementById(id);

// retrieving a saved APIkey from Chrome Storage to check if a user already entered and saved one
chrome.storage.local.get("apiKey", ({ apiKey }) => {
    if (apiKey) {
        // if a user has already entered an api key
        // the api key input box should already have the api key stored (may be read as "......")
        $("apiKey").value = apiKey;
    }
});
// when the save button is clicked, get the API key from the input box (make sure to trim for any whitespace so we just get the api key).
$("saveApiKey").addEventListener("click", async () => {
    const apiKey = $("apiKey").value.trim();

    if (!apiKey) {
        // if the user didn't enter anything into the API key field, indicate to the user to enter an API key.
        $("apiKeyStatus").textContent = "Enter an API key first";
        return;
    }
    // for saving the APIKey to chrome local storage after its set
    await chrome.storage.local.set({ apiKey });
    // setting a timeout to clear the saved message when a user saves an API key (in the input box) after 1500 ms which is 1.5 seconds
    $("apiKeyStatus").textContent = "Saved";
    setTimeout(() => {
        $("apiKeyStatus").textContent = "";
    }, 1500);
});