import {
  animate,
  hover,
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
  desktopHeroCover: '(min-width: 992px)',
  desktopInteractiveManual: '(min-width: 992px)',
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
   PLAN LINES MOTION
   Progressively reveals each plan connector stack on scroll.
   ============================= */

const PLAN_LINES_MOTION = {
  wrapperSelector: '[data-sn-plan-lines-wrapper]',
  lineSelector: '[data-sn-plan-line]',
  readyFlag: 'planLinesMotionReady',
  cleanupKey: 'planLinesMotionCleanup',

  // Raise the first percentage if you want the plan lines to start appearing earlier.
  // Lower the second percentage if you want each stack to finish drawing sooner.
  offsets: ['start 80%', 'end 45%'],

  // These control how hidden each short line is before its turn begins.
  hiddenOpacity: 0,
  hiddenScaleX: 0.2,
};

/* =============================
   PLAN SWORDS MOTION
   Hover float lives on the inner image.
   Drag and spring-back live on the outer shell.
   ============================= */

const PLAN_SWORDS_MOTION = {
  shellSelector: '[data-sn-plan-sword-shell]',
  imageSelector: '[data-sn-plan-sword-image]',
  readyFlag: 'planSwordMotionReady',
  cleanupKey: 'planSwordMotionCleanup',
  draggingFlag: 'snPlanSwordDragging',

  // Hover float is decorative and should stay subtle across all swords.
  hoverFloatYKeyframes: [0, -8, 0, -5, 0],
  hoverFloatRotateKeyframes: [0, -1.5, 0.8, -0.5, 0],
  hoverFloatDuration: 2.2,
  hoverScaleBoost: 0.02,
  dragScaleBoost: 0.04,

  // Week 1 is the baseline. Each later sword roughly doubles the
  // allowed movement area as the sequence progresses toward "beyond".
  defaultConfig: {
    dragPerimeterX: 32,
    dragPerimeterY: 22,
    dragRotateRange: 5,
  },
  swordConfigs: {
    'day-1': {
      dragPerimeterX: 23,
      dragPerimeterY: 16,
      dragRotateRange: 4,
    },
    'week-1': {
      dragPerimeterX: 46,
      dragPerimeterY: 32,
      dragRotateRange: 5,
    },
    'week-5': {
      dragPerimeterX: 92,
      dragPerimeterY: 46,
      dragRotateRange: 6,
    },
    beyond: {
      dragPerimeterX: 184,
      dragPerimeterY: 92,
      dragRotateRange: 7,
    },
  },

  shellSpring: {
    stiffness: 260,
    damping: 22,
    mass: 0.85,
  },
  hoverReturnSpring: {
    type: 'spring',
    stiffness: 320,
    damping: 26,
  },
};

/* =============================
   HERO COVER MOTION
   Premium hover lift for the separate hero book cover.
   ============================= */

const HERO_COVER_MOTION = {
  rootSelector: '[data-sn-hero-cover-root]',
  hitAreaSelector: '[data-sn-hero-cover-hit-area]',
  stageSelector: '[data-sn-hero-cover-stage]',
  imageSelector: '[data-sn-hero-cover-image]',
  readyFlag: 'heroCoverMotionReady',
  cleanupKey: 'heroCoverMotionCleanup',
  engagedFlag: 'snHeroCoverEngaged',

  liftY: -10,
  hoverScale: 1.014,
  imageScale: 1.008,
  maxShiftX: 8,
  maxShiftY: 5,
  maxRotate: 1.35,

  pointerSpring: {
    stiffness: 215,
    damping: 25,
    mass: 0.74,
  },
  hoverSpring: {
    stiffness: 250,
    damping: 28,
    mass: 0.82,
  },
};

/* =============================
   INTERACTIVE MANUAL MOTION
   Premium tactile hover reveal for the manual section.
   ============================= */

const INTERACTIVE_MANUAL_MOTION = {
  rootSelector: '[data-sn-manual-root]',
  hitAreaSelector: '[data-sn-manual-hit-area]',
  baseSelector: '[data-sn-manual-base]',
  revealSvgSelector: '[data-sn-manual-reveal-svg]',
  fillImageSelector: '[data-sn-manual-fill-image]',
  maskSelector: '[data-sn-manual-mask]',
  maskShapeSelector: '[data-sn-manual-mask-shape]',
  maskGradientSelector: '[data-sn-manual-mask-gradient]',
  haloShapeSelector: '[data-sn-manual-halo-shape]',
  haloGradientSelector: '[data-sn-manual-halo-gradient]',
  toggleSelector: '[data-sn-manual-toggle]',
  readyFlag: 'interactiveManualMotionReady',
  cleanupKey: 'interactiveManualMotionCleanup',
  engagedFlag: 'snManualEngaged',
  simpleFlag: 'snManualSimple',
  uidKey: 'snManualSvgUid',

  // Inspection window:
  // Increase the open sizes if you want to reveal more writing at once.
  closedMaskRadiusX: 10.5,
  closedMaskRadiusY: 9.5,
  openMaskRadiusX: 24.5,
  openMaskRadiusY: 22,
  haloRadiusBoostX: 5.5,
  haloRadiusBoostY: 5,

  // Keep the reveal window away from the hard edges of the book.
  maskInsetX: 10,
  maskInsetY: 9,

  // The aperture should feel editorial, not literally glued to the cursor.
  leftPageAnchorX: 35,
  rightPageAnchorX: 65,
  pageAnchorY: 51.5,
  anchorFollowX: 0.34,
  anchorFollowY: 0.28,
  edgeFollowBoostX: 0.48,
  edgeFollowBoostY: 0.56,
  haloOpacity: 0.1,

  // Hover object feel:
  // Raise liftY or hoverScale slightly if you want more presence.
  liftY: -10,
  hoverScale: 1.012,
  maxShiftX: 6,
  maxShiftY: 4,
  maxRotate: 1.2,

  pointerSpring: {
    stiffness: 220,
    damping: 26,
    mass: 0.72,
  },
  hoverSpring: {
    stiffness: 260,
    damping: 28,
    mass: 0.8,
  },
  revealSpring: {
    stiffness: 240,
    damping: 30,
    mass: 0.88,
  },
  apertureSpring: {
    stiffness: 160,
    damping: 30,
    mass: 0.96,
  },

  // One-time attract cue. Keep this subtle and non-looping.
  idleCueDelayMs: 450,
  idleCueLiftY: -4,
  idleCueScale: 1.006,
  idleCueDuration: 1.2,
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
const heroCoverDesktopMedia = window.matchMedia(MEDIA_QUERIES.desktopHeroCover);
const interactiveManualDesktopMedia = window.matchMedia(MEDIA_QUERIES.desktopInteractiveManual);
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

function bindMotionValueChange(value, handler) {
  const unsubscribe =
    typeof value?.on === 'function'
      ? value.on('change', handler)
      : typeof value?.subscribe === 'function'
        ? value.subscribe(handler)
        : null;

  if (typeof value?.get === 'function') {
    handler(value.get());
  }

  return typeof unsubscribe === 'function' ? unsubscribe : () => {};
}

function clampPointToEllipse(x, y, maxX, maxY) {
  const safeMaxX = Math.max(maxX, 1);
  const safeMaxY = Math.max(maxY, 1);
  const ellipseRatio = (x * x) / (safeMaxX * safeMaxX) + (y * y) / (safeMaxY * safeMaxY);

  if (ellipseRatio <= 1) {
    return { x, y };
  }

  const clampScale = 1 / Math.sqrt(ellipseRatio);

  return {
    x: x * clampScale,
    y: y * clampScale,
  };
}

function read2dTransformSnapshot(element) {
  const transform = window.getComputedStyle(element).transform;
  if (!transform || transform === 'none') {
    return { rotate: 0, scale: 1 };
  }

  const matrixMatch = transform.match(/matrix(3d)?\((.+)\)/);
  if (!matrixMatch) {
    return { rotate: 0, scale: 1 };
  }

  const values = matrixMatch[2].split(',').map(value => Number.parseFloat(value.trim()));
  const a = values[0];
  const b = values[1];
  const scale = Math.sqrt(a * a + b * b) || 1;
  const rotate = (Math.atan2(b, a) * 180) / Math.PI;

  return { rotate, scale };
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
   PLAN LINES MOTION
   ============================= */

function getPlanLineWrappers(root) {
  return getTargets(root, PLAN_LINES_MOTION.wrapperSelector);
}

function resetPlanLineStyles(lines) {
  lines.forEach(line => {
    line.style.opacity = '';
    line.style.transform = '';
    line.style.transformOrigin = '';
  });
}

function applyPlanLineProgress(lines, progress) {
  const lineCount = lines.length;
  if (!lineCount) return;

  const clampedProgress = clampNumber(progress, 0, 1);

  lines.forEach((line, index) => {
    const lineStart = index / lineCount;
    const lineEnd = (index + 1) / lineCount;
    const lineProgress = clampNumber(mapNumberRange(clampedProgress, lineStart, lineEnd, 0, 1), 0, 1);
    const opacity = mapNumberRange(lineProgress, 0, 1, PLAN_LINES_MOTION.hiddenOpacity, 1);
    const scaleX = mapNumberRange(lineProgress, 0, 1, PLAN_LINES_MOTION.hiddenScaleX, 1);

    line.style.transformOrigin = 'center center';
    line.style.opacity = `${opacity}`;
    line.style.transform = `scaleX(${scaleX})`;
  });
}

function destroyPlanLinesMotion(root = document) {
  getPlanLineWrappers(root).forEach(wrapper => {
    if (typeof wrapper[PLAN_LINES_MOTION.cleanupKey] === 'function') {
      wrapper[PLAN_LINES_MOTION.cleanupKey]();
      return;
    }

    resetPlanLineStyles(Array.from(wrapper.querySelectorAll(PLAN_LINES_MOTION.lineSelector)));
    delete wrapper.dataset[PLAN_LINES_MOTION.readyFlag];
    delete wrapper[PLAN_LINES_MOTION.cleanupKey];
  });
}

function initPlanLinesMotion(root = document) {
  const prefersReducedMotion = reducedMotionMedia.matches;

  getPlanLineWrappers(root).forEach(wrapper => {
    if (wrapper.dataset[PLAN_LINES_MOTION.readyFlag]) return;

    const lines = Array.from(wrapper.querySelectorAll(PLAN_LINES_MOTION.lineSelector));
    if (!lines.length) return;

    wrapper.dataset[PLAN_LINES_MOTION.readyFlag] = 'true';

    if (prefersReducedMotion) return;

    applyPlanLineProgress(lines, 0);

    const stopScrollTracking = scroll(
      progress => {
        applyPlanLineProgress(lines, progress);
      },
      {
        target: wrapper,
        offset: PLAN_LINES_MOTION.offsets,
      }
    );

    wrapper[PLAN_LINES_MOTION.cleanupKey] = () => {
      stopScrollTracking();
      resetPlanLineStyles(lines);

      delete wrapper.dataset[PLAN_LINES_MOTION.readyFlag];
      delete wrapper[PLAN_LINES_MOTION.cleanupKey];
    };
  });
}

/* =============================
   PLAN SWORDS MOTION
   ============================= */

function getPlanSwordShells(root) {
  return getTargets(root, PLAN_SWORDS_MOTION.shellSelector);
}

function getPlanSwordConfig(shell) {
  const swordId = shell.dataset.snPlanSwordId;

  return {
    ...PLAN_SWORDS_MOTION.defaultConfig,
    ...(PLAN_SWORDS_MOTION.swordConfigs[swordId] || {}),
  };
}

function stopPlanSwordHoverAnimations(context) {
  context.hoverAnimations.forEach(animation => {
    animation?.stop?.();
  });
  context.hoverAnimations = [];
}

function setPlanSwordHoverAnimations(context, animations) {
  stopPlanSwordHoverAnimations(context);
  context.hoverAnimations = animations.filter(Boolean);
}

function settlePlanSwordHover(context) {
  setPlanSwordHoverAnimations(context, [
    animate(context.hoverYOffset, 0, PLAN_SWORDS_MOTION.hoverReturnSpring),
    animate(context.hoverRotateOffset, 0, PLAN_SWORDS_MOTION.hoverReturnSpring),
  ]);
}

function startPlanSwordHover(context) {
  if (context.isDragging || !context.isHovered) return;

  context.scaleTarget.set(context.baseScale + PLAN_SWORDS_MOTION.hoverScaleBoost);
  setPlanSwordHoverAnimations(context, [
    animate(context.hoverYOffset, PLAN_SWORDS_MOTION.hoverFloatYKeyframes, {
      duration: PLAN_SWORDS_MOTION.hoverFloatDuration,
      ease: 'easeInOut',
      repeat: Infinity,
    }),
    animate(context.hoverRotateOffset, PLAN_SWORDS_MOTION.hoverFloatRotateKeyframes, {
      duration: PLAN_SWORDS_MOTION.hoverFloatDuration,
      ease: 'easeInOut',
      repeat: Infinity,
    }),
  ]);
}

function releasePlanSword(context) {
  if (!context.isDragging) return;

  context.isDragging = false;
  context.pointerId = null;
  delete context.shell.dataset[PLAN_SWORDS_MOTION.draggingFlag];

  context.xTarget.set(0);
  context.yTarget.set(0);
  context.rotateTarget.set(context.baseRotate);
  context.scaleTarget.set(
    context.isHovered ? context.baseScale + PLAN_SWORDS_MOTION.hoverScaleBoost : context.baseScale
  );

  if (context.isHovered) {
    startPlanSwordHover(context);
    return;
  }

  settlePlanSwordHover(context);
}

function destroyPlanSwordMotion(root = document) {
  getPlanSwordShells(root).forEach(shell => {
    if (typeof shell[PLAN_SWORDS_MOTION.cleanupKey] === 'function') {
      shell[PLAN_SWORDS_MOTION.cleanupKey]();
      return;
    }

    delete shell.dataset[PLAN_SWORDS_MOTION.readyFlag];
    delete shell.dataset[PLAN_SWORDS_MOTION.draggingFlag];
    delete shell[PLAN_SWORDS_MOTION.cleanupKey];
  });
}

function initPlanSwordMotion(root = document) {
  const prefersReducedMotion = reducedMotionMedia.matches;

  getPlanSwordShells(root).forEach(shell => {
    if (shell.dataset[PLAN_SWORDS_MOTION.readyFlag]) return;

    const swordImage = shell.querySelector(PLAN_SWORDS_MOTION.imageSelector);
    if (!swordImage) return;

    shell.dataset[PLAN_SWORDS_MOTION.readyFlag] = 'true';

    if (prefersReducedMotion) return;

    const swordConfig = getPlanSwordConfig(shell);
    const baseTransform = read2dTransformSnapshot(shell);
    const xTarget = motionValue(0);
    const yTarget = motionValue(0);
    const rotateTarget = motionValue(baseTransform.rotate);
    const scaleTarget = motionValue(baseTransform.scale);
    const hoverYOffset = motionValue(0);
    const hoverRotateOffset = motionValue(0);

    const x = springValue(xTarget, PLAN_SWORDS_MOTION.shellSpring);
    const y = springValue(yTarget, PLAN_SWORDS_MOTION.shellSpring);
    const rotate = springValue(rotateTarget, PLAN_SWORDS_MOTION.shellSpring);
    const scale = springValue(scaleTarget, PLAN_SWORDS_MOTION.shellSpring);

    shell.style.willChange = 'transform';
    swordImage.style.willChange = 'transform';

    const stopShellEffect = styleEffect(shell, {
      x,
      y,
      rotate,
      scale,
    });
    const stopImageEffect = styleEffect(swordImage, {
      y: hoverYOffset,
      rotate: hoverRotateOffset,
    });

    const context = {
      shell,
      swordImage,
      config: swordConfig,
      xTarget,
      yTarget,
      rotateTarget,
      scaleTarget,
      hoverYOffset,
      hoverRotateOffset,
      x,
      y,
      rotate,
      scale,
      baseRotate: baseTransform.rotate,
      baseScale: baseTransform.scale,
      hoverAnimations: [],
      isDragging: false,
      isHovered: false,
      pointerId: null,
      dragStartPointerX: 0,
      dragStartPointerY: 0,
      dragStartX: 0,
      dragStartY: 0,
    };

    const onPointerDown = event => {
      if (event.button !== undefined && event.button !== 0) return;

      event.preventDefault();

      context.isDragging = true;
      context.pointerId = event.pointerId;
      context.shell.dataset[PLAN_SWORDS_MOTION.draggingFlag] = 'true';

      stopPlanSwordHoverAnimations(context);
      settlePlanSwordHover(context);

      const currentX = context.x.get();
      const currentY = context.y.get();
      const currentRotate = context.rotate.get();

      context.xTarget.set(currentX);
      context.yTarget.set(currentY);
      context.rotateTarget.set(currentRotate);

      context.dragStartPointerX = event.clientX;
      context.dragStartPointerY = event.clientY;
      context.dragStartX = currentX;
      context.dragStartY = currentY;

      context.scaleTarget.set(context.baseScale + PLAN_SWORDS_MOTION.dragScaleBoost);

      shell.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = event => {
      if (!context.isDragging || event.pointerId !== context.pointerId) return;

      event.preventDefault();

      const dragOffset = clampPointToEllipse(
        context.dragStartX + (event.clientX - context.dragStartPointerX),
        context.dragStartY + (event.clientY - context.dragStartPointerY),
        context.config.dragPerimeterX,
        context.config.dragPerimeterY
      );

      context.xTarget.set(dragOffset.x);
      context.yTarget.set(dragOffset.y);
      context.rotateTarget.set(
        context.baseRotate +
          mapNumberRange(
            dragOffset.x,
            -context.config.dragPerimeterX,
            context.config.dragPerimeterX,
            -context.config.dragRotateRange,
            context.config.dragRotateRange
          )
      );
    };

    const onPointerEnd = event => {
      if (context.pointerId !== null && event.pointerId !== context.pointerId) return;
      releasePlanSword(context);
    };

    const preventNativeDrag = event => {
      event.preventDefault();
    };

    const stopHoverGesture = hover(shell, () => {
      context.isHovered = true;
      startPlanSwordHover(context);

      return () => {
        context.isHovered = false;
        if (context.isDragging) return;

        context.scaleTarget.set(context.baseScale);
        settlePlanSwordHover(context);
      };
    });

    shell.addEventListener('pointerdown', onPointerDown);
    shell.addEventListener('pointermove', onPointerMove);
    shell.addEventListener('pointerup', onPointerEnd);
    shell.addEventListener('pointercancel', onPointerEnd);
    shell.addEventListener('lostpointercapture', onPointerEnd);
    swordImage.addEventListener('dragstart', preventNativeDrag);

    shell[PLAN_SWORDS_MOTION.cleanupKey] = () => {
      stopHoverGesture?.();
      stopPlanSwordHoverAnimations(context);

      shell.removeEventListener('pointerdown', onPointerDown);
      shell.removeEventListener('pointermove', onPointerMove);
      shell.removeEventListener('pointerup', onPointerEnd);
      shell.removeEventListener('pointercancel', onPointerEnd);
      shell.removeEventListener('lostpointercapture', onPointerEnd);
      swordImage.removeEventListener('dragstart', preventNativeDrag);

      stopShellEffect();
      stopImageEffect();

      [x, y, rotate, scale, xTarget, yTarget, rotateTarget, scaleTarget, hoverYOffset, hoverRotateOffset].forEach(
        destroyMotionValue
      );

      shell.style.transform = '';
      shell.style.willChange = '';
      swordImage.style.transform = '';
      swordImage.style.willChange = '';

      delete shell.dataset[PLAN_SWORDS_MOTION.readyFlag];
      delete shell.dataset[PLAN_SWORDS_MOTION.draggingFlag];
      delete shell[PLAN_SWORDS_MOTION.cleanupKey];
    };
  });
}

/* =============================
   HERO COVER MOTION
   ============================= */

function getHeroCoverRoots(root) {
  return getTargets(root, HERO_COVER_MOTION.rootSelector);
}

function getHeroCoverContext(heroCoverRoot) {
  const hitArea = heroCoverRoot.querySelector(HERO_COVER_MOTION.hitAreaSelector);
  const stage = heroCoverRoot.querySelector(HERO_COVER_MOTION.stageSelector);
  const image = heroCoverRoot.querySelector(HERO_COVER_MOTION.imageSelector);

  if (!hitArea || !stage || !image) return null;

  return {
    root: heroCoverRoot,
    hitArea,
    stage,
    image,
  };
}

function setHeroCoverEngaged(context, isEngaged) {
  if (isEngaged) {
    context.root.dataset[HERO_COVER_MOTION.engagedFlag] = 'true';
    return;
  }

  delete context.root.dataset[HERO_COVER_MOTION.engagedFlag];
}

function resetHeroCoverStyles(context) {
  if (!context) return;

  context.stage.style.transform = '';
  context.stage.style.willChange = '';
  context.image.style.transform = '';
  context.image.style.willChange = '';
  setHeroCoverEngaged(context, false);
}

function setupHeroCoverMotion(context) {
  const xTarget = motionValue(0);
  const yTarget = motionValue(0);
  const rotateTarget = motionValue(0);
  const scaleTarget = motionValue(1);
  const imageScaleTarget = motionValue(1);

  const x = springValue(xTarget, HERO_COVER_MOTION.pointerSpring);
  const y = springValue(yTarget, HERO_COVER_MOTION.hoverSpring);
  const rotate = springValue(rotateTarget, HERO_COVER_MOTION.pointerSpring);
  const scale = springValue(scaleTarget, HERO_COVER_MOTION.hoverSpring);
  const imageScale = springValue(imageScaleTarget, HERO_COVER_MOTION.hoverSpring);

  const stopStageEffect = styleEffect(context.stage, {
    x,
    y,
    rotate,
    scale,
  });
  const stopImageEffect = styleEffect(context.image, {
    scale: imageScale,
  });

  const onPointerMove = event => {
    if (!context.isHovered) return;

    const rect = context.hitArea.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const relativeX = clampNumber(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const relativeY = clampNumber(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    const normalizedX = mapNumberRange(relativeX, 0, 100, -1, 1);
    const normalizedY = mapNumberRange(relativeY, 0, 100, -1, 1);

    xTarget.set(normalizedX * HERO_COVER_MOTION.maxShiftX);
    yTarget.set(HERO_COVER_MOTION.liftY + normalizedY * HERO_COVER_MOTION.maxShiftY);
    rotateTarget.set(normalizedX * HERO_COVER_MOTION.maxRotate);
  };

  const stopHoverGesture = hover(context.hitArea, () => {
    context.isHovered = true;
    setHeroCoverEngaged(context, true);
    yTarget.set(HERO_COVER_MOTION.liftY);
    scaleTarget.set(HERO_COVER_MOTION.hoverScale);
    imageScaleTarget.set(HERO_COVER_MOTION.imageScale);

    return () => {
      context.isHovered = false;
      setHeroCoverEngaged(context, false);
      xTarget.set(0);
      yTarget.set(0);
      rotateTarget.set(0);
      scaleTarget.set(1);
      imageScaleTarget.set(1);
    };
  });

  context.isHovered = false;
  context.stage.style.willChange = 'transform, filter';
  context.image.style.willChange = 'transform';

  context.hitArea.addEventListener('pointermove', onPointerMove);

  return () => {
    stopHoverGesture?.();
    context.hitArea.removeEventListener('pointermove', onPointerMove);

    stopStageEffect();
    stopImageEffect();

    [x, y, rotate, scale, imageScale, xTarget, yTarget, rotateTarget, scaleTarget, imageScaleTarget].forEach(
      destroyMotionValue
    );
  };
}

function destroyHeroCoverMotion(root = document) {
  getHeroCoverRoots(root).forEach(heroCoverRoot => {
    if (typeof heroCoverRoot[HERO_COVER_MOTION.cleanupKey] === 'function') {
      heroCoverRoot[HERO_COVER_MOTION.cleanupKey]();
      return;
    }

    resetHeroCoverStyles(getHeroCoverContext(heroCoverRoot));
    delete heroCoverRoot.dataset[HERO_COVER_MOTION.readyFlag];
    delete heroCoverRoot[HERO_COVER_MOTION.cleanupKey];
  });
}

function initHeroCoverMotion(root = document) {
  const shouldUseHeroCoverMotion = heroCoverDesktopMedia.matches && !reducedMotionMedia.matches;
  if (!shouldUseHeroCoverMotion) return;

  getHeroCoverRoots(root).forEach(heroCoverRoot => {
    if (heroCoverRoot.dataset[HERO_COVER_MOTION.readyFlag]) return;

    const context = getHeroCoverContext(heroCoverRoot);
    if (!context) return;

    heroCoverRoot.dataset[HERO_COVER_MOTION.readyFlag] = 'true';

    const cleanup = setupHeroCoverMotion(context);

    heroCoverRoot[HERO_COVER_MOTION.cleanupKey] = () => {
      cleanup?.();
      resetHeroCoverStyles(context);

      delete heroCoverRoot.dataset[HERO_COVER_MOTION.readyFlag];
      delete heroCoverRoot[HERO_COVER_MOTION.cleanupKey];
    };
  });
}

function syncHeroCoverMotionForViewportChange() {
  destroyHeroCoverMotion(document);
  initHeroCoverMotion(document);
}

/* =============================
   INTERACTIVE MANUAL MOTION
   ============================= */

let interactiveManualSvgIdCounter = 0;

function getInteractiveManualRoots(root) {
  return getTargets(root, INTERACTIVE_MANUAL_MOTION.rootSelector);
}

function getInteractiveManualContext(manualRoot) {
  const hitArea = manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.hitAreaSelector);
  const manualFrame = hitArea?.querySelector('.interactive_manual-images');
  const revealSvg = manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.revealSvgSelector);
  const fillImage = manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.fillImageSelector);
  const maskDefinition = manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.maskSelector);
  const maskShape = manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.maskShapeSelector);
  const maskGradient = manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.maskGradientSelector);
  const haloShape = manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.haloShapeSelector);
  const haloGradient = manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.haloGradientSelector);

  if (
    !hitArea ||
    !manualFrame ||
    !revealSvg ||
    !fillImage ||
    !maskDefinition ||
    !maskShape ||
    !maskGradient ||
    !haloShape ||
    !haloGradient
  ) {
    return null;
  }

  return {
    root: manualRoot,
    hitArea,
    manualFrame,
    baseImage: manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.baseSelector),
    revealSvg,
    fillImage,
    maskDefinition,
    maskShape,
    maskGradient,
    haloShape,
    haloGradient,
    toggle: manualRoot.querySelector(INTERACTIVE_MANUAL_MOTION.toggleSelector),
  };
}

