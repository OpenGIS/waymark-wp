<?php

class Waymark_HTTP {

	function __construct() {
		add_filter('query_vars', [$this, 'query_vars']);
		add_action('template_redirect', [$this, 'template_redirect']);

		//Setup AJAX
		Waymark_JS::add_chunk('//HTTP');
		Waymark_JS::add_chunk('var waymark_http_endpoint = ' . wp_json_encode(Waymark_Helper::http_url()) . ';');
	}

	public function query_vars($vars) {
		$vars[] = 'waymark_http';

		return $vars;
	}

	public function template_redirect() {
		//If not Waymark HTTP request
		if (! get_query_var('waymark_http')) {
			//WP loads normally
			return;
		}

		$request_data = wp_unslash($_REQUEST);

		//Validate export format
		if (! isset($request_data['export_format']) || ! in_array($request_data['export_format'], ['gpx', 'kml', 'geojson'])) {
			$request_data['export_format'] = 'geojson';
		}

		//Action
		if (array_key_exists('waymark_action', $request_data)) {
			//Requires Map Data
			if (in_array($request_data['waymark_action'], [
				'get_map_data',
				'download_map_data',
				'download_collection_data',
			])) {
				//Do we have data?
				if (array_key_exists('map_id', $request_data) && is_numeric($request_data['map_id'])) {
					//Valid Map
					if ($Map = new Waymark_Map(esc_attr($request_data['map_id']))) {
						if (isset($Map->data['map_data']) && ! empty($Map->data['map_data'])) {
							//Clean
							$map_data = Waymark_GeoJSON::remove_unwanted_overlay_properties($Map->data['map_data']);
							//Invalid Map data
						} else {
							die("-1");
						}
						//Invalid Map
					} else {
						die("-1");
					}
				} elseif (array_key_exists('collection_id', $request_data) && is_numeric($request_data['collection_id'])) {
					$Collection = new Waymark_Collection(esc_attr($request_data['collection_id']));
					//Invalid Map ID
				} else {
					die("-1");
				}

				//Gzip supported?
				if (function_exists('gzcompress') && ! in_array('ob_gzhandler', ob_list_handlers())) {
					ob_start("ob_gzhandler");
				} else {
					ob_start();
				}

				//Cache
				header('Cache-control: public,max-age=' . DAY_IN_SECONDS);

				switch (esc_attr($request_data['waymark_action'])) {
				// === AJAX Load ===

				case 'get_map_data':
					//Security
					check_ajax_referer(Waymark_Config::get_item('nonce_string'), 'waymark_security');

					//Required data
					if (! isset($map_data) || ! isset($Map)) {
						die("-1");
					}

					//Modify
					$map_data = Waymark_Helper::add_map_link_to_description($Map->post_id, $Map->post_title, $map_data);

					//Type
					header('Content-Type: application/geo+json');

					//The content
					if (isset($map_data) && $map_data) {
						// Decode then re-encode to ensure valid JSON
						$map_data = json_decode($map_data, true);
						echo wp_json_encode($map_data);
					}

					break;

				// === Collection Export ===

				case 'download_collection_data':
					//Security
					check_ajax_referer(Waymark_Config::get_item('nonce_string'), 'waymark_security');

					//Required data
					if (! isset($Collection)) {
						die("-1");
					}

					//File download name
					$export_filename = sanitize_file_name($Collection->slug) . '-' . $Collection->collection_id . '.' . esc_attr($request_data['export_format']);

					break;

				// === Map Export ===

				case 'download_map_data':
					//Security
					check_ajax_referer(Waymark_Config::get_item('nonce_string'), 'waymark_security');

					//Required data
					if (! isset($map_data) || ! isset($Map)) {
						die("-1");
					}

					//File download name
					$export_filename = sanitize_file_name(get_post_field('post_name', $Map->post_id)) . '-' . $Map->post_id . '.' . esc_attr($request_data['export_format']);

					break;
				}

				//Echo
				if (isset($export_filename) && isset($request_data['map_data'])) {
					header('Content-Disposition: attachment; filename="' . $export_filename . '"');

					$map_data = rawurldecode($request_data['map_data']);

					switch ($request_data['export_format']) {
					case 'gpx':
						header('Content-Type: application/gpx+xml');

						//Clean (allow GPX elements)
						echo wp_kses($map_data, Waymark_Helper::allowable_tags('gpx'));

						break;
					case 'kml':
						header('Content-Type: application/vnd.google-earth.kml+xml');

						// Clean (allow KML elements)
						echo '<?xml version="1.0" encoding="UTF-8"?>';
						echo wp_kses($map_data, Waymark_Helper::allowable_tags('kml'));

						break;
					case 'geojson':
						header('Content-Type: application/geo+json');

						//Encode and then decode to ensure valid JSON
						$map_data = json_decode($map_data, true);
						echo wp_json_encode($map_data);

						break;
					}
				}

				//That's it, that's all...
				die;

				//Does not require Map data
			} else {
				switch ($request_data['waymark_action']) {
				// === Public Submissions ===
				case 'public_add_map':
					//Security
					check_ajax_referer(Waymark_Config::get_item('nonce_string'), 'waymark_security');

					//Create submission
					$Submission = new Waymark_Submission($request_data);

					//Ensure submissions allowed
					if ($Submission->get_allowed() === true) {
						//Create Map
						$Submission->create_map();

						$Submission->do_redirect();

//							Waymark_Helper::debug($Submission);
						//Submission not allowed
					} else {
						///!!! Submission
					}

					break;
				}

				die;
			}
		}
	}
}

new Waymark_HTTP;
