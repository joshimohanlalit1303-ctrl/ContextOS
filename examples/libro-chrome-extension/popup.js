document.addEventListener('DOMContentLoaded', () => {
  const memoryText = document.getElementById('memoryText');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');
  const toggleSettings = document.getElementById('toggleSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  const apiKeyInput = document.getElementById('apiKey');
  const userIdInput = document.getElementById('userId');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');

  // Load saved settings
  chrome.storage.sync.get(['libroApiKey', 'libroUserId'], (data) => {
    if (data.libroApiKey) apiKeyInput.value = data.libroApiKey;
    if (data.libroUserId) userIdInput.value = data.libroUserId;
  });

  // Get selected text from active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: () => window.getSelection().toString()
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          memoryText.value = results[0].result;
        }
      }
    );
  });

  toggleSettings.addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
  });

  saveSettingsBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      libroApiKey: apiKeyInput.value,
      libroUserId: userIdInput.value || 'chrome-extension-user'
    }, () => {
      status.innerText = 'Settings saved!';
      setTimeout(() => status.innerText = '', 2000);
      settingsPanel.style.display = 'none';
    });
  });

  saveBtn.addEventListener('click', async () => {
    const text = memoryText.value.trim();
    if (!text) {
      status.innerText = 'Please enter or highlight some text.';
      return;
    }

    const data = await chrome.storage.sync.get(['libroApiKey', 'libroUserId']);
    if (!data.libroApiKey) {
      status.innerText = 'Please configure your API key in settings.';
      settingsPanel.style.display = 'block';
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';
    status.innerText = '';

    try {
      // For local testing, we point to localhost. In production, change to https://libro.co.in/api/v1/ingest
      const response = await fetch('http://localhost:3000/api/v1/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.libroApiKey}`
        },
        body: JSON.stringify({
          content: text,
          endUserId: data.libroUserId || 'chrome-extension-user',
          metadata: { source: 'chrome_extension' }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save');
      }

      status.style.color = 'green';
      status.innerText = '✅ Saved to your Brain!';
      memoryText.value = '';
    } catch (error) {
      status.style.color = 'red';
      status.innerText = `❌ Error: ${error.message}`;
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = 'Save to Brain';
    }
  });
});
