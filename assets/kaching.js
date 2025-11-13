document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.js-select-bundle');

  cards.forEach(card => {
    const bundleEl = card.querySelector('kaching-bundle[product-id]');
    if (!bundleEl) return;

    const defaultIndex = parseInt(card.dataset.kachingDefaultIndex, 10);
    const index = Number.isNaN(defaultIndex) ? 0 : defaultIndex;

    let tries = 0;
    const maxTries = 30;

    const timer = setInterval(() => {
      tries += 1;

      const bars = bundleEl.querySelectorAll('.kaching-bundles__bar');
      if (!bars.length) {
        if (tries >= maxTries) clearInterval(timer);
        return;
      }

      const targetBar = bars[index] || bars[0];
      if (!targetBar) {
        clearInterval(timer);
        return;
      }

      // Prefer clicking the label so all Kaching logic runs
      const label = targetBar.querySelector('label');
      if (label) {
        label.click();
        clearInterval(timer);
        return;
      }

      // Fallback if label not found
      const main = targetBar.querySelector('.kaching-bundles__bar-main');
      if (main) {
        main.click();
        clearInterval(timer);
        return;
      }

      if (tries >= maxTries) {
        clearInterval(timer);
      }
    }, 200);
  });
});

//
// Chat
//
(function () {
  function tweakShopifyChatButton(chatEl) {
    if (!chatEl || !chatEl.shadowRoot) return;

    const btn = chatEl.shadowRoot.querySelector('button.chat-toggle');

    if (!btn) return;

    // Your custom styles
    btn.style.borderRadius = '0';
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
