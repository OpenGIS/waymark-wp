import { beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import $ from 'jquery';

// Attach jQuery to window
window.$ = window.jQuery = $;

// Helper to load script content into global scope
function loadScript(filePath) {
  const content = fs.readFileSync(path.resolve(__dirname, '../', filePath), 'utf8');
  // We use eval to execute the script in the global scope
  // This mimics how the browser executes <script> tags
  window.eval(content);
}

// Load Leaflet (bundled)
// Note: Leaflet might try to access window/document immediately
loadScript('libs/js/leaflet.min.js');

// Restore L for plugins (since Waymark's Leaflet uses noConflict)
if (window.Waymark_L) {
  window.L = window.Waymark_L;
}

// Load Leaflet Plugins & Dependencies
loadScript('libs/js/L.Control.Locate.min.js');
loadScript('libs/js/Control.Geocoder.js');
loadScript('libs/js/leaflet.fullscreen.min.js');
loadScript('libs/js/leaflet.markercluster.js');
loadScript('libs/js/leaflet.polylineDecorator.js');
loadScript('libs/js/Leaflet.Editable.js');
loadScript('libs/js/Leaflet.FeatureGroup.SubGroup.js');
loadScript('libs/js/Leaflet.Sleep.js');
loadScript('libs/js/leaflet-elevation.js');
loadScript('libs/js/togeojson.min.js');
loadScript('libs/js/togpx.js');
loadScript('libs/js/tokml.js');

// Load Waymark Source Files in order
// We use import.meta.glob with ?raw to let Vite know about these dependencies
// This ensures tests re-run when these files change
const sourceFiles = import.meta.glob('../src/js/*.js', { eager: true, query: '?raw', import: 'default' });

// Order matters!
const loadOrder = [
  '../src/js/Waymark_Map.js',
  '../src/js/Waymark_Lightbox.js',
  '../src/js/Waymark_Map_Viewer.js',
  '../src/js/Waymark_Map_Editor.js',
  '../src/js/Waymark_Map_Factory.js'
];

loadOrder.forEach(file => {
  if (sourceFiles[file]) {
    window.eval(sourceFiles[file]);
  } else {
    console.error(`Failed to load ${file}`);
  }
});

// jsdom exposes HTMLDialogElement but does not implement showModal() or close().
// The lightbox relies on both and cleans up on the close event, so provide
// minimal stubs. A jsdom release that implements them takes precedence.
// jsdom never fires the cancel event, so Esc-to-close is covered by the browser suite.
if (typeof window.HTMLDialogElement !== 'undefined') {
  if (typeof window.HTMLDialogElement.prototype.showModal !== 'function') {
    window.HTMLDialogElement.prototype.showModal = function () {
      this.open = true;
    };
  }

  if (typeof window.HTMLDialogElement.prototype.close !== 'function') {
    window.HTMLDialogElement.prototype.close = function () {
      this.open = false;
      this.dispatchEvent(new window.Event('close'));
    };
  }
}

// Reset DOM before each test
beforeEach(() => {
  document.body.innerHTML = '';
});
