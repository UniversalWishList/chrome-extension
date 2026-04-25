const $ = (id) => document.getElementById(id);

chrome.storage.local.get("apiKey", ({ apiKey }) => {
    if (apiKey) {
        $("apiKey").value = apiKey;
        $("apiKeyStatus").textContent = "Saved";
    }
});

$("saveApiKey").addEventListener("click", async () => {
    const apiKey = $("apiKey").value.trim();

    if (!apiKey) {
        $("apiKeyStatus").textContent = "Enter an API key first";
        return;
    }

    await chrome.storage.local.set({ apiKey });

    $("apiKeyStatus").textContent = "Saved";
    setTimeout(() => {
        $("apiKeyStatus").textContent = "";
    }, 1500);
});