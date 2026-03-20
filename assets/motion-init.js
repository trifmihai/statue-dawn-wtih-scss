import {
  mapValue,
  motionValue,
  scroll,
  springValue,
  styleEffect,
  svgEffect,
} from 'https://cdn.jsdelivr.net/npm/motion@12.34.5/+esm';

/* =============================
   Shared Setup
   ============================= */

const STAKES_SECTION_SELECTOR = '[data-sn-stakes-section]';
const STAKES_CONTENT_WRAPPER_SELECTOR = '.content-wrapper.is-stakes';

const MEDIA_QUERIES = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  desktopAnswerMotion: '(min-width: 992px)',
};

/* =============================
   SVG PATH MOTION
   Controls the dotted curved line inside the stakes section.
   ============================= */

const SVG_PATH_MOTION = {
  rootSelector: '[data-sn-scroll-root]',
  maskPathSelector: '[data-sn-scroll-mask-path]',
  readyFlag: 'stakesMotionReady',
  cleanupKey: 'stakesPathMotionCleanup',

  // Raise the first percentage if you want the dotted path to begin earlier.
  // Lower the second percentage if you want it to finish sooner.
  offsets: ['start 30%', 'end 60%'],
};

/* =============================
   BRIDGE / ANSWER MOTION
   Controls the answer card and the vertical connector above it.
   ============================= */

const ANSWER_BRIDGE_MOTION = {
  cardSelector: '[data-sn-answer-card-scroll]',
  readyFlag: 'stakesAnswerCardMotionReady',
  cleanupKey: 'stakesAnswerCardCleanup',
  layoutActiveFlag: 'snAnswerCardMotionActive',

  selectors: {
    origin: '[data-sn-answer-origin]',
    panel: '[data-sn-scroll-root]',
    destination: '[data-sn-answer-destination]',
    connectorOverlay: '[data-sn-answer-connector-overlay]',
    connectorReveal: '[data-sn-answer-connector-reveal]',
    connectorSvg: '[data-sn-answer-connector-svg]',
    connectorVisiblePath: '[data-sn-answer-connector-visible-path]',
    connectorSpacer: '[data-sn-answer-connector-spacer]',
    connectorLower: '[data-sn-answer-connector-lower]',
    rangeTarget: '[data-sn-answer-card-range]',
  },

  // These offsets define when the whole answer-card travel begins and ends.
  offsets: ['center 85%', 'center 15%'],

  // Basic motion controls for the card itself.
  // Lower minScale if you want the card to feel smaller at both ends.
  minScale: 0.74,
  spring: {
    stiffness: 260,
    damping: 26,
    mass: 0.9,
  },

  // =============================
  // BRIDGE MANUAL TUNING
  // =============================
  // Increase this if you want more empty space around the card
  // when it reaches full size between the two endpoints.
  visibleGapPaddingMin: 50,

  // This adds responsive padding based on the card's own height.
  // 0.18 means "18% of the card height".
  visibleGapPaddingHeightRatio: 0.18,

  // This controls how much of the path title's height counts as overlap
  // with the steps panel. 0.5 = half the title height.
  titleOverlapFactor: 0.5,

  // How far the card should tuck behind the trap card and the path title.
  endpointHiddenInset: 12,

  // Light center linger:
  // input = raw scroll progress
  // output = actual bridge motion progress
  // Keep the output band much narrower than the input band
  // if you want the card to feel almost paused near full size.
  centerSlowZoneInputStart: 0.42,
  centerSlowZoneInputEnd: 0.58,
  centerSlowZoneOutputStart: 0.495,
  centerSlowZoneOutputEnd: 0.505,

  // Small overdraw so the connector tucks slightly under the card edges.
  connectorOverdraw: 8,
};

const reducedMotionMedia = window.matchMedia(MEDIA_QUERIES.reducedMotion);
const answerBridgeDesktopMedia = window.matchMedia(MEDIA_QUERIES.desktopAnswerMotion);

/* =============================
   Shared Helpers
   ============================= */

function getTargets(root, selector) {
  if (!root) return [];

  if (root instanceof Element) {
    const matchedRoot = root.matches(selector) ? [root] : [];
    return matchedRoot.concat(Array.from(root.querySelectorAll(selector)));
  }

  if (root.querySelectorAll) {
    return Array.from(root.querySelectorAll(selector));
  }

  return [];
}

