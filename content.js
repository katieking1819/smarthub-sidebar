// Content script for Jira Sidebar extension
console.log("Jira Sidebar content script loaded");

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  if (request.action === "toggleSidebar") {
    toggleSidebar();
  }
});

// Create a simple floating button (for direct page interaction)
function createButton() {
  // Check if button already exists
  if (document.querySelector('.jira-sidebar-button')) {
    return;
  }
  
  const button = document.createElement('button');
  button.className = 'jira-sidebar-button';
  button.textContent = '🔗';
  button.title = 'Show Description Links';
  document.body.appendChild(button);
  
  button.addEventListener('click', function() {
    toggleSidebar();
  });
  
  console.log("Link button created");
}

// Function to toggle sidebar visibility
function toggleSidebar() {
  console.log("Toggle sidebar called");
  let panel = document.querySelector('.jira-sidebar-panel');
  
  if (panel) {
    // Panel exists, toggle visibility
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      // Refresh links when showing
      showLinks();
    } else {
      panel.style.display = 'none';
    }
  } else {
    // Create panel if it doesn't exist
    panel = createPanel();
    showLinks();
  }
}

// Create the panel that will show links
function createPanel() {
  const panel = document.createElement('div');
  panel.className = 'jira-sidebar-panel';
  
  panel.innerHTML = `
    <button class="jira-sidebar-close">×</button>
    <h2>Description Links</h2>
    <div class="jira-sidebar-content"></div>
  `;
  
  document.body.appendChild(panel);
  
  // Add close button functionality
  const closeButton = panel.querySelector('.jira-sidebar-close');
  closeButton.addEventListener('click', function() {
    panel.style.display = 'none';
  });
  
  console.log("Panel created");
  return panel;
}

// Display links in the panel
function showLinks() {
  console.log("Showing links");
  const links = extractLinks();
  const contentDiv = document.querySelector('.jira-sidebar-content');
  
  if (contentDiv) {
    if (links.length > 0) {
      let html = '<ul class="jira-sidebar-links">';
      links.forEach(link => {
        html += `<li><a href="${link.url}" target="_blank">${link.text}</a> <span class="link-source">(${link.source})</span></li>`;
      });
      html += '</ul>';
      contentDiv.innerHTML = html;
    } else {
      contentDiv.innerHTML = '<p>No links found in description.</p>';
    }
  }
}

// Extract links from Jira description with improved debugging and filtering
function extractLinks() {
  const links = [];
  console.log("Starting link extraction from description...");
  
  try {
    // STEP 1: Find the description section
    console.log("Trying to find description section...");
    
    const possibleDescriptionSelectors = [
      '[data-test-id="issue.views.field.rich-text.description"]',
      '.description',
      '#description-val',
      '[data-test-id="issue.field.description"]',
      '#descriptionmodule',
      '.field-description',
      '[id^="description"]', // Any ID starting with "description"
      '[class*="description"]' // Any class containing "description"
    ];
    
    let descriptionSection = null;
    
    // Try each selector
    for (const selector of possibleDescriptionSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`Selector "${selector}" found ${elements.length} elements`);
      
      if (elements.length > 0) {
        // Use the first element that has actual content
        for (const element of elements) {
          if (element.textContent.trim().length > 0) {
            console.log(`Found description with selector: ${selector}`);
            descriptionSection = element;
            break;
          }
        }
        
        if (descriptionSection) break;
      }
    }
    
    // If we found a description section, extract links from it
    if (descriptionSection) {
      console.log("Processing links in description section");
      console.log("Description HTML:", descriptionSection.innerHTML);
      
      // Find all links within the description section
      const descLinks = descriptionSection.querySelectorAll('a[href]');
      console.log(`Found ${descLinks.length} links in description`);
      
      // Process description links
      descLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const linkText = link.textContent.trim();
        
        console.log(`Examining link ${index + 1}:`, { href, linkText });
        
        // Skip empty or javascript links
        if (!href || href === '#' || href.startsWith('javascript:')) {
          console.log(`Skipping link ${index + 1}: Empty or javascript link`);
          return;
        }
        
        // Check if it's a URL link and not a special Jira action link
        const isUrlLink = href.startsWith('http') || href.startsWith('https');
        const isJiraActionLink = href.includes('/secure/CreateWorkflowTransition') || 
                               href.includes('/browse/');
                               
        if (!isUrlLink || isJiraActionLink) {
          console.log(`Skipping link ${index + 1}: Not a URL or is Jira action`);
          return;
        }
        
        // Filter out specific unwanted links
        const unwantedTexts = [
          'Create branch',
          'Open with VS Code',
          'Create commit',
          'Create pull request'
        ];
        
        // Check if the link text exactly matches any unwanted texts
        if (unwantedTexts.some(text => linkText === text)) {
          console.log(`Skipping link ${index + 1}: Matched unwanted text "${linkText}"`);
          return;
        }
        
        // Add the link
        links.push({
          text: linkText || href,
          url: href,
          source: 'Description'
        });
        console.log(`Added description link ${index + 1}: ${href} (${linkText})`);
      });
    } else {
      console.log("Description section not found!");
      
      // Try to find description in a different way - look for URL section
      const urlSection = document.querySelector('h3, h4, div').textContent.includes('URL:');
      if (urlSection) {
        console.log("Found URL section, looking for links after it");
        
        // This is a very specific approach for the layout in your screenshot
        // Get all links in the document
        const allLinks = document.querySelectorAll('a[href]');
        console.log(`Found ${allLinks.length} total links on page`);
        
        allLinks.forEach((link, index) => {
          const href = link.getAttribute('href');
          const linkText = link.textContent.trim();
          
          // Only look for specific links that match what we saw in your screenshot
          if (href && href.includes('godaddy.com') && 
              (href.includes('/payments/invoicing') || 
               href.includes('/offers/payments') ||
               href.includes('/sample-invoice'))) {
            
            links.push({
              text: linkText || href,
              url: href,
              source: 'URL Section'
            });
            console.log(`Added URL section link ${index + 1}: ${href} (${linkText})`);
          }
        });
      }
    }
    
    // If still no links found, try a more aggressive approach
    if (links.length === 0) {
      console.log("No links found yet, trying more aggressive approach");
      
      // Get all links on the page
      const allLinks = document.querySelectorAll('a[href]');
      console.log(`Found ${allLinks.length} total links on page`);
      
      allLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const linkText = link.textContent.trim();
        
        // Only consider http/https links
        if (href && (href.startsWith('http') || href.startsWith('https'))) {
          // Skip internal Jira links
          if (href.includes('atlassian.net') || href.includes('jira.')) {
            return;
          }
          
          // Skip known action buttons
          const unwantedTexts = [
            'Create branch',
            'Open with VS Code',
            'Create commit',
            'Create pull request'
          ];
          
          if (unwantedTexts.includes(linkText)) {
            return;
          }
          
          // Add link if it's likely a content link (from godaddy.com in your case)
          if (href.includes('godaddy.com')) {
            links.push({
              text: linkText || href,
              url: href,
              source: 'Page'
            });
            console.log(`Added page link ${index + 1}: ${href} (${linkText})`);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error extracting links from description:', error);
  }
  
  console.log(`Extraction complete. Found ${links.length} links.`);
  return links;
}

// Initialize extension
function init() {
  console.log("Initializing Jira Description Links extension...");
  createButton(); // Create the in-page button
  console.log("Initialization complete");
}

// Start the extension after page loads
window.addEventListener('load', function() {
  console.log("Window loaded, initializing...");
  setTimeout(init, 1500);
});

// Also run init now in case page is already loaded
console.log("Running initial initialization");
init();