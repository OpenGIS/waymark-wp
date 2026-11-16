<?php
/**
 * Meta field render tests.
 *
 * @package Waymark
 */

/**
 * Covers how multi-select Meta values are escaped and rendered on the front
 * end, including newline handling and the escaping security boundary.
 */
class Test_Meta_Render extends WP_UnitTestCase {

	/**
	 * Configure a multi-select Meta field for every test.
	 */
	public function set_up() {
		parent::set_up();

		delete_option( 'Waymark_Settings' );

		update_option(
			'Waymark_Settings',
			[
				'meta' => [
					'inputs' => [
						'meta_title'      => [ 'Trailhead Status' ],
						'meta_key'        => [ 'trailhead_status' ],
						'meta_type'       => [ 'select_multi' ],
						'meta_options'    => [ 'Open,Partially Closed,Shut,Closure <script>alert(1)</script>' ],
						'meta_default'    => [ '' ],
						'meta_tip'        => [ '' ],
						'meta_group'      => [ '' ],
						'meta_shortcode'  => [ '1' ],
						'meta_submission' => [ '0' ],
					],
				],
			]
		);

		Waymark_Config::init();
	}

	/**
	 * Leave the options and the static config clean for the next test.
	 */
	public function tear_down() {
		delete_option( 'Waymark_Settings' );

		Waymark_Config::init();

		parent::tear_down();
	}

	/**
	 * Build a Map carrying the given stored value for the configured field.
	 *
	 * @param  string $value Stored Meta value.
	 * @return Waymark_Map   Map object.
	 */
	private function map_with_value( $value ) {
		$post_id = self::factory()->post->create(
			[
				'post_type'   => 'waymark_map',
				'post_status' => 'publish',
			]
		);

		$Map = new Waymark_Map( $post_id );
		$Map->set_data( [ 'waymark_map_trailhead_status' => $value ] );

		return $Map;
	}

	/**
	 * Read the Meta rows and rendered HTML for a Map.
	 *
	 * @param  Waymark_Map $Map Map object.
	 * @return array           Meta rows and rendered HTML.
	 */
	private function render_meta( $Map ) {
		$map_meta = Waymark_Helper::get_map_meta( $Map );

		return [ $map_meta, Waymark_Helper::map_meta_html( $map_meta ) ];
	}

	/**
	 * Multiple selected options are joined with newlines, without a trailing
	 * separator.
	 */
	public function test_multi_select_value_is_joined_with_newlines() {
		$Map      = $this->map_with_value( wp_json_encode( [ 'partially_closed', 'shut' ] ) );
		$map_meta = Waymark_Helper::get_map_meta( $Map );

		$this->assertArrayHasKey( 'map_trailhead_status', $map_meta );
		$this->assertSame( "Partially Closed\nShut", $map_meta['map_trailhead_status']['meta_value'] );
	}

	/**
	 * A multi-select value renders real line breaks between plain text labels,
	 * with no escaped markup and no trailing break.
	 */
	public function test_multi_select_renders_labels_without_escaped_or_trailing_breaks() {
		$Map = $this->map_with_value( wp_json_encode( [ 'partially_closed', 'shut' ] ) );

		list( , $html ) = $this->render_meta( $Map );

		$this->assertStringContainsString( 'Partially Closed<br />', $html );
		$this->assertStringContainsString( 'Shut', $html );
		$this->assertStringNotContainsString( '&lt;br', $html, 'The line break must not be escaped as text.' );
		$this->assertStringNotContainsString( 'Shut<br />', $html, 'The last label must not have a trailing break.' );
		$this->assertSame( 1, substr_count( $html, '<br />' ), 'There should be exactly one break between two labels.' );
	}

	/**
	 * A single selected option renders as plain text without a line break.
	 */
	public function test_single_multi_select_value_renders_without_a_break() {
		$Map = $this->map_with_value( wp_json_encode( [ 'partially_closed' ] ) );

		list( $map_meta, $html ) = $this->render_meta( $Map );

		$this->assertSame( 'Partially Closed', $map_meta['map_trailhead_status']['meta_value'] );
		$this->assertStringContainsString( 'Partially Closed', $html );
		$this->assertSame( 0, substr_count( $html, '<br />' ), 'A single value should not render a line break.' );
	}

	/**
	 * HTML and script characters in option labels are escaped at output.
	 */
	public function test_multi_select_escapes_html_in_option_labels() {
		$key = Waymark_Helper::make_key( 'Closure <script>alert(1)</script>' );

		$Map = $this->map_with_value( wp_json_encode( [ $key ] ) );

		list( , $html ) = $this->render_meta( $Map );

		$this->assertStringContainsString( 'Closure', $html );
		$this->assertStringNotContainsString( '<script>', $html, 'Script markup in a label must not appear unescaped.' );
		$this->assertStringContainsString( '&lt;script&gt;', $html, 'Script markup should be escaped as text.' );
	}
}
