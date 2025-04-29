"use client"

import { useEffect } from 'react'

/**
 * This component forces the application of Comic Sans MS to post and comment content
 * by directly manipulating the DOM through JavaScript
 */
export function FontEnforcer() {
  useEffect(() => {
    // Create a style tag to forcefully override font styles
    const injectComicSansStylesheet = () => {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* Force Comic Sans on any post content */
        p.post-content, 
        p.comment-content, 
        .post-content, 
        .comment-content, 
        p.whitespace-pre-wrap, 
        p.break-words,
        .whitespace-pre-wrap, 
        .break-words,
        p.whitespace-pre-wrap.break-words,
        div:has(> p.whitespace-pre-wrap),
        div:has(> .whitespace-pre-wrap) p,
        .post-content *,
        .comment-content *,
        div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm > p,
        div[class*="flex"][class*="border"] > p:not([class*="text-xs"]) {
          font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", sans-serif !important;
          font-weight: normal !important;
          letter-spacing: normal !important;
          font-style: normal !important;
          -webkit-font-smoothing: auto !important;
          font-variant: normal !important;
        }
      `;
      document.head.appendChild(styleElement);
    };

    // Directly manipulate DOM elements to force Comic Sans
    const forceComicSans = () => {
      // Target elements by class
      const selectors = [
        '.post-content',
        '.comment-content',
        'p.whitespace-pre-wrap',
        'p.break-words',
        '.whitespace-pre-wrap',
        '.whitespace-pre-wrap.break-words'
      ];

      // Find all elements that match the selectors
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.cssText = 'font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", sans-serif !important;';
            
            // Also force on all child elements
            const children = el.querySelectorAll('*');
            children.forEach(child => {
              if (child instanceof HTMLElement) {
                child.style.cssText = 'font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", sans-serif !important;';
              }
            });
          }
        });
      });

      // Special targeting for whitespace-pre-wrap which might be the actual post content
      document.querySelectorAll('p.whitespace-pre-wrap').forEach(el => {
        if (el instanceof HTMLElement) {
          // Set extreme inline style with !important
          el.setAttribute('style', 'font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", sans-serif !important;');
        }
      });
    };

    // Insert a new Comic Sans font via @font-face
    const insertFontFace = () => {
      const fontFaceStyle = document.createElement('style');
      fontFaceStyle.textContent = `
        @font-face {
          font-family: 'ComicSansForced';
          src: local('Comic Sans MS'), local('Comic Sans');
          font-weight: normal;
          font-style: normal;
        }
        
        p.whitespace-pre-wrap,
        .whitespace-pre-wrap,
        p.break-words,
        .post-content,
        .comment-content {
          font-family: 'ComicSansForced', 'Comic Sans MS', 'Comic Sans', cursive !important;
        }
      `;
      document.head.appendChild(fontFaceStyle);
    };
    
    // Apply all strategies
    insertFontFace();
    injectComicSansStylesheet();
    
    // Run forceComicSans immediately and after a delay
    forceComicSans();
    
    // Set multiple timeouts to catch dynamically loaded content
    const timeouts = [
      setTimeout(forceComicSans, 100),
      setTimeout(forceComicSans, 500),
      setTimeout(forceComicSans, 1000),
      setTimeout(forceComicSans, 2000)
    ];
    
    // Use MutationObserver to catch dynamically added content
    const observer = new MutationObserver((mutations) => {
      let hasNewElements = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          hasNewElements = true;
        }
      });
      
      if (hasNewElements) {
        forceComicSans();
      }
    });
    
    // Observe the whole document for changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      observer.disconnect();
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return null;
} 