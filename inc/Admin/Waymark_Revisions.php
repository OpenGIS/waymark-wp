<?php

/**
 * Waymark_Revisions
 *
 * Makes WordPress revisions aware of Waymark Map data and custom Map meta, and
 * adds the Map fields to the revision diff UI.
 */

class Waymark_Revisions {

	/**
	 * Snapshot of waymark meta values taken before a restore, so that restoring
	 * a revision created before the fix (which holds no waymark meta) leaves the
	 * current Map data intact instead of wiping it.
	 */
	private static $meta_snapshot = [];

	public function __construct() {
		//Defensive: all required classes are loaded with the plugin, but never fatal if not
		if (! class_exists('Waymark_Map') || ! class_exists('Waymark_Config') || ! class_exists('Waymark_Helper') || ! class_exists('Waymark_GeoJSON')) {
			return;
		}

		//WP 6.4+ natively supports revisioned meta keys
		if (function_exists('wp_post_revision_meta_keys')) {
			add_filter('wp_post_revision_meta_keys', [$this, 'revisioned_meta_keys'], 10, 2);

			//Restore safeguard: snapshot before core's delete-and-copy, then guarantee the value
			add_action('wp_restore_post_revision', [$this, 'snapshot_waymark_meta'], 5, 2);
			add_action('wp_restore_post_revision', [$this, 'restore_waymark_meta_safely'], 20, 2);

			//Autosaves: core only matches meta keys against prefixed field names, Waymark posts unprefixed
			add_action('wp_creating_autosave', [$this, 'autosave_capture_waymark_meta'], 20, 1);

		//Pre-6.4 fallback: revisions already contain waymark meta, only restore was missing
		} else {
			add_action('wp_restore_post_revision', [$this, 'restore_legacy_meta'], 10, 2);
		}

		//Diff UI
		add_filter('_wp_post_revision_fields', [$this, 'revision_diff_fields'], 10, 2);
	}

	/**
	 * Build the list of waymark meta keys to revision, derived from the current
	 * config in the same way as Waymark_Map.
	 *
	 * @return array Meta keys, e.g. waymark_map_data, waymark_map_description
	 */
	public function get_waymark_meta_keys() {
		$keys = [];

		//Map Data is always revisioned
		$keys['waymark_map_data'] = true;

		$map_meta = Waymark_Config::get_item('meta', 'inputs', true);
		if ($map_meta && sizeof($map_meta)) {
			foreach ($map_meta as $meta) {
				if (! isset($meta['meta_title']) || empty($meta['meta_title'])) {
					continue;
				}

				$keys['waymark_' . Waymark_Helper::make_key($meta['meta_title'], 'map')] = true;
			}
		}

		return array_keys($keys);
	}

	/**
	 * Register waymark meta keys with the WP 6.4+ revisioned meta mechanism.
	 *
	 * @param  array  $keys      Registered revisioned meta keys
	 * @param  string $post_type Post type being revisioned
	 * @return array             Registered revisioned meta keys
	 */
	public function revisioned_meta_keys($keys, $post_type) {
		//Only for Maps
		if ($post_type !== 'waymark_map') {
			return $keys;
		}

		if (! is_array($keys)) {
			$keys = [];
		}

		return array_values(array_unique(array_merge($keys, $this->get_waymark_meta_keys())));
	}

	/**
	 * Capture the current waymark meta values before core's delete-and-copy.
	 *
	 * @param int $post_id     Post ID
	 * @param int $revision_id Revision ID
	 */
	public function snapshot_waymark_meta($post_id, $revision_id) {
		if (get_post_type($post_id) !== 'waymark_map') {
			return;
		}

		self::$meta_snapshot = [];

		foreach ($this->get_waymark_meta_keys() as $meta_key) {
			if (metadata_exists('post', $post_id, $meta_key)) {
				self::$meta_snapshot[$meta_key] = get_post_meta($post_id, $meta_key, true);
			}
		}
	}

	/**
	 * Guarantee waymark meta is correctly restored after core's delete-and-copy.
	 *
	 * @param int $post_id     Post ID
	 * @param int $revision_id Revision ID
	 */
	public function restore_waymark_meta_safely($post_id, $revision_id) {
		if (get_post_type($post_id) !== 'waymark_map') {
			return;
		}

		foreach ($this->get_waymark_meta_keys() as $meta_key) {
			//Revisions created since this fix contain waymark meta: guarantee the value
			if (metadata_exists('post', $revision_id, $meta_key)) {
				update_post_meta($post_id, $meta_key, get_post_meta($revision_id, $meta_key, true));
			//Old revisions have no waymark meta: undo core's delete, restore the snapshot
			} elseif (isset(self::$meta_snapshot[$meta_key])) {
				update_post_meta($post_id, $meta_key, self::$meta_snapshot[$meta_key]);
			}
		}
	}

