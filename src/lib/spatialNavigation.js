/**
 * Utility functions and Spatial Navigation Engine for TV Remote D-Pad Navigation
 */

// Detect TV Browser based on User Agent or URL search param
export function isTVBrowser() {
  if (typeof window === 'undefined' || !navigator) return false;

  // Manual URL override for testing on PC: ?tv=true or ?tv=1
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('tv') === 'true' || searchParams.get('tv') === '1') {
    return true;
  }

  const ua = (navigator.userAgent || '').toLowerCase();

  const tvKeywords = [
    'smarttv',
    'smart-tv',
    'smart tv',
    'tizen',
    'webos',
    'web0s',
    'samsungbrowser',
    'samsungtv',
    'samsung',
    'netcast',
    'hbbtv',
    'pov_tv',
    'viera',
    'bravia',
    'ce-html',
    'googletv',
    'android tv',
    'aftm', // Amazon Fire TV
    'aftb',
    'afts',
    'aftt',
    'apple-tv',
    'appletv',
    'roku',
    'playstation',
    'xbox',
    'large screen',
    'crkey',
    'mibox',
    'mitv'
  ];

  return tvKeywords.some((keyword) => ua.includes(keyword));
}

// Focusable Selector Query
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]'
].join(', ');

// Helper: Check if element is visible on screen and suitable for TV navigation
function isVisible(el) {
  if (!el || el.nodeType !== 1) return false;

  // Explicitly ignore elements marked tabindex="-1" or aria-hidden="true"
  if (el.getAttribute('tabindex') === '-1' || el.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Ignore cloned slick slides
  if (el.closest('.slick-cloned')) return false;

  // Ignore inactive slick slides that are hidden
  if (el.closest('.slick-slide:not(.slick-active)')) return false;

  // Ignore slider pagination dots in TV mode to prevent D-pad trapping
  if (
    el.closest('.slick-dots, .custom-dots') ||
    el.getAttribute('aria-label')?.startsWith('Go to slide')
  ) {
    return false;
  }

  // Ignore slider prev/next arrow buttons from direct spatial traversal so D-Pad moves card-to-card
  if (
    el.classList.contains('slick-arrow') ||
    el.getAttribute('aria-label')?.includes('Previous') ||
    el.getAttribute('aria-label')?.includes('Next') ||
    el.getAttribute('aria-label')?.includes('previous') ||
    el.getAttribute('aria-label')?.includes('next')
  ) {
    return false;
  }

  const style = window.getComputedStyle(el);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  ) {
    return false;
  }

  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  // Ignore elements completely offscreen horizontally
  if (rect.right < -20 || rect.left > window.innerWidth + 20) return false;

  return true;
}

// Get all focusable elements currently visible in the DOM
export function getFocusableElements() {
  const elements = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR));
  return elements.filter(isVisible);
}

