// Global Comic Sans Fixer
// This will be injected at the bottom of the page to force Comic Sans on all post content

(function() {
  // Create a style tag to apply Comic Sans to targeted paragraphs
  function injectComicSansStyles() {
    // Create style element
    const style = document.createElement('style');
    style.id = 'comic-sans-enforcer';
    style.innerHTML = `
      body p.whitespace-pre-wrap,
      p.whitespace-pre-wrap,
      p.break-words,
      p.post-content,
      div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm p,
      div[class*="flex"][class*="border"] p,
      #post-content-text,
      .post-content,
      .comment-content,
      [class*="post-content"], 
      [class*="comment-content"],
      [id="post-content-text"],
      [class="post-content"],
      [class="comment-content"] {
        font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", cursive !important;
        font-weight: normal !important;
        letter-spacing: normal !important;
        line-height: 1.5 !important;
        font-style: normal !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Find post content and directly modify it
  function forceComicSans() {
    // Direct modification of post content elements
    const paragraphs = document.querySelectorAll('div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm p');
    paragraphs.forEach(p => {
      p.style.fontFamily = '"Comic Sans MS", "Comic Sans", "Comic Neue", cursive';
      p.style.setProperty('font-family', '"Comic Sans MS", "Comic Sans", "Comic Neue", cursive', 'important');
    });
    
    // Specifically target elements with class containing "post-content" or "whitespace-pre-wrap"
    const postContent = document.querySelectorAll('.post-content, .whitespace-pre-wrap');
    postContent.forEach(el => {
      el.style.fontFamily = '"Comic Sans MS", "Comic Sans", "Comic Neue", cursive';
      el.style.setProperty('font-family', '"Comic Sans MS", "Comic Sans", "Comic Neue", cursive', 'important');
    });
  }
  
  // Run our main functions
  injectComicSansStyles();
  
  // Run now and after small delays to catch all content
  forceComicSans();
  setTimeout(forceComicSans, 500);
  setTimeout(forceComicSans, 1000);
  
  // Run whenever DOM changes
  const observer = new MutationObserver(forceComicSans);
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
})(); 