function getInteractiveManualFillSource(context) {
  return interactiveManualDesktopMedia.matches
    ? context.fillImage.dataset.snManualFillDesktopSrc
    : context.fillImage.dataset.snManualFillMobileSrc || context.fillImage.dataset.snManualFillDesktopSrc;
}

function setInteractiveManualFillSource(context) {
  const source = getInteractiveManualFillSource(context);
  if (!source) return;

  context.fillImage.setAttribute('href', source);
  context.fillImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', source);
}

function ensureInteractiveManualSvgBindings(context) {
  const uid =
    context.root.dataset[INTERACTIVE_MANUAL_MOTION.uidKey] ||
    `sn-manual-${interactiveManualSvgIdCounter++}`;
  const maskId = `${uid}-mask`;
  const maskGradientId = `${uid}-mask-gradient`;
  const haloGradientId = `${uid}-halo-gradient`;

  context.root.dataset[INTERACTIVE_MANUAL_MOTION.uidKey] = uid;

  context.maskDefinition.id = maskId;
  context.maskGradient.id = maskGradientId;
  context.haloGradient.id = haloGradientId;
  context.maskShape.setAttribute('fill', `url(#${maskGradientId})`);
  context.haloShape.setAttribute('fill', `url(#${haloGradientId})`);
  context.maskId = maskId;

  setInteractiveManualFillSource(context);
}

