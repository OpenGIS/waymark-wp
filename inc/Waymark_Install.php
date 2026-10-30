<?php

class Waymark_Install {
	private static $plugin_path;
	
	static function init() {
		self::$plugin_path = dirname(__DIR__) . '/Waymark.php';
		
		register_activation_hook(self::$plugin_path, array('Waymark_Install', 'do_install'));
		register_uninstall_hook(self::$plugin_path, array('Waymark_Install', 'do_uninstall'));

		add_action('admin_init', array('Waymark_Install', 'activation_redirect'));
		add_action('admin_init', array('Waymark_Install', 'update_check'));
		
		add_filter('plugin_action_links_' . plugin_basename(self::$plugin_path), array('Waymark_Install', 'add_action_links'));		
	}

	//Thanks https://stackoverflow.com/a/2463514
	static function activation_redirect() {
		if(get_option('waymark_activation_redirect')) {
			delete_option('waymark_activation_redirect');

			wp_redirect(admin_url('edit.php?post_type=waymark_map'));
			
			die;		
		}
	}
	
	static function do_install() {
		//Ensure config is initialised in the activation context (before init hook fires)
		Waymark_Config::init();

		//Flush permalinks
		$Waymark_Types = new Waymark_Types;
		$Waymark_Types->register_types();
    flush_rewrite_rules();
    
    //Trigger redirect
    add_option('waymark_activation_redirect', true);		
	}

	static function do_uninstall() {
		delete_option('Waymark_Settings');			
		delete_option('Waymark_Settings_Backup');			
		delete_option('Waymark_Version');			
		delete_option('Waymark_Key_Aliases');
		delete_option('Waymark_Key_Migration');
	}

	static function add_action_links($links) {
		$links_before = array();

		$links_after = array(
			'<a href="' . admin_url('edit.php?post_type=waymark_map') . '">' . esc_html__('Maps', 'waymark') . '</a>',
			'<a href="' . admin_url('edit.php?post_type=waymark_map&page=waymark-settings') . '">' . esc_html__('Settings', 'waymark') . '</a>'
		);				
		
		return array_merge($links_before, $links, $links_after);
	}
	
	static function update_check() {
		//If versions differ
		$version_changed = get_option('Waymark_Version') != Waymark_Config::get_item('plugin_version');

		if ($version_changed) {
			//Backup Settings
			add_option('Waymark_Settings_' . get_option('Waymark_Version'), get_option('Waymark_Settings'));
		}

		//Persist stable keys and legacy aliases on every admin_init; the
		//migration is idempotent via the Waymark_Key_Migration flag
		self::migrate_i18n_keys();

		if ($version_changed) {
			//Flush permalinks
			flush_rewrite_rules();

			//Update version
			update_option('Waymark_Version', Waymark_Config::get_item('plugin_version'));
		}
	}

