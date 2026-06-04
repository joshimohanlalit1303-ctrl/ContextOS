console.log("Libro Tracker initialized.");

type PlatformConfig = {
  name: string;
  host: string;
  messageSelector: string;
  assistantSelector: string;
  inputSelector: string;
};

const PLATFORMS: PlatformConfig[] = [
  {
    name: 'claude',
    host: 'claude.ai',
    messageSelector: '.font-user-message',
    assistantSelector: '.font-claude-message',
    inputSelector: '.ProseMirror, div[contenteditable="true"]'
  },
  {
    name: 'chatgpt',
    host: 'chatgpt.com',
    messageSelector: 'div[data-message-author-role="user"]',
    assistantSelector: 'div[data-message-author-role="assistant"]',
    inputSelector: '#prompt-textarea'
  },
  {
    name: 'gemini',
    host: 'gemini.google.com',
    messageSelector: 'user-query, .user-query',
    assistantSelector: 'model-response, .model-response',
    inputSelector: 'div.ql-editor[contenteditable="true"], rich-textarea > div'
  },
  {
    name: 'deepseek',
    host: 'chat.deepseek.com',
    messageSelector: 'div[dir="auto"]', // generic fallback
    assistantSelector: 'div[dir="auto"]',
    inputSelector: 'textarea, div[contenteditable="true"]'
  }
];

const currentPlatform = PLATFORMS.find(p => window.location.hostname.includes(p.host));

if (currentPlatform) {
  console.log(`Libro: Active on ${currentPlatform.name}`);
  
  // 1. Capture user messages
  let processedNodes = new WeakSet();

  function processMessage(element: HTMLElement) {
    if (processedNodes.has(element)) return;
    processedNodes.add(element);

    const text = element.textContent?.trim();
    if (!text || text.length < 10) return;

    console.log(`Libro captured context on ${currentPlatform?.name}:`, text);

    chrome.runtime.sendMessage({
      type: 'PROMPT_TRACKED',
      payload: {
        text: text,
        timestamp: new Date().toISOString(),
        source: currentPlatform?.name
      }
    });
  }

  // Scan existing messages already on the screen when the script loads
  setTimeout(() => {
    const existingMessages = document.querySelectorAll(currentPlatform.messageSelector);
    existingMessages.forEach(msg => processMessage(msg as HTMLElement));
  }, 1500); // Small delay to let the SPA render initial messages

  // Listen for new messages added to the DOM
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          
          if (element.matches && element.matches(currentPlatform.messageSelector)) {
            processMessage(element);
          } else {
            const userMessages = element.querySelectorAll(currentPlatform.messageSelector);
            userMessages.forEach(msg => processMessage(msg as HTMLElement));
          }
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  // 2. Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'DROP_CAPSULE') {
      dropContext(message.payload.text);
      sendResponse({ success: true });
    } else if (message.type === 'EXPORT_CHAT') {
      const history = extractChatHistory();
      sendResponse({ success: true, history });
    }
  });

  function extractChatHistory() {
    if (!currentPlatform) return [];
    
    // Select both user and assistant messages
    const nodes = document.querySelectorAll(`${currentPlatform.messageSelector}, ${currentPlatform.assistantSelector}`);
    const history: { role: string, content: string }[] = [];
    
    nodes.forEach(node => {
      const text = node.textContent?.trim();
      if (!text) return;
      
      const isUser = node.matches(currentPlatform.messageSelector);
      // For deepseek where both selectors are the same, we might need a fallback,
      // but assuming standard DOM structure, alternating or checking classes helps.
      history.push({
        role: isUser ? 'user' : 'assistant',
        content: text
      });
    });
    
    return history;
  }

  function dropContext(text: string) {
    if (!currentPlatform) return;
    const inputElement = document.querySelector(currentPlatform.inputSelector) as HTMLElement;
    
    if (!inputElement) {
      console.warn("Libro: Could not find input element to drop context.");
      alert("Could not find the chat input box.");
      return;
    }

    if (inputElement instanceof HTMLTextAreaElement || inputElement instanceof HTMLInputElement) {
      // Append text
      inputElement.value = inputElement.value ? inputElement.value + "\n\n" + text : text;
      // Trigger events
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (inputElement.isContentEditable) {
      // It's a contenteditable div (Claude, Gemini sometimes)
      // Focus first
      inputElement.focus();
      
      // Use document.execCommand to insert text properly simulating user typing
      document.execCommand('insertText', false, "\n\n" + text);
      
      // Trigger input event for React/Angular to pick it up
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    console.log("Libro: Dropped capsule context successfully.");
  }
}