function setInteractiveManualMaskEnabled(context, isEnabled) {
  if (isEnabled) {
    context.fillImage.setAttribute('mask', `url(#${context.maskId})`);
    return;
  }

  context.fillImage.removeAttribute('mask');
}

function setInteractiveManualEngaged(context, isEngaged) {
  if (isEngaged) {
    context.root.dataset[INTERACTIVE_MANUAL_MOTION.engagedFlag] = 'true';
    return;
  }

  delete context.root.dataset[INTERACTIVE_MANUAL_MOTION.engagedFlag];
}

function resetInteractiveManualStyles(context) {
  if (!context) return;

  context.fillImage.classList.remove('is-active');
  context.haloShape.classList.remove('is-active');

  context.manualFrame.style.transform = '';
  context.manualFrame.style.willChange = '';

  context.fillImage.style.opacity = '';
  context.fillImage.style.willChange = '';
  context.haloShape.style.opacity = '';
  context.haloShape.style.willChange = '';

  setInteractiveManualMaskEnabled(context, false);
  setInteractiveManualFillSource(context);
  setInteractiveManualEngaged(context, false);
  delete context.root.dataset[INTERACTIVE_MANUAL_MOTION.simpleFlag];
}

function setInteractiveManualSimpleState(context, isActive, syncToggle = true) {
  context.isSimpleActive = isActive;
  setInteractiveManualMaskEnabled(context, false);
  context.fillImage.classList.toggle('is-active', isActive);
  context.haloShape.classList.toggle('is-active', isActive);
  setInteractiveManualEngaged(context, isActive);

  if (syncToggle && context.toggle && context.toggle.checked !== isActive) {
    context.toggle.checked = isActive;
  }
}

