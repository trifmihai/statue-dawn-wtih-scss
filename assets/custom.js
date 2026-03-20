// ==============================
// COPY TO CLIPBOARD
// ==============================

(function () {
  const wrappers = document.querySelectorAll('.footer_copy-wrapper');
  if (!wrappers.length) return;

  wrappers.forEach(wrapper => {
    const container = wrapper.closest('.footer_support-links') || wrapper.parentElement;
    const explicitCopyEl = wrapper.hasAttribute('data-copy') ? wrapper : wrapper.querySelector('[data-copy]');
    const explicitCopy = explicitCopyEl
      ? explicitCopyEl.getAttribute('data-copy') || explicitCopyEl.dataset.copy
      : null;

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
      return;
    }

    if (!wrapper.hasAttribute('role')) wrapper.setAttribute('role', 'button');
    if (!wrapper.hasAttribute('tabindex')) wrapper.setAttribute('tabindex', '0');
    wrapper.setAttribute('aria-pressed', 'false');

    let resetTimeout = null;

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

    const updateUIOnCopy = () => {
      buttonState.textContent = 'Successfully copied!';
      wrapper.classList.add('copied');
      clipDefaultIcon.classList.add('hidden');
      clipSuccessIcon.classList.remove('hidden');
      wrapper.setAttribute('aria-pressed', 'true');

      if (resetTimeout) clearTimeout(resetTimeout);

      resetTimeout = setTimeout(() => {
        resetUI();
      }, 10000);
    };

    const fallbackCopyText = text => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch (error) {
        return false;
      }
    };

    const doCopy = text => {
      if (!text) return Promise.reject(new Error('No text to copy'));

      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }

      return new Promise((resolve, reject) => {
        const didCopy = fallbackCopyText(text);
        didCopy ? resolve() : reject(new Error('Clipboard fallback failed'));
      });
    };

    const handleActivation = event => {
      if (event && event.type === 'keydown') {
        const key = event.key || event.keyCode;
        const isKeyboardActivation = key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 13 || key === 32;

        if (!isKeyboardActivation) return;
        event.preventDefault();
      }

      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      const text = explicitCopy ? String(explicitCopy).trim() : copySource.textContent && copySource.textContent.trim();
      if (!text) return;

      doCopy(text)
        .then(() => {
          updateUIOnCopy();
        })
        .catch(error => {
          console.error('Failed to copy text:', error);

          if (fallbackCopyText(text)) {
            updateUIOnCopy();
          }
        });
    };

    wrapper.addEventListener('click', handleActivation);
    wrapper.addEventListener(
      'touchend',
      event => {
        event.preventDefault();
        handleActivation(event);
      },
      { passive: false }
    );
    wrapper.addEventListener('keydown', handleActivation);
  });
})();

// ==============================
// BLUR HIDE
// ==============================

(function () {
  const blurComponent = document.querySelector('.blur-component');
  const footer = document.querySelector('.footer');
  if (!blurComponent || !footer) return;

  const setBlurVisibility = isFooterVisible => {
    if (isFooterVisible) {
      blurComponent.style.opacity = '0';
      blurComponent.style.pointerEvents = 'none';

      window.setTimeout(() => {
        if (footer.getBoundingClientRect().top < window.innerHeight) {
          blurComponent.style.display = 'none';
        }
      }, 300);

      return;
    }

    blurComponent.style.display = 'block';

    window.setTimeout(() => {
      blurComponent.style.opacity = '1';
      blurComponent.style.pointerEvents = 'auto';
    }, 10);
  };

  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        setBlurVisibility(entry.isIntersecting);
      });
    });

    observer.observe(footer);
    return;
  }

  const syncBlurVisibility = () => {
    setBlurVisibility(footer.getBoundingClientRect().top < window.innerHeight);
  };

  window.addEventListener('scroll', syncBlurVisibility, { passive: true });
  syncBlurVisibility();
})();

// ==============================
// KACHING CART DRAWER AUTOLAUNCH
// ==============================

