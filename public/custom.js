// public/custom.js - Obsidian checkbox handler and metadata hider
document.addEventListener('DOMContentLoaded', function() {
  // Watch for DOM changes
  const observer = new MutationObserver(function(mutations) {
    processCheckboxes();
    hideFrontmatter();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial processing
  processCheckboxes();
  hideFrontmatter();
  setupCustomKeybindings();

  // Override j/k navigation (swap them so j goes up, k goes down)
  function setupCustomKeybindings() {
    document.addEventListener('keydown', (event) => {
      // Only handle j/k when preview window is focused
      if (event.key === 'j' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        window.scrollBy({ top: -50 }); // j goes up
      } else if (event.key === 'k' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        window.scrollBy({ top: 50 }); // k goes down
      }
    }, true); // Use capture phase to run before other handlers
  }

  function processCheckboxes() {
    // Process all list items
    const allListItems = document.querySelectorAll('li');

    allListItems.forEach(li => {
      const text = li.textContent.trim();

      // Check if this is a custom Obsidian checkbox (not already processed)
      const customCheckboxMatch = text.match(/^\[(>|<|\-|\*|!|\/|\?|l|i|I|f|k|u|d|w|p|c|b|S|")\]\s/);

      if (customCheckboxMatch && !li.classList.contains('task-list-item')) {
        const taskType = customCheckboxMatch[1];

        // Create a checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-list-item-checkbox';
        checkbox.checked = true; // Custom checkboxes are "checked" to show the icon
        checkbox.setAttribute('data-task', taskType);

        // Add classes and attributes to the list item
        li.classList.add('task-list-item');
        li.setAttribute('data-task', taskType);

        // Remove the checkbox marker from the text
        const textWithoutMarker = text.replace(/^\[(>|<|\-|\*|!|\/|\?|l|i|I|f|k|u|d|w|p|c|b|S|")\]\s/, '');

        // Wrap content in label
        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(textWithoutMarker));

        // Replace li content
        li.textContent = '';
        li.appendChild(label);
      }

      // Also handle standard checkboxes that need custom styling
      const standardCheckbox = li.querySelector('input[type="checkbox"]');
      if (standardCheckbox && !standardCheckbox.hasAttribute('data-task')) {
        const parentLi = standardCheckbox.closest('li');
        const liText = parentLi.textContent.trim();

        // Check if the original markdown had a custom checkbox
        // This is a fallback for items that were partially parsed
        const taskMatch = liText.match(/\[(>|<|\-|\*|!|\/|\?|l|i|I|f|k|u|d|w|p|c|b|S|")\]/);
        if (taskMatch) {
          const taskType = taskMatch[1];
          parentLi.setAttribute('data-task', taskType);
          standardCheckbox.setAttribute('data-task', taskType);
          standardCheckbox.checked = true;
        }
      }
    });
  }

  function hideFrontmatter() {
    const markdownBody = document.getElementById('peek-markdown-body');
    if (!markdownBody) return;

    // Method 1: Hide elements with data-line-begin attribute in first 10 lines
    const earlyElements = markdownBody.querySelectorAll('p[data-line-begin], ul[data-line-begin]');
    earlyElements.forEach(el => {
      const lineBegin = parseInt(el.getAttribute('data-line-begin') || '0');
      const text = el.textContent || '';

      // If it's in the first 10 lines and contains frontmatter-like content
      if (lineBegin <= 10) {
        const hasFrontmatterKeys = text.includes('created:') ||
                                   text.includes('tags:') ||
                                   text.includes('aliases:') ||
                                   text.includes('area:') ||
                                   text.includes('id:') ||
                                   text.includes('project:') ||
                                   text.includes('January') ||
                                   text.includes('2026');

        if (hasFrontmatterKeys) {
          el.style.display = 'none';
        }
      }
    });

    // Method 2: Hide any elements that contain metadata patterns
    const allElements = markdownBody.querySelectorAll('p, ul, div');
    allElements.forEach(el => {
      const text = el.textContent || '';

      // Hide elements that match these patterns
      const isFrontmatter = (
        text.match(/^created:\s*\d{4}-\d{2}-\d{2}/) ||
        text.match(/^tags:\s*$/) ||
        text.match(/^aliases:\s*$/) ||
        text.match(/^area:\s*$/) ||
        text.match(/^id:\s*\d{4}-\d{2}-\d{2}/) ||
        text.match(/^project:\s*$/)
      );

      if (isFrontmatter) {
        el.style.display = 'none';
      }
    });

    // Method 3: Hide ul elements that contain metadata items
    const allLists = markdownBody.querySelectorAll('ul');
    allLists.forEach(ul => {
      const listItems = ul.querySelectorAll('li');
      const itemTexts = Array.from(listItems).map(li => li.textContent || '');

      // Check if any list item contains metadata
      const hasMetadata = itemTexts.some(text =>
        text.includes('daily') ||
        text.includes('created:') ||
        text.includes('tags:') ||
        text.match(/\d{4}-\d{2}-\d{2}/) ||
        text.match(/January|February|March|April|May|June|July|August|September|October|November|December/)
      );

      if (hasMetadata && listItems.length <= 3) {
        ul.style.display = 'none';
      }
    });
  }
});