function setupInteractiveManualSimple(context) {
  const isDesktop = interactiveManualDesktopMedia.matches;
  const onDesktopSimpleHoverEnter = () => {
    setInteractiveManualSimpleState(context, true, false);
  };
  const onDesktopSimpleHoverLeave = () => {
    setInteractiveManualSimpleState(context, false, false);
  };
  const onToggleChange = () => {
    setInteractiveManualSimpleState(context, context.toggle.checked, false);
  };
  const onHitAreaClick = event => {
    if (isDesktop) return;
    if (event.target.closest('.interactive_toggle')) return;

    setInteractiveManualSimpleState(context, !context.isSimpleActive);
  };

  context.root.dataset[INTERACTIVE_MANUAL_MOTION.simpleFlag] = 'true';
  ensureInteractiveManualSvgBindings(context);
  setInteractiveManualSimpleState(context, !isDesktop && Boolean(context.toggle?.checked));

  if (context.toggle) {
    context.toggle.addEventListener('change', onToggleChange);
  }

  context.hitArea.addEventListener('click', onHitAreaClick);

  if (isDesktop) {
    context.hitArea.addEventListener('mouseenter', onDesktopSimpleHoverEnter);
    context.hitArea.addEventListener('mouseleave', onDesktopSimpleHoverLeave);
  }

  return () => {
    if (context.toggle) {
      context.toggle.removeEventListener('change', onToggleChange);
    }

    context.hitArea.removeEventListener('click', onHitAreaClick);
    context.hitArea.removeEventListener('mouseenter', onDesktopSimpleHoverEnter);
    context.hitArea.removeEventListener('mouseleave', onDesktopSimpleHoverLeave);
  };
}

