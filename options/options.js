const $ = (id) => document.getElementById(id);

// Load existing value on open
chrome.storage.local.get("apiKey", ({ apiKey }) => {
  if (apiKey) $("apiKey").value = apiKey;
});

$("save").addEventListener("click", async () => {
  const apiKey = $("apiKey").value.trim();

  if (!apiKey) {
    $("status").textContent = "Enter an API key first";
    return;
  }

  await chrome.storage.local.set({ apiKey });

  $("status").textContent = "Saved";
  setTimeout(() => {
    $("status").textContent = "";
  }, 1500);
});