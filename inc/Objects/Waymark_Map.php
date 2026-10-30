<?php

require_once 'Waymark_Object.php';

class Waymark_Map extends Waymark_Object {

	public $post_type = 'waymark_map';

	function __construct($post_id = null) {
		//Set groups
		$this->parameter_groups = Waymark_Helper::get_meta_groups();

		//Map Data
		$this->parameters['map_data'] = [
			'input_types' => ['meta'],
			'name' => 'map_data',
			'id' => 'map_data',
			'type' => 'textarea',
			'tip' => __('You are seeing the Map Data (in GeoJSON format) because you have the Waymark Debug Mode enabled. The amount of text shown here can get VERY large, so your browser might struggle to scroll through it. You can disable Debug Mode in Settings &gt; Misc. &gt; Advanced.', 'waymark'),
			'group' => '',
			'title' => __('Map Data', 'waymark'),
			'class' => 'waymark-hidden',
		];

		// If debug mode
		if (Waymark_Helper::is_debug()) {
			$this->parameters['map_data']['class'] = '';
		}

		//Meta
		$map_meta = Waymark_Config::get_item('meta', 'inputs', true);
		if ($map_meta && sizeof($map_meta)) {

			foreach ($map_meta as $meta) {
				$meta_key = 'map_' . Waymark_Helper::get_meta_key($meta);

				//Submissions
				if (($post_id === null) && (! is_admin()) && class_exists('Waymark_Submission')) {
					$Submission = new Waymark_Submission;

					//Meta feature not allowed for user
					if (! in_array('meta', $Submission->get_features())) {
						//Skip it
						continue;
					}

					//Not allowed in submissions
					if (! $meta['meta_submission']) {
						//Skip it
						continue;
					}
				}

				$this->parameters[$meta_key] = [
					'input_types' => ['meta'],
					'group' => '',
					'name' => $meta_key,
					'id' => $meta_key,
					'default' => $meta['meta_default'],
					'title' => $meta['meta_title'],
				];

				//Do we have a type?
				if (isset($meta['meta_type'])) {
					$this->parameters[$meta_key]['type'] = $meta['meta_type'];

					//Select?
					if (in_array($meta['meta_type'], ['select', 'select_multi']) && isset($meta['meta_options'])) {

						$this->parameters[$meta_key]['options'] = Waymark_Helper::comma_string_to_array($meta['meta_options']);

						//Normalise the default so null and non-scalars are handled safely
						$meta_default = (isset($meta['meta_default']) && is_scalar($meta['meta_default'])) ? (string) $meta['meta_default'] : '';

						//Ensure the default is keyified
						//Multi
						if (strpos($meta_default, ',')) {
							$default_exploded = explode(',', $meta_default);
							foreach ($default_exploded as &$val) {
								$val = Waymark_Helper::make_key(trim($val));
							}
							$default_imploded = implode(',', $default_exploded);

							$this->parameters[$meta_key]['default'] = $default_imploded;
							//Single
						} else {
							$this->parameters[$meta_key]['default'] = Waymark_Helper::make_key(trim($meta_default));
						}
					}
				}

				//Tip?
				if (isset($meta['meta_tip']) && ! empty($meta['meta_tip'])) {
					$this->parameters[$meta_key]['tip'] = $meta['meta_tip'];
				}

				//Group?
				if (isset($meta['meta_group'])) {
					$this->parameters[$meta_key]['group'] = Waymark_Helper::resolve_group_key($meta['meta_group']);
				}
			}
		} else {
		}

		parent::__construct($post_id);
	}

	function get_geojson($format = 'array') {
		//Get GeoJSON
		$geojson_string = array_key_exists('map_data', $this->data) ? $this->data['map_data'] : '';

		if ($format == 'string') {
			return $geojson_string;
		}

		return Waymark_GeoJSON::string_to_feature_collection($geojson_string);
	}
}