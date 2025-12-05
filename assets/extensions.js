//
//? KACHING BUNDLE SELECTION
//?
//? This script enables custom pricing cards to add specific bundle options to cart.
//? It uses a single shared Kaching widget (hidden) that contains all bundle options,
//? and programmatically selects the correct option when a custom button is clicked.
//

document.addEventListener('DOMContentLoaded', () => {
  const sharedWidget = document.querySelector('#shared-kaching-bundle');
  const sharedSubmit = document.querySelector('#kaching-shared-submit');
  const buttons = document.querySelectorAll('.js-kaching-submit[data-bundle-index]');

  // Silently exit if elements not found (might be on a different page)
  if (!sharedWidget || !sharedSubmit || !buttons.length) {
    return;
  }

  // Wait for Kaching widget to fully render
  let tries = 0;
  const maxTries = 50;
  const pollInterval = 200;

  const waitForWidget = setInterval(() => {
    tries += 1;
    const bars = sharedWidget.querySelectorAll('.kaching-bundles__bar');

    if (bars.length >= 3) {
      clearInterval(waitForWidget);
      initBundleButtons(sharedWidget, sharedSubmit, buttons);
    } else if (tries >= maxTries) {
      clearInterval(waitForWidget);
      console.warn('[Kaching] Widget did not load expected bundle options');
    }
  }, pollInterval);
});

/**
 * Initialize click handlers for custom bundle buttons
 */
function initBundleButtons(widget, submitBtn, buttons) {
  buttons.forEach(btn => {
    btn.addEventListener('click', handleBundleButtonClick.bind(null, widget, submitBtn));
  });
}

/**
 * Select a bundle option and ensure dropdown is set to first option
 * Returns a Promise that resolves to true if successful
 */
function selectBundleOption(widget, bundleIndex) {
  return new Promise(resolve => {
    const bars = widget.querySelectorAll('.kaching-bundles__bar');
    const targetBar = bars[bundleIndex];

    if (!targetBar) {
      resolve(false);
      return;
    }

    // Select the bundle option via its radio input
    const radio = targetBar.querySelector('input[type="radio"]');

    if (radio && !radio.checked) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Wait for Kaching to render the dropdown (it appears after radio selection)
    let attempts = 0;
    const maxAttempts = 30;

    const waitForDropdown = setInterval(() => {
      attempts++;
      const dropdowns = targetBar.querySelectorAll('select');

      if (dropdowns.length > 0) {
        clearInterval(waitForDropdown);

        // Force dropdown to first option (1 Book)
        dropdowns.forEach(select => {
          select.selectedIndex = 0;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        });

        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(waitForDropdown);
        resolve(true);
      }
    }, 50);
  });
}

// Prevent double-clicks
let isProcessing = false;

/**
 * Handle click on a custom bundle button
 */
async function handleBundleButtonClick(widget, submitBtn, event) {
  event.preventDefault();
  event.stopPropagation();

  if (isProcessing) return;
  isProcessing = true;

  const button = event.currentTarget;
  const bundleIndex = parseInt(button.dataset.bundleIndex, 10);

  if (isNaN(bundleIndex) || bundleIndex < 0) {
    isProcessing = false;
    return;
  }

  // Select the bundle option and wait for dropdown to be ready
  const success = await selectBundleOption(widget, bundleIndex);

  if (!success) {
    isProcessing = false;
    return;
  }

  // Small delay to ensure Kaching has processed everything, then submit
  setTimeout(() => {
    submitBtn.click();
    setTimeout(() => {
      isProcessing = false;
    }, 1000);
  }, 100);
}

//
//? CHAT STYLING
//
(function () {
  function tweakShopifyChatButton(chatEl) {
    if (!chatEl || !chatEl.shadowRoot) return;

    const btn = chatEl.shadowRoot.querySelector('button.chat-toggle');

    if (!btn) return;

    // Your custom styles
    btn.style.borderRadius = '0px';
    // You can tweak more if you want:
    // btn.style.padding = '10px 18px';
    // btn.style.border = '1px solid #ffffff';
  }

  function initShopifyChatTweaks() {
    const chatEl = document.querySelector('inbox-online-store-chat');
    if (!chatEl) return false;

    // Apply once
    tweakShopifyChatButton(chatEl);

    // Observe future changes inside the shadow root
    const root = chatEl.shadowRoot;
    if (!root) return true;

    const observer = new MutationObserver(() => {
      tweakShopifyChatButton(chatEl);
    });

    observer.observe(root, { childList: true, subtree: true });

    return true;
  }

  // Try once immediately
  if (!initShopifyChatTweaks()) {
    // If the widget is injected later, poll for it
    let tries = 0;
    const maxTries = 40; // about 20 seconds if interval is 500ms

    const id = setInterval(() => {
      const ok = initShopifyChatTweaks();
      tries += 1;

      if (ok || tries >= maxTries) {
        clearInterval(id);
      }
    }, 500);
  }
})();
