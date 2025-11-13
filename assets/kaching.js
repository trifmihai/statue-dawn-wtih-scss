document.addEventListener('DOMContentLoaded', () => {
  // Map of product-id -> deal-bar-id you want preselected
  const kachingDefaults = {
    // Apprentice pack widget
    10252630786386: 'BQyD',
    // Add more here if you need for other bundles:
    // 'OTHER_PRODUCT_ID': 'KyG_',
    // 'ANOTHER_PRODUCT_ID': 'LKTJ',
  };

  Object.entries(kachingDefaults).forEach(([productId, dealId]) => {
    const bundleEl = document.querySelector(`kaching-bundle[product-id="${productId}"]`);
    if (!bundleEl) return;

    let tries = 0;
    const maxTries = 30;

    const timer = setInterval(() => {
      tries += 1;

      // Look for the bar inside this widget
      const barButton = bundleEl.querySelector(
        `.kaching-bundles__bar[data-deal-bar-id="${dealId}"] .kaching-bundles__bar-main`
      );

      if (barButton) {
        // Simulate the exact thing a user does: click the bar
        barButton.click();
        clearInterval(timer);
      } else if (tries >= maxTries) {
        // Give up after a few seconds if Kaching never renders
        clearInterval(timer);
      }
    }, 200);
  });
});
