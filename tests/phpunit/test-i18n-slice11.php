<?php
/**
 * Slice 11 localisation regression tests: decorative link arrows.
 *
 * @package Waymark
 */

/**
 * The arrow is decorative markup, so it must live outside translatable strings.
 */
class Test_I18n_Slice11 extends WP_UnitTestCase {

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
	 * The translation template carries the plain msgids and drops the arrows.
	 */
	public function test_pot_contains_plain_link_msgids_without_arrows() {
		$pot = file_get_contents( dirname( __DIR__, 2 ) . '/languages/waymark.pot' );

		$this->assertIsString( $pot );

		$new_msgids = [
			'Basemap Documentation',
			'Type Documentation',
			'Meta Documentation',
			'Submission Documentation',
			'See Examples',
			'Clustering Documentation',
			'Shortcode Documentation',
			'Elevation Styling',
			'Collection Documentation',
			'View Help',
			'Read the Docs',
		];

		foreach ( $new_msgids as $msgid ) {
			$this->assertStringContainsString( 'msgid "' . $msgid . '"', $pot, $msgid );
		}

		$retired_msgids = [
			'Basemap Documentation &raquo;',
			'Type Documentation &raquo;',
			'Meta Documentation &raquo;',
			'Submission Documentation &raquo;',
			'See Examples &raquo;',
			'Clustering Documentation &raquo;',
			'Shortcode Documentation &raquo;',
			'Elevation Styling &raquo;',
			'Collection Documentation &raquo;',
			'View Help &raquo;',
		];

		foreach ( $retired_msgids as $msgid ) {
			$this->assertStringNotContainsString( 'msgid "' . $msgid . '"', $pot, $msgid );
		}
	}

	/**
	 * No gettext call in the plugin may embed the decorative arrow entity.
	 */
	public function test_no_gettext_msgid_contains_the_arrow_entity() {
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( dirname( __DIR__, 2 ) . '/inc' )
		);

		$offenders = [];

		foreach ( $iterator as $file ) {
			if ( ! $file->isFile() || 'php' !== $file->getExtension() ) {
				continue;
			}

			$contents = file_get_contents( $file->getPathname() );

			if ( false !== strpos( $contents, '&raquo;' ) ) {
				$offenders[] = $file->getPathname();
			}
		}

		$this->assertSame( [], $offenders, 'The decorative arrow must not appear in PHP source or gettext msgids.' );
	}

	/**
	 * The arrow relies on the browser's bidi mirroring, with no RTL override.
	 *
	 * U+00BB is a bidi-mirrored character, so the browser already draws it
	 * pointing left in RTL. An explicit `[dir="rtl"]` override would flip the
	 * glyph a second time.
	 */
	public function test_arrow_relies_on_bidi_mirroring_without_an_rtl_override() {
		$root = dirname( __DIR__, 2 );

		$less = file_get_contents( $root . '/assets/less/shared.less' );

		$this->assertIsString( $less );
		$this->assertStringContainsString( '.waymark-arrow::after', $less );
		$this->assertStringContainsString( '\00BB', $less );
		$this->assertStringNotContainsString( '[dir="rtl"] .waymark-arrow', $less );
		$this->assertStringNotContainsString( '\00AB', $less );

		$stylesheets = glob( $root . '/assets/css/*.css' );

		$this->assertNotEmpty( $stylesheets );

		foreach ( $stylesheets as $stylesheet ) {
			$contents = file_get_contents( $stylesheet );
			$name     = basename( $stylesheet );

			$this->assertIsString( $contents );
			$this->assertStringContainsString( '.waymark-arrow::after', $contents, $name );
			$this->assertTrue(
				false !== strpos( $contents, '\00BB' ) || false !== strpos( $contents, '»' ),
				$name . ' must keep the base right-pointing arrow glyph.'
			);
			$this->assertStringNotContainsString( '[dir="rtl"] .waymark-arrow', $contents, $name );
			$this->assertStringNotContainsString( '[dir=rtl] .waymark-arrow', $contents, $name );
			$this->assertStringNotContainsString( '\00AB', $contents, $name );
		}
	}
}