function getSectionRoot(element) {
  return element ? element.closest(STAKES_SECTION_SELECTOR) : null;
}

function destroyMotionValue(value) {
  if (typeof value?.destroy === 'function') {
    value.destroy();
  }
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mapNumberRange(value, inputStart, inputEnd, outputStart, outputEnd) {
  if (inputEnd === inputStart) return outputEnd;

  const normalizedValue = (value - inputStart) / (inputEnd - inputStart);
  return outputStart + normalizedValue * (outputEnd - outputStart);
}

function bindMediaQueryChange(mediaQueryList, handler) {
  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.addEventListener('change', handler);
    return;
  }

  if (typeof mediaQueryList.addListener === 'function') {
    mediaQueryList.addListener(handler);
  }
}

/* =============================
   SVG PATH MOTION
   ============================= */

function getSvgPathMotionRoots(root) {
  return getTargets(root, SVG_PATH_MOTION.rootSelector);
}

function destroySvgPathMotion(root = document) {
  getSvgPathMotionRoots(root).forEach(motionRoot => {
    if (typeof motionRoot[SVG_PATH_MOTION.cleanupKey] === 'function') {
      motionRoot[SVG_PATH_MOTION.cleanupKey]();
    }
  });
}

function initSvgPathMotion(root = document) {
  const prefersReducedMotion = reducedMotionMedia.matches;

  getSvgPathMotionRoots(root).forEach(motionRoot => {
    if (motionRoot.dataset[SVG_PATH_MOTION.readyFlag]) return;

    const maskPath = motionRoot.querySelector(SVG_PATH_MOTION.maskPathSelector);
    if (!maskPath) return;

    motionRoot.dataset[SVG_PATH_MOTION.readyFlag] = 'true';

    // If the visitor prefers reduced motion, keep the path static and visible.
    if (prefersReducedMotion) return;

    const drawProgress = motionValue(0);

    const stopDrawingEffect = svgEffect(maskPath, {
      pathLength: drawProgress,
    });

    const stopScrollTracking = scroll(
      progress => {
        drawProgress.set(progress);
      },
      {
        target: motionRoot,
        offset: SVG_PATH_MOTION.offsets,
      }
    );

    motionRoot[SVG_PATH_MOTION.cleanupKey] = () => {
      stopScrollTracking();
      stopDrawingEffect();
      destroyMotionValue(drawProgress);

      delete motionRoot.dataset[SVG_PATH_MOTION.readyFlag];
      delete motionRoot[SVG_PATH_MOTION.cleanupKey];
    };
  });
}

/* =============================
   BRIDGE / ANSWER MOTION
   ============================= */

function getAnswerBridgeCards(root) {
  return getTargets(root, ANSWER_BRIDGE_MOTION.cardSelector);
}

function getAnswerBridgeContext(answerCard) {
  const sectionRoot = getSectionRoot(answerCard);
  if (!sectionRoot) return null;

  const contentWrapper = sectionRoot.querySelector(STAKES_CONTENT_WRAPPER_SELECTOR);
  const selectors = ANSWER_BRIDGE_MOTION.selectors;
  const connectorOverlay = sectionRoot.querySelector(selectors.connectorOverlay);

  return {
    sectionRoot,
    contentWrapper,
    answerCard,
    answerOrigin: sectionRoot.querySelector(selectors.origin),
    answerPanel: sectionRoot.querySelector(selectors.panel),
    answerDestination: sectionRoot.querySelector(selectors.destination),
    answerCardRangeTarget: sectionRoot.querySelector(selectors.rangeTarget),
    connectorOverlay,
    connectorReveal: connectorOverlay ? connectorOverlay.querySelector(selectors.connectorReveal) : null,
    connectorSvg: connectorOverlay ? connectorOverlay.querySelector(selectors.connectorSvg) : null,
    connectorVisiblePath: connectorOverlay ? connectorOverlay.querySelector(selectors.connectorVisiblePath) : null,
    connectorSpacer: sectionRoot.querySelector(selectors.connectorSpacer),
    lowerConnectors: Array.from(sectionRoot.querySelectorAll(selectors.connectorLower)),
  };
}