(function () {
  if (typeof window === 'undefined' || !window.location) return;

  const param = 'open_kaching_cart';
  const search = window.location.search || '';
  if (search.indexOf(param) === -1) return;

  const strategies = [
    () => (window.KachingCart && typeof window.KachingCart.open === 'function' && window.KachingCart.open()) || false,
    () =>
      (window.Kaching &&
        window.Kaching.cart &&
        typeof window.Kaching.cart.open === 'function' &&
        window.Kaching.cart.open()) ||
      false,
    () => {
      const trigger = document.querySelector(
        '[data-kaching-cart-trigger], [data-kaching-cart-open], [data-kaching-cart-button], .kaching-cart-open, .kaching-cart-button'
      );

      if (!trigger) return false;

      trigger.click();
      return true;
    },
    () => {
      const drawer = document.querySelector('[data-kaching-cart-drawer], #kaching-cart-drawer, .kaching-cart-drawer');
      if (!drawer || !drawer.classList) return false;

      drawer.classList.add('is-open', 'kaching-cart--visible');
      document.documentElement.classList.add('kaching-cart-open');
      return true;
    },
  ];

  const tryOpen = () => {
    for (const openStrategy of strategies) {
      try {
        if (openStrategy()) return true;
      } catch (error) {
        if (window.console && console.warn) {
          console.warn('Kaching cart open attempt failed', error);
        }
      }
    }

    return false;
  };

  const removeParam = () => {
    if (!window.history || typeof window.history.replaceState !== 'function') return;

    try {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete(param);
      window.history.replaceState({}, document.title, nextUrl.toString());
    } catch (error) {
      const fallbackUrl = window.location.href.replace(new RegExp('[?&]' + param + '(=[^&#]*)?(?=&|#|$)'), match => {
        return match.startsWith('?') ? '?' : '';
      });

      window.history.replaceState({}, document.title, fallbackUrl);
    }
  };

  const begin = () => {
    let attempts = 0;
    const maxAttempts = 40;
    const timer = window.setInterval(() => {
      attempts += 1;

      if (tryOpen() || attempts >= maxAttempts) {
        window.clearInterval(timer);
        removeParam();
      }
    }, 150);
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    begin();
  } else {
    window.addEventListener('load', begin, { once: true });
  }
})();

// ==============================
// NAVIGATION SHOW/HIDE ON SCROLL
// ==============================

(function () {
  const navSection = document.getElementById('shopify-section-nav');
  if (!navSection) return;

  const nav = navSection.querySelector('[data-nav-root]');
  if (!nav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateNav = () => {
    const currentScrollY = window.scrollY;

    document.body.classList.add('has-sticky-nav');
    document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');

    if (currentScrollY <= 0) {
      nav.classList.remove('is-hidden');
    } else if (currentScrollY > lastScrollY + 2) {
      nav.classList.add('is-hidden');
    } else if (currentScrollY < lastScrollY - 2) {
      nav.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;

    window.requestAnimationFrame(updateNav);
    ticking = true;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();
})();

// ==============================
// SECTION ANCHOR SMOOTH SCROLL
// ==============================

(function () {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const getStickyNavOffset = () => {
    const navSection = document.getElementById('shopify-section-nav');
    const nav = navSection ? navSection.querySelector('[data-nav-root]') : null;
    const navHeight = nav
      ? nav.offsetHeight
      : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    return navHeight + rootFontSize;
  };

  const handleSectionAnchorClick = event => {
    const clickTarget =
      event.target && event.target.nodeType === Node.TEXT_NODE ? event.target.parentElement : event.target;

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !(clickTarget instanceof Element)
    ) {
      return;
    }

    const link = clickTarget.closest("a[href^='#section-']");
    if (!link) return;

    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin !== window.location.origin || targetUrl.pathname !== window.location.pathname) {
      return;
    }

    const hash = targetUrl.hash;
    if (!hash || !hash.startsWith('#section-')) return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getStickyNavOffset());

    window.scrollTo({
      top: targetTop,
      behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
    });

    if (window.location.hash !== hash && window.history && typeof window.history.pushState === 'function') {
      window.history.pushState({}, '', hash);
    }
  };

  document.addEventListener('click', handleSectionAnchorClick, true);
})();

