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
  const maxTries = 50; // 10 seconds max wait time
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
 * Handle click on a custom bundle button
 * 1. Select the correct bundle option in the shared widget
 * 2. Reset quantity to 1
 * 3. Trigger the add-to-cart action
 */
function handleBundleButtonClick(widget, submitBtn, event) {
  event.preventDefault();

  const button = event.currentTarget;
  const bundleIndex = parseInt(button.dataset.bundleIndex, 10);

  if (isNaN(bundleIndex) || bundleIndex < 0) {
    console.warn('[Kaching] Invalid bundle index');
    return;
  }

  const bars = widget.querySelectorAll('.kaching-bundles__bar');
  const targetBar = bars[bundleIndex];

  if (!targetBar) {
    console.warn(`[Kaching] Bundle option ${bundleIndex} not found`);
    return;
  }

  // Select the bundle option via its radio input
  const radio = targetBar.querySelector('input[type="radio"]');
  if (radio) {
    radio.checked = true;
    // Dispatch change event so Kaching updates its internal state
    radio.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    // Fallback: click the label
    const label = targetBar.querySelector('label');
    if (label) {
      label.click();
    }
  }

  // Reset quantity to 1 for this bundle option
  const quantityInput = targetBar.querySelector(
    'input[type="number"], .kaching-bundles__quantity-input, [name*="quantity"]'
  );
  if (quantityInput) {
    quantityInput.value = '1';
    quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Also check for a global quantity input in the widget
  const globalQuantity = widget.querySelector('input[type="number"], .kaching-bundles__quantity-input');
  if (globalQuantity && globalQuantity !== quantityInput) {
    globalQuantity.value = '1';
    globalQuantity.dispatchEvent(new Event('input', { bubbles: true }));
    globalQuantity.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Small delay to allow Kaching to process the selection change
  setTimeout(() => {
    submitBtn.click();
  }, 150);
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