function stopInteractiveManualAttractAnimations(context) {
  context.attractAnimations.forEach(animation => {
    animation?.stop?.();
  });
  context.attractAnimations = [];
}

function openInteractiveManualTactile(context) {
  setInteractiveManualMaskEnabled(context, true);
  setInteractiveManualEngaged(context, true);
  context.revealOpacityTarget.set(1);
  context.haloOpacityTarget.set(INTERACTIVE_MANUAL_MOTION.haloOpacity);
  context.maskWidthTarget.set(INTERACTIVE_MANUAL_MOTION.openMaskRadiusX);
  context.maskHeightTarget.set(INTERACTIVE_MANUAL_MOTION.openMaskRadiusY);
  context.haloWidthTarget.set(
    INTERACTIVE_MANUAL_MOTION.openMaskRadiusX + INTERACTIVE_MANUAL_MOTION.haloRadiusBoostX
  );
  context.haloHeightTarget.set(
    INTERACTIVE_MANUAL_MOTION.openMaskRadiusY + INTERACTIVE_MANUAL_MOTION.haloRadiusBoostY
  );
  context.yTarget.set(INTERACTIVE_MANUAL_MOTION.liftY);
  context.scaleTarget.set(INTERACTIVE_MANUAL_MOTION.hoverScale);
}

