<?php
/**
 * Stable, locale-independent key tests.
 *
 * @package Waymark
 */

require_once dirname( __DIR__, 2 ) . '/inc/Admin/Waymark_Settings.php';

/**
 * Covers explicit key columns, legacy aliases, the migration and the
 * settings sanitizer.
 */
class Test_Stable_Keys extends WP_UnitTestCase {

	/**
	 * Start every test from a pristine config.
	 */
	public function set_up() {
		parent::set_up();

		delete_option( 'Waymark_Settings' );
		delete_option( 'Waymark_Key_Aliases' );
		delete_option( 'Waymark_Key_Migration' );

		Waymark_Config::init();
	}

	/**
	 * Leave the options and the static config clean for the next test.
	 */
	public function tear_down() {
		delete_option( 'Waymark_Settings' );
		delete_option( 'Waymark_Key_Aliases' );
		delete_option( 'Waymark_Key_Migration' );

		Waymark_Config::init();

		parent::tear_down();
	}

	/**
	 * Find a row by its title.
	 *
	 * @param  array  $rows  Overlay type rows.
	 * @param  string $field Title field.
	 * @param  string $title Title to find.
	 * @return array|null    Row, or null when absent.
	 */
	private function find_row_by_title( $rows, $field, $title ) {
		foreach ( $rows as $row ) {
			if ( isset( $row[ $field ] ) && $row[ $field ] === $title ) {
				return $row;
			}
		}

		return null;
	}

