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
		wp_localize_script('waymark_admin_js', 'waymark_php_lang', [
			'repeatable_delete_title' => esc_attr__('Remove!', 'waymark'),
			'marker_icon_icon_label' => esc_attr__('Name', 'waymark'),
			'marker_icon_text_label' => esc_attr__('Text', 'waymark'),
			'marker_icon_html_label' => esc_attr__('HTML', 'waymark'),
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
		self::add_call('waymark_user_config.map_options.map_height = 600;');

		if ($default_latlng = Waymark_Config::get_setting('misc', 'map_options', 'map_default_latlng')) {
			// We have a valid LatLng
			if ($default_latlng_array = Waymark_Helper::latlng_string_to_array($default_latlng)) {
				self::add_call('waymark_user_config.map_options.map_init_latlng = [' . $default_latlng_array[0] . ', ' . $default_latlng_array[1] . ']');

			}
		}
		if ($default_zoom = Waymark_Config::get_setting('misc', 'map_options', 'map_default_zoom')) {
			self::add_call('waymark_user_config.map_options.map_init_zoom = ' . $default_zoom);
		}

		//Set basemap
		if ($editor_basemap = Waymark_Config::get_setting('misc', 'editor_options', 'editor_basemap')) {
			self::add_call('waymark_user_config.map_options.map_init_basemap = ' . wp_json_encode($editor_basemap));
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