<?php
/**
 * Slice 8 localisation regression tests: canonical terminology and labels.
 *
 * @package Waymark
 */

require_once dirname( __DIR__, 2 ) . '/inc/Admin/Waymark_Settings.php';

/**
 * Covers the normalised Map/Collection labels and the per-section repeatable
 * add and new-row labels.
 */
class Test_I18n_Slice8 extends WP_UnitTestCase {

	/**
	 * Start every test from a pristine config.
	 */
	public function set_up() {
		parent::set_up();

		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();

		unset( $_GET['content'] );
	}

	/**
	 * Reset options after each test.
	 */
	public function tear_down() {
		unset( $_GET['content'] );

		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();

		parent::tear_down();
	}

	/**
	 * Render the Settings screen for a given content id.
	 *
	 * @param  string $content Settings nav content id.
	 * @return string          Rendered HTML.
	 */
	private function render_settings_page( $content ) {
		$_GET['content'] = $content;

		$settings = new Waymark_Settings();
		$settings->register_settings();

		ob_start();
		$settings->content_admin_page();
		$html = ob_get_clean();

		unset( $_GET['content'] );

		return $html;
	}

	/**
	 * The Map post type uses the canonical plural labels.
	 */
	public function test_map_post_type_uses_canonical_labels() {
		$labels = get_post_type_object( 'waymark_map' )->labels;

		$this->assertSame( 'Search Maps', $labels->search_items );
		$this->assertSame( 'No Maps found.', $labels->not_found );
		$this->assertSame( 'No Maps found in Trash.', $labels->not_found_in_trash );
		$this->assertSame( 'Maps list', $labels->items_list );
		$this->assertSame( 'Filter Maps list', $labels->filter_items_list );
	}

	/**
	 * The Collection taxonomy uses the canonical plural labels.
	 */
	public function test_collection_taxonomy_uses_canonical_labels() {
		$labels = get_taxonomy( 'waymark_collection' )->labels;

		$this->assertSame( 'Collections', $labels->menu_name );
		$this->assertSame( 'Parent Collection', $labels->parent_item );
		$this->assertSame( 'Add New Collection', $labels->add_new_item );
		$this->assertSame( 'Choose from the most used Collections', $labels->choose_from_most_used );
		$this->assertSame( 'No Collections found.', $labels->not_found );
		$this->assertSame( 'Collections list', $labels->items_list );
		$this->assertSame( 'Collections list navigation', $labels->items_list_navigation );
	}

	/**
	 * Each repeatable section exposes a specific add button and new-row caption.
	 */
	public function test_repeatable_sections_expose_add_and_new_labels() {
		$expected = [
			'waymark-settings-tab-tiles' => [
				'layers' => [ 'Add Basemap', 'New Basemap' ],
			],
			'waymark-settings-tab-markers' => [
				'marker_types' => [ 'Add Marker Type', 'New Marker Type' ],
			],
			'waymark-settings-tab-lines' => [
				'line_types' => [ 'Add Line Type', 'New Line Type' ],
			],
			'waymark-settings-tab-shapes' => [
				'shape_types' => [ 'Add Shape Type', 'New Shape Type' ],
			],
			'waymark-settings-tab-meta' => [
				'inputs' => [ 'Add Meta Field', 'New Meta Field' ],
				'groups' => [ 'Add Group', 'New Group' ],
			],
			'waymark-settings-tab-properties' => [
				'props' => [ 'Add Property', 'New Property' ],
			],
		];

		foreach ( $expected as $content => $sections ) {
			$html = $this->render_settings_page( $content );

			foreach ( $sections as $section => list( $add_label, $new_label ) ) {
				$pattern = '/waymark-settings-section-' . preg_quote( $section, '/' ) . '.*?<div class="waymark-repeatable"[^>]*data-add-label="([^"]*)"[^>]*data-new-label="([^"]*)"/s';

				$this->assertSame( 1, preg_match( $pattern, $html, $matches ), 'Missing repeatable container for ' . $section );
				$this->assertSame( $add_label, html_entity_decode( $matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8' ), $section . ' add label' );
				$this->assertSame( $new_label, html_entity_decode( $matches[2], ENT_QUOTES | ENT_HTML5, 'UTF-8' ), $section . ' new label' );
			}
		}
	}

	/**
	 * Boolean fields without custom options render the default Yes/No pair.
	 */
	public function test_boolean_fields_render_default_yes_no_options() {
		$html = $this->render_settings_page( 'waymark-settings-tab-misc' );

		$fields = [ 'show_gallery', 'show_filter', 'show_cluster', 'debug_mode' ];

		foreach ( $fields as $field ) {
			$pattern = '/<select[^>]*class="[^"]*waymark-input-' . preg_quote( $field, '/' ) . '(?:\s[^"]*)?"[^>]*>(.*?)<\/select>/s';

			$this->assertSame( 1, preg_match( $pattern, $html, $matches ), 'Missing the ' . $field . ' field.' );

			$this->assertSame( 2, substr_count( $matches[1], '<option' ), $field . ' option count' );
			$this->assertStringContainsString( '>Yes</option>', $matches[1], $field . ' Yes option' );
			$this->assertStringContainsString( '>No</option>', $matches[1], $field . ' No option' );
			$this->assertStringNotContainsString( 'Enabled', $matches[1], $field . ' Enabled option' );
			$this->assertStringNotContainsString( 'Disabled', $matches[1], $field . ' Disabled option' );
			$this->assertStringNotContainsString( '>Enable</option>', $matches[1], $field . ' Enable option' );
			$this->assertStringNotContainsString( '>Disable</option>', $matches[1], $field . ' Disable option' );
		}
	}
}
