'use client';

import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Plot-only vertical resize: the table below is a fixed size and should
// never shrink to make room, so this can't reuse `ResizablePanelGroup`
// (which always trades space between sibling panels). Instead this just
// grows/shrinks its own height directly, independent of everything below it.
const DEFAULT_HEIGHT = "60vh";
const MIN_HEIGHT_PX = 280;
// Leaves a sliver of breathing room at the bottom of the viewport instead
// of the panel touching the very edge.
const MAX_HEIGHT_VH_RATIO = 0.95;
// Fallback used only for the brief first render, before the mount effect
// below has measured the viewport; immediately replaced (and kept in sync
// with the viewport) so the real max always fills up to `MAX_HEIGHT_VH_RATIO`
// of the window, however much space is left below wherever the panel sits
// (e.g. under the sticky top nav).
const MAX_HEIGHT_FALLBACK_PX = 1400;
const KEYBOARD_STEP_PX = 24;
// Persists the user's chosen height across reloads, mirroring how
// `context/preferences-context.tsx` persists things like the chart palette.
const HEIGHT_STORAGE_KEY = "pca-plot-panel-height";

/**
 * Reads the last saved height synchronously, so the very first render
 * already has it — avoiding a visible default-then-snap-to-saved flash
 * that a post-mount effect would cause. Only ever called client-side (see
 * the `dynamic(..., { ssr: false })` export below), so `localStorage` is
 * always available; the `null` case is just "nothing saved yet".
 */
function readStoredHeight(): number | null {
  const saved = Number(window.localStorage.getItem(HEIGHT_STORAGE_KEY));
  return Number.isFinite(saved) && saved > 0 ? saved : null;
}

function ResizablePlotPanelInner({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [height, setHeight] = useState<number | string>(() => readStoredHeight() ?? DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  // Mirrors the container's actual rendered height in pixels, for use in
  // aria-valuenow and keyboard stepping. Refs can't be read during render,
  // so this is only ever updated from an effect / event handler.
  const [renderedHeightPx, setRenderedHeightPx] = useState<number>(MIN_HEIGHT_PX);
  // The max is however much of `MAX_HEIGHT_VH_RATIO` viewport height is left
  // below the panel's own top edge — i.e. 95vh minus whatever sits above it
  // (the sticky top nav, etc.) — tracked in state (rather than read directly
  // during render) so it stays correct if the window resizes.
  const [maxHeightPx, setMaxHeightPx] = useState<number>(MAX_HEIGHT_FALLBACK_PX);
  // True once the mount effect below has re-clamped the initial height
  // against the real max. Gates the persist effect so it can't fire before
  // that settles and write a not-yet-corrected value back to storage.
  const [isHeightHydrated, setIsHeightHydrated] = useState(false);

  useEffect(() => {
    const computeMaxHeight = () => {
      const top = containerRef.current?.getBoundingClientRect().top ?? 0;
      return Math.max(MIN_HEIGHT_PX, window.innerHeight * MAX_HEIGHT_VH_RATIO - top);
    };

    const initialMax = computeMaxHeight();
    setMaxHeightPx(initialMax);

    // The initial state only had `window.innerHeight` to clamp against (the
    // panel's real position, and thus its true max, isn't known until it's
    // in the DOM) — re-clamp now that `initialMax` accounts for it too.
    setHeight((current) =>
      typeof current === "number" ? Math.min(initialMax, Math.max(MIN_HEIGHT_PX, current)) : current
    );
    setIsHeightHydrated(true);

    const handleResize = () => setMaxHeightPx(computeMaxHeight());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persist changes back to localStorage, once hydrated (see above) and
  // only while `height` is a concrete pixel value — the default `"60vh"`
  // string isn't a user choice worth saving.
  useEffect(() => {
    if (!isHeightHydrated) return;
    if (typeof height !== "number") return;
    window.localStorage.setItem(HEIGHT_STORAGE_KEY, String(Math.round(height)));
  }, [isHeightHydrated, height]);

  const clamp = useCallback(
    (value: number) => Math.min(maxHeightPx, Math.max(MIN_HEIGHT_PX, value)),
    [maxHeightPx]
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setRenderedHeightPx(Math.round(containerRef.current.getBoundingClientRect().height));
  }, [height]);

  const currentHeightPx = useCallback(() => {
    if (typeof height === "number") return height;
    return containerRef.current?.getBoundingClientRect().height ?? MIN_HEIGHT_PX;
  }, [height]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragStartRef.current) return;
      const delta = event.clientY - dragStartRef.current.startY;
      setHeight(clamp(dragStartRef.current.startHeight + delta));
    },
    [clamp]
  );

  // Attach/detach the window-level drag listeners for the lifetime of a
  // single drag gesture, keyed off `isDragging` rather than a self-removing
  // handler so cleanup is unambiguous.
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerUp = () => setIsDragging(false);
    document.body.style.cursor = "row-resize";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.body.style.cursor = "";
      dragStartRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handlePointerMove]);

  const startDragging = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    dragStartRef.current = {
      startY: event.clientY,
      startHeight: containerRef.current?.getBoundingClientRect().height ?? MIN_HEIGHT_PX,
    };
    setIsDragging(true);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHeight(clamp(currentHeightPx() - KEYBOARD_STEP_PX));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setHeight(clamp(currentHeightPx() + KEYBOARD_STEP_PX));
      }
    },
    [clamp, currentHeightPx]
  );

  const resetHeight = useCallback(() => {
    setHeight(DEFAULT_HEIGHT);
    window.localStorage.removeItem(HEIGHT_STORAGE_KEY);
  }, []);

  return (
    <div className="w-full min-w-0">
      <div
        ref={containerRef}
        className="w-full min-w-0 overflow-hidden"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      >
        {children}
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize plot height"
        aria-valuenow={renderedHeightPx}
        aria-valuemin={MIN_HEIGHT_PX}
        aria-valuemax={maxHeightPx}
        tabIndex={0}
        onPointerDown={startDragging}
        onKeyDown={handleKeyDown}
        onDoubleClick={resetHeight}
        className="relative flex h-1.5 w-full shrink-0 cursor-row-resize touch-none items-center justify-center outline-none select-none after:absolute after:inset-x-0 after:-top-1.5 after:-bottom-1.5 focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="h-px w-full bg-border" />
        <div className="absolute z-10 h-1 w-6 shrink-0 rounded-lg bg-border" />
      </div>
    </div>
  );
}

/**
 * Reading `localStorage` means this component can never render identical
 * markup on the server and the client, so it's opted out of SSR entirely
 * (`ssr: false`) rather than hydrated — that's what actually avoids the
 * flash: there's no server-rendered "60vh" for the client to reconcile
 * against (and no hydration mismatch warning) before it settles on the
 * saved height.
 */
export const ResizablePlotPanel = dynamic(() => Promise.resolve(ResizablePlotPanelInner), {
  ssr: false,
  loading: () => <div className="w-full min-w-0" style={{ height: DEFAULT_HEIGHT }} />,
});
