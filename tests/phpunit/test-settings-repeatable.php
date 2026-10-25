<?php
/**
 * Repeatable settings normalisation tests.
 *
 * @package Waymark
 */

/**
 * Regression tests for repeatable settings columns that drift out of step.
 *
 * A repeatable column that is shorter than its siblings, nested, or missing
 * entirely must still produce complete rows without emitting PHP warnings.
 */
class Test_Settings_Repeatable extends WP_UnitTestCase {

	/**
	 * Start every test from a pristine config: no option saved, defaults loaded.
	 */
	public function set_up() {
		parent::set_up();

		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();
	}

	/**
	 * Leave the option and the static config clean for the next test.
	 */
	public function tear_down() {
		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();

		parent::tear_down();
	}

	/**
	 * Read the tile layers repeatable setting, capturing any PHP warnings.
	 *
	 * @return array Rows and captured warning messages.
	 */
	private function get_layers_capturing_warnings() {
		$warnings = [];

		set_error_handler(
			function ( $errno, $errstr ) use ( &$warnings ) {
				$warnings[] = $errstr;

				return true;
			},
			E_WARNING
		);

		try {
			$rows = Waymark_Config::get_item( 'tiles', 'layers', true );
		} finally {
			restore_error_handler();
		}

		return [ $rows, $warnings ];
	}

	/**
	 * A short column is padded by repeating its own last value, without warnings.
	 */
	public function test_ragged_column_is_padded_without_warning() {
		update_option(
			'Waymark_Settings',
			[
				'tiles' => [
					'layers' => [
						'layer_name'        => [ 'Layer A', 'Layer B' ],
						'layer_url'         => [ 'https://a.example/{z}', 'https://b.example/{z}' ],
						'layer_attribution' => [ 'Attribution A', 'Attribution B' ],
						'layer_max_zoom'    => '18',
					],
				],
			]
		);

		Waymark_Config::init();

		list( $rows, $warnings ) = $this->get_layers_capturing_warnings();

		$this->assertSame( [], $warnings, 'A ragged repeatable column should not emit PHP warnings.' );
		$this->assertCount( 2, $rows, 'Two layer rows should be returned.' );

		foreach ( [ 0, 1 ] as $row_index ) {
			foreach ( [ 'layer_name', 'layer_url', 'layer_attribution', 'layer_max_zoom' ] as $column_key ) {
				$this->assertArrayHasKey( $column_key, $rows[ $row_index ], "Row {$row_index} should contain {$column_key}." );
			}
		}

		$this->assertSame( '18', $rows[0]['layer_max_zoom'], 'Row 0 should keep the seeded max zoom.' );
		$this->assertSame( $rows[0]['layer_max_zoom'], $rows[1]['layer_max_zoom'], 'Row 1 should repeat the short column\'s last value.' );
	}

	/**
	 * Nested column values are flattened into one value per row, without warnings.
	 */
	public function test_nested_column_is_flattened_without_warning() {
		update_option(
			'Waymark_Settings',
			[
				'tiles' => [
					'layers' => [
						'layer_name'        => [ 'Layer A', 'Layer B' ],
						'layer_url'         => [ [ 'a' ], [ 'b' ] ],
						'layer_attribution' => [ 'Attribution A', 'Attribution B' ],
						'layer_max_zoom'    => [ '18', '19' ],
					],
				],
			]
		);

		Waymark_Config::init();

		list( $rows, $warnings ) = $this->get_layers_capturing_warnings();

		$this->assertSame( [], $warnings, 'A nested repeatable column should not emit PHP warnings.' );
		$this->assertCount( 2, $rows, 'Two layer rows should be returned.' );
		$this->assertSame( 'a', $rows[0]['layer_url'], 'Row 0 should hold the first flattened URL.' );
		$this->assertSame( 'b', $rows[1]['layer_url'], 'Row 1 should hold the second flattened URL.' );
	}

	/**
	 * A scalar column is treated as a one-row column and repeated, without warnings.
	 */
	public function test_scalar_column_is_repeated_without_warning() {
		update_option(
			'Waymark_Settings',
			[
				'tiles' => [
					'layers' => [
						'layer_name'        => [ 'Layer A', 'Layer B' ],
						'layer_url'         => [ 'https://a.example/{z}', 'https://b.example/{z}' ],
						'layer_attribution' => [ 'Attribution A', 'Attribution B' ],
						'layer_max_zoom'    => '18',
					],
				],
			]
		);

		Waymark_Config::init();

		list( $rows, $warnings ) = $this->get_layers_capturing_warnings();

		$this->assertSame( [], $warnings, 'A scalar repeatable column should not emit PHP warnings.' );
		$this->assertCount( 2, $rows, 'Two layer rows should be returned.' );
		$this->assertSame( '18', $rows[0]['layer_max_zoom'], 'Row 0 should hold the scalar value.' );
		$this->assertSame( '18', $rows[1]['layer_max_zoom'], 'Row 1 should repeat the scalar value.' );
	}