function resetAnswerBridgeCardStyles(answerCard) {
  if (!answerCard) return;

  answerCard.style.transform = '';
  answerCard.style.opacity = '';
  answerCard.style.marginBottom = '';
}

function resetAnswerBridgeRangeStyles(answerCardRangeTarget) {
  if (!answerCardRangeTarget) return;

  answerCardRangeTarget.style.top = '';
  answerCardRangeTarget.style.height = '';
}

function resetAnswerBridgeConnectorStyles(context) {
  if (!context) return;

  if (context.contentWrapper) {
    delete context.contentWrapper.dataset[ANSWER_BRIDGE_MOTION.layoutActiveFlag];
  }

  if (context.connectorOverlay) {
    context.connectorOverlay.style.top = '';
    context.connectorOverlay.style.left = '';
    context.connectorOverlay.style.height = '';
    context.connectorOverlay.style.opacity = '';
  }

  if (context.connectorReveal) {
    context.connectorReveal.style.height = '';
  }

  if (context.connectorSpacer) {
    context.connectorSpacer.style.opacity = '';
  }

  context.lowerConnectors.forEach(lowerConnector => {
    lowerConnector.style.opacity = '';
  });
}

function resetAnswerBridgeMotionState(context) {
  if (!context) return;

  resetAnswerBridgeCardStyles(context.answerCard);
  resetAnswerBridgeRangeStyles(context.answerCardRangeTarget);
  resetAnswerBridgeConnectorStyles(context);
}

function hideStaticAnswerBridgeConnectors(context) {
  if (context.connectorSpacer) {
    context.connectorSpacer.style.opacity = '0';
  }

  context.lowerConnectors.forEach(lowerConnector => {
    lowerConnector.style.opacity = '0';
  });
}

function measureAnswerBridgeLayout(context) {
  if (
    !context.contentWrapper ||
    !context.answerOrigin ||
    !context.answerPanel ||
    !context.answerDestination ||
    !context.connectorOverlay ||
    !context.connectorReveal ||
    !context.connectorSvg ||
    !context.connectorVisiblePath
  ) {
    return null;
  }

  const contentWrapperRect = context.contentWrapper.getBoundingClientRect();
  const originRect = context.answerOrigin.getBoundingClientRect();
  const panelRect = context.answerPanel.getBoundingClientRect();
  const destinationRect = context.answerDestination.getBoundingClientRect();
  const answerCardRect = context.answerCard.getBoundingClientRect();

  return {
    cardCenterX: Math.round(answerCardRect.left + answerCardRect.width / 2 - contentWrapperRect.left) - 0.5,
    cardHeight: answerCardRect.height,
    cardTop: answerCardRect.top - contentWrapperRect.top,
    originBottom: originRect.bottom - contentWrapperRect.top,
    panelTop: panelRect.top - contentWrapperRect.top,
    titleHeight: destinationRect.height,
  };
}

function getAnswerBridgeVisibleGapPadding(cardHeight) {
  const heightRatio = Math.max(0, ANSWER_BRIDGE_MOTION.visibleGapPaddingHeightRatio);

  return Math.max(ANSWER_BRIDGE_MOTION.visibleGapPaddingMin, Math.round(cardHeight * heightRatio));
}

function getAnswerBridgeTitleOverlapOffset(titleHeight) {
  const overlapFactor = clampNumber(ANSWER_BRIDGE_MOTION.titleOverlapFactor, 0, 1);

  return Math.round(titleHeight * overlapFactor);
}

function getAnswerBridgeProgress(progress) {
  const clampedProgress = clampNumber(progress, 0, 1);

  const inputStart = clampNumber(ANSWER_BRIDGE_MOTION.centerSlowZoneInputStart, 0, 1);
  const inputEnd = clampNumber(ANSWER_BRIDGE_MOTION.centerSlowZoneInputEnd, inputStart, 1);
  const outputStart = clampNumber(ANSWER_BRIDGE_MOTION.centerSlowZoneOutputStart, 0, 1);
  const outputEnd = clampNumber(ANSWER_BRIDGE_MOTION.centerSlowZoneOutputEnd, outputStart, 1);

  if (clampedProgress <= inputStart) {
    return mapNumberRange(clampedProgress, 0, inputStart, 0, outputStart);
  }

  if (clampedProgress <= inputEnd) {
    return mapNumberRange(clampedProgress, inputStart, inputEnd, outputStart, outputEnd);
  }

  return mapNumberRange(clampedProgress, inputEnd, 1, outputEnd, 1);
}