	/**
	 * Populate stable key columns for overlay types, meta inputs and groups.
	 *
	 * Keys previously derived from translated titles at runtime. The migration
	 * writes an explicit key per row and records aliases for the old PHP and
	 * JavaScript derived keys, without rewriting any post data.
	 *
	 * @return void
	 */
	public static function migrate_i18n_keys() {
		$settings = get_option('Waymark_Settings');

		if (! is_array($settings)) {
			return;
		}

		$sections = [
			['markers', 'marker_types', 'marker_key', 'marker_title', 'marker'],
			['lines', 'line_types', 'line_key', 'line_title', 'line'],
			['shapes', 'shape_types', 'shape_key', 'shape_title', 'shape'],
			['meta', 'inputs', 'meta_key', 'meta_title', 'meta'],
			['meta', 'groups', 'group_key', 'group_title', 'group'],
		];

		//Does every section already have a key column of the right length?
		$needs_migration = false;

		foreach ($sections as $section) {
			list($tab_key, $section_key, $key_field) = $section;

			$rows       = Waymark_Config::get_item($tab_key, $section_key, true);
			$row_count  = is_array($rows) ? sizeof($rows) : 0;
			$key_column = isset($settings[$tab_key][$section_key][$key_field]) ? $settings[$tab_key][$section_key][$key_field] : null;

			//A section with no rows needs no key column
			if ($row_count === 0) {
				$has_key_column = ($key_column === null) || (is_array($key_column) && sizeof($key_column) === 0);
			} else {
				$has_key_column = is_array($key_column) && sizeof($key_column) === $row_count;
			}

			if (! $has_key_column) {
				$needs_migration = true;
			}
		}

		if (! $needs_migration && get_option('Waymark_Key_Migration') === '1') {
			return;
		}

		//Count the overlay type keys already used by persisted Maps
		$persisted = [
			'marker' => [],
			'line'   => [],
			'shape'  => [],
		];

		//Scan persisted Map data in batches so a large site does not load every
		//Map ID into memory at once
		$page = 1;

		do {
			$map_ids = get_posts([
				'post_type'              => 'waymark_map',
				'post_status'            => 'any',
				'fields'                 => 'ids',
				'posts_per_page'         => 100,
				'paged'                  => $page,
				'meta_key'               => 'waymark_map_data',
				'no_found_rows'          => true,
				'cache_results'          => false,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			]);

			foreach ($map_ids as $map_id) {
				$map_data = get_post_meta($map_id, 'waymark_map_data', true);

				if (! is_string($map_data) || $map_data === '') {
					continue;
				}

				$FeatureCollection = json_decode($map_data, true);

				if (! is_array($FeatureCollection) || ! isset($FeatureCollection['features']) || ! is_array($FeatureCollection['features'])) {
					continue;
				}

				foreach ($FeatureCollection['features'] as $feature) {
					if (! is_array($feature) || ! isset($feature['properties']['type']) || ! is_scalar($feature['properties']['type'])) {
						continue;
					}

					$type     = (string) $feature['properties']['type'];
					$geometry = isset($feature['geometry']['type']) ? $feature['geometry']['type'] : '';
					$kind     = '';

					switch ($geometry) {
					case 'Point':
						$kind = isset($feature['properties']['radius']) ? 'shape' : 'marker';

						break;
					case 'LineString':
					case 'MultiLineString':
						$kind = 'line';

						break;
					case 'Polygon':
					case 'MultiPolygon':
						$kind = 'shape';

						break;
					}

					if ($kind === '') {
						continue;
					}

					if (! isset($persisted[$kind][$type])) {
						$persisted[$kind][$type] = 0;
					}

					$persisted[$kind][$type]++;
				}
			}

			$page++;
		} while (sizeof($map_ids) === 100);

		$aliases = get_option('Waymark_Key_Aliases');
		$aliases = is_array($aliases) ? $aliases : [];

		foreach ($sections as $section) {
			list($tab_key, $section_key, $key_field, $title_field, $kind) = $section;

			$rows = Waymark_Config::get_item($tab_key, $section_key, true);
			$rows = is_array($rows) ? $rows : [];

			//Do not store an empty key column: the repeatable reader treats an
			//empty array as one blank row, which would break idempotence.
			if (! sizeof($rows)) {
				unset($settings[$tab_key][$section_key][$key_field]);

				continue;
			}

			$existing_keys = isset($settings[$tab_key][$section_key][$key_field]) && is_array($settings[$tab_key][$section_key][$key_field])
				? $settings[$tab_key][$section_key][$key_field]
				: [];

			$new_keys = [];
			$used     = [];

			foreach ($rows as $index => $row) {
				$title = isset($row[$title_field]) ? $row[$title_field] : '';

				$php = Waymark_Helper::make_key($title);
				$js  = Waymark_Helper::make_key_js($title);

				//Preserve an existing key
				if (isset($existing_keys[$index]) && is_scalar($existing_keys[$index]) && (string) $existing_keys[$index] !== '') {
					$key = (string) $existing_keys[$index];
				} else {
					$key = '';

					if (in_array($kind, ['marker', 'line', 'shape'], true)) {
						$php_count = ($php !== '' && isset($persisted[$kind][$php])) ? $persisted[$kind][$php] : 0;
						$js_count  = ($js !== '' && isset($persisted[$kind][$js])) ? $persisted[$kind][$js] : 0;

						if ($php !== '' && $js !== '' && $php !== $js) {
							if ($php_count > $js_count) {
								$key = $php;
							} elseif ($js_count > $php_count) {
								$key = $js;
							} else {
								$key = $php;
							}
						} else {
							$key = ($php !== '') ? $php : $js;
						}
					} else {
						$key = ($php !== '') ? $php : $js;
					}

					if ($key === '') {
						$key = 'item_' . $index;
					}
				}

				//Deduplicate within the section
				$base   = $key;
				$suffix = 2;

				while (in_array($key, $used, true)) {
					$key = $base . '_' . $suffix;
					$suffix++;
				}

				$used[]     = $key;
				$new_keys[] = $key;

				//Alias both title-derived formats and the chosen key to the key
				foreach ([$php, $js, $key] as $alias) {
					if ($alias === '') {
						continue;
					}

					$aliases[$kind][$alias] = $key;
				}
			}

			$settings[$tab_key][$section_key][$key_field] = $new_keys;
		}

		update_option('Waymark_Settings', $settings);
		update_option('Waymark_Key_Aliases', $aliases);
		update_option('Waymark_Key_Migration', '1');

		//Refresh the in-memory config
		Waymark_Config::init();
	}
}
