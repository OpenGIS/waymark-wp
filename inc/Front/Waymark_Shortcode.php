<?php

class Waymark_Shortcode {
	function __construct() {
		add_shortcode(Waymark_Config::get_item('shortcode'), [$this, 'handle_shortcode']);
	}

	function handle_shortcode($shortcode_data, $content = null) {
		$out = '';
		$map_class = 'waymark-map';
		$shortcode_hash = substr(md5(wp_json_encode($shortcode_data)), 0, 6);
		$maps_output = [];
		$shortcode_header = [];
		$shortcode_meta = [];

		//Just in case false is passed
		if (! $shortcode_data) {
			$shortcode_data = [];
		}

		// ============ Content? ================

		if (array_key_exists('content', $shortcode_data)) {
			switch ($shortcode_data['content']) {
			case 'submission':
				$Submission = new Waymark_Submission;

				$content = $Submission->render_front();

				break;
			}

			//Stop here
			return $content;
		}

		// ============ START HTML ================

		//Map Hash given?
		if (array_key_exists('map_hash', $shortcode_data)) {
			$shortcode_hash = $shortcode_data['map_hash'];
		}

		//Map ID
		if (array_key_exists('map_id', $shortcode_data)) {
			//Get Map
			$Map = new Waymark_Map($shortcode_data['map_id']);

			//Shortcode header
			$shortcode_header = [
				'title' => $Map->post_title,
				'link' => get_permalink($Map->post_id),
			];

			//Map Meta?
			$shortcode_meta = Waymark_Helper::get_map_meta($Map, 'shortcode');

			//Ensure we have data
			if ($Map && array_key_exists('map_data', $Map->data)) {
				//Output
				$maps_output[$Map->post_id] = [
					'map_id' => $Map->post_id,
					'map_title' => $Map->post_title,
					'map_data' => $Map->data['map_data'],
				];

				//Map Class
				$map_class .= ' waymark-map-id-' . $Map->post_id;
			}
			//Collection
		} else if (array_key_exists('collection_id', $shortcode_data)) {
			$collection_id = $shortcode_data['collection_id'];

			//Valid Collection
			$Collection = new Waymark_Collection($collection_id);
			if ($Collection->collection_id) {
				$shortcode_meta = Waymark_Helper::get_collection_meta($Collection, 'shortcode');

				//Map Class
				$map_class .= ' waymark-collection-id-' . esc_attr($collection_id);

				// Collection Maps as GeoJSON

				// If we are embedding
				if ('embed' === Waymark_Config::get_setting('misc', 'collection_options', 'load_method')) {
					$collectionMaps = [
						'type' => 'FeatureCollection',
						'features' => [],
					];

					//Iterate over Collection
					foreach ($Collection->Maps as $Map) {
						//Ensure we have data
						if (! array_key_exists('map_data', $Map->data)) {
							continue;
						}

						//Modify map data
						$Map->data['map_data'] = Waymark_Helper::add_map_link_to_description($Map->post_id, $Map->post_title, $Map->data['map_data']);

						//Add to GeoJSON
						$collectionMaps['features'] = array_merge($collectionMaps['features'], json_decode($Map->data['map_data'], true)['features']);
					}

					// Collection Maps
					if (sizeof($collectionMaps['features'])) {
						$maps_output[$collection_id] = [
							'map_data' => wp_json_encode($collectionMaps),
						];
					}

					// Loading Maps via HTTP
				} else {
					//Iterate over Collection
					foreach ($Collection->Maps as $Map) {
						//Ensure we have data
						if (! array_key_exists('map_data', $Map->data)) {
							continue;
						}

						//Modify map data
						$Map->data['map_data'] = Waymark_Helper::add_map_link_to_description($Map->post_id, $Map->post_title, $Map->data['map_data']);

						//Output
						$maps_output[$Map->post_id] = [
							'map_id' => $Map->post_id,
							'map_title' => $Map->post_title,
							'collection_id' => $collection_id,
							'map_data' => $Map->data['map_data'],
						];
					}
				}

				//Shortcode header
				$shortcode_header = [
					'title' => $Collection->title,
					'link' => get_term_link((int) $Collection->collection_id, 'waymark_collection'),
				];
			}
		}

		// ===== Shortcode options (1/2) =====

		//Height
		if (array_key_exists('map_height', $shortcode_data)) {
			$map_height = $shortcode_data['map_height'];

			//Numeric only
			if (! is_numeric($map_height)) {
				$map_height = false;
			}
		} else {
			$map_height = Waymark_Config::get_setting('misc', 'map_options', 'map_height');
		}

		//Width
		if (array_key_exists('map_width', $shortcode_data)) {
			$map_width = $shortcode_data['map_width'];

			//Numeric only
			if (! is_numeric($map_width)) {
				$map_width = false;
			}
		} else {
			$map_width = false;
		}

		//Output HTML container
		$out = "\n\n" . '<!-- START Waymark Shortcode #' . esc_html($shortcode_hash) . ' -->' . "\n";

		$shortcode_style = '';
		if ($map_width) {
			$shortcode_style .= 'width:' . $map_width . 'px';
		}

		$out .= '<div style="' . esc_attr($shortcode_style) . '" id="waymark-shortcode-' . esc_attr($shortcode_hash) . '" data-shortcode_hash="' . esc_attr($shortcode_hash) . '" class="waymark-shortcode waymark-container">' . "\n";

		//Header ?
		$do_header = 0;

		// Start with Setting
		$setting = Waymark_Config::get_setting('misc', 'shortcode_options', 'shortcode_header');
		if (is_numeric($setting)) {
			$do_header = $setting;
		}

		// Shortcode option set?
		if (array_key_exists('shortcode_header', $shortcode_data)) {
			$param = $shortcode_data['shortcode_header'];

			if (is_numeric($param)) {
				$do_header = $param;
			}
		}

		//Map Details Page
		if (get_post_type() == 'waymark_map') {
			//Map Details Page
			if (is_single()) {
				$do_header = 0;
			}
			//Archive
			// } else {
			// 	$do_header = 0;
			// }
			//I.e. Embedding using the Shortcode
		} else {
			//Always for Admin
			if (current_user_can('administrator') && Waymark_Config::get_setting('misc', 'shortcode_options', 'header_override')) {
				$do_header = 1;
			}
		}

		// Waymark_Helper::debug($do_header);

		//Header (non Map pages only)
		if ($do_header && sizeof($shortcode_header)) {
			$out .= '	<!-- Shortcode Header -->' . "\n";
			$out .= '	<header class="waymark-header">' . "\n";

			//Link
			if (array_key_exists('link', $shortcode_header)) {
				$out .= '		<a class="waymark-link" href="' . esc_url($shortcode_header['link']) . '">' . esc_html__('Details', 'waymark') . ' <i class="ion ion-android-open"></i></a>' . "\n";
			}

			//Title
			if (array_key_exists('title', $shortcode_header) && ! empty($shortcode_header['title'])) {
				$out .= '		<div class="waymark-title">' . esc_html($shortcode_header['title']) . '</div>' . "\n";
			} else {
				$out .= '		<div class="waymark-title waymark-empty">&nbsp;</div>' . "\n";

			}

			//Shortcode Meta?
			//...and it's not the Map Details page
			if (sizeof($shortcode_meta)) {
				$out .= '	<div class="waymark-meta">' . "\n";
				$out .= Waymark_Helper::map_meta_html($shortcode_meta, false);
				$out .= '		<a class="waymark-link" href="' . esc_url($shortcode_header['link']) . '">' . esc_html__('More Details', 'waymark') . ' <i class="ion ion-android-open"></i></a>' . "\n";
				$out .= '	</div>' . "\n";
			}

			$out .= '	</header>' . "\n";
		}

		//Map HTML Container (Initially hidden, made visible by JS)
		$out .= '	<!-- Map -->' . "\n";

		// TODO - refactor - add/remove "loading" class instead of inline style

		$map_style = 'display:none;';
		$map_style .= 'height:' . $map_height . 'px;min-height:' . $map_height . 'px;';
		$out .= '	<div style="' . esc_attr($map_style) . '" id="waymark-map-' . esc_attr($shortcode_hash) . '" class="' . esc_attr($map_class) . '" data-shortcode_hash="' . esc_attr($shortcode_hash) . '"></div>' . "\n";

		//Elevation?

		// Shortcode
		if (array_key_exists('show_elevation', $shortcode_data)) {
			$show_elevation = $shortcode_data['show_elevation'] == '1';
			// Use Setting
		} else {
			$show_elevation = Waymark_Config::get_setting('misc', 'elevation_options', 'show_elevation') == '1';
		}

		if ($show_elevation) {
			$out .= '	<div id="waymark-elevation-' . esc_attr($shortcode_hash) . '"></div>' . "\n";
		}

		// Waymark_Helper::debug($show_elevation);

		//Close container
		$out .= '</div>' . "\n";

		// ================ END HTML ====================

		// ============ START JAVASCRIPT ================

		//Create viewer
		$out .= '<script>' . "\n";
		$out .= 'jQuery(document).ready(function() {' . "\n";
		$out .= '	let waymark_viewer = window.Waymark_Map_Factory.viewer();' . "\n";

		//Output Config
		$out .= '	if(typeof waymark_user_config === "undefined") { waymark_viewer.message("Configuration not found! Check for \"var waymark_user_config\" in your page HTML.", "error"); }' . "\n";

		$out .= '	var waymark_config = jQuery.extend(true, {}, waymark_user_config);' . "\n";
		$out .= '	waymark_config.map_options.map_div_id = "waymark-map-' . esc_js($shortcode_hash) . '";' . "\n";
		$out .= '	waymark_config.map_options.map_height = ' . esc_js($map_height) . ";\n";
		if ($map_width) {
			$out .= '	waymark_config.map_options.map_width = ' . esc_js($map_width) . ";\n";
		}

		// ===== Shortcode options (2/2) =====

		//Map Centre
		if (array_key_exists('map_centre', $shortcode_data)) {
			$latlng_string = $shortcode_data['map_centre'];
			$map_latlng_array = Waymark_Helper::latlng_string_to_array($latlng_string);

			if (is_array($map_latlng_array)) {
				$out .= '	waymark_config.map_options.map_init_latlng = [' . esc_js($map_latlng_array[0]) . ',' . esc_js($map_latlng_array[1]) . '];' . "\n";
			}
			// } else if ($default_latlng = Waymark_Config::get_setting('misc', 'map_options', 'map_default_latlng')) {
			// 	// We have a valid LatLng
			// 	if ($default_latlng_array = Waymark_Helper::latlng_string_to_array($default_latlng)) {
			// 		$out .= '	waymark_config.map_options.map_init_latlng = [' . $default_latlng_array[0] . ', ' . $default_latlng_array[1] . '];' . "\n";
			// 	}
		}

		//Map Zoom
		if (array_key_exists('map_zoom', $shortcode_data)) {
			$map_init_zoom = $shortcode_data['map_zoom'];

			if (is_numeric($map_init_zoom)) {
				$out .= '	waymark_config.map_options.map_init_zoom = ' . esc_js($map_init_zoom) . ";\n";
			}
			// Default Zoom
			// } elseif ($default_zoom = Waymark_Config::get_setting('misc', 'map_options', 'map_default_zoom')) {
			// 	$out .= '	waymark_config.map_options.map_init_zoom = ' . $default_zoom . ";\n";
		}

		//Max Zoom
		if (array_key_exists('max_zoom', $shortcode_data) && is_numeric($shortcode_data['max_zoom'])) {
			$out .= '	waymark_config.map_options.map_max_zoom = ' . esc_js($shortcode_data['max_zoom']) . ";\n";
		}

		//Basemap?
		if (array_key_exists('basemap', $shortcode_data)) {
			$out .= '	waymark_config.map_options.map_init_basemap = "' . esc_js($shortcode_data['basemap']) . '";' . "\n";
		}

		//Gallery?
		if (array_key_exists('show_gallery', $shortcode_data) && in_array($shortcode_data['show_gallery'], ['1', '0'])) {
			$out .= '	waymark_config.viewer_options.show_gallery = ' . esc_js($shortcode_data['show_gallery']) . ';' . "\n";
		}

		//Overlay filter?
		if (array_key_exists('show_filter', $shortcode_data) && in_array($shortcode_data['show_filter'], ['1', '0'])) {
			$out .= '	waymark_config.viewer_options.show_filter = ' . esc_js($shortcode_data['show_filter']) . ';' . "\n";
		}

		//Elevation?
		if ($show_elevation) {
			$out .= '	waymark_config.viewer_options.show_elevation = "1";' . "\n";
			$out .= '	waymark_config.viewer_options.elevation_div_id = "waymark-elevation-' . esc_js($shortcode_hash) . '";' . "\n";

			//Units
			//Shortcode
			if (array_key_exists('elevation_units', $shortcode_data) && in_array($shortcode_data['elevation_units'], ['metric', 'imperial'])) {
				$out .= '	waymark_config.viewer_options.elevation_units = "' . esc_js($shortcode_data['elevation_units']) . '";' . "\n";
			}
		}

		// === Clustering ===

		// Shortcode option set?
		if (array_key_exists('show_cluster', $shortcode_data) && in_array($shortcode_data['show_cluster'], ['1', '0'])) {
			$out .= '	waymark_config.viewer_options.show_cluster = ' . esc_js($shortcode_data['show_cluster']) . ';' . "\n";
		}

		// === Initially Show / Hide ===

		$debug_output = '';

		foreach (['hide_marker', 'show_marker', 'hide_line', 'show_line', 'hide_shape', 'show_shape'] as $show_hide_type) {
			// If option exists
			if (array_key_exists($show_hide_type, $shortcode_data)) {
				$show_hide_explode = explode('_', $show_hide_type);
				$overlay_kind = $show_hide_explode[1];

				// Show / Hide
				if ($show_hide_explode[0] == 'show') {
					$overlay_display = 1;
				} elseif ($show_hide_explode[0] == 'hide') {
					$overlay_display = 0;
				}

				// Marker / Line / Shape
				$overlay_type_explode = explode(',', $shortcode_data[$show_hide_type]);

				foreach ($overlay_type_explode as $overlay_type) {
					$out .= '	for(i in waymark_config.map_options.' . esc_js($overlay_kind) . '_types) {' . "\n";

					$out .= '		var this_key = waymark_viewer.make_key(waymark_config.map_options.' . esc_js($overlay_kind) . '_types[i]["' . esc_js($overlay_kind) . '_title"]);' . "\n";

					$out .= '		if("' . esc_js($overlay_type) . '" == "*" || this_key == "' . esc_js($overlay_type) . '") {' . "\n";

					if (Waymark_Helper::is_debug()) {
						$debug_output .= ucwords($overlay_kind) . ' ' . ucwords($show_hide_explode[0]) . ' (' . $overlay_type . ') ';
					}

					$out .= '			waymark_config.map_options.' . esc_js($overlay_kind) . '_types[i]["' . esc_js($overlay_kind) . '_display"] = ' . esc_js($overlay_display) . ';' . "\n";
					$out .= '		}' . "\n";
					$out .= '	}' . "\n";
				}
			}
		}

		// =====================================
		// ============ INIT CONFIG ============
		// =====================================

		$out .= '	waymark_viewer.init(waymark_config);' . "\n";

		if (Waymark_Helper::is_debug()) {
			$out .= '	waymark_viewer.debug("Shortcode #' . esc_js($shortcode_hash) . ' Initialised");' . "\n";
			$out .= '	waymark_viewer.debug(waymark_config);' . "\n";

			if ($debug_output) {
				$out .= '	waymark_viewer.debug("' . esc_js($debug_output) . '");' . "\n";
			}
		}

		// =====================================
		// ================ MAPS ===============
		// =====================================

		$i = 0;
		foreach ($maps_output as $map_id => $map_output) {
			$i++;

			//Embed (always embed first map)
			if ($i === 1 || 'embed' === Waymark_Config::get_setting('misc', 'collection_options', 'load_method')) {
				//If map data exists
				if (isset($map_output['map_data'])) {
					//Re-encode for safe output (json_encode does not escape </script>)
					$map_json = json_decode($map_output['map_data'], true);
					if (! is_array($map_json)) {
						$map_json = array('type' => 'FeatureCollection', 'features' => array());
					}

					$out .= '	waymark_viewer.load_json(' . wp_json_encode($map_json) . ');' . "\n";

					if (Waymark_Helper::is_debug()) {
						$out .= '	waymark_viewer.debug("Shortcode #' . esc_js($shortcode_hash) . ' Map Loaded");' . "\n";
						$out .= '	waymark_viewer.debug(' . wp_json_encode($map_json) . ');' . "\n";
					}

					//Done loading
					$out .= '	waymark_viewer.load_done();' . "\n";
				}
				//Load via HTTP
			} else {
				//Reset view (last map only)
				if ($i == sizeof($maps_output)) {
					$reset_view = 'true';
				} else {
					$reset_view = 'false';
				}

				$out .= '	waymark_load_map_data(waymark_viewer, ' . $map_id . ', ' . $reset_view . ');' . "\n";

				if (Waymark_Helper::is_debug()) {
					$out .= '	waymark_viewer.debug("Shortcode #' . esc_js($shortcode_hash) . ' Map Loaded via HTTP (' . $i . '/' . sizeof($maps_output) . ')");' . "\n";
					$out .= '	waymark_viewer.debug(' . $map_id . ');' . "\n";
				}

				//Done loading
				if ($i == sizeof($maps_output)) {
					$out .= '	waymark_viewer.load_done();' . "\n";
				}
			}
		}

		// =====================================
		// =========== START MARKERS ===========
		// =====================================

		//Get Marker data
		$marker_data_keys = [
			'marker_centre',
			'marker_type',
			'marker_title',
			'marker_description',
			'marker_image',
		];

		//Count for marker data
		$marker_data_count = 0;
		foreach ($shortcode_data as $key => $value) {
			if (in_array($key, $marker_data_keys)) {
				$marker_data_count++;
			}
		}

		//We have Marker data
		if ($marker_data_count) {
			//Explicit Marker location?
			if (array_key_exists('marker_centre', $shortcode_data)) {
				$latlng_string = $shortcode_data['marker_centre'];
				$marker_latlng_array = Waymark_Helper::latlng_string_to_array($latlng_string);
				//Use Map centre?
			} elseif (isset($map_latlng_array)) {
				$marker_latlng_array = $map_latlng_array;
			}

			if (isset($marker_latlng_array)) {
				$marker_data = [];

				foreach ($marker_data_keys as $key) {
					if (array_key_exists($key, $shortcode_data)) {
						$value = $shortcode_data[$key];

						switch ($key) {
						case 'marker_type':
							$marker_data['type'] = $value;

							break;
						case 'marker_title':
							$marker_data['title'] = $value;

							break;
						case 'marker_description':
							$marker_data['description'] = $value;

							break;
						case 'marker_image':
							$marker_data['image_thumbnail_url'] = $value;
							$marker_data['image_medium_url'] = $value;
							$marker_data['image_large_url'] = $value;

							break;
						}
					}
				}

				$marker_geojson = [
					'type' => 'FeatureCollection',
					'features' => [
						[
							'type' => 'Feature',
							'properties' => $marker_data,
							'geometry' => [
								'type' => 'Point',
								'coordinates' => [$marker_latlng_array[1], $marker_latlng_array[0]],
							],
						],
					],
				];

				$out .= ' let marker_geojson = ' . wp_json_encode($marker_geojson) . ';' . "\n";
				$out .= '	waymark_viewer.load_json(marker_geojson);' . "\n";

				if (Waymark_Helper::is_debug()) {
					$out .= '	waymark_viewer.debug("Shortcode #' . esc_js($shortcode_hash) . ' Marker Loaded");' . "\n";
					$out .= '	waymark_viewer.debug(marker_geojson);' . "\n";
				}
			}
		}

		// ============== END MARKERS ==============

		$out .= '});' . "\n";
		$out .= '</script>' . "\n";
		$out .= '<!-- END Waymark Shortcode #' . esc_html($shortcode_hash) . ' -->' . "\n";

		// ============= END JAVASCRIPT =================

		//Return HTML
		return $out;
	}
}

new Waymark_Shortcode;