function getAnswerBridgeLayoutGapAdjustment(layout) {
  const visibleGapStart = layout.originBottom;
  const visibleGapEnd = layout.panelTop - getAnswerBridgeTitleOverlapOffset(layout.titleHeight);
  const visibleGap = visibleGapEnd - visibleGapStart;
  const requiredGap = layout.cardHeight + getAnswerBridgeVisibleGapPadding(layout.cardHeight) * 2;

  return Math.max(0, Math.round(requiredGap - visibleGap));
}

function calculateAnswerBridgeMotionGeometry(layout) {
  // The bridge travel corridor is measured from:
  // 1. the bottom of sn_trap-card
  // 2. to the top of sn_steps-bg, minus half the path-title height
  // That subtraction accounts for the title panel overlapping the top edge
  // of the steps background, which keeps the enter and exit distances balanced.
  const rangeStart = Math.round(layout.originBottom);
  const rangeEnd = Math.round(layout.panelTop - getAnswerBridgeTitleOverlapOffset(layout.titleHeight));
  const rangeHeight = Math.max(1, rangeEnd - rangeStart);

  // Full-size state sits centered inside the real open space between the two endpoints.
  const centerTop = Math.round(rangeStart + Math.max(0, rangeHeight - layout.cardHeight) / 2);

  // Hidden states tuck the card fully under the trap card above and the title below.
  const hiddenStartTop = Math.round(rangeStart - layout.cardHeight - ANSWER_BRIDGE_MOTION.endpointHiddenInset);
  const hiddenEndTop = Math.round(rangeEnd + ANSWER_BRIDGE_MOTION.endpointHiddenInset);

  const lineStart = Math.round(rangeStart - ANSWER_BRIDGE_MOTION.connectorOverdraw);
  const lineFinish = Math.round(rangeEnd + ANSWER_BRIDGE_MOTION.connectorOverdraw);
  const lineHeight = Math.max(0, lineFinish - lineStart);
  const linePathHeight = Math.max(1, Math.round(lineHeight));

  return {
    centerY: centerTop - layout.cardTop,
    endY: hiddenEndTop - layout.cardTop,
    lineHeight,
    lineCenterX: layout.cardCenterX,
    linePathHeight,
    lineStart,
    rangeHeight,
    rangeStart,
    startY: hiddenStartTop - layout.cardTop,
    shouldShowLine: lineHeight > 0,
  };
}

function applyAnswerBridgeLineGeometry(context, geometry) {
  context.connectorOverlay.style.top = `${geometry.lineStart}px`;
  context.connectorOverlay.style.left = `${geometry.lineCenterX}px`;
  context.connectorOverlay.style.height = `${geometry.lineHeight}px`;
  context.connectorOverlay.style.opacity = geometry.shouldShowLine ? '1' : '0';
  context.connectorReveal.style.height = geometry.shouldShowLine ? `${geometry.lineHeight}px` : '0px';

  if (context.answerCardRangeTarget && geometry.rangeStart !== null && geometry.rangeHeight !== null) {
    context.answerCardRangeTarget.style.top = `${geometry.rangeStart}px`;
    context.answerCardRangeTarget.style.height = `${geometry.rangeHeight}px`;
  }

  const connectorPath = `M0.5 0V${geometry.linePathHeight}`;

  context.connectorSvg.setAttribute('viewBox', `0 0 1 ${geometry.linePathHeight}`);
  context.connectorVisiblePath.setAttribute('d', connectorPath);
}

function prepareAnswerBridgeGeometry(context) {
  hideStaticAnswerBridgeConnectors(context);

  let layout = measureAnswerBridgeLayout(context);
  if (!layout) return null;

  const missingGap = getAnswerBridgeLayoutGapAdjustment(layout);
  context.answerCard.style.marginBottom = missingGap > 0 ? `${missingGap}px` : '';

  layout = measureAnswerBridgeLayout(context);
  if (!layout) return null;

  const geometry = calculateAnswerBridgeMotionGeometry(layout);

  if (context.connectorOverlay) {
    applyAnswerBridgeLineGeometry(context, geometry);
  }

  return geometry;
}

