// ==============================
// ? COPY TO CLIPBOARD
// ==============================
const copyText = document.querySelector('.footer_link-wrapper .footer_address .text-size-medium');
const buttonState = document.querySelector('.footer_copy-wrapper .text-size-regular');
const copyWrapper = document.querySelector('.footer_copy-wrapper');
const clipDefaultIcon = document.querySelector('.footer_clipboard-icon.is-default');
const clipSuccessIcon = document.querySelector('.footer_clipboard-icon.is-copied');
(function () {
  if (!copyText || !buttonState || !copyWrapper || !clipDefaultIcon || !clipSuccessIcon) {
    return; // Exit if any element is missing
  }
  // Function to handle the copy action
  const handleCopy = e => {
    e.preventDefault();
    const text = copyText.textContent;
    if (text !== null) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          updateUIOnCopy();
          setTimeout(resetUI, 10000);
        })
        .catch(err => {
          console.error('❗️ Failed to copy:', err);
        });
    }
  };
  // Function to update the UI when text is copied
  const updateUIOnCopy = () => {
    buttonState.textContent = `Successfully copied!`;
    copyWrapper.classList.add('copied');
    clipDefaultIcon.classList.add('hidden');
    clipSuccessIcon.classList.remove('hidden');
  };
  // Function to reset the UI after a delay
  const resetUI = () => {
    buttonState.textContent = `Copy address`;
    copyWrapper.classList.remove('copied');
    clipDefaultIcon.classList.remove('hidden');
    clipSuccessIcon.classList.add('hidden');
  };
  // Add event listeners to the copy wrapper (safe because we checked earlier)
  copyWrapper.addEventListener('click', handleCopy);
  copyWrapper.addEventListener('touchend', handleCopy);
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
