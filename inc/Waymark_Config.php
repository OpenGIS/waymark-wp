<?php
class Waymark_Config {
	//Set defaults
	private static $data    = [];
	private static $default = [];

	public static function init() {
		$multi_value_seperator = '__multi__';

		self::$data = [
			'plugin_name' => 'Waymark',
			'plugin_name_short' => 'Waymark',
			'custom_types' => [],
			'plugin_version' => get_file_data(dirname(__DIR__) . '/Waymark.php', ['Version' => 'Version'])['Version'],
			'nonce_string' => 'Waymark_Nonce',
			'site_url' => 'https://www.ogis.org/waymark-wp/',
			'directory_url' => 'https://wordpress.org/support/plugin/waymark/',
			'multi_value_seperator' => $multi_value_seperator,
			'overlay_properties' => ['radius', 'type', 'title', 'description', 'image_thumbnail_url', 'image_medium_url', 'image_large_url', 'direction'],
			'shortcode' => 'Waymark',
			'media_library_sizes' => ['thumbnail', 'medium', 'large', 'full'],
			'mimes' => [
// 				'image' => array(
//
				'file' => [
					'gpx' => [
						'application/gpx+xml',
						'application/xml',
						'text/xml',
						'text/plain',
					],
					'kml' => [
						'application/vnd.google-earth.kml+xml',
						'application/xml',
						'text/html',
						'text/xml',
						'text/plain',
					],
//					'kmz' => 'application/vnd.google-earth.kmz',
					'json' => [
						'application/geo+json',
						'application/json',
						'text/plain',
					],
					'geojson' => [
						'application/geo+json',
						'application/json',
						'text/plain',
					],
				],
			],
			'meta' => [
				'inputs' => [
					'meta_title' => esc_html__('Description', 'waymark'),
					'meta_default' => '',
					'meta_tip' => esc_html__('The Description you enter here will be displayed on the Map Details page.', 'waymark'),
					'meta_type' => 'textarea_rich',
					'meta_group' => '',
					'meta_options' => '',
					'meta_shortcode' => '0',
					'meta_submission' => '0',
				],
			],
			'submission' => [
				'global' => [
					'submission_enable' => '0',
				],
				'from_users' => [
					'submission_roles' => '',
					'submission_features' => 'draw' . $multi_value_seperator . 'photo' . $multi_value_seperator . 'file' . $multi_value_seperator . 'title' . $multi_value_seperator . 'meta',
					'submission_status' => 'publish',
					'submission_alert' => '0',
				],
				'from_public' => [
					'submission_public' => '0',
					'submission_features' => 'draw' . $multi_value_seperator . 'photo' . $multi_value_seperator . 'file' . $multi_value_seperator . 'title',
					'submission_upload_dir' => 'waymark_submission',
					'submission_status' => 'draft',
					'submission_alert' => '1',
				],
			],
			'misc' => [
				'map_options' => [
					'map_default_latlng' => '51.38436,-68.74923',
					'map_default_zoom' => '9',
					'map_height' => '450',
					'show_gallery' => '1',
					'show_filter' => '1',
					'allow_export' => '0',
					'show_scale' => '0',
				],
				'collection_options' => [
					'load_method' => 'fetch',
				],
				'interaction_options' => [
					'delay_seconds' => '2',
					'do_message' => '0',
					'wake_message' => esc_attr__('Click or Hover to Wake', 'waymark'),
				],
				'cluster_options' => [
					'show_cluster' => '0',
					'cluster_threshold' => '14',
					'cluster_radius' => '80',
				],
				'shortcode_options' => [
					'shortcode_header' => '1',
					'header_override' => '0',
				],
				'editor_options' => [
					'confirm_delete' => '1',
					'editor_basemap' => 'Open Street Map',
				],
				'elevation_options' => [
					'show_elevation' => '2',
					'elevation_units' => 'metric',
					'elevation_colour' => '#b42714',
					'elevation_initial' => '1',
				],
				'permalinks' => [
					'permalink_slug_map' => 'map',
					'permalink_slug_collection' => 'collection',
				],
				'post' => [
					'supports' => ['title', 'author', 'revisions', 'thumbnail'],
				],
				'advanced' => [
					'debug_mode' => '0',
				],
			],
			'tiles' => [
				'layers' => [
					'layer_name' => 'Open Street Map',
					'layer_url' => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					'layer_attribution' => '© &lt;a href=&quot;https://www.openstreetmap.org/copyright&quot;&gt;OpenStreetMap&lt;/a&gt; contributors',
					'layer_max_zoom' => '18',
				],
			],
			'markers' => [
				'marker_types' => [
					'marker_title' => esc_html__('Photo', 'waymark') . $multi_value_seperator . esc_html__('Information', 'waymark') . $multi_value_seperator . esc_html__('Alert', 'waymark') . $multi_value_seperator . esc_html__('Trail Access', 'waymark') . $multi_value_seperator . esc_html__('Food', 'waymark') . $multi_value_seperator . esc_html__('Water', 'waymark') . $multi_value_seperator . esc_html__('Shelter', 'waymark') . $multi_value_seperator . esc_html__('Beer', 'waymark') . $multi_value_seperator . esc_html__('Start', 'waymark') . $multi_value_seperator . esc_html__('Finish', 'waymark'),
					'marker_shape' => 'marker' . $multi_value_seperator . 'marker' . $multi_value_seperator . 'marker' . $multi_value_seperator . 'marker' . $multi_value_seperator . 'marker' . $multi_value_seperator . 'marker' . $multi_value_seperator . 'marker' . $multi_value_seperator . 'marker' . $multi_value_seperator . 'marker' . $multi_value_seperator . 'marker',
					'marker_size' => 'large' . $multi_value_seperator . 'large' . $multi_value_seperator . 'large' . $multi_value_seperator . 'large' . $multi_value_seperator . 'large' . $multi_value_seperator . 'large' . $multi_value_seperator . 'large' . $multi_value_seperator . 'large' . $multi_value_seperator . 'large' . $multi_value_seperator . 'large',
					'icon_type' => 'icon' . $multi_value_seperator . 'icon' . $multi_value_seperator . 'icon' . $multi_value_seperator . 'icon' . $multi_value_seperator . 'icon' . $multi_value_seperator . 'icon' . $multi_value_seperator . 'icon' . $multi_value_seperator . 'icon' . $multi_value_seperator . 'icon' . $multi_value_seperator . 'icon',
					'marker_icon' => 'ion-camera' . $multi_value_seperator . 'ion-information-circled' . $multi_value_seperator . 'ion-android-alert' . $multi_value_seperator . 'ion-android-bicycle' . $multi_value_seperator . 'ion-pizza' . $multi_value_seperator . 'ion-waterdrop' . $multi_value_seperator . 'ion-home' . $multi_value_seperator . 'ion-beer' . $multi_value_seperator . 'ion-power' . $multi_value_seperator . 'ion-power',
					'marker_colour' => 'white' . $multi_value_seperator . 'white' . $multi_value_seperator . 'red' . $multi_value_seperator . 'green' . $multi_value_seperator . 'red' . $multi_value_seperator . 'blue' . $multi_value_seperator . 'darkgreen' . $multi_value_seperator . 'white' . $multi_value_seperator . 'green' . $multi_value_seperator . 'darkred',
					'icon_colour' => '#475260' . $multi_value_seperator . '#0069a5' . $multi_value_seperator . 'white' . $multi_value_seperator . 'white' . $multi_value_seperator . '#ffba00' . $multi_value_seperator . '#fff' . $multi_value_seperator . 'white' . $multi_value_seperator . '#754423' . $multi_value_seperator . 'white' . $multi_value_seperator . 'white',
					'marker_display' => '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1',
					'marker_submission' => '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1',
				],
			],
			'lines' => [
				'line_types' => [
					'line_title' => esc_html__('Red', 'waymark') . $multi_value_seperator . esc_html__('Green', 'waymark') . $multi_value_seperator . esc_html__('Blue', 'waymark'),
					'line_colour' => '#d84848' . $multi_value_seperator . '#3cbc47' . $multi_value_seperator . '#487bd9',
					'line_weight' => '3' . $multi_value_seperator . '3' . $multi_value_seperator . '3',
					'line_opacity' => '0.7' . $multi_value_seperator . '0.7' . $multi_value_seperator . '0.7',
					'line_display' => '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1',
					'line_submission' => '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1',
				],
			],
			'shapes' => [
				'shape_types' => [
					'shape_title' => esc_html__('Red', 'waymark') . $multi_value_seperator . esc_html__('Green', 'waymark') . $multi_value_seperator . esc_html__('Blue', 'waymark'),
					'shape_colour' => '#d84848' . $multi_value_seperator . '#3cbc47' . $multi_value_seperator . '#487bd9',
					'fill_opacity' => '0.5' . $multi_value_seperator . '0.5' . $multi_value_seperator . '0.5',
					'shape_display' => '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1',
					'shape_submission' => '1' . $multi_value_seperator . '1' . $multi_value_seperator . '1',
				],
			],
			'properties' => [
				'options' => [
					'description_append' => '0',
				],
			],
		];

		//Keep a copy of the original values
		self::$default = self::$data;

		//Read config options from DB
		$settings_data = get_option('Waymark_Settings');

		//Add settings to config data
		if (is_array($settings_data)) {
			foreach ($settings_data as $tab_key => $tab_data) {
				foreach ($tab_data as $section_key => $section_data) {
					foreach ($section_data as $parameter_key => $parameter_value) {
						self::$data[$tab_key][$section_key][$parameter_key] = $parameter_value;
					}
				}
			}

			// ====== Fix multi-settings ======

			//If a Type gets a new setting, then we use the first value
			//from the default as the value for all existing Types.

			//For each Overlay
			foreach (['marker', 'line', 'shape'] as $overlay_name) {

				//Existing Types set
				if (is_array(self::$data[$overlay_name . 's'][$overlay_name . '_types'][$overlay_name . '_title'])) {
					$line_count = sizeof(self::$data[$overlay_name . 's'][$overlay_name . '_types'][$overlay_name . '_title']);

					foreach (self::$data[$overlay_name . 's'][$overlay_name . '_types'] as &$value) {
						if (! is_array($value) || sizeof($value) != $line_count) {
							//Is string and contains multi-value seperator?
							if (is_string($value) && strpos($value, $multi_value_seperator) !== false) {
								$value = explode($multi_value_seperator, $value);
							}

							$default = $value[0];

							$value = [];
							for ($i = 0; $i < $line_count; $i++) {
								$value[$i] = $default;
							}
						}
					}
				}

			}
		}

		// ====== Normalise multi-value settings ======

		//Some array-typed settings are stored (or default) as multi-value
		//separator strings, but are consumed as arrays. Normalise them at
		//load so consumers can always rely on the type; arrays are left as-is.
		$multi_value_settings = [
			['misc', 'post', 'supports'],
			['submission', 'from_users', 'submission_roles'],
			['submission', 'from_users', 'submission_features'],
			['submission', 'from_public', 'submission_features'],
		];

		foreach ($multi_value_settings as $setting_path) {
			$value = self::$data[$setting_path[0]][$setting_path[1]][$setting_path[2]];

			if (is_string($value)) {
				self::$data[$setting_path[0]][$setting_path[1]][$setting_path[2]] = ($value === '') ? [] : explode($multi_value_seperator, $value);
			}
		}
	}

