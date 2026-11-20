import { describe, it, expect, beforeEach } from "vitest";

// Regression coverage for issue #87.
//
// Exporters write 0 as the third ordinate when they have no elevation source,
// so a track whose third ordinates are all 0 is treated as a flat track that
// still has elevation data: the profile is shown, positioned with a centred
// transform origin, and reported as flat. Elevation data is reliable when at
// least one point has a finite elevation and either some point has relief
// (non-zero) or every point carried a finite value (a fully 3D all-zero
// track). A Line with missing or unparseable values has no reliable profile
// unless a genuine non-zero elevation appears anywhere on it.

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

  function expectLine(feature, expected) {
    expect({
      has_data: viewer.line_has_elevation_data(feature),
      flat: viewer.line_is_flat(feature),
    }).toEqual(expected);
  }

  it("detects genuine elevations on a LineString", () => {
    const feature = lineString([
      [-128.152, 50.69, 120],
      [-128.145, 50.695, 80],
      [-128.138, 50.7, 45],
    ]);

    expectLine(feature, { has_data: true, flat: false });
  });

  // Issue #87: an exporter with no elevation source writes 0 for every point.
  // The track is flat rather than elevation-less, so its profile is shown.
  it("treats an all-zero LineString as flat elevation data", () => {
    const feature = lineString([
      [-128.152, 50.69, 0],
      [-128.145, 50.695, 0],
      [-128.138, 50.7, 0],
    ]);

    expectLine(feature, { has_data: true, flat: true });
    expect(viewer.line_elevation_state(feature)).toEqual({
      has_elevation: true,
      has_relief: false,
      complete: true,
    });
  });

  it("treats an all-zero MultiLineString as flat elevation data", () => {
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

    expectLine(feature, { has_data: true, flat: true });
  });

  it("detects relief when zeroes are mixed with a non-zero elevation", () => {
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

    expectLine(feature, { has_data: true, flat: false });
  });

  it("detects a negative elevation below sea level", () => {
    const feature = lineString([
      [35.5, 31.5, -430],
      [35.51, 31.51, -425],
    ]);

    expectLine(feature, { has_data: true, flat: false });
  });

  it("detects a constant non-zero elevation", () => {
    const feature = lineString([
      [-128.152, 50.69, 100],
      [-128.145, 50.695, 100],
      [-128.138, 50.7, 100],
    ]);

    expectLine(feature, { has_data: true, flat: false });
  });

  it("treats string zeroes as flat elevation data", () => {
    const feature = lineString([
      [-128.152, 50.69, "0"],
      [-128.145, 50.695, "0"],
    ]);

    expectLine(feature, { has_data: true, flat: true });
  });

  it("parses string elevations as relief", () => {
    const feature = lineString([
      [-128.152, 50.69, "120"],
      [-128.145, 50.695, "0"],
    ]);

    expectLine(feature, { has_data: true, flat: false });
  });

  it("treats 2D-only LineString coordinates as having no elevation data", () => {
    const feature = lineString([
      [-128.152, 50.69],
      [-128.145, 50.695],
      [-128.138, 50.7],
    ]);

    expectLine(feature, { has_data: false, flat: false });
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

    expectLine(withNull, { has_data: false, flat: false });
    expectLine(withNaN, { has_data: false, flat: false });
    expectLine(withEmptyString, { has_data: false, flat: false });
  });

  it("treats mixed 2D and 3D all-zero points as incomplete elevation data", () => {
    const feature = lineString([
      [-128.152, 50.69],
      [-128.145, 50.695, 0],
      [-128.138, 50.7],
    ]);

    expectLine(feature, { has_data: false, flat: false });
    expect(viewer.line_elevation_state(feature)).toEqual({
      has_elevation: true,
      has_relief: false,
      complete: false,
    });
  });

  it("keeps mixed 2D and 3D data when a genuine elevation is present", () => {
    const feature = lineString([
      [-128.152, 50.69],
      [-128.145, 50.695, 95],
      [-128.138, 50.7],
    ]);

    expectLine(feature, { has_data: true, flat: false });
  });
});