function closeInteractiveManualTactile(context) {
  setInteractiveManualEngaged(context, false);
  context.revealOpacityTarget.set(0);
  context.haloOpacityTarget.set(0);
  context.maskXTarget.set(50);
  context.maskYTarget.set(50);
  context.maskWidthTarget.set(INTERACTIVE_MANUAL_MOTION.closedMaskRadiusX);
  context.maskHeightTarget.set(INTERACTIVE_MANUAL_MOTION.closedMaskRadiusY);
  context.haloWidthTarget.set(
    INTERACTIVE_MANUAL_MOTION.closedMaskRadiusX + INTERACTIVE_MANUAL_MOTION.haloRadiusBoostX
  );
  context.haloHeightTarget.set(
    INTERACTIVE_MANUAL_MOTION.closedMaskRadiusY + INTERACTIVE_MANUAL_MOTION.haloRadiusBoostY
  );
  context.xTarget.set(0);
  context.yTarget.set(0);
  context.rotateTarget.set(0);
  context.scaleTarget.set(1);
}

function updateInteractiveManualPointer(context, event) {
  const frameRect = context.manualFrame.getBoundingClientRect();
  if (!frameRect.width || !frameRect.height) return;

  const relativeX = clampNumber(((event.clientX - frameRect.left) / frameRect.width) * 100, 0, 100);
  const relativeY = clampNumber(((event.clientY - frameRect.top) / frameRect.height) * 100, 0, 100);
  const clampedMaskX = clampNumber(
    relativeX,
    INTERACTIVE_MANUAL_MOTION.maskInsetX,
    100 - INTERACTIVE_MANUAL_MOTION.maskInsetX
  );
  const clampedMaskY = clampNumber(
    relativeY,
    INTERACTIVE_MANUAL_MOTION.maskInsetY,
    100 - INTERACTIVE_MANUAL_MOTION.maskInsetY
  );
  const anchorBlend = clampNumber(mapNumberRange(relativeX, 16, 84, 0, 1), 0, 1);
  const anchorX =
    INTERACTIVE_MANUAL_MOTION.leftPageAnchorX +
    (INTERACTIVE_MANUAL_MOTION.rightPageAnchorX - INTERACTIVE_MANUAL_MOTION.leftPageAnchorX) *
      anchorBlend;
  const anchorY = INTERACTIVE_MANUAL_MOTION.pageAnchorY;
  const normalizedX = mapNumberRange(relativeX, 0, 100, -1, 1);
  const normalizedY = mapNumberRange(relativeY, 0, 100, -1, 1);
  const edgeFollowX =
    INTERACTIVE_MANUAL_MOTION.anchorFollowX +
    clampNumber((Math.abs(normalizedX) - 0.28) / 0.72, 0, 1) * INTERACTIVE_MANUAL_MOTION.edgeFollowBoostX;
  const edgeFollowY =
    INTERACTIVE_MANUAL_MOTION.anchorFollowY +
    clampNumber((Math.abs(normalizedY) - 0.18) / 0.82, 0, 1) * INTERACTIVE_MANUAL_MOTION.edgeFollowBoostY;
  const composedMaskX =
    anchorX + (clampedMaskX - anchorX) * clampNumber(edgeFollowX, 0, 1);
  const composedMaskY =
    anchorY + (clampedMaskY - anchorY) * clampNumber(edgeFollowY, 0, 1);

  context.maskXTarget.set(composedMaskX);
  context.maskYTarget.set(composedMaskY);
  context.xTarget.set(normalizedX * INTERACTIVE_MANUAL_MOTION.maxShiftX);
  context.yTarget.set(INTERACTIVE_MANUAL_MOTION.liftY + normalizedY * INTERACTIVE_MANUAL_MOTION.maxShiftY);
  context.rotateTarget.set(normalizedX * INTERACTIVE_MANUAL_MOTION.maxRotate);
}

