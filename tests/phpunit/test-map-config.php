<?php
/**
 * Map config default-view tests.
 *
 * @package Waymark
 */

/**
 * Regression coverage for issue #86: the shared Map config must expose the
 * configured default centre and zoom so the viewer can load a Map before any
 * data is fitted.
 */
class Test_Map_Config extends WP_UnitTestCase {

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
	 * Save Map options and reload the static config.
	 *
	 * @param array $map_options Map options to save under misc > map_options.
	 */
	private function save_map_options( array $map_options ) {
		update_option(
			'Waymark_Settings',
			[
				'misc' => [
					'map_options' => $map_options,
				],
			]
		);

		Waymark_Config::init();
	}

	/**
	 * Return the Map options from the unencoded Map config.
	 *
	 * @return array
	 */
	private function map_options() {
		$config = Waymark_Config::get_map_config();

		return $config['map_options'];
	}

	/**
	 * The shipped defaults are exposed as a typed centre and zoom.
	 */
	public function test_default_map_view_is_exposed_as_typed_values() {
		$options = $this->map_options();

		$this->assertSame( [ 51.38436, -68.74923 ], $options['map_default_latlng'] );
		$this->assertSame( 9, $options['map_default_zoom'] );
	}

	/**
	 * A valid saved centre and zoom are exposed as a float array and an integer.
	 */
	public function test_saved_map_view_is_exposed_as_typed_values() {
		$this->save_map_options(
			[
				'map_default_latlng' => '50.6539,-128.0094',
				'map_default_zoom'   => '10',
			]
		);

		$options = $this->map_options();

		$this->assertSame( [ 50.6539, -128.0094 ], $options['map_default_latlng'] );
		$this->assertSame( 10, $options['map_default_zoom'] );
	}

	/**
	 * An empty saved centre and zoom stay null at the config layer instead of
	 * leaking falsy strings into the JavaScript config.
	 */
	public function test_empty_saved_map_view_is_null() {
		$this->save_map_options(
			[
				'map_default_latlng' => '',
				'map_default_zoom'   => '',
			]
		);

		$options = $this->map_options();

		$this->assertNull( $options['map_default_latlng'] );
		$this->assertNull( $options['map_default_zoom'] );
	}

	/**
	 * An invalid saved centre and zoom stay null at the config layer.
	 */
	public function test_invalid_saved_map_view_is_null() {
		$this->save_map_options(
			[
				'map_default_latlng' => 'not-a-latlng',
				'map_default_zoom'   => 'not-a-zoom',
			]
		);

		$options = $this->map_options();

		$this->assertNull( $options['map_default_latlng'] );
		$this->assertNull( $options['map_default_zoom'] );
	}

	/**
	 * The encoded Map config is valid JSON and round-trips both values.
	 */
	public function test_encoded_map_config_round_trips_map_view() {
		$this->save_map_options(
			[
				'map_default_latlng' => '50.6539,-128.0094',
				'map_default_zoom'   => '10',
			]
		);

		$encoded = Waymark_Config::get_map_config( true );

		$this->assertIsString( $encoded );

		$decoded = json_decode( $encoded, true );

		$this->assertIsArray( $decoded, 'Encoded Map config is not valid JSON: ' . json_last_error_msg() );
		$this->assertSame( [ 50.6539, -128.0094 ], $decoded['map_options']['map_default_latlng'] );
		$this->assertSame( 10, $decoded['map_options']['map_default_zoom'] );
	}
}
