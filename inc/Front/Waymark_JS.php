<?php

class Waymark_JS {

	static private $chunks = [];
	static private $calls  = [];

	static function init() {
		add_action('wp_footer', ['Waymark_JS', 'wp_footer']);
		add_action('wp_enqueue_scripts', ['Waymark_JS', 'enqueue_scripts']);
	}

	static function enqueue_scripts() {
		wp_register_style('waymark-js', Waymark_Helper::plugin_url('waymark-js/dist/css/waymark-js.min.css'), [], Waymark_Config::get_version());
		wp_enqueue_style('waymark-js');
		wp_register_script('waymark-js', Waymark_Helper::plugin_url('waymark-js/dist/js/waymark-js.min.js'), ['jquery'], Waymark_Config::get_version(), true);
		wp_localize_script('waymark-js', 'waymark_js', [
			//AJAX
			'ajaxurl' => admin_url('admin-ajax.php'),
		]);
		wp_enqueue_script('waymark-js');

		wp_register_script('waymark_front_js', Waymark_Helper::asset_url('js/front.min.js'), ['jquery'], Waymark_Config::get_version(), true);
		wp_enqueue_script('waymark_front_js');

		//Config
		self::add_chunk("\n" . 'var waymark_user_config = ' . Waymark_Config::get_map_config(true));

		//AJAX
		if ('fetch' === Waymark_Config::get_setting('misc', 'collection_options', 'load_method')) {
			self::add_chunk('
function waymark_load_map_data(map_instance, map_id, reset_map = true) {
	//Build request
	var data = {
		"waymark_action": "get_map_data",
		"waymark_security": "' . wp_create_nonce(Waymark_Config::get_item('nonce_string')) . '",
		"map_id": map_id
	};

	//Do request
	jQuery.post(waymark_http_endpoint, data, function(map_data) {
		map_instance.load_json(map_data, reset_map);
	});
}');
		}
	}

	static function add_chunk($chunk) {
//		Waymark_Helper::debug(strpos($chunk, '//'));

		if ((! in_array($chunk[strlen($chunk) - 1], [';', "\n"]) && (strpos($chunk, '//') === false))) {
			$chunk .= ';';
		}
		self::$chunks[] = $chunk;
	}

	static function add_call($call) {
		if (! in_array($call, self::$calls)) {
			self::$calls[] = $call;
		}
	}

	static function wp_footer() {
		echo "\n" . '<!-- START ' . esc_html(Waymark_Config::get_name(true, true)) . ' Footer JS -->' . "\n";
		echo '<script type="text/javascript">' . "\n";
		//Lines
		foreach (self::$chunks as $chunk) {
			echo wp_kses($chunk, []) . "\n";
		}

		//Calls
		if (sizeof(self::$calls)) {
			echo "\n//Call";
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

		//Get Map config
		$map_config = Waymark_Config::get_map_config();

		//Each Overlay Type
		foreach (['marker', 'line', 'shape'] as $overlay_name) {
			$submission_types = [];
			//Only include Types set for Submissions
			foreach ($map_config['map_options'][$overlay_name . '_types'] as $type) {
				if ($type[$overlay_name . '_submission']) {
					$submission_types[] = $type;
				}
			}

			//If none (i.e. no Types set to Submission in Settings)
			if (! sizeof($submission_types)) {
				//Create blank
				$blank = [];
				foreach (array_keys($type) as $key) {
					switch ($key) {
					case 'fill_opacity':
						$value = '0.5';

						break;
					case 'line_colour':
					case 'marker_colour':
						$value = '#000';

						break;
					default:
						$value = '';

						break;
					}
					$blank[$key] = $value;
				}
				$submission_types[] = $blank;
			}

			//Update Config
			$map_config['map_options'][$overlay_name . '_types'] = $submission_types;
		}

		self::add_call('var waymark_user_config = ' . wp_json_encode($map_config) . ';');

		//Set basemap
		if ($editor_basemap = Waymark_Config::get_setting('misc', 'editor_options', 'editor_basemap')) {
			self::add_call('waymark_user_config.map_options.map_init_basemap = ' . wp_json_encode($editor_basemap));
		}

		//Default view
		if ($default_latlng = Waymark_Config::get_setting('misc', 'map_options', 'map_default_latlng')) {
			// We have a valid LatLng
			if ($default_latlng_array = Waymark_Helper::latlng_string_to_array($default_latlng)) {
				self::add_call('waymark_user_config.map_options.map_init_latlng = ' . wp_json_encode([(float) $default_latlng_array[0], (float) $default_latlng_array[1]]));
			}
		}
		if ($default_zoom = Waymark_Config::get_setting('misc', 'map_options', 'map_default_zoom')) {
			self::add_call('waymark_user_config.map_options.map_init_zoom = ' . wp_json_encode((int) $default_zoom));
		}

		// Set up data container by adding ID
		self::add_call('
			jQuery(".waymark-input.waymark-input-map_data").attr("id", "waymark-data");
		');

		//Go!
		self::add_call('waymark_editor.init(waymark_user_config)');

		// Handle Front-End Upload Integration
		self::add_call('if(typeof waymark_setup_map_editor === "function") waymark_setup_map_editor(waymark_editor)');

		// Done loading
		self::add_call('waymark_editor.load_done()');
	}
}

Waymark_JS::init();