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
