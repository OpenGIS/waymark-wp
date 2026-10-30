<?php
/**
 * Slice 10 localisation regression tests: locale-aware display formatting.
 *
 * @package Waymark
 */

/**
 * Covers the BCP-47 locale passed to JS and the complete elevation/geocoder
 * labels that replaced the old trailing-space fragments.
 */
class Test_I18n_Slice10 extends WP_UnitTestCase {

	/**
	 * Start every test from a pristine config.
	 */
	public function set_up() {
		parent::set_up();

		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();
	}

	/**
	 * Reset options after each test.
	 */
	public function tear_down() {
		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();

		parent::tear_down();
	}

	/**
	 * The JavaScript labels are complete strings without trailing spaces.
	 */
	public function test_js_lang_labels_have_no_trailing_spaces() {
		$lang = Waymark_Lang::get_js_lang();

		$expected = [
			'label_total_length' => 'Total Length:',
			'label_max_elevation' => 'Max Elevation:',
			'label_min_elevation' => 'Min Elevation:',
			'label_ascent' => 'Total Ascent:',
			'label_descent' => 'Total Descent:',
		];

		foreach ( $expected as $key => $value ) {
			$this->assertSame( $value, $lang[ $key ], $key );
			$this->assertSame( rtrim( $lang[ $key ] ), $lang[ $key ], $key . ' has a trailing space' );
		}
	}

	/**
	 * The new elevation and geocoder keys carry the expected English values.
	 */
	public function test_js_lang_contains_new_keys() {
		$lang = Waymark_Lang::get_js_lang();

		$expected = [
			'label_altitude' => 'Altitude',
			'label_download' => 'Download',
			'label_unit_km' => 'km',
			'label_unit_m' => 'm',
			'label_unit_mi' => 'mi',
			'label_unit_ft' => 'ft',
			'error_geocoder' => 'Nothing found.',
		];

		foreach ( $expected as $key => $value ) {
			$this->assertArrayHasKey( $key, $lang );
			$this->assertSame( $value, $lang[ $key ] );
		}
	}

	/**
	 * The map config exposes the site locale as a BCP-47 tag.
	 */
	public function test_map_config_locale_is_bcp47() {
		$config = Waymark_Config::get_map_config();

		$this->assertArrayHasKey( 'locale', $config );
		$this->assertNotSame( '', $config['locale'] );
		$this->assertStringNotContainsString( '_', $config['locale'] );

		$expected = function_exists( 'determine_locale' ) ? determine_locale() : get_locale();

		$this->assertSame( str_replace( '_', '-', $expected ), $config['locale'] );
	}

	/**
	 * The translation template carries the new complete msgids only.
	 */
	public function test_pot_contains_new_msgids_without_trailing_spaces() {
		$pot = file_get_contents( dirname( __DIR__, 2 ) . '/languages/waymark.pot' );

		$this->assertIsString( $pot );

		$new_msgids = [
			'Total Length:',
			'Max Elevation:',
			'Min Elevation:',
			'Total Ascent:',
			'Total Descent:',
			'Altitude',
			'Download',
			'km',
			'm',
			'mi',
			'ft',
			'Nothing found.',
		];

		foreach ( $new_msgids as $msgid ) {
			$this->assertStringContainsString( 'msgid "' . $msgid . '"', $pot, $msgid );
		}

		$retired_msgids = [
			'Total Length: ',
			'Max. Elevation: ',
			'Min. Elevation: ',
			'Total Ascent: ',
			'Total Descent: ',
		];

		foreach ( $retired_msgids as $msgid ) {
			$this->assertStringNotContainsString( 'msgid "' . $msgid . '"', $pot, $msgid );
		}
	}
}
