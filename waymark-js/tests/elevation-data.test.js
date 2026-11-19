import { describe, it, expect, beforeEach } from "vitest";

// Regression coverage for issue #87.
//
// Exporters write 0 as the third ordinate when they have no elevation data,
// which made the elevation chart appear for flat tracks. A line counts as
// having elevation data only when at least one point has a finite, non-zero
// elevation.

function lineString(coordinates) {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates },
    properties: {},
  };
}

function multiLineString(coordinates) {
  return {
    type: "Feature",
    geometry: { type: "MultiLineString", coordinates },
    properties: {},
  };
}

describe("line elevation data detection", () => {
  let viewer;

  beforeEach(() => {
    viewer = window.Waymark_Map_Factory.viewer();
  });

  it("detects genuine elevations on a LineString", () => {
    const feature = lineString([
      [-128.152, 50.69, 120],
      [-128.145, 50.695, 80],
      [-128.138, 50.7, 45],
    ]);

    expect(viewer.line_has_elevation_data(feature)).toBe(true);
  });

  // Issue #87: an exporter with no elevation data writes 0 for every point,
  // so an all-zero track must not show the elevation chart.
  it("treats an all-zero LineString as having no elevation data", () => {
    const feature = lineString([
      [-128.152, 50.69, 0],
      [-128.145, 50.695, 0],
      [-128.138, 50.7, 0],
    ]);

    expect(viewer.line_has_elevation_data(feature)).toBe(false);
  });

  it("treats 2D-only LineString coordinates as having no elevation data", () => {
    const feature = lineString([
      [-128.152, 50.69],
      [-128.145, 50.695],
      [-128.138, 50.7],
    ]);

    expect(viewer.line_has_elevation_data(feature)).toBe(false);
  });

  it("treats a MultiLineString of all-zero segments as having no elevation data", () => {
    const feature = multiLineString([
      [
        [-128.152, 50.69, 0],
        [-128.145, 50.695, 0],
      ],
      [
        [-128.138, 50.7, 0],
        [-128.131, 50.705, 0],
      ],
    ]);

    expect(viewer.line_has_elevation_data(feature)).toBe(false);
  });

  it("detects a non-zero elevation in any MultiLineString segment", () => {
    const feature = multiLineString([
      [
        [-128.152, 50.69, 0],
        [-128.145, 50.695, 0],
      ],
      [
        [-128.138, 50.7, 95],
        [-128.131, 50.705, 0],
      ],
    ]);

    expect(viewer.line_has_elevation_data(feature)).toBe(true);
  });

  it("detects a negative elevation below sea level", () => {
    const feature = lineString([
      [35.5, 31.5, -430],
      [35.51, 31.51, -425],
    ]);

    expect(viewer.line_has_elevation_data(feature)).toBe(true);
  });

  it("ignores null, NaN and empty-string third ordinates", () => {
    const withNull = lineString([
      [-128.152, 50.69, null],
      [-128.145, 50.695, null],
    ]);
    const withNaN = lineString([
      [-128.152, 50.69, NaN],
      [-128.145, 50.695, NaN],
    ]);
    const withEmptyString = lineString([
      [-128.152, 50.69, ""],
      [-128.145, 50.695, ""],
    ]);

    expect(viewer.line_has_elevation_data(withNull)).toBe(false);
    expect(viewer.line_has_elevation_data(withNaN)).toBe(false);
    expect(viewer.line_has_elevation_data(withEmptyString)).toBe(false);
  });

  it("ignores mixed 2D and 3D all-zero points", () => {
    const feature = lineString([
      [-128.152, 50.69],
      [-128.145, 50.695, 0],
      [-128.138, 50.7],
    ]);

    expect(viewer.line_has_elevation_data(feature)).toBe(false);
  });

  it("parses string elevations and rejects the string zero", () => {
    const withElevation = lineString([
      [-128.152, 50.69, "120"],
      [-128.145, 50.695, "0"],
    ]);
    const withZero = lineString([
      [-128.152, 50.69, "0"],
      [-128.145, 50.695, "0"],
    ]);

    expect(viewer.line_has_elevation_data(withElevation)).toBe(true);
    expect(viewer.line_has_elevation_data(withZero)).toBe(false);
  });

  it("detects a constant non-zero elevation", () => {
    const feature = lineString([
      [-128.152, 50.69, 100],
      [-128.145, 50.695, 100],
      [-128.138, 50.7, 100],
    ]);

    expect(viewer.line_has_elevation_data(feature)).toBe(true);
  });
});