	/**
	 * An omitted column still leaves the remaining columns as complete rows.
	 */
	public function test_missing_column_still_builds_complete_rows() {
		update_option(
			'Waymark_Settings',
			[
				'tiles' => [
					'layers' => [
						'layer_name'     => [ 'Layer A', 'Layer B' ],
						'layer_url'      => [ 'https://a.example/{z}', 'https://b.example/{z}' ],
						'layer_max_zoom' => [ '18', '19' ],
					],
				],
			]
		);

		Waymark_Config::init();

		list( $rows, $warnings ) = $this->get_layers_capturing_warnings();

		$this->assertSame( [], $warnings, 'An omitted repeatable column should not emit PHP warnings.' );
		$this->assertCount( 2, $rows, 'Two layer rows should be returned.' );

		foreach ( [ 0, 1 ] as $row_index ) {
			foreach ( [ 'layer_name', 'layer_url', 'layer_max_zoom' ] as $column_key ) {
				$this->assertArrayHasKey( $column_key, $rows[ $row_index ], "Row {$row_index} should contain {$column_key}." );
			}
		}

		$this->assertSame(
			array_keys( $rows[0] ),
			array_keys( $rows[1] ),
			'Rows should be rectangular even when a column is omitted.'
		);
	}

	/**
	 * Aligned columns are returned exactly as seeded (no behaviour change).
	 */
	public function test_aligned_columns_are_unchanged() {
		update_option(
			'Waymark_Settings',
			[
				'tiles' => [
					'layers' => [
						'layer_name'        => [ 'Layer A', 'Layer B' ],
						'layer_url'         => [ 'https://a.example/{z}', 'https://b.example/{z}' ],
						'layer_attribution' => [ 'Attribution A', 'Attribution B' ],
						'layer_max_zoom'    => [ '18', '19' ],
					],
				],
			]
		);

		Waymark_Config::init();

		list( $rows, $warnings ) = $this->get_layers_capturing_warnings();

		$expected = [
			[
				'layer_name'        => 'Layer A',
				'layer_url'         => 'https://a.example/{z}',
				'layer_attribution' => 'Attribution A',
				'layer_max_zoom'    => '18',
			],
			[
				'layer_name'        => 'Layer B',
				'layer_url'         => 'https://b.example/{z}',
				'layer_attribution' => 'Attribution B',
				'layer_max_zoom'    => '19',
			],
		];

		$this->assertSame( [], $warnings, 'Aligned repeatable columns should not emit PHP warnings.' );
		$this->assertSame( $expected, $rows, 'Aligned repeatable columns should be returned unchanged.' );
	}

	/**
	 * The meta inputs repeatable group is normalised the same way, without warnings.
	 */
	public function test_ragged_meta_inputs_are_normalised_without_warning() {
		update_option(
			'Waymark_Settings',
			[
				'meta' => [
					'inputs' => [
						'meta_title' => [ 'Title A', 'Title B' ],
						'meta_type'  => 'textarea_rich',
					],
				],
			]
		);

		Waymark_Config::init();

		$warnings = [];

		set_error_handler(
			function ( $errno, $errstr ) use ( &$warnings ) {
				$warnings[] = $errstr;

				return true;
			},
			E_WARNING
		);

		try {
			$rows = Waymark_Config::get_item( 'meta', 'inputs', true );
		} finally {
			restore_error_handler();
		}

		$this->assertSame( [], $warnings, 'A ragged meta inputs group should not emit PHP warnings.' );
		$this->assertCount( 2, $rows, 'Two meta input rows should be returned.' );
		$this->assertSame( 'Title A', $rows[0]['meta_title'], 'Row 0 should hold the first meta title.' );
		$this->assertSame( 'Title B', $rows[1]['meta_title'], 'Row 1 should hold the second meta title.' );
		$this->assertSame( 'textarea_rich', $rows[0]['meta_type'], 'Row 0 should hold the scalar meta type.' );
		$this->assertSame( $rows[0]['meta_type'], $rows[1]['meta_type'], 'Row 1 should repeat the scalar meta type.' );
		$this->assertSame(
			array_keys( $rows[0] ),
			array_keys( $rows[1] ),
			'Meta input rows should be rectangular.'
		);
	}
}
