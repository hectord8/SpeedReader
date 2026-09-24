chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'capture-selection') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, async (response) => {
    if (chrome.runtime.lastError || !response?.text) return;
    await chrome.storage.local.set({ capturedText: response.text });
    // Supported in recent Chrome versions; if unavailable, the text is still saved.
    if (chrome.action.openPopup) chrome.action.openPopup().catch(() => {});
  });
});