function setupInteractiveManualTactile(context) {
  ensureInteractiveManualSvgBindings(context);
  setInteractiveManualMaskEnabled(context, true);

  const xTarget = motionValue(0);
  const yTarget = motionValue(0);
  const scaleTarget = motionValue(1);
  const rotateTarget = motionValue(0);
  const revealOpacityTarget = motionValue(0);
  const haloOpacityTarget = motionValue(0);
  const maskXTarget = motionValue(50);
  const maskYTarget = motionValue(50);
  const maskWidthTarget = motionValue(INTERACTIVE_MANUAL_MOTION.closedMaskRadiusX);
  const maskHeightTarget = motionValue(INTERACTIVE_MANUAL_MOTION.closedMaskRadiusY);
  const haloWidthTarget = motionValue(
    INTERACTIVE_MANUAL_MOTION.closedMaskRadiusX + INTERACTIVE_MANUAL_MOTION.haloRadiusBoostX
  );
  const haloHeightTarget = motionValue(
    INTERACTIVE_MANUAL_MOTION.closedMaskRadiusY + INTERACTIVE_MANUAL_MOTION.haloRadiusBoostY
  );

  const x = springValue(xTarget, INTERACTIVE_MANUAL_MOTION.pointerSpring);
  const y = springValue(yTarget, INTERACTIVE_MANUAL_MOTION.hoverSpring);
  const scale = springValue(scaleTarget, INTERACTIVE_MANUAL_MOTION.hoverSpring);
  const rotate = springValue(rotateTarget, INTERACTIVE_MANUAL_MOTION.pointerSpring);
  const revealOpacity = springValue(revealOpacityTarget, INTERACTIVE_MANUAL_MOTION.revealSpring);
  const haloOpacity = springValue(haloOpacityTarget, INTERACTIVE_MANUAL_MOTION.revealSpring);
  const maskX = springValue(maskXTarget, INTERACTIVE_MANUAL_MOTION.apertureSpring);
  const maskY = springValue(maskYTarget, INTERACTIVE_MANUAL_MOTION.apertureSpring);
  const maskWidth = springValue(maskWidthTarget, INTERACTIVE_MANUAL_MOTION.apertureSpring);
  const maskHeight = springValue(maskHeightTarget, INTERACTIVE_MANUAL_MOTION.apertureSpring);
  const haloWidth = springValue(haloWidthTarget, INTERACTIVE_MANUAL_MOTION.apertureSpring);
  const haloHeight = springValue(haloHeightTarget, INTERACTIVE_MANUAL_MOTION.apertureSpring);

  const stopFrameEffect = styleEffect(context.manualFrame, {
    x,
    y,
    rotate,
    scale,
  });
  const stopRevealEffect = styleEffect(context.fillImage, {
    opacity: revealOpacity,
  });
  const stopHaloOpacityEffect = styleEffect(context.haloShape, {
    opacity: haloOpacity,
  });
  const stopMaskShapeEffect = svgEffect(context.maskShape, {
    cx: maskX,
    cy: maskY,
    rx: maskWidth,
    ry: maskHeight,
  });
  const stopHaloGeometryEffect = svgEffect(context.haloShape, {
    cx: maskX,
    cy: maskY,
    rx: haloWidth,
    ry: haloHeight,
  });

  const onPointerMove = event => {
    if (!context.isHovered) return;
    updateInteractiveManualPointer(context, event);
  };

  const stopHoverGesture = hover(context.hitArea, () => {
    context.isHovered = true;
    context.hasInteracted = true;

    window.clearTimeout(context.idleCueTimeoutId);
    stopInteractiveManualAttractAnimations(context);
    openInteractiveManualTactile(context);

    return () => {
      context.isHovered = false;
      closeInteractiveManualTactile(context);
    };
  });

  context.xTarget = xTarget;
  context.yTarget = yTarget;
  context.scaleTarget = scaleTarget;
  context.rotateTarget = rotateTarget;
  context.revealOpacityTarget = revealOpacityTarget;
  context.haloOpacityTarget = haloOpacityTarget;
  context.maskXTarget = maskXTarget;
  context.maskYTarget = maskYTarget;
  context.maskWidthTarget = maskWidthTarget;
  context.maskHeightTarget = maskHeightTarget;
  context.haloWidthTarget = haloWidthTarget;
  context.haloHeightTarget = haloHeightTarget;
  context.attractAnimations = [];
  context.hasInteracted = false;
  context.isHovered = false;
  context.idleCueTimeoutId = window.setTimeout(() => {
    if (context.isHovered || context.hasInteracted) return;

    context.attractAnimations = [
      animate(yTarget, [0, INTERACTIVE_MANUAL_MOTION.idleCueLiftY, 0], {
        duration: INTERACTIVE_MANUAL_MOTION.idleCueDuration,
        ease: 'easeInOut',
      }),
      animate(scaleTarget, [1, INTERACTIVE_MANUAL_MOTION.idleCueScale, 1], {
        duration: INTERACTIVE_MANUAL_MOTION.idleCueDuration,
        ease: 'easeInOut',
      }),
    ];
  }, INTERACTIVE_MANUAL_MOTION.idleCueDelayMs);

  context.manualFrame.style.willChange = 'transform, filter';
  context.fillImage.style.willChange = 'opacity';
  context.haloShape.style.willChange = 'opacity';

  context.hitArea.addEventListener('pointermove', onPointerMove);

  return () => {
    stopHoverGesture?.();
    stopInteractiveManualAttractAnimations(context);
    window.clearTimeout(context.idleCueTimeoutId);

    context.hitArea.removeEventListener('pointermove', onPointerMove);

    stopFrameEffect();
    stopRevealEffect();
    stopHaloOpacityEffect();
    stopMaskShapeEffect();
    stopHaloGeometryEffect();

    [
      x,
      y,
      scale,
      rotate,
      revealOpacity,
      haloOpacity,
      maskX,
      maskY,
      maskWidth,
      maskHeight,
      haloWidth,
      haloHeight,
    ].forEach(destroyMotionValue);
    [
      xTarget,
      yTarget,
      scaleTarget,
      rotateTarget,
      revealOpacityTarget,
      haloOpacityTarget,
      maskXTarget,
      maskYTarget,
      maskWidthTarget,
      maskHeightTarget,
      haloWidthTarget,
      haloHeightTarget,
    ].forEach(destroyMotionValue);
  };
}

