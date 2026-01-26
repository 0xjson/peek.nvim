// public/custom.js - Obsidian checkbox handler
document.addEventListener('DOMContentLoaded', function() {
  // Watch for DOM changes
  const observer = new MutationObserver(function(mutations) {
    processCheckboxes();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Initial processing
  processCheckboxes();
  
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
});
