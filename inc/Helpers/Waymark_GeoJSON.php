<?php

class Waymark_GeoJSON {

	/**
	 * Convert a GeoJSON string to an array
	 *
	 * @param  string $string GeoJSON string
	 * @return array          GeoJSON array
	 */
	static public function string_to_feature_collection($string = '') {
		if (is_string($string)) {
			return json_decode($string, true, 512, JSON_OBJECT_AS_ARRAY);
		}

		return false;
	}

	/**
	 * Convert a GeoJSON array to a string
	 *
	 * @param  array $FeatureCollection GeoJSON array
	 * @return string                   GeoJSON string
	 */

	static public function feature_collection_to_string($FeatureCollection = []) {
		if (is_array($FeatureCollection)) {
			return wp_json_encode($FeatureCollection);
		}

		return false;
	}

	/**
	 * Get count of features in a GeoJSON array
	 *
	 * @param		array|string 			$FeatureCollection GeoJSON array or string
	 * @return	integer|boolean 	Count of features or false
	 */
	static public function get_feature_count($FeatureCollection = []) {
		if (is_string($FeatureCollection)) {
			$FeatureCollection = self::string_to_feature_collection($FeatureCollection);
		}

		if ($FeatureCollection && isset($FeatureCollection['features']) && is_array($FeatureCollection['features'])) {

			return sizeof($FeatureCollection['features']);
		}

		return false;
	}

	/**
	 * Update every feature's property in a GeoJSON array
	 *
	 * @param  array  $FeatureCollection GeoJSON array
	 * @param  string $property_key      Property key
	 * @param  string $property_value    Property value
	 * @return array                     Updated GeoJSON array
	 */
	static public function update_feature_property($FeatureCollection = [], $property_key = '', $property_value = '') {
		if (is_string($FeatureCollection)) {
			$FeatureCollection = self::string_to_feature_collection($FeatureCollection);
		}

		//Feature Collection
		if ($FeatureCollection && isset($FeatureCollection['features'])) {

			//Each Feature
			foreach ($FeatureCollection['features'] as &$Feature) {
				if (! isset($Feature['properties']) || ! is_array($Feature['properties'])) {
					$Feature['properties'] = [];
				}

				$Feature['properties'][$property_key] = $property_value;
			}
		}

		return $FeatureCollection;
	}

	/**
	 * Replace bad characters in every feature's description property in a GeoJSON array
	 *
	 * @param  array  $FeatureCollection GeoJSON array
	 * @return array                     Updated GeoJSON array
	 */
	static public function clean_feature_descriptions($FeatureCollection = []) {
		//Feature Collection
		if ($FeatureCollection && isset($FeatureCollection['features'])) {

			//Each Feature
			foreach ($FeatureCollection['features'] as &$Feature) {
				if (isset($Feature['properties']['description'])) {
					$bad = ['"'];
					$good = ['\"'];
					$Feature['properties']['description'] = str_replace($bad, $good, $Feature['properties']['description']);
				}
			}
		}

		return $FeatureCollection;
	}

	/**
	 * Sort features into Markers, Lines and Shapes and then by type
	 *
	 * @param  array  $FeatureCollection GeoJSON array
	 * @return array                     Sorted GeoJSON array
	 */
	static public function features_by_overlay_type($FeatureCollection = []) {

		// Waymark_Helper::debug($FeatureCollection);

		$overlays = [
			'markers' => [],
			'lines' => [],
			'shapes' => [],
		];

		foreach ($FeatureCollection['features'] as $feature) {

			// Waymark_Helper::debug($feature);

			//Ensure feature properties has type
			if (! isset($feature['properties']['type'])) {
				continue;
			}

			if (isset($feature['geometry']['type'])) {
				switch ($feature['geometry']['type']) {
				case 'Point':
					//Circle
					if (isset($feature['properties']['radius'])) {
						$type = 'shapes';
						//Marker
					} else {
						$type = 'markers';
					}

					break;

				case 'LineString':
				case 'MultiLineString':
					$type = 'lines';

					break;
				case 'Polygon':
					$type = 'shapes';

					break;
				}
			}

			//Add to Array if we have a type
			if (isset($type)) {
				$overlays[$type][$feature['properties']['type']][] = $feature;
			}
		}

		// Order markers/lines/shapes by type
		foreach ($overlays as &$overlay) {
			ksort($overlay);
		}

		return $overlays;
	}

	static public function remove_unwanted_overlay_properties($FeatureCollection = [], $wanted = []) {
		if (is_string($FeatureCollection)) {
			$FeatureCollection = self::string_to_feature_collection($FeatureCollection);

			$do_stringify = true;
		}

		if (! sizeof($wanted)) {
			$wanted = Waymark_Helper::get_overlay_properties();
		}

		$FeatureCollection = Waymark_Helper::stringify_numbers($FeatureCollection);

		//Feature Collection
		if ($FeatureCollection && isset($FeatureCollection['features'])) {
			foreach ($FeatureCollection['features'] as &$feature) {
				// Include only wanted properties
				$properties_out = [];
				foreach ($wanted as $key) {
					if (isset($feature['properties'][$key])) {
						$properties_out[$key] = (string) $feature['properties'][$key];
					}
				}

				//Update
				$feature['properties'] = $properties_out;
			}
		}

		if ($do_stringify) {
			$FeatureCollection = self::feature_collection_to_string($FeatureCollection);
		}

		return $FeatureCollection;
	}

	static public function process_import($FeatureCollection = []) {
		// Clean
		$FeatureCollection = self::remove_unwanted_overlay_properties($FeatureCollection);

		// Append to description?
		if (Waymark_Config::get_setting('properties', 'options', 'description_append') == '1') {
			// Iterate over features
			foreach ($FeatureCollection['features'] as &$feature) {

				// Modify description

				// Ensure there is a description
				if (! array_key_exists('description', $feature['properties'])) {
					$feature['properties']['description'] = '';
				}

				// Additional GeoJSON Properties
				$custom_props = Waymark_Config::get_item('properties', 'props', true);
				$custom_props = Waymark_Helper::multi_use_as_key($custom_props, 'property_key');

				if (sizeof($custom_props)) {
					foreach ($custom_props as $custom_prop) {
						// Ensure property exists
						if (array_key_exists($custom_prop['property_key'], $feature['properties'])) {

							// Format
							$feature['properties']['description'] .= '<p class="waymark-property waymark-property-' . esc_attr($custom_prop['property_key']) . '"><b>' . esc_html($custom_prop['property_title']) . '</b><br>' . esc_html($feature['properties'][$custom_prop['property_key']]) . '</p>';
						}
					}
				}
			}
		}

		return $FeatureCollection;
	}
}