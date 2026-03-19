//
//? KACHING BUNDLE SELECTION
//?
//? This script powers the three visible pricing CTAs with the shared hidden
//? Kaching widget. Each button keeps its own loading state, and only resets
//? after the built-in cart drawer is actually open.
//

(function () {
  const WIDGET_SELECTOR = '#shared-kaching-bundle';
  const SUBMIT_SELECTOR = '#kaching-shared-submit';
  const BUTTON_SELECTOR = '.js-kaching-submit[data-bundle-index]';
  const DRAWER_SELECTOR = '[data-kaching-cart-drawer], #kaching-cart-drawer, .kaching-cart-drawer';
  const DRAWER_TRIGGER_SELECTOR =
    '[data-kaching-cart-trigger], [data-kaching-cart-open], [data-kaching-cart-button], .kaching-cart-open, .kaching-cart-button';

  let activeFlowButton = null;

  const onReady = callback => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(() => {
    const sharedWidget = document.querySelector(WIDGET_SELECTOR);
    const sharedSubmit = document.querySelector(SUBMIT_SELECTOR);
    const buttons = Array.from(document.querySelectorAll(BUTTON_SELECTOR));

    if (!sharedWidget || !sharedSubmit || !buttons.length) {
      return;
    }

    if (sharedWidget.dataset.pricingBundleButtonsInitialized === 'true') {
      return;
    }

    sharedWidget.dataset.pricingBundleButtonsInitialized = 'true';

    let tries = 0;
    const maxTries = 50;
    const pollInterval = 200;

    const waitForWidget = window.setInterval(() => {
      tries += 1;
      const bars = sharedWidget.querySelectorAll('.kaching-bundles__bar');

      if (bars.length >= buttons.length) {
        window.clearInterval(waitForWidget);
        initBundleButtons(sharedWidget, sharedSubmit, buttons);
      } else if (tries >= maxTries) {
        window.clearInterval(waitForWidget);
        console.warn('[Kaching] Widget did not load expected bundle options');
      }
    }, pollInterval);
  });

  function initBundleButtons(widget, submitButton, buttons) {
    buttons.forEach(button => {
      if (button.dataset.pricingButtonInitialized === 'true') {
        return;
      }

      button.dataset.pricingButtonInitialized = 'true';
      button.addEventListener('click', event => {
        handleBundleButtonClick(widget, submitButton, event);
      });
    });
  }

  function setButtonState(button, nextState, liveMessage = '') {
    const isLoading = nextState === 'loading';
    const statusRegion = button.querySelector('.pricing_button-status');

    button.classList.toggle('is-loading', isLoading);
    button.disabled = isLoading;
    button.setAttribute('aria-busy', String(isLoading));

    if (statusRegion) {
      statusRegion.textContent = liveMessage;
    }
  }

  function resetButtonState(button, liveMessage = '') {
    setButtonState(button, 'default', liveMessage);

    if (!liveMessage) {
      return;
    }

    window.setTimeout(() => {
      const statusRegion = button.querySelector('.pricing_button-status');

      if (statusRegion && statusRegion.textContent === liveMessage) {
        statusRegion.textContent = '';
      }
    }, 1600);
  }

  function isCartDrawerOpen() {
    const drawer = document.querySelector(DRAWER_SELECTOR);

    if (!drawer) {
      return false;
    }

    if (document.documentElement.classList.contains('kaching-cart-open') || drawer.hasAttribute('open')) {
      return true;
    }

    const classList = drawer.classList;

    return (
      classList.contains('is-open') ||
      classList.contains('kaching-cart--visible') ||
      classList.contains('is-visible') ||
      classList.contains('active') ||
      drawer.getAttribute('aria-hidden') === 'false'
    );
  }

  function tryOpenCartDrawer() {
    const strategies = [
      () => (window.KachingCart && typeof window.KachingCart.open === 'function' && window.KachingCart.open()) || false,
      () =>
        (window.Kaching &&
          window.Kaching.cart &&
          typeof window.Kaching.cart.open === 'function' &&
          window.Kaching.cart.open()) ||
        false,
      () => {
        const trigger = document.querySelector(DRAWER_TRIGGER_SELECTOR);

        if (trigger) {
          trigger.click();
          return true;
        }

        return false;
      },
    ];

    return strategies.some(openStrategy => {
      try {
        return Boolean(openStrategy());
      } catch (error) {
        if (window.console && console.warn) {
          console.warn('[Kaching] Cart drawer open attempt failed', error);
        }

        return false;
      }
    });
  }

  function waitForCartDrawerOpen(timeoutMs = 10000) {
    return new Promise(resolve => {
      if (isCartDrawerOpen()) {
        resolve(true);
        return;
      }

      let settled = false;
      let observer = null;

      const finish = didOpen => {
        if (settled) {
          return;
        }

        settled = true;

        if (observer) {
          observer.disconnect();
        }

        window.clearTimeout(timeoutId);
        resolve(didOpen);
      };

      observer = new MutationObserver(() => {
        if (isCartDrawerOpen()) {
          finish(true);
        }
      });

      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'aria-hidden', 'open'],
      });

      const timeoutId = window.setTimeout(() => {
        finish(false);
      }, timeoutMs);
    });
  }

  function selectBundleOption(widget, bundleIndex) {
    return new Promise(resolve => {
      const bars = widget.querySelectorAll('.kaching-bundles__bar');
      const targetBar = bars[bundleIndex];

      if (!targetBar) {
        resolve(false);
        return;
      }

      // Select the requested bundle option through the widget's real radio control.
      const radio = targetBar.querySelector('input[type="radio"]');

      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Wait for Kaching to render the option dropdown, then lock it to the first choice.
      let attempts = 0;
      const maxAttempts = 30;

      const waitForDropdown = window.setInterval(() => {
        attempts += 1;
        const dropdowns = targetBar.querySelectorAll('select');

        if (dropdowns.length > 0) {
          window.clearInterval(waitForDropdown);

          dropdowns.forEach(select => {
            select.selectedIndex = 0;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          });

          resolve(true);
        } else if (attempts >= maxAttempts) {
          window.clearInterval(waitForDropdown);
          resolve(true);
        }
      }, 50);
    });
  }

  async function handleBundleButtonClick(widget, submitButton, event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const bundleIndex = Number.parseInt(button.dataset.bundleIndex, 10);

    if (button.disabled || Number.isNaN(bundleIndex) || bundleIndex < 0) {
      return;
    }

    // The shared hidden widget can only safely process one pricing flow at a time.
    if (activeFlowButton && activeFlowButton !== button) {
      return;
    }

    activeFlowButton = button;
    setButtonState(button, 'loading', 'Claiming your pack...');

    const selectionSucceeded = await selectBundleOption(widget, bundleIndex);

    if (!selectionSucceeded) {
      resetButtonState(button, 'We could not claim this pack. Please try again.');
      activeFlowButton = null;
      return;
    }

    submitButton.click();

    // Reuse the theme's cart drawer hooks if the app does not auto-open fast enough.
    const nudgeDrawerTimer = window.setTimeout(() => {
      if (!isCartDrawerOpen()) {
        tryOpenCartDrawer();
      }
    }, 900);

    const drawerOpened = await waitForCartDrawerOpen();

    window.clearTimeout(nudgeDrawerTimer);

    if (drawerOpened) {
      resetButtonState(button, 'Pack added to cart.');
    } else {
      resetButtonState(button, 'We could not open the cart. Please try again.');
    }

    activeFlowButton = null;
  }
})();

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