function destroyAnswerBridgeMotion(root = document) {
  getAnswerBridgeCards(root).forEach(answerCard => {
    if (typeof answerCard[ANSWER_BRIDGE_MOTION.cleanupKey] === 'function') {
      answerCard[ANSWER_BRIDGE_MOTION.cleanupKey]();
      return;
    }

    const context = getAnswerBridgeContext(answerCard);
    resetAnswerBridgeMotionState(context);
    delete answerCard.dataset[ANSWER_BRIDGE_MOTION.readyFlag];
    delete answerCard[ANSWER_BRIDGE_MOTION.cleanupKey];
  });
}

function initAnswerBridgeMotion(root = document) {
  const shouldAnimateAnswerBridge = answerBridgeDesktopMedia.matches && !reducedMotionMedia.matches;

  if (!shouldAnimateAnswerBridge) {
    destroyAnswerBridgeMotion(root);
    return;
  }

  getAnswerBridgeCards(root).forEach(answerCard => {
    if (answerCard.dataset[ANSWER_BRIDGE_MOTION.readyFlag]) return;

    const context = getAnswerBridgeContext(answerCard);
    if (!context) return;

    answerCard.dataset[ANSWER_BRIDGE_MOTION.readyFlag] = 'true';

    if (context.contentWrapper) {
      context.contentWrapper.dataset[ANSWER_BRIDGE_MOTION.layoutActiveFlag] = 'true';
    }

    const bridgeGeometry = prepareAnswerBridgeGeometry(context);
    if (!bridgeGeometry) {
      resetAnswerBridgeMotionState(context);
      delete answerCard.dataset[ANSWER_BRIDGE_MOTION.readyFlag];
      return;
    }

    const answerCardProgress = motionValue(0);

    const yTarget = mapValue(
      answerCardProgress,
      [0, 0.5, 1],
      [bridgeGeometry.startY, bridgeGeometry.centerY, bridgeGeometry.endY]
    );
    const scaleTarget = mapValue(
      answerCardProgress,
      [0, 0.5, 1],
      [ANSWER_BRIDGE_MOTION.minScale, 1, ANSWER_BRIDGE_MOTION.minScale]
    );

    const springY = springValue(yTarget, ANSWER_BRIDGE_MOTION.spring);
    const springScale = springValue(scaleTarget, ANSWER_BRIDGE_MOTION.spring);

    const stopAnswerCardEffect = styleEffect(context.answerCard, {
      y: springY,
      scale: springScale,
    });

    const stopAnswerCardScroll = scroll(
      progress => {
        answerCardProgress.set(getAnswerBridgeProgress(progress));
      },
      {
        target: context.answerCardRangeTarget || context.answerCard,
        offset: ANSWER_BRIDGE_MOTION.offsets,
      }
    );

    answerCard[ANSWER_BRIDGE_MOTION.cleanupKey] = () => {
      stopAnswerCardScroll();
      stopAnswerCardEffect();

      [springScale, springY, scaleTarget, yTarget, answerCardProgress].forEach(destroyMotionValue);

      resetAnswerBridgeMotionState(context);
      delete answerCard.dataset[ANSWER_BRIDGE_MOTION.readyFlag];
      delete answerCard[ANSWER_BRIDGE_MOTION.cleanupKey];
    };
  });
}

function syncAnswerBridgeMotionForViewportChange() {
  destroyAnswerBridgeMotion(document);
  initAnswerBridgeMotion(document);
}

/* =============================
   Boot / Shopify Theme Editor
   ============================= */

function initStakesMotions(root = document) {
  initSvgPathMotion(root);
  initAnswerBridgeMotion(root);
}

function destroyStakesMotions(root = document) {
  destroySvgPathMotion(root);
  destroyAnswerBridgeMotion(root);
}

initStakesMotions();

document.addEventListener('shopify:section:load', event => {
  initStakesMotions(event.target);
});

document.addEventListener('shopify:section:unload', event => {
  destroyStakesMotions(event.target);
});

bindMediaQueryChange(answerBridgeDesktopMedia, syncAnswerBridgeMotionForViewportChange);
bindMediaQueryChange(reducedMotionMedia, syncAnswerBridgeMotionForViewportChange);
