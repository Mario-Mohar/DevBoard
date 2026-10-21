import { createContext, useContext } from "react";

// Board zoom (#577). Columns are scaled with CSS zoom rather than a transform:
// @hello-pangea/dnd measures with getBoundingClientRect, which already reports
// zoomed sizes, so hit testing and drop targets stay right.
export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 1.3;
export const ZOOM_STEP = 0.1;
const STORAGE_KEY = "board_zoom";

export const clampZoom = (zoom) =>
  Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) * 10) / 10;

export const readStoredZoom = () => {
  try {
    const value = parseFloat(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) ? clampZoom(value) : 1;
  } catch {
    return 1;
  }
};

export const storeZoom = (zoom) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(zoom));
  } catch {
    // Storage can be unavailable (private mode); the zoom then lasts the session.
  }
};

export const BoardZoomContext = createContext(1);
export const useBoardZoom = () => useContext(BoardZoomContext);

// dnd positions a dragged card in viewport pixels (fixed top/left/size plus a
// translate), and shifts the cards it passes with a translate too. Inside a
// zoomed column every one of those lengths gets multiplied by the zoom again,
// so the card would drift away from the pointer. Dividing them back keeps it
// under the cursor.
export const unzoomDragStyle = (style, zoom) => {
  if (!style || zoom === 1) return style;
  const out = { ...style };
  for (const key of ["top", "left", "width", "height"]) {
    if (typeof out[key] === "number") out[key] = out[key] / zoom;
  }
  if (typeof out.transform === "string") {
    out.transform = out.transform.replace(
      /(-?\d*\.?\d+)px/g,
      (_, n) => `${parseFloat(n) / zoom}px`,
    );
  }
  return out;
};
