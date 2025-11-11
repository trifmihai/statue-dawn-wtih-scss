// ==============================
// COPY TO CLIPBOARD (robust, accessible)
// - Works with multiple `.footer_copy-wrapper` instances
// - Finds the nearest address text within `.footer_support-links`
// - Uses navigator.clipboard with a textarea fallback
// - Adds keyboard support (Enter / Space) and ARIA attributes
// ==============================
(function () {
  const wrappers = document.querySelectorAll('.footer_copy-wrapper');
  if (!wrappers || wrappers.length === 0) return;

  wrappers.forEach(wrapper => {
    // Find the closest container that holds the address text
    const container = wrapper.closest('.footer_support-links') || wrapper.parentElement;

    // Prefer an explicit data-copy attribute (either on the wrapper or a child)
    const explicitCopyEl = wrapper.hasAttribute('data-copy') ? wrapper : wrapper.querySelector('[data-copy]');
    const explicitCopy = explicitCopyEl
      ? explicitCopyEl.getAttribute('data-copy') || explicitCopyEl.dataset.copy
      : null;

    // Try a few selectors for the copy source to be resilient to markup variations
    const copySource =
      container &&
      (container.querySelector('.is-footer-link') ||
        container.querySelector('.footer_address') ||
        container.querySelector('.text-size-medium') ||
        container.querySelector('.text-size-regular'));
    const buttonState = wrapper.querySelector('.text-size-regular');
    const clipDefaultIcon = wrapper.querySelector('.footer_clipboard-icon.is-default');
    const clipSuccessIcon = wrapper.querySelector('.footer_clipboard-icon.is-copied');

    if (!copySource || !buttonState || !clipDefaultIcon || !clipSuccessIcon) {
      return; // Skip this wrapper if required elements are missing
    }

    // Make wrapper keyboard accessible if not already
    if (!wrapper.hasAttribute('role')) wrapper.setAttribute('role', 'button');
    if (!wrapper.hasAttribute('tabindex')) wrapper.setAttribute('tabindex', '0');
    wrapper.setAttribute('aria-pressed', 'false');

    let resetTimeout = null;

    const updateUIOnCopy = () => {
      buttonState.textContent = 'Successfully copied!';
      wrapper.classList.add('copied');
      clipDefaultIcon.classList.add('hidden');
      clipSuccessIcon.classList.remove('hidden');
      wrapper.setAttribute('aria-pressed', 'true');

      // Reset previous timeout if any
      if (resetTimeout) clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => {
        resetUI();
      }, 10000);
    };

    const resetUI = () => {
      buttonState.textContent = 'Copy address';
      wrapper.classList.remove('copied');
      clipDefaultIcon.classList.remove('hidden');
      clipSuccessIcon.classList.add('hidden');
      wrapper.setAttribute('aria-pressed', 'false');
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }
    };

    // Fallback copy using a temporary textarea for older browsers
    const fallbackCopyText = text => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        // Prevent page scroll to top on iOS
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch (err) {
        return false;
      }
    };

    const doCopy = text => {
      if (!text) return Promise.reject(new Error('No text to copy'));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback sync copy
      return new Promise((resolve, reject) => {
        const ok = fallbackCopyText(text);
        ok ? resolve() : reject(new Error('Clipboard fallback failed'));
      });
    };

    const handleActivation = e => {
      // Accept click, touchend, Enter, or Space
      if (e && e.type === 'keydown') {
        const key = e.key || e.keyCode;
        if (!(key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 13 || key === 32)) return;
        e.preventDefault();
      }
      e && e.preventDefault && e.preventDefault();

      // If an explicit data-copy is present, use it (this ensures only the email is copied)
      const text = explicitCopy ? String(explicitCopy).trim() : copySource.textContent && copySource.textContent.trim();
      if (!text) return;

      doCopy(text)
        .then(() => {
          updateUIOnCopy();
        })
        .catch(err => {
          console.error('❗️ Failed to copy:', err);
          // Try fallback once more synchronously
          if (fallbackCopyText(text)) {
            updateUIOnCopy();
          }
        });
    };

    wrapper.addEventListener('click', handleActivation);
    wrapper.addEventListener(
      'touchend',
      e => {
        // touchend may fire along with click; prevent double-handling by using a tiny delay
        e.preventDefault();
        handleActivation(e);
      },
      { passive: false }
    );
    wrapper.addEventListener('keydown', handleActivation);
  });
})();

// ==============================
// ? BLUR HIDE
// ==============================
window.addEventListener('scroll', function () {
  const blurComponent = document.querySelector('.blur-component');
  const footer = document.querySelector('.footer');
  if (!blurComponent || !footer) {
    return; // Exit early if either element is missing
  }
  const footerRect = footer.getBoundingClientRect();
  if (footerRect.top < window.innerHeight) {
    blurComponent.style.opacity = '0';
    blurComponent.style.pointerEvents = 'none'; // Prevent interactions
    setTimeout(() => {
      // Double-check again to avoid flickering if scrolling fast
      const footerRectCheck = footer.getBoundingClientRect();
      if (footerRectCheck.top < window.innerHeight) {
        blurComponent.style.display = 'none';
      }
    }, 300);
  } else {
    blurComponent.style.display = 'block'; // Restore display when scrolling up
    setTimeout(() => {
      blurComponent.style.opacity = '1';
      blurComponent.style.pointerEvents = 'auto';
    }, 10);
  }
});
