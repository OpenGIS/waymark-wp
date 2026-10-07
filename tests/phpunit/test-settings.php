<?php
/**
 * Settings normalisation tests.
 *
 * @package Waymark
 */

/**
 * Regression tests for the settings normalisation (multi-value strings stored
 * in the Waymark_Settings option must be arrays once the config is loaded).
 */
class Test_Settings extends WP_UnitTestCase {

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
	 * The default supports setting is an array and Map revisions are supported.
	 */
	public function test_default_supports_is_array_and_revisions_supported() {
		$supports = Waymark_Config::get_setting( 'misc', 'post', 'supports' );

		$this->assertIsArray( $supports );
		$this->assertContains( 'title', $supports );
		$this->assertContains( 'author', $supports );
		$this->assertContains( 'revisions', $supports );
		$this->assertContains( 'thumbnail', $supports );

		$this->assertTrue( post_type_supports( 'waymark_map', 'revisions' ) );
	}

	/**
	 * A legacy multi-value supports string is normalised to an array at load.
	 */
	public function test_legacy_supports_string_is_normalised_to_array() {
		update_option(
			'Waymark_Settings',
			[
				'misc' => [
					'post' => [
						'supports' => 'title__multi__author__multi__revisions__multi__thumbnail',
					],
				],
			]
		);

		Waymark_Config::init();

		$supports = Waymark_Config::get_setting( 'misc', 'post', 'supports' );

		$this->assertIsArray( $supports );
		$this->assertSame( [ 'title', 'author', 'revisions', 'thumbnail' ], $supports );
	}

	/**
	 * Submission multi-value settings are normalised to arrays, including empty strings.
	 */
	public function test_submission_settings_are_normalised_to_arrays() {
		update_option(
			'Waymark_Settings',
			[
				'submission' => [
					'from_users' => [
						'submission_roles'    => 'editor__multi__author',
						'submission_features' => '',
					],
					'from_public' => [
						'submission_features' => '',
					],
				],
			]
		);

		Waymark_Config::init();

		$this->assertSame( [], Waymark_Config::get_setting( 'submission', 'from_users', 'submission_features' ) );
		$this->assertSame( [ 'editor', 'author' ], Waymark_Config::get_setting( 'submission', 'from_users', 'submission_roles' ) );
		$this->assertSame( [], Waymark_Config::get_setting( 'submission', 'from_public', 'submission_features' ) );
	}
}
