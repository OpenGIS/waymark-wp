import { describe, it, expect } from "vitest";

// Focused coverage for the track-level elevation availability guard.
//
// Exporters commonly write 0 for every third ordinate when no elevation source
// exists. The guard treats that all-zero range as no elevation, so the
// readouts fall back to distance only. Any other finite range — including a
// range below sea level, or one wholly below zero — still counts as elevation.

const hasElevation = window.Waymark_L.Control.Elevation.prototype._hasElevation;

function elevationFor(max, min) {
  return hasElevation.call({ _maxElevation: max, _minElevation: min });
}

describe("track elevation availability", () => {
  it("treats an all-zero range as no elevation", () => {
    expect(elevationFor(0, 0)).toBe(false);
  });

  it("treats a real relief range as elevation", () => {
    expect(elevationFor(350.2, 0)).toBe(true);
  });

  it("treats a range that dips below sea level as elevation", () => {
    expect(elevationFor(0, -5)).toBe(true);
  });

  it("treats cleared bounds as no elevation", () => {
    expect(elevationFor(null, null)).toBe(false);
  });

  it("treats non-finite bounds as no elevation", () => {
    expect(elevationFor(Infinity, -Infinity)).toBe(false);
    expect(elevationFor(Infinity, 0)).toBe(false);
    expect(elevationFor(0, -Infinity)).toBe(false);
    expect(elevationFor(NaN, NaN)).toBe(false);
  });

  it("treats a wholly negative range as elevation", () => {
    expect(elevationFor(-10, -25)).toBe(true);
  });
});