	public static function set_item($key = null, $value = null) {
		if (array_key_exists($key, self::$data)) {
			self::$data[$key] = $value;
		}
	}

	public static function get_item($key, $key_2 = null, $is_repeatable = false) {
		//Waymark_Helper::debug(self::$data);

		if (array_key_exists($key, self::$data)) {
			if (is_array(self::$data[$key]) && array_key_exists($key_2, self::$data[$key])) {
				//Single value
				if (! $is_repeatable) {
					return self::$data[$key][$key_2];
					//Multi-value
				} else {
					//Convert
					$values = self::normalise_repeatable_rows(self::$data[$key][$key_2]);

					$values = Waymark_Helper::convert_values_to_single_value($values);
					$values = Waymark_Helper::convert_single_value_to_array($values);

					return $values;
				}
			} else {
				if (! $is_repeatable) {
					return self::$data[$key];
				} else {
					return [];
				}
			}
		} else {
			return null;
		}
	}

	/**
	 * Normalise a repeatable setting so every column holds one value per row.
	 *
	 * Columns can drift out of step — a truncated settings POST, an import, or
	 * an option written before columns were validated — leaving one column
	 * shorter than the others, or holding nested arrays. Flatten anything
	 * nested, treat a single value as a one-row column, then pad short columns
	 * by repeating their own last value, so the transposition in
	 * convert_single_value_to_array() always builds complete rows.
	 *
	 * @param  mixed $values Repeatable setting columns.
	 * @return array         Rectangular columns.
	 */
	private static function normalise_repeatable_rows($values) {
		if (! is_array($values)) {
			return [];
		}

		$columns   = [];
		$row_count = 0;

		foreach ($values as $column_key => $column) {
			//A single value is a one-row column
			if (! is_array($column)) {
				$column = [$column];
			}

			//Flatten nested values so one row is always one value
			$flat = [];
			array_walk_recursive($column, function ($value) use (&$flat) {
				$flat[] = $value;
			});

			$columns[$column_key] = $flat;
			$row_count            = max($row_count, sizeof($flat));
		}

		if (! $row_count) {
			return $columns;
		}

		foreach ($columns as $column_key => $column) {
			//An empty column needs a value for every row
			if (! sizeof($column)) {
				$columns[$column_key] = array_fill(0, $row_count, '');
				continue;
			}

			//Repeat the column's own last value into any missing rows
			if (sizeof($column) < $row_count) {
				$columns[$column_key] = array_pad($column, $row_count, $column[sizeof($column) - 1]);
			}
		}

		return $columns;
	}