	/**
	 * Pre-6.4 fallback: copy waymark meta from the revision to the post.
	 *
	 * @param int $post_id     Post ID
	 * @param int $revision_id Revision ID
	 */
	public function restore_legacy_meta($post_id, $revision_id) {
		if (get_post_type($post_id) !== 'waymark_map') {
			return;
		}

		foreach ($this->get_waymark_meta_keys() as $meta_key) {
			if (metadata_exists('post', $revision_id, $meta_key)) {
				update_post_meta($post_id, $meta_key, get_post_meta($revision_id, $meta_key, true));
			}
		}
	}

	/**
	 * Capture waymark meta for autosaves.
	 *
	 * Core's handler only matches revisioned keys against POST fields named
	 * exactly like the meta key; Waymark submits unprefixed parameter names.
	 *
	 * @param array $new_autosave Autosave post data, with 'ID' and 'post_parent'
	 */
	public function autosave_capture_waymark_meta($new_autosave) {
		//$new_autosave is an array: 'ID' is the autosave, 'post_parent' is the Map
		if (! is_array($new_autosave) || ! isset($new_autosave['ID']) || ! isset($new_autosave['post_parent'])) {
			return;
		}

		if (get_post_type($new_autosave['post_parent']) !== 'waymark_map') {
			return;
		}

		//Block editor posts as data[wp_autosave], classic editor as the top level $_POST
		$posted_data = (isset($_POST['data']['wp_autosave']) && is_array($_POST['data']['wp_autosave'])) ? $_POST['data']['wp_autosave'] : $_POST;
		$posted_data = wp_unslash($posted_data);

		foreach ($this->get_waymark_meta_keys() as $meta_key) {
			//Waymark fields are submitted with the unprefixed parameter name
			$parameter_name = substr($meta_key, strlen('waymark_'));

			if (isset($posted_data[$parameter_name]) && get_post_meta($new_autosave['ID'], $meta_key, true) !== $posted_data[$parameter_name]) {
				update_post_meta($new_autosave['ID'], $meta_key, $posted_data[$parameter_name]);
			}
		}
	}

	/**
	 * Add the waymark fields to the revision diff UI.
	 *
	 * @param  array      $fields Revision diff fields
	 * @param  array|null $post   Post array being processed
	 * @return array              Revision diff fields
	 */
	public function revision_diff_fields($fields, $post = null) {
		//Only for Maps (and only when $post is an array)
		if (! is_array($post) || ! isset($post['post_type']) || $post['post_type'] !== 'waymark_map') {
			return $fields;
		}

		$fields['waymark_map_data'] = __('Map Data', 'waymark');
		add_filter('_wp_post_revision_field_waymark_map_data', [$this, 'revision_diff_field_value'], 10, 4);

		$map_meta = Waymark_Config::get_item('meta', 'inputs', true);
		if ($map_meta && sizeof($map_meta)) {
			foreach ($map_meta as $meta) {
				if (! isset($meta['meta_title']) || empty($meta['meta_title'])) {
					continue;
				}

				$meta_key = 'waymark_' . Waymark_Helper::make_key($meta['meta_title'], 'map');

				if (isset($fields[$meta_key])) {
					continue;
				}

				$fields[$meta_key] = $meta['meta_title'];
				add_filter('_wp_post_revision_field_' . $meta_key, [$this, 'revision_diff_field_value'], 10, 4);
			}
		}

		return $fields;
	}

	/**
	 * Provide the waymark field value for the revision diff UI.
	 *
	 * @param  string   $content Current field value
	 * @param  string   $field   Field name (also the meta key)
	 * @param  WP_Post  $compare Revision post object to compare to or from
	 * @param  string   $context 'to' or 'from'
	 * @return string            Field value for the diff
	 */
	public function revision_diff_field_value($content, $field, $compare, $context = 'to') {
		//Only for waymark fields
		if (strpos($field, 'waymark_') !== 0) {
			return $content;
		}

		if (! isset($compare->ID)) {
			return $content;
		}

		$value = get_post_meta($compare->ID, $field, true);

		//Map Data: show a summary instead of raw GeoJSON
		if ($field === 'waymark_map_data') {
			$feature_count = Waymark_GeoJSON::get_feature_count($value);
			if ($feature_count) {
				// translators: %d: Number of features
				return sprintf(__('%d feature(s)', 'waymark'), $feature_count);
			}

			return '—';
		}

		//Array value?
		if (is_array($value)) {
			return implode(', ', $value);
		}

		return (string) $value;
	}
}
new Waymark_Revisions;