	/**
	 * Every overlay type row carries a type_key, with an explicit key winning
	 * and missing keys derived from the title using both key formats.
	 */
	public function test_get_overlay_types_adds_type_key_and_derives_missing_keys() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access', 'Café Stop', 'Привет' ],
						'marker_key'   => [ 'custom_key', '', '' ],
					],
				],
			]
		);

		Waymark_Config::init();

		$rows = Waymark_Helper::get_overlay_types( 'marker' );

		$trail_access = $this->find_row_by_title( $rows, 'marker_title', 'Trail Access' );
		$cafe         = $this->find_row_by_title( $rows, 'marker_title', 'Café Stop' );
		$cyrillic     = $this->find_row_by_title( $rows, 'marker_title', 'Привет' );

		$this->assertNotNull( $trail_access );
		$this->assertSame( 'custom_key', $trail_access['type_key'], 'An explicit key should win.' );

		$this->assertNotNull( $cafe );
		$this->assertSame( 'caf_stop', $cafe['type_key'], 'A missing key should fall back to make_key().' );

		$this->assertNotNull( $cyrillic );
		$this->assertSame( 'privet', $cyrillic['type_key'], 'A Cyrillic title should fall back to make_key_js().' );
	}

	/**
	 * Without a key column, defaults still expose a derived type_key.
	 */
	public function test_get_overlay_types_falls_back_when_no_key_column_exists() {
		$rows = Waymark_Helper::get_overlay_types( 'marker' );

		$trail_access = $this->find_row_by_title( $rows, 'marker_title', 'Trail Access' );

		$this->assertNotNull( $trail_access );
		$this->assertSame( 'trail_access', $trail_access['type_key'] );
	}

	/**
	 * Explicit, legacy PHP and legacy JavaScript keys all resolve to one row.
	 */
	public function test_get_type_data_resolves_explicit_and_legacy_keys() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access' ],
						'marker_key'   => [ 'trail_access_explicit' ],
					],
				],
			]
		);

		Waymark_Config::init();

		$explicit = Waymark_Helper::get_type_data( 'marker', 'trail_access_explicit' );
		$php      = Waymark_Helper::get_type_data( 'marker', 'trail_access' );
		$js       = Waymark_Helper::get_type_data( 'marker', 'trailaccess' );

		$this->assertIsArray( $explicit );
		$this->assertSame( $explicit, $php, 'The legacy PHP key should resolve to the explicit row.' );
		$this->assertSame( $explicit, $js, 'The legacy JavaScript key should resolve to the explicit row.' );
		$this->assertSame( 'trail_access_explicit', $php['type_key'] );
	}

	/**
	 * build_overlay_content() reads properties.type, the stored GeoJSON field,
	 * rather than the legacy type_key property.
	 */
	public function test_build_overlay_content_uses_properties_type() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Photo', 'Trail Access' ],
						'marker_key'   => [ 'photo', 'trail_access' ],
					],
				],
			]
		);

		Waymark_Config::init();

		$feature = [
			'geometry'   => [
				'type'        => 'Point',
				'coordinates' => [ -128.0, 50.0 ],
			],
			'properties' => [
				'type' => 'trail_access',
			],
		];

		set_error_handler(
			function ( $errno, $errstr ) {
				throw new \ErrorException( $errstr, 0, $errno );
			},
			E_WARNING | E_NOTICE
		);

		try {
			$content = Waymark_Helper::build_overlay_content( $feature, 'marker' );
		} finally {
			restore_error_handler();
		}

		$this->assertStringContainsString( 'Trail Access', $content, 'The type title should come from properties.type.' );
		$this->assertStringNotContainsString( 'Photo', $content, 'The first configured type should not be used.' );
	}

	/**
	 * build_overlay_content() keeps reading the legacy type_key property.
	 */
	public function test_build_overlay_content_falls_back_to_legacy_type_key() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Photo', 'Trail Access' ],
						'marker_key'   => [ 'photo', 'trail_access' ],
					],
				],
			]
		);

		Waymark_Config::init();

		$feature = [
			'geometry'   => [
				'type'        => 'Point',
				'coordinates' => [ -128.0, 50.0 ],
			],
			'properties' => [
				'type'     => '',
				'type_key' => 'trail_access',
			],
		];

		$content = Waymark_Helper::build_overlay_content( $feature, 'marker' );

		$this->assertStringContainsString( 'Trail Access', $content, 'The legacy type_key should still resolve.' );
	}

	/**
	 * Meta keys and Map parameter names use the explicit meta_key.
	 */
	public function test_map_meta_and_parameters_use_explicit_meta_key() {
		update_option(
			'Waymark_Settings',
			[
				'meta' => [
					'inputs' => [
						'meta_title' => [ 'Beschreibung' ],
						'meta_key'   => [ 'description' ],
						'meta_type'  => [ 'text' ],
					],
				],
			]
		);

		Waymark_Config::init();

		$post_id = self::factory()->post->create(
			[
				'post_type'   => 'waymark_map',
				'post_status' => 'publish',
			]
		);

		update_post_meta( $post_id, 'waymark_map_description', 'Hello' );

		$map_meta = Waymark_Helper::get_map_meta(
			(object) [
				'post_id' => $post_id,
				'data'    => [ 'map_description' => 'Hello' ],
			]
		);

		$this->assertArrayHasKey( 'map_description', $map_meta, 'The explicit meta_key should build the meta name.' );
		$this->assertArrayNotHasKey( 'map_beschreibung', $map_meta );
		$this->assertSame( 'Hello', $map_meta['map_description']['meta_value'] );

		$Map = new Waymark_Map( $post_id );
		$parameters = $Map->get_parameters();

		$this->assertArrayHasKey( 'map_description', $parameters, 'Map parameter names should use the explicit meta_key.' );
		$this->assertArrayNotHasKey( 'map_beschreibung', $parameters );
		$this->assertSame( 'Hello', $Map->data['map_description'] );
	}

	/**
	 * Meta groups are keyed by group_key, and legacy group keys resolve via
	 * the alias map.
	 */
	public function test_meta_groups_use_group_key_and_resolve_legacy_alias() {
		update_option(
			'Waymark_Settings',
			[
				'meta' => [
					'groups' => [
						'group_title' => [ 'Details' ],
						'group_key'   => [ 'details_key' ],
					],
				],
			]
		);

		update_option(
			'Waymark_Key_Aliases',
			[
				'group' => [
					'details' => 'details_key',
				],
			]
		);

		Waymark_Config::init();

		$groups = Waymark_Helper::get_meta_groups();

		$this->assertArrayHasKey( 'details_key', $groups );
		$this->assertSame( 'details_key', $groups['details_key']['group_key'] );
		$this->assertSame( 'Details', $groups['details_key']['group_title'] );

		$grouped = Waymark_Helper::group_meta(
			[
				[
					'meta_key'   => 'map_details',
					'meta_group' => 'details',
				],
			]
		);

		$this->assertArrayHasKey( 'details_key', $grouped, 'The legacy group key should resolve through the alias.' );
		$this->assertArrayHasKey( 'map_details', $grouped['details_key'] );
	}

	/**
	 * The map config exposes type_key rows and a top-level alias map.
	 */
	public function test_map_config_includes_type_keys_and_top_level_aliases() {
		update_option(
			'Waymark_Key_Aliases',
			[
				'marker' => [
					'old_marker' => 'photo',
				],
				'line' => [
					'old_line' => 'red',
				],
				'shape' => [
					'old_shape' => 'red',
				],
				'meta' => [
					'old_meta' => 'description',
				],
			]
		);

		Waymark_Config::init();

		$config = Waymark_Config::get_map_config();

		foreach ( [ 'marker_types', 'line_types', 'shape_types' ] as $type_group ) {
			$this->assertNotEmpty( $config['map_options'][ $type_group ] );

			foreach ( $config['map_options'][ $type_group ] as $row ) {
				$this->assertArrayHasKey( 'type_key', $row, $type_group . ' rows should carry type_key.' );
			}
		}

		$this->assertSame( [ 'old_marker' => 'photo' ], $config['type_aliases']['marker'] );
		$this->assertSame( [ 'old_line' => 'red' ], $config['type_aliases']['line'] );
		$this->assertSame( [ 'old_shape' => 'red' ], $config['type_aliases']['shape'] );
		$this->assertArrayNotHasKey( 'meta', $config['type_aliases'], 'Only overlay aliases belong in the map config.' );
		$this->assertArrayNotHasKey( 'type_aliases', $config['map_options'] );
	}

	/**
	 * The migration writes key columns and aliases without rewriting map data.
	 */
	public function test_migration_populates_keys_and_aliases_idempotently() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access' ],
					],
				],
			]
		);

		Waymark_Config::init();

		$post_id = self::factory()->post->create(
			[
				'post_type'   => 'waymark_map',
				'post_status' => 'publish',
			]
		);

		$FeatureCollection = [
			'type'     => 'FeatureCollection',
			'features' => [
				[
					'type'       => 'Feature',
					'geometry'   => [
						'type'        => 'Point',
						'coordinates' => [ -68.74923, 51.38436 ],
					],
					'properties' => [
						'type'  => 'trailaccess',
						'title' => 'Trail marker',
					],
				],
			],
		];

		update_post_meta( $post_id, 'waymark_map_data', wp_json_encode( $FeatureCollection ) );
		update_post_meta( $post_id, 'waymark_map_description', 'Existing description' );

		Waymark_Install::migrate_i18n_keys();

		$settings = get_option( 'Waymark_Settings' );

		$this->assertArrayHasKey( 'marker_key', $settings['markers']['marker_types'] );
		$this->assertNotEmpty( $settings['markers']['marker_types']['marker_key'][0], 'The marker key column should be populated.' );

		$marker_key = $settings['markers']['marker_types']['marker_key'][0];

		$resolved = Waymark_Helper::get_type_data( 'marker', 'trail_access' );
		$this->assertIsArray( $resolved, 'The legacy PHP key should resolve through the alias.' );
		$this->assertSame( $marker_key, $resolved['type_key'] );

		$resolved_js = Waymark_Helper::get_type_data( 'marker', 'trailaccess' );
		$this->assertIsArray( $resolved_js );
		$this->assertSame( $marker_key, $resolved_js['type_key'] );

		$Map = new Waymark_Map( $post_id );
		$this->assertArrayHasKey( 'map_description', $Map->data, 'Existing map meta should still resolve after migration.' );
		$this->assertSame( 'Existing description', $Map->data['map_description'] );

		//Re-running the migration leaves both options untouched
		$settings_before = get_option( 'Waymark_Settings' );
		$aliases_before  = get_option( 'Waymark_Key_Aliases' );

		Waymark_Install::migrate_i18n_keys();

		$this->assertSame( $settings_before, get_option( 'Waymark_Settings' ), 'A second migration should be a no-op.' );
		$this->assertSame( $aliases_before, get_option( 'Waymark_Key_Aliases' ), 'Aliases should not change on a second run.' );
	}

	/**
	 * The settings sanitizer generates, preserves and deduplicates keys.
	 */
	public function test_settings_sanitizer_generates_preserves_and_deduplicates_keys() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access', 'Existing Row' ],
						'marker_key'   => [ 'trail_access', 'keep_me' ],
					],
				],
			]
		);

		$settings = new Waymark_Settings();

		$input = [
			'markers' => [
				'marker_types' => [
					'marker_title' => [ 'Trail Access', 'Existing Row', 'New Row', 'Trail Access' ],
				],
			],
		];

		$output = $settings->sanitize_callback( $input );
		$keys   = $output['markers']['marker_types']['marker_key'];

		$this->assertSame( 'trail_access', $keys[0], 'An existing key should be preserved.' );
		$this->assertSame( 'keep_me', $keys[1], 'An existing key should be preserved for its row.' );
		$this->assertSame( 'new_row', $keys[2], 'A new row should derive a key from its title.' );
		$this->assertSame( 'trail_access_2', $keys[3], 'Duplicate keys should be suffixed.' );
	}

	/**
	 * Submitted hidden keys travel with their own row when rows are reordered.
	 */
	public function test_settings_save_keeps_keys_with_their_titles_when_reordered() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access', 'Café Stop' ],
						'marker_key'   => [ 'trail_access', 'caf_stop' ],
					],
				],
			]
		);

		$settings = new Waymark_Settings();

		$input = [
			'markers' => [
				'marker_types' => [
					'marker_title' => [ 'Café Stop', 'Trail Access' ],
					'marker_key'   => [ 'caf_stop', 'trail_access' ],
				],
			],
		];

		$output = $settings->sanitize_callback( $input );
		$keys   = $output['markers']['marker_types']['marker_key'];

		$this->assertSame( 'caf_stop', $keys[0], 'The key should follow Café Stop, not the first current key.' );
		$this->assertSame( 'trail_access', $keys[1], 'The key should follow Trail Access, not the second current key.' );
	}

	/**
	 * Deleting a middle row leaves gapped POST indexes in the hidden key
	 * column while the title column is reindexed. Keys must still pair with
	 * their own rows in submitted order rather than by raw index.
	 */
	public function test_settings_save_pairs_gapped_keys_with_titles_after_deleting_a_row() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Beer', 'Food', 'Photo', 'Alert', 'Information', 'Camp' ],
						'marker_key'   => [ 'beer', 'food', 'photo', 'alert', 'information', 'camp' ],
					],
				],
			]
		);

		$settings = new Waymark_Settings();

		$input = [
			'markers' => [
				'marker_types' => [
					'marker_title' => [
						0 => 'Beer',
						2 => 'Photo',
						3 => 'Alert',
					],
					'marker_key'   => [
						0 => 'beer',
						2 => 'photo',
						3 => 'alert',
					],
				],
			],
		];

		$output = $settings->sanitize_callback( $input );
		$keys   = $output['markers']['marker_types']['marker_key'];

		$this->assertSame( [ 'beer', 'photo', 'alert' ], array_values( $keys ), 'Gapped submitted keys should pair by row order, not raw POST index.' );
	}

	/**
	 * Gapped indexes combined with a new row order keep every key with its
	 * own title.
	 */
	public function test_settings_save_pairs_gapped_keys_with_titles_when_reordered() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access', 'Beer', 'Café Stop' ],
						'marker_key'   => [ 'trail_access', 'beer', 'caf_stop' ],
					],
				],
			]
		);

		$settings = new Waymark_Settings();

		$input = [
			'markers' => [
				'marker_types' => [
					'marker_title' => [
						0 => 'Café Stop',
						2 => 'Beer',
						3 => 'Trail Access',
					],
					'marker_key'   => [
						0 => 'caf_stop',
						2 => 'beer',
						3 => 'trail_access',
					],
				],
			],
		];

		$output = $settings->sanitize_callback( $input );
		$keys   = $output['markers']['marker_types']['marker_key'];

		$this->assertSame( [ 'caf_stop', 'beer', 'trail_access' ], array_values( $keys ), 'Each key should follow its own title.' );
	}

	/**
	 * An old form submits no key column, so keys are matched by title.
	 */
	public function test_settings_save_matches_keys_by_title_when_key_column_is_absent() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access', 'Café Stop' ],
						'marker_key'   => [ 'trail_access', 'caf_stop' ],
					],
				],
			]
		);

		$settings = new Waymark_Settings();

		$input = [
			'markers' => [
				'marker_types' => [
					'marker_title' => [ 'Café Stop', 'Trail Access' ],
				],
			],
		];

		$output = $settings->sanitize_callback( $input );
		$keys   = $output['markers']['marker_types']['marker_key'];

		$this->assertSame( 'caf_stop', $keys[0], 'The existing key should follow Café Stop.' );
		$this->assertSame( 'trail_access', $keys[1], 'The existing key should follow Trail Access.' );
	}

	/**
	 * The settings screen renders a hidden key input carrying the joined keys.
	 */
	public function test_settings_renderer_outputs_hidden_key_input() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access', 'Café Stop' ],
						'marker_key'   => [ 'trail_access', 'caf_stop' ],
					],
				],
			]
		);

		$_GET['content'] = 'waymark-settings-tab-markers';

		$settings = new Waymark_Settings();
		$settings->register_settings();

		ob_start();
		$settings->content_admin_page();
		$html = ob_get_clean();

		unset( $_GET['content'] );

		$separator = Waymark_Config::get_item( 'multi_value_seperator' );

		$this->assertGreaterThanOrEqual( 1, substr_count( $html, 'waymark-key-row' ), 'A hidden key row should be rendered.' );
		$this->assertSame( 1, substr_count( $html, 'name="Waymark_Settings[markers][marker_types][marker_key]"' ) );
		$this->assertStringContainsString( 'class="waymark-input waymark-input-marker_key"', $html );
		$this->assertStringContainsString( 'value="' . implode( $separator, [ 'trail_access', 'caf_stop' ] ) . '"', $html, 'The hidden input should carry the joined keys.' );
	}

	/**
	 * A legacy meta_group alias resolves to the canonical group and the Meta
	 * field is rendered rather than dropped.
	 */
	public function test_map_resolves_legacy_group_alias_and_keeps_the_meta_field() {
		update_option(
			'Waymark_Settings',
			[
				'meta' => [
					'groups' => [
						'group_title' => [ 'Details' ],
						'group_key'   => [ 'details_key' ],
					],
					'inputs' => [
						'meta_title'      => [ 'Description' ],
						'meta_key'        => [ 'description' ],
						'meta_type'       => [ 'text' ],
						'meta_group'      => [ 'details' ],
						'meta_default'    => [ '' ],
						'meta_tip'        => [ '' ],
						'meta_submission' => [ '0' ],
					],
				],
			]
		);

		update_option(
			'Waymark_Key_Aliases',
			[
				'group' => [
					'details' => 'details_key',
				],
			]
		);

		Waymark_Config::init();

		$post_id = self::factory()->post->create(
			[
				'post_type'   => 'waymark_map',
				'post_status' => 'publish',
			]
		);

		$Map        = new Waymark_Map( $post_id );
		$parameters = $Map->get_parameters();

		$this->assertArrayHasKey( 'map_description', $parameters );
		$this->assertSame( 'details_key', $parameters['map_description']['group'], 'The legacy alias should resolve to the canonical group key.' );

		$html = $Map->create_form();

		$this->assertStringContainsString( 'name="map_description"', $html, 'The Meta field should survive parameter grouping.' );
		$this->assertStringContainsString( 'waymark-parameter-group-details_key', $html );
	}

	/**
	 * Fields in an unknown or deleted group are kept in the ungrouped bucket.
	 */
	public function test_create_parameter_groups_keeps_fields_from_unknown_groups() {
		$fields = [
			'map_description' => [
				'name'  => 'map_description',
				'id'    => 'map_description',
				'type'  => 'text',
				'title' => 'Description',
				'group' => 'deleted_group',
			],
		];

		$groups = [
			'details_key' => [
				'group_title' => 'Details',
			],
		];

		$html = Waymark_Input::create_parameter_groups( $fields, $groups, [], null, '', '' );

		$this->assertStringContainsString( 'name="map_description"', $html, 'A field in an unknown group should not disappear.' );
	}

	/**
	 * A zero-row section returns no rows, and migration adds no phantom key row.
	 */
	public function test_zero_row_section_returns_no_rows_and_migration_adds_no_key_row() {
		update_option(
			'Waymark_Settings',
			[
				'meta' => [
					'groups' => [
						'group_title' => [],
						'group_key'   => [],
					],
				],
			]
		);

		Waymark_Config::init();

		$this->assertSame( [], Waymark_Config::get_item( 'meta', 'groups', true ), 'A zero-row section should expose no rows.' );

		Waymark_Install::migrate_i18n_keys();

		$settings = get_option( 'Waymark_Settings' );

		$this->assertArrayNotHasKey( 'group_key', $settings['meta']['groups'], 'Migration should not add a phantom key row.' );
		$this->assertSame( [], $settings['meta']['groups']['group_title'] );
	}

	/**
	 * update_check() migrates on every admin_init, even without a version change.
	 */
	public function test_update_check_migrates_when_version_is_unchanged() {
		update_option(
			'Waymark_Settings',
			[
				'markers' => [
					'marker_types' => [
						'marker_title' => [ 'Trail Access' ],
					],
				],
			]
		);

		Waymark_Config::init();

		update_option( 'Waymark_Version', Waymark_Config::get_item( 'plugin_version' ) );

		Waymark_Install::update_check();

		$settings = get_option( 'Waymark_Settings' );
		$aliases  = get_option( 'Waymark_Key_Aliases' );

		$this->assertArrayHasKey( 'marker_key', $settings['markers']['marker_types'], 'Keys should be written without a version change.' );
		$this->assertNotEmpty( $settings['markers']['marker_types']['marker_key'][0] );
		$this->assertArrayHasKey( 'trail_access', $aliases['marker'], 'Aliases should be written without a version change.' );
		$this->assertSame( '1', get_option( 'Waymark_Key_Migration' ) );

		//A second call is a no-op
		Waymark_Install::update_check();

		$this->assertSame( $settings, get_option( 'Waymark_Settings' ), 'A second check should not rewrite the settings.' );
		$this->assertSame( $aliases, get_option( 'Waymark_Key_Aliases' ), 'A second check should not rewrite the aliases.' );
	}
}
