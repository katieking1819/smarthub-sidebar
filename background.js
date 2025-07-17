// Background script for Jira Sidebar extension
console.log('Jira Sidebar background script loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Jira Sidebar extension installed');
});

// Listen for toolbar icon clicks
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension button clicked');
  // Only send message to tabs that match our URL pattern
  if (tab.url.includes('atlassian.net')) {
    chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" });
  } else {
    console.log('Not on a Jira page');
    // Optional: Show an alert or notification that user isn't on a Jira page
  }
});