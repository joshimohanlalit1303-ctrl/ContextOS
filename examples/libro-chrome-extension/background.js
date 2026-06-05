chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-libro",
    title: "Save to Libro Brain",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-libro" && info.selectionText) {
    chrome.storage.sync.get(['libroApiKey', 'libroUserId'], async (data) => {
      if (!data.libroApiKey) {
        // Show an alert on the page if they haven't configured the API key
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => alert("Libro: Please configure your API key in the extension popup first.")
        });
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/ingest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.libroApiKey}`
          },
          body: JSON.stringify({
            content: info.selectionText,
            endUserId: data.libroUserId || 'chrome-extension-user',
            metadata: { source: 'chrome_extension_context_menu' }
          })
        });

        if (!response.ok) throw new Error("Failed to save");

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => alert("✅ Saved successfully to your Libro Brain!")
        });
      } catch (e) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: (err) => alert(`❌ Libro Error: ${err}`),
          args: [e.message]
        });
      }
    });
  }
});