// ==============================
// NAV CART BUBBLE
// ==============================

(function () {
  const bubble = document.querySelector('[data-cart-count-bubble]');
  if (!bubble) return;

  const countValue = bubble.querySelector('[data-cart-count-value]');
  let lastCartCount = Number(bubble.dataset.cartCount || 0);

  const updateCartBubble = count => {
    const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;

    lastCartCount = safeCount;
    bubble.dataset.cartCount = String(safeCount);
    bubble.hidden = safeCount <= 0;

    if (countValue) {
      countValue.textContent = String(safeCount);
    }
  };

  document.addEventListener('cart:updated', event => {
    const detail = event.detail || {};
    const count = detail.cart?.item_count ?? detail.item_count ?? 0;
    updateCartBubble(count);
  });

  const checkCartCount = async () => {
    try {
      const response = await fetch('/cart.js', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return;

      const cart = await response.json();
      if (cart.item_count !== lastCartCount) {
        updateCartBubble(cart.item_count);
      }
    } catch (error) {
      // Silently ignore polling failures.
    }
  };

  const timer = window.setInterval(checkCartCount, 2000);
  window.addEventListener(
    'beforeunload',
    () => {
      window.clearInterval(timer);
    },
    { once: true }
  );
})();

// ==============================
// STAKES WIDTH SYNC
// ==============================

(function () {
  const sections = document.querySelectorAll('[data-sn-stakes-section]:not([data-sn-width-sync-initialized])');
  if (!sections.length) return;

  sections.forEach(section => {
    section.dataset.snWidthSyncInitialized = 'true';

    let frameId = 0;

    const syncWidth = () => {
      const source = section.querySelector('[data-sn-width-source]');
      if (!source) return;

      const { width } = source.getBoundingClientRect();
      if (!width) return;

      section.style.setProperty('--sn-path-title-width', `${width}px`);
    };

    const scheduleSync = () => {
      if (frameId) window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        syncWidth();
      });
    };

    const source = section.querySelector('[data-sn-width-source]');

    if (source && typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(scheduleSync);
      observer.observe(source);
    } else {
      window.addEventListener('resize', scheduleSync, { passive: true });
    }

    window.addEventListener('load', scheduleSync, { once: true });
    scheduleSync();
  });
})();

// ==============================
// LEAD GEN FORM
// ==============================

(function () {
  const form = document.querySelector('[data-mailchimp-form]');
  if (!form) return;

  const formWrapper = form.closest('.w-form');
  const successMessage = formWrapper ? formWrapper.querySelector('.w-form-done') : null;
  const errorMessage = formWrapper ? formWrapper.querySelector('.w-form-fail') : null;
  const submitButton = form.querySelector('input[type="submit"]');
  const originalButtonText = submitButton ? submitButton.value : 'Submit';
  const waitText = submitButton ? submitButton.getAttribute('data-wait') || 'Please wait...' : 'Please wait...';

  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (errorMessage) {
      errorMessage.style.display = 'none';
    }

    if (submitButton) {
      submitButton.value = waitText;
      submitButton.disabled = true;
    }

    const params = [];

    Array.from(form.elements).forEach(element => {
      if (element.name && element.value) {
        params.push(`${encodeURIComponent(element.name)}=${encodeURIComponent(element.value)}`);
      }
    });

    const callbackName = `mailchimpCallback_${Date.now()}`;
    let script;
    let url = form.action.replace('/post?', '/post-json?');
    url += `&${params.join('&')}&c=${callbackName}`;

    window[callbackName] = response => {
      delete window[callbackName];

      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }

      if (response.result === 'success') {
        form.style.display = 'none';

        if (successMessage) {
          successMessage.style.display = 'block';
        }

        return;
      }

      if (submitButton) {
        submitButton.value = originalButtonText;
        submitButton.disabled = false;
      }

      if (errorMessage) {
        errorMessage.style.display = 'block';
      }

      console.error('Mailchimp error:', response.msg);
    };

    script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  });
})();