	public static function get_data() {
		return self::$data;
	}

	public static function get_default($tab, $group, $key, $single = true) {
		if (array_key_exists($tab, self::$default) && array_key_exists($group, self::$default[$tab]) && array_key_exists($key, self::$default[$tab][$group])) {

			$value = self::$default[$tab][$group][$key];

			if ($single && is_array($value)) {
				$value = $value[0];
			}

			return $value;
		} else {
			return false;
		}
	}

	public static function get_setting($tab, $group, $key) {
		if (array_key_exists($tab, self::$data) && array_key_exists($group, self::$data[$tab]) && array_key_exists($key, self::$data[$tab][$group])) {
			return self::$data[$tab][$group][$key];
		} else {
			return false;
		}
	}

	//Helpers
	public static function get_name($short = false, $really_short = false) {
		if (! $short) {
			return self::get_item('plugin_name');
		} else {
			if (! $really_short) {
				return self::get_item('plugin_name_short');
			} else {
				return wp_strip_all_tags(self::get_item('plugin_name_short'));
			}
		}
	}

	public static function get_version() {
		return self::get_item('plugin_version');
	}

	public static function get_settings_parameters($tab_id = null, $group_id = null) {
		$settings = [];

		//If only getting a specific section
		if (array_key_exists($tab_id, self::$parameters) && array_key_exists($group_id, self::$parameters[$tab_id])) {
			$group_data = self::$parameters[$tab_id][$group_id];
			//Iterate over each parameter
			foreach ($group_data as $parameter_data) {
				if (array_key_exists('setting', $parameter_data) && $parameter_data['setting']) {
					$settings[] = $parameter_data;
				}
			}
		}

		return $settings;
	}

