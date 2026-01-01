(function() {
  // Check if the hash is "render-shareable"
  if (window.location.hash === '#render-shareable') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderShareableTemplate);
    } else {
      renderShareableTemplate();
    }
  }

  function renderShareableTemplate() {
    // Find the template with data-shareable attribute
    const template = document.querySelector('template[data-shareable]');

    if (!template) {
      console.error('[Shareable] No template[data-shareable] found in document!');
      return;
    }

    let htmlContent = '';

    // Try different methods to get the content
    // Method 1: Use template.content (standard)
    if (template.content && template.content.childNodes.length > 0) {
      const content = template.content.cloneNode(true);
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(content);
      htmlContent = tempDiv.innerHTML;
    }
    // Method 2: Use template.innerHTML
    else if (template.innerHTML && template.innerHTML.trim()) {
      htmlContent = template.innerHTML;
    }
    // Method 3: Try template.childNodes directly
    else if (template.childNodes.length > 0) {
      const tempDiv = document.createElement('div');
      template.childNodes.forEach(node => {
        tempDiv.appendChild(node.cloneNode(true));
      });
      htmlContent = tempDiv.innerHTML;
    }
    // Method 4: Last resort - parse outerHTML
    else {
      const outerHTML = template.outerHTML;
      const match = outerHTML.match(/<template[^>]*>([\s\S]*)<\/template>/i);
      if (match && match[1]) {
        htmlContent = match[1];
      }
    }

    if (!htmlContent.trim()) {
      console.error('[Shareable] Template has no content!');
      return;
    }

    // Clear the body and set new content
    document.body.innerHTML = htmlContent;
  }
})();
