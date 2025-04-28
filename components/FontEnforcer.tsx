"use client"

import { useEffect } from 'react'

export function FontEnforcer() {
  useEffect(() => {
    // Apply font styles after component mounts (client-side only)
    const applyFontStyles = () => {
      // Set all elements to angry font first
      document.querySelectorAll('*').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.fontFamily = "'Creepster', cursive";
          el.style.color = "#FF6600";
        }
      });
      
      // Then specifically override post and comment content with Comic Sans
      document.querySelectorAll('p.post-content, p.comment-content, .post-content, .comment-content').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.fontFamily = "'Comic Neue', 'Comic Sans MS', cursive";
        }
      });
      
      // Add id and name to all form fields that don't have them
      document.querySelectorAll('input, textarea, select').forEach((el, index) => {
        const element = el as HTMLElement;
        if (element instanceof HTMLInputElement || 
            element instanceof HTMLTextAreaElement || 
            element instanceof HTMLSelectElement) {
          if (!element.id) {
            element.id = `form-field-${index}`;
          }
          if (!element.name) {
            element.name = element.id;
          }
        }
      });
    };
    
    // Apply immediately and again after a short delay to catch post-rendering elements
    applyFontStyles();
    
    // Use multiple timeouts to ensure we catch elements rendered at different times
    const timeouts = [
      setTimeout(applyFontStyles, 100),
      setTimeout(applyFontStyles, 500),
      setTimeout(applyFontStyles, 1000),
      setTimeout(applyFontStyles, 2000) // Add one more longer timeout for slower rendering
    ];
    
    // Create observer to apply to dynamically added elements
    const observer = new MutationObserver((mutations) => {
      let shouldApplyStyles = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          shouldApplyStyles = true;
          
          // Apply immediate styling to new nodes
          mutation.addedNodes.forEach(node => {
            // If it's an element node
            if (node.nodeType === 1) {
              const element = node as HTMLElement;
              
              // Apply default angry font
              element.style.fontFamily = "'Creepster', cursive";
              element.style.color = "#FF6600";
              
              // Process specific elements
              if (element.classList.contains('post-content') || 
                  element.classList.contains('comment-content')) {
                element.style.fontFamily = "'Comic Neue', 'Comic Sans MS', cursive";
              }
              
              // Process form elements
              if (element instanceof HTMLInputElement || 
                  element instanceof HTMLTextAreaElement || 
                  element instanceof HTMLSelectElement) {
                if (!element.id) {
                  element.id = `form-field-dynamic-${Date.now()}`;
                }
                if (!element.name) {
                  element.name = element.id;
                }
              }
            }
          });
        }
      });
      
      // Apply full styles if needed (debounced to reduce performance impact)
      if (shouldApplyStyles) {
        // Use requestAnimationFrame to optimize performance
        requestAnimationFrame(() => {
          applyFontStyles();
        });
      }
    });
    
    // Start observing the entire document
    observer.observe(document.documentElement, { 
      childList: true, 
      subtree: true,
      attributes: false, // Only need to observe structure changes, not attribute changes
      characterData: false
    });
    
    // Cleanup
    return () => {
      observer.disconnect();
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // This component doesn't render anything
  return null;
} 