	public static function get_map_config($encode = false) {
		$map_config = [];

		//Basemaps
		$tile_layers = Waymark_Config::get_item('tiles', 'layers');
		$tile_layers = Waymark_Helper::convert_values_to_single_value($tile_layers);

		$tile_layers = Waymark_Helper::convert_single_value_to_array($tile_layers);

		//Decode and sanitise the Basemap attribution; Leaflet renders it as HTML
		foreach ($tile_layers as &$tile_layer) {
			if (isset($tile_layer['layer_attribution'])) {
				$tile_layer['layer_attribution'] = wp_kses(htmlspecialchars_decode($tile_layer['layer_attribution']), Waymark_Helper::allowable_tags('attribution'));
			}
		}
		unset($tile_layer);

		//Map Options
		$map_config['map_options'] = [
			'map_height' => Waymark_Config::get_setting('misc', 'map_options', 'map_height'),

			// Basemaps
			'tile_layers' => $tile_layers,

			'marker_types' => Waymark_Helper::get_overlay_types('marker'),
			'line_types' => Waymark_Helper::get_overlay_types('line'),
			'shape_types' => Waymark_Helper::get_overlay_types('shape'),

			'show_scale' => Waymark_Config::get_setting('misc', 'map_options', 'show_scale'),

			// Admin only
			'debug_mode' => current_user_can('administrator') && Waymark_Config::get_setting('misc', 'advanced', 'debug_mode'),
		];

		//Viewer Options
		$map_config['viewer_options'] = [
			// Features
			'show_gallery' => Waymark_Config::get_setting('misc', 'map_options', 'show_gallery'),
			'show_filter' => Waymark_Config::get_setting('misc', 'map_options', 'show_filter'),
			'show_cluster' => Waymark_Config::get_setting('misc', 'cluster_options', 'show_cluster'),
			'show_elevation' => Waymark_Config::get_setting('misc', 'elevation_options', 'show_elevation') == '1',

			// Cluster options
			'cluster_radius' => Waymark_Config::get_setting('misc', 'cluster_options', 'cluster_radius'),
			'cluster_threshold' => Waymark_Config::get_setting('misc', 'cluster_options', 'cluster_threshold'),

			// Elevation options
			'elevation_units' => Waymark_Config::get_setting('misc', 'elevation_options', 'elevation_units'),
			'elevation_initial' => Waymark_Config::get_setting('misc', 'elevation_options', 'elevation_initial'),
			'elevation_colour' => Waymark_Config::get_setting('misc', 'elevation_options', 'elevation_colour'),

			// Sleep options
			'sleep_delay_seconds' => Waymark_Config::get_setting('misc', 'interaction_options', 'delay_seconds'),
			'sleep_do_message' => Waymark_Config::get_setting('misc', 'interaction_options', 'do_message'),
			'sleep_wake_message' => Waymark_Config::get_setting('misc', 'interaction_options', 'wake_message'),
		];

		//Editor Options
		$map_config['editor_options'] = [
			'confirm_delete' => Waymark_Config::get_setting('misc', 'editor_options', 'confirm_delete'),
		];

		// Localisation

		$map_config['language'] = Waymark_Lang::get_js_lang();

		// Waymark_Helper::debug($map_config);

		if ($encode) {
			//JSON_HEX_TAG keeps any HTML (e.g. the Basemap attribution) opaque to the
			//wp_kses() pass that is applied when the config is output
			return wp_json_encode($map_config, JSON_HEX_TAG);
		} else {
			return $map_config;
		}
	}

	public static function is_custom_type($type = null) {
		//Get from post
		if ($type == null) {
			global $post;

			//If it exists
			if (isset($post->post_type)) {
				$type = $post->post_type;
			}
		}

		return in_array($type, self::$data['custom_types']) || in_array('waymark_' . $type, self::$data['custom_types']);
	}

}
