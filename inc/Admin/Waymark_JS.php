<?php

class Waymark_JS {

	static private $chunks = [];
	static private $calls  = [];

	static function init() {
		self::add_chunk('//' . Waymark_Config::get_name(true, true) . ' v' . Waymark_Config::get_version());

		add_action('admin_footer', ['Waymark_JS', 'admin_footer']);
		add_action('admin_enqueue_scripts', ['Waymark_JS', 'enqueue_scripts']);
	}

	static function enqueue_scripts() {
		wp_register_script('waymark_admin_js', Waymark_Helper::asset_url('js/admin.min.js'), ['jquery', 'jquery-ui-sortable', 'jquery-effects-core', 'wp-color-picker'], Waymark_Config::get_version());

		//Needed by the repeatable splitter, which now runs while the settings
		//markup is parsed rather than waiting for DOM-ready.
		wp_add_inline_script('waymark_admin_js', 'var waymark_multi_value_seperator = ' . wp_json_encode(Waymark_Config::get_item('multi_value_seperator'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . ';', 'before');

		wp_localize_script('waymark_admin_js', 'waymark_php_lang', [
			/* translators: Tooltip for the delete control on a repeatable settings row. */
			'repeatable_delete_title' => __('Remove!', 'waymark'),
			'marker_icon_icon_label' => __('Icon Name', 'waymark'),
			'marker_icon_text_label' => __('Icon Text', 'waymark'),
			'marker_icon_html_label' => __('Icon HTML', 'waymark'),
			/* translators: Tooltip for the Marker icon name field when the icon type is Font Icon. */
			'marker_icon_icon_tip' => __('The desired icon name from Ionicons or Font Awesome, e.g. "ion-camera", or "fa-camera". Click the links to see the full list of icons available.', 'waymark'),
			/* translators: Tooltip for the Marker icon name field when the icon type is Text or Emoji. */
			'marker_icon_text_tip' => __('Text to display inside the Marker, in the chosen colour. Space is very limited! Pro Tip: adjust text size using CSS; for all Markers: .waymark-icon-text{font-size: 18px}, or by Type: .waymark-marker-photo .waymark-icon-text{...}. Use your browser\'s inspector to dig for Type class names.', 'waymark'),
			/* translators: Tooltip for the Marker icon name field when the icon type is HTML. */
			'marker_icon_html_tip' => __('The HTML entered will be added inside each Marker. Pro Tip! HTML Entities supported (e.g. &amp;cross; as well as Unicode and Emojis!), or provide HTML to integrate with other Icon providers.', 'waymark'),
			'new_type' => __('New Type', 'waymark'),
			'add_type' => __('Add Type', 'waymark'),
			'select_colour' => __('Select Colour', 'waymark'),
		]);
		wp_enqueue_script('waymark_admin_js');
	}

	static function add_chunk($chunk) {
		if ($chunk[strlen($chunk) - 1] != ';') {
			$chunk .= ';';
		}
		self::$chunks[] = $chunk;
	}

	static function add_call($call) {
		if (! in_array($call, self::$calls)) {
			self::$calls[] = $call;
		}
	}

	static function admin_footer() {
		echo "\n" . '<!-- START ' . esc_html(Waymark_Config::get_name(true, true)) . ' Footer JS -->' . "\n";
		echo '<script type="text/javascript">' . "\n";
		//Lines
		foreach (self::$chunks as $chunk) {
			echo wp_kses($chunk, []) . "\n";
		}

		//Calls
		if (sizeof(self::$calls)) {
			echo "\n" . 'jQuery(document).ready(function() {' . "\n";
			foreach (self::$calls as $call) {
				echo "	" . wp_kses($call, []) . ";\n";
			}
			echo '});' . "\n";
		}
		echo '</script>' . "\n";
		echo '<!-- END ' . esc_html(Waymark_Config::get_name(true, true)) . ' Footer JS -->' . "\n\n";
	}

	static function add_editor($map_data = []) {

		// Ensure we have a valid map_data array
		if (! is_array($map_data)) {
			$map_data = [];
		}

		//Create new Map object
		self::add_call('const waymark_editor = window.Waymark_Map_Factory.editor()');

		//Map Div
		echo '<div id="waymark-map" class="waymark-map"></div>' . "\n";

		//Output Config
		self::add_call('var waymark_user_config = ' . Waymark_Config::get_map_config(true) . ';');
		self::add_call('var waymark_editor_map = document.getElementById("waymark-map");');
		self::add_call('var waymark_editor_top = waymark_editor_map ? waymark_editor_map.getBoundingClientRect().top : 0;');
		self::add_call('var waymark_editor_available = window.innerHeight - waymark_editor_top - 24;');
		self::add_call('waymark_user_config.map_options.map_height = Math.max(400, Math.min(600, waymark_editor_available));');

		if ($default_latlng = Waymark_Config::get_setting('misc', 'map_options', 'map_default_latlng')) {
			// We have a valid LatLng
			if ($default_latlng_array = Waymark_Helper::latlng_string_to_array($default_latlng)) {
				self::add_call('waymark_user_config.map_options.map_init_latlng = ' . wp_json_encode([(float) $default_latlng_array[0], (float) $default_latlng_array[1]], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT));

			}
		}
		if ($default_zoom = Waymark_Config::get_setting('misc', 'map_options', 'map_default_zoom')) {
			self::add_call('waymark_user_config.map_options.map_init_zoom = ' . wp_json_encode((int) $default_zoom, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT));
		}

		//Set basemap
		if ($editor_basemap = Waymark_Config::get_setting('misc', 'editor_options', 'editor_basemap')) {
			self::add_call('waymark_user_config.map_options.map_init_basemap = ' . wp_json_encode($editor_basemap, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT));
		}

		// Set up data container by adding ID
		self::add_call('
			jQuery(".waymark-input.waymark-input-map_data").attr("id", "waymark-data");
		');

		// Initialise Editor
		self::add_call('waymark_editor.init(waymark_user_config)');

		// // Add GeoJSON
		// self::add_call('waymark_editor.load_json(' . json_encode($map_data) . ');');

		// Handle WordPress Editor integrations
		self::add_call('if(typeof waymark_setup_map_editor === "function") waymark_setup_map_editor(waymark_editor)');

		// Done loading
		self::add_call('waymark_editor.load_done()');
	}
}

Waymark_JS::init();