// Find closest spatial element in a direction (UP, DOWN, LEFT, RIGHT)
export function getNextSpatialElement(currentEl, direction) {
  const allFocusables = getFocusableElements();
  if (!allFocusables.length) return null;

  // If no element is currently focused or currentEl is invalid, return first focusable element
  if (!currentEl || !isVisible(currentEl) || !allFocusables.includes(currentEl)) {
    return allFocusables[0];
  }

  // STRICT SLIDER ISOLATION RULE:
  // If moving LEFT or RIGHT inside a slider container, restrict candidate elements strictly to elements inside that same slider container.
  // This guarantees horizontal D-Pad actions never jump up/down to hero sliders or navbar links!
  const sliderParent = currentEl.closest('.slick-slider, [role="region"][aria-roledescription="carousel"], [data-slider-row="true"]');
  if ((direction === 'LEFT' || direction === 'RIGHT') && sliderParent) {
    const sliderCandidates = allFocusables.filter((el) => sliderParent.contains(el));
    const currentRect = currentEl.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2,
    };

    let bestCandidate = null;
    let minDistance = Infinity;

    for (const candidate of sliderCandidates) {
      if (candidate === currentEl) continue;
      const candRect = candidate.getBoundingClientRect();
      const candCenter = {
        x: candRect.left + candRect.width / 2,
        y: candRect.top + candRect.height / 2,
      };

      const dx = candCenter.x - currentCenter.x;
      const dy = candCenter.y - currentCenter.y;

      if (direction === 'RIGHT' && dx > 2 && Math.abs(dy) < currentRect.height * 1.5) {
        if (dx < minDistance) {
          minDistance = dx;
          bestCandidate = candidate;
        }
      } else if (direction === 'LEFT' && dx < -2 && Math.abs(dy) < currentRect.height * 1.5) {
        if (Math.abs(dx) < minDistance) {
          minDistance = Math.abs(dx);
          bestCandidate = candidate;
        }
      }
    }

    // Return the next card in row OR null if at edge of visible cards (so TVNavigationProvider auto-advances the slider)
    return bestCandidate;
  }

  const currentRect = currentEl.getBoundingClientRect();
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2,
  };

  let bestCandidate = null;
  let minDistance = Infinity;

  for (const candidate of allFocusables) {
    if (candidate === currentEl) continue;

    // If candidate is nested inside another focusable container (e.g. favorite button inside channel card),
    // and currentEl is not inside that same container, skip child element to select the parent card container first.
    const parentFocusable = allFocusables.find(
      (parent) => parent !== candidate && parent.contains(candidate)
    );
    if (parentFocusable && (!currentEl || !parentFocusable.contains(currentEl))) {
      continue;
    }

    const candRect = candidate.getBoundingClientRect();
    const candCenter = {
      x: candRect.left + candRect.width / 2,
      y: candRect.top + candRect.height / 2,
    };

    const dx = candCenter.x - currentCenter.x;
    const dy = candCenter.y - currentCenter.y;

    let isCandidateInDirection = false;

    switch (direction) {
      case 'UP':
        isCandidateInDirection = dy < -2 && candRect.bottom <= currentRect.top + currentRect.height * 0.5;
        break;
      case 'DOWN':
        isCandidateInDirection = dy > 2 && candRect.top >= currentRect.bottom - currentRect.height * 0.5;
        break;
      case 'LEFT':
        isCandidateInDirection = dx < -2 && candRect.right <= currentRect.left + currentRect.width * 0.5;
        break;
      case 'RIGHT':
        isCandidateInDirection = dx > 2 && candRect.left >= currentRect.right - currentRect.width * 0.5;
        break;
    }

    if (!isCandidateInDirection) continue;

    // Weight distance to prefer elements directly aligned along the primary direction
    let primaryDist = 0;
    let secondaryDist = 0;

    if (direction === 'UP' || direction === 'DOWN') {
      primaryDist = Math.abs(dy);
      secondaryDist = Math.abs(dx);
    } else {
      primaryDist = Math.abs(dx);
      secondaryDist = Math.abs(dy);
    }

    // Weighted distance formula
    const totalDistance = primaryDist + secondaryDist * 2.5;

    if (totalDistance < minDistance) {
      minDistance = totalDistance;
      bestCandidate = candidate;
    }
  }

  // Fallback: If no candidate passed strict directional filter, try looser check
  if (!bestCandidate) {
    for (const candidate of allFocusables) {
      if (candidate === currentEl) continue;

      const parentFocusable = allFocusables.find(
        (parent) => parent !== candidate && parent.contains(candidate)
      );
      if (parentFocusable && (!currentEl || !parentFocusable.contains(currentEl))) {
        continue;
      }

      const candRect = candidate.getBoundingClientRect();
      const candCenter = {
        x: candRect.left + candRect.width / 2,
        y: candRect.top + candRect.height / 2,
      };

      const dx = candCenter.x - currentCenter.x;
      const dy = candCenter.y - currentCenter.y;

      let isLooseMatch = false;
      if (direction === 'UP' && dy < 0) isLooseMatch = true;
      if (direction === 'DOWN' && dy > 0) isLooseMatch = true;
      if (direction === 'LEFT' && dx < 0) isLooseMatch = true;
      if (direction === 'RIGHT' && dx > 0) isLooseMatch = true;

      if (isLooseMatch) {
        const dist = Math.hypot(dx, dy);
        if (dist < minDistance) {
          minDistance = dist;
          bestCandidate = candidate;
        }
      }
    }
  }

  return bestCandidate;
}

// Remote Keycode Mappings across Samsung Tizen, LG WebOS, Android TV, Fire TV
export const TV_KEYS = {
  UP: ['ArrowUp', 38, 'Up'],
  DOWN: ['ArrowDown', 40, 'Down'],
  LEFT: ['ArrowLeft', 37, 'Left'],
  RIGHT: ['ArrowRight', 39, 'Right'],
  ENTER: ['Enter', 13, 32, 10252, 29443, 'Select', 'Accept'],
  BACK: ['Backspace', 'Escape', 'GoBack', 8, 27, 461, 10009, 'Back'],
  PLAY: ['MediaPlay', 415],
  PAUSE: ['MediaPause', 19],
  PLAY_PAUSE: ['MediaPlayPause', 10252]
};

export function getKeyAction(event) {
  const key = event.key;
  const keyCode = event.keyCode;

  if (TV_KEYS.UP.includes(key) || TV_KEYS.UP.includes(keyCode)) return 'UP';
  if (TV_KEYS.DOWN.includes(key) || TV_KEYS.DOWN.includes(keyCode)) return 'DOWN';
  if (TV_KEYS.LEFT.includes(key) || TV_KEYS.LEFT.includes(keyCode)) return 'LEFT';
  if (TV_KEYS.RIGHT.includes(key) || TV_KEYS.RIGHT.includes(keyCode)) return 'RIGHT';
  if (TV_KEYS.ENTER.includes(key) || TV_KEYS.ENTER.includes(keyCode)) return 'ENTER';
  if (TV_KEYS.BACK.includes(key) || TV_KEYS.BACK.includes(keyCode)) return 'BACK';

  return null;
}
