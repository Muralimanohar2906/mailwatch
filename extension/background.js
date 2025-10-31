// background.js — MailWatch Backend Bridge
const SERVER_URL = 'http://localhost:8000/predict';

chrome.runtime.onInstalled.addListener(() => {
  console.log('MailWatch background active');
});

// Listen for messages from content or popup scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CHECK_EMAIL') {
    fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg.payload)
    })
    .then(r => r.json())
    .then(result => {
      // Send result back to the same tab's content script
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: 'PREDICTION', result });
      }
    })
    .catch(err => {
      console.error('MailWatch fetch error', err);
    });
  }
});
