<?php
/**
 * Release metadata parity tests.
 *
 * @package Waymark
 */

/**
 * Guards the release version metadata. The plugin header is the single source
 * of the version; package.json and the distributed readme are derived from it,
 * so they must never lead it and must agree with each other.
 */
class Test_Release extends WP_UnitTestCase {

	/**
	 * Resolve the plugin root directory.
	 *
	 * @return string Absolute path with a trailing slash.
	 */
	private function plugin_dir() {
		return dirname( __DIR__, 2 ) . '/';
	}

	/**
	 * Read the declared value for a readme.txt header line.
	 *
	 * @param string $label Header label without the trailing colon.
	 * @return string|null Header value, or null when the label is absent.
	 */
	private function readme_txt_value( $label ) {
		$contents = file_get_contents( $this->plugin_dir() . 'readme.txt' );

		$this->assertIsString( $contents, 'readme.txt should be readable.' );

		if ( preg_match( '/^' . preg_quote( $label, '/' ) . ':\s*(.+)$/m', $contents, $matches ) ) {
			return trim( $matches[1] );
		}

		return null;
	}

	/**
	 * Read the version declared in the plugin header.
	 *
	 * @return string Plugin header version.
	 */
	private function plugin_version() {
		$headers = get_file_data(
			$this->plugin_dir() . 'Waymark.php',
			[
				'Version' => 'Version',
			],
			'plugin'
		);

		return $headers['Version'];
	}

	/**
	 * Read the version declared in package.json.
	 *
	 * @return string package.json version.
	 */
	private function package_version() {
		$contents = file_get_contents( $this->plugin_dir() . 'package.json' );

		$this->assertIsString( $contents, 'package.json should be readable.' );

		$package = json_decode( $contents, true );

		$this->assertIsArray( $package, 'package.json should decode to an array.' );
		$this->assertArrayHasKey( 'version', $package, 'package.json should declare a "version" field.' );

		return $package['version'];
	}

	/**
	 * The plugin header declares a semantic version.
	 */
	public function test_plugin_header_declares_a_semantic_version() {
		$this->assertMatchesRegularExpression(
			'/^\d+\.\d+\.\d+$/',
			$this->plugin_version(),
			'Waymark.php should declare its Version in MAJOR.MINOR.PATCH form.'
		);
	}

	/**
	 * package.json declares a semantic version.
	 */
	public function test_package_json_declares_a_semantic_version() {
		$this->assertMatchesRegularExpression(
			'/^\d+\.\d+\.\d+$/',
			$this->package_version(),
			'package.json should declare its version in MAJOR.MINOR.PATCH form.'
		);
	}

	/**
	 * The distributed readme and package.json share the same version.
	 */
	public function test_stable_tag_matches_package_version() {
		$this->assertSame(
			$this->package_version(),
			$this->readme_txt_value( 'Stable tag' ),
			'readme.txt Stable tag and package.json version are written by the same grunt sync_version step, so a mismatch means a partial sync.'
		);
	}

	/**
	 * The derived versions never run ahead of the plugin header.
	 */
	public function test_derived_versions_never_lead_the_plugin_header() {
		$this->assertTrue(
			version_compare( $this->package_version(), $this->plugin_version(), '<=' ),
			'Waymark.php is the source of truth for the version and the derived files lag until CI syncs them after deploy, so package.json must never be ahead of the plugin header.'
		);
	}

	/**
	 * The changelog documents the plugin header version.
	 */
	public function test_readme_txt_has_changelog_entry_for_plugin_version() {
		$contents = file_get_contents( $this->plugin_dir() . 'readme.txt' );

		$this->assertIsString( $contents, 'readme.txt should be readable.' );
		$this->assertMatchesRegularExpression(
			'/^=\s*' . preg_quote( $this->plugin_version(), '/' ) . '\s*=$/m',
			$contents,
			'Bumping the Waymark.php Version requires a matching "= X.Y.Z =" section in the readme.txt == Changelog ==.'
		);
	}

	/**
	 * The generated readme.md mirrors readme.txt and the plugin header.
	 */
	public function test_generated_readme_is_in_sync() {
		$contents = file_get_contents( $this->plugin_dir() . 'readme.md' );

		$this->assertIsString( $contents, 'readme.md should be readable.' );
		$this->assertStringContainsString(
			'**Stable tag:** ' . $this->readme_txt_value( 'Stable tag' ),
			$contents,
			'readme.md is generated from readme.txt; regenerate it with npx grunt build_wp_md.'
		);
		$this->assertMatchesRegularExpression(
			'/^###\s*' . preg_quote( $this->plugin_version(), '/' ) . '\s*###$/m',
			$contents,
			'readme.md is generated from readme.txt; regenerate it with npx grunt build_wp_md.'
		);
	}
}
