# smarthub-sidebar
This is a Chrome sidebar extension that populates with links from Jira Stories that are assigned to the Jira user who is using the extension.

## Features
- Shows a button on Jira pages to open a sidebar
- Extracts and displays links from Jira ticket descriptions
- Works with GoDaddy Jira instance

## Installation for Development

1. Clone this repository: git clone https://github.com/YOUR-USERNAME/jira-sidebar-extension.git
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now be installed and ready to use

## Making Changes
1. Make changes to the extension files using your preferred code editor
2. Go to `chrome://extensions/` and click the refresh icon on the extension
3. Test your changes on a Jira page

## Files
- `manifest.json` - Extension configuration
- `content.js` - Main script that runs on Jira pages
- `background.js` - Background script for handling extension events
- `sidebar.css` - Styles for the sidebar interface
