"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  isTVBrowser,
  getKeyAction,
  getNextSpatialElement,
  getFocusableElements,
} from "@/lib/spatialNavigation";

export default function TVNavigationProvider({ children }) {
  const [isTV, setIsTV] = useState(false);
  const pathname = usePathname();

  // Helper to focus initial element on page load or navigation
  const autoFocusFirstElement = useCallback(() => {
    setTimeout(() => {
      const focusables = getFocusableElements();
      if (focusables.length > 0) {
        // Prefer main content or first visible interactive element
        const mainContentEl = document.querySelector('main a[href], main button') || focusables[0];
        mainContentEl.focus();
        mainContentEl.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      }
    }, 150);
  }, []);

  const applyTVFocus = useCallback((el) => {
    if (!el) return;
    document.querySelectorAll('.tv-focused').forEach((prev) => prev.classList.remove('tv-focused'));
    el.focus();
    el.classList.add('tv-focused');
    el.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    // Detect TV Mode for Smart TV browsers or ?tv=true parameter
    const tvActive = isTVBrowser();
    if (tvActive) {
      setIsTV(true);
      document.body.classList.add("tv-mode");
      autoFocusFirstElement();
    }

    const handleFocusIn = (e) => {
      if (e.target && e.target.nodeType === 1) {
        document.querySelectorAll('.tv-focused').forEach((prev) => prev.classList.remove('tv-focused'));
        e.target.classList.add('tv-focused');
      }
    };

    const handleKeyDown = (e) => {
      const action = getKeyAction(e);
      if (!action) return;

      // Dynamically activate TV navigation mode on first D-Pad arrow press
      setIsTV(true);
      document.body.classList.add("tv-mode");

      let activeEl = document.activeElement;

      // If body or no element is focused, focus the first interactive element on screen
      if (!activeEl || activeEl === document.body) {
        const focusables = getFocusableElements();
        if (focusables.length > 0) {
          activeEl = focusables[0];
          applyTVFocus(activeEl);
        }
      }

      // Handle D-Pad Directions
      if (["UP", "DOWN", "LEFT", "RIGHT"].includes(action)) {
        // Prevent default browser scrolling (page scrolling up/down)
        e.preventDefault();

        const nextEl = getNextSpatialElement(activeEl, action);
        if (nextEl) {
          applyTVFocus(nextEl);
        } else if (action === "RIGHT" || action === "LEFT") {
          // If no next card visible on screen, check if inside a slider and trigger slide change
          const sliderContainer = activeEl?.closest(
            ".slick-slider, [role='region'][aria-roledescription='carousel'], [data-slider-row='true']"
          );
          if (sliderContainer) {
            const arrowSelector =
              action === "RIGHT"
                ? ".slick-next, button[aria-label*='Next'], button[aria-label*='next']"
                : ".slick-prev, button[aria-label*='Previous'], button[aria-label*='previous']";
            const arrowButton = sliderContainer.querySelector(arrowSelector);

            if (arrowButton) {
              arrowButton.click();
              // After transition completes, focus the new edge card
              setTimeout(() => {
                const newFocusables = getFocusableElements();
                const sliderFocusables = newFocusables.filter((el) => sliderContainer.contains(el));
                const newNext = getNextSpatialElement(activeEl, action);

                if (newNext && sliderContainer.contains(newNext)) {
                  applyTVFocus(newNext);
                } else if (sliderFocusables.length > 0) {
                  const fallbackTarget =
                    action === "RIGHT"
                      ? sliderFocusables[sliderFocusables.length - 1]
                      : sliderFocusables[0];
                  applyTVFocus(fallbackTarget);
                }
              }, 320);
            }
          }
        }
      } else if (action === "ENTER") {
        // If current element is focused, trigger click
        if (activeEl && activeEl !== document.body) {
          if (activeEl.tagName !== "INPUT" && activeEl.tagName !== "TEXTAREA") {
            activeEl.click();
          }
        }
      } else if (action === "BACK") {
        e.preventDefault();
        // Go back in history if possible
        if (window.history.length > 1) {
          window.history.back();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("focusin", handleFocusIn);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("focusin", handleFocusIn);
    };
  }, [applyTVFocus, autoFocusFirstElement]);

  // Refocus on route changes
  useEffect(() => {
    if (isTV) {
      autoFocusFirstElement();
    }
  }, [pathname, isTV, autoFocusFirstElement]);

  return (
    <>
      {children}
      {isTV && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/50 shadow-2xl flex items-center gap-2 pointer-events-none backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          📺 TV Remote Control Mode (D-Pad Active)
        </div>
      )}
    </>
  );
}