function destroyInteractiveManualMotion(root = document) {
  getInteractiveManualRoots(root).forEach(manualRoot => {
    if (typeof manualRoot[INTERACTIVE_MANUAL_MOTION.cleanupKey] === 'function') {
      manualRoot[INTERACTIVE_MANUAL_MOTION.cleanupKey]();
      return;
    }

    resetInteractiveManualStyles(getInteractiveManualContext(manualRoot));
    delete manualRoot.dataset[INTERACTIVE_MANUAL_MOTION.readyFlag];
    delete manualRoot[INTERACTIVE_MANUAL_MOTION.cleanupKey];
  });
}

function initInteractiveManualMotion(root = document) {
  const shouldUseTactileMotion = interactiveManualDesktopMedia.matches && !reducedMotionMedia.matches;

  getInteractiveManualRoots(root).forEach(manualRoot => {
    if (manualRoot.dataset[INTERACTIVE_MANUAL_MOTION.readyFlag]) return;

    const context = getInteractiveManualContext(manualRoot);
    if (!context) return;

    ensureInteractiveManualSvgBindings(context);
    manualRoot.dataset[INTERACTIVE_MANUAL_MOTION.readyFlag] = 'true';

    const cleanup = shouldUseTactileMotion
      ? setupInteractiveManualTactile(context)
      : setupInteractiveManualSimple(context);

    manualRoot[INTERACTIVE_MANUAL_MOTION.cleanupKey] = () => {
      cleanup?.();
      resetInteractiveManualStyles(context);

      delete manualRoot.dataset[INTERACTIVE_MANUAL_MOTION.readyFlag];
      delete manualRoot[INTERACTIVE_MANUAL_MOTION.cleanupKey];
    };
  });
}

function syncInteractiveManualMotionForViewportChange() {
  destroyInteractiveManualMotion(document);
  initInteractiveManualMotion(document);
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

function initThemeMotions(root = document) {
  initSvgPathMotion(root);
  initPlanLinesMotion(root);
  initPlanSwordMotion(root);
  initHeroCoverMotion(root);
  initInteractiveManualMotion(root);
  initAnswerBridgeMotion(root);
}

function destroyThemeMotions(root = document) {
  destroySvgPathMotion(root);
  destroyPlanLinesMotion(root);
  destroyPlanSwordMotion(root);
  destroyHeroCoverMotion(root);
  destroyInteractiveManualMotion(root);
  destroyAnswerBridgeMotion(root);
}

initThemeMotions();

document.addEventListener('shopify:section:load', event => {
  initThemeMotions(event.target);
});

document.addEventListener('shopify:section:unload', event => {
  destroyThemeMotions(event.target);
});

bindMediaQueryChange(answerBridgeDesktopMedia, syncAnswerBridgeMotionForViewportChange);
bindMediaQueryChange(reducedMotionMedia, syncAnswerBridgeMotionForViewportChange);
bindMediaQueryChange(heroCoverDesktopMedia, syncHeroCoverMotionForViewportChange);
bindMediaQueryChange(reducedMotionMedia, syncHeroCoverMotionForViewportChange);
bindMediaQueryChange(interactiveManualDesktopMedia, syncInteractiveManualMotionForViewportChange);
bindMediaQueryChange(reducedMotionMedia, syncInteractiveManualMotionForViewportChange);
