<?php
/**
 * Admin branding output tests.
 *
 * @package Waymark
 */

/**
 * Verifies the Open GIS branding rendered by the settings sidebar.
 */
class Test_Admin_Branding extends WP_UnitTestCase {

	/**
	 * The settings sidebar shows the Open GIS lead line, the documentation link
	 * and the version/debug state.
	 */
	public function test_plugin_about_renders_links_and_meta() {
		$output  = Waymark_Helper::plugin_about();
		$version = Waymark_Config::get_item( 'plugin_version' );

		preg_match( '/<div class="ogis-panel__heading">(.*?)<\/div>/s', $output, $heading );
		$this->assertArrayHasKey( 1, $heading, 'The settings sidebar should render a heading block.' );

		$heading_text = wp_strip_all_tags( str_replace( '</p>', ' </p>', $heading[1] ) );
		$this->assertSame( 'Open-Source by Open GIS.', trim( preg_replace( '/\s+/', ' ', $heading_text ) ) );

		preg_match_all( '/<a href="([^"]+)" rel="noopener noreferrer" target="_blank">([^<]+)<\/a>/', $heading[1], $heading_links, PREG_SET_ORDER );
		$this->assertCount( 2, $heading_links );
		$this->assertSame( [ 'https://github.com/opengis/waymark-wp', 'https://www.ogis.org' ], array_column( $heading_links, 1 ) );
		$this->assertSame( [ 'Open-Source', 'Open GIS' ], array_column( $heading_links, 2 ) );
		$this->assertStringContainsString( 'ogis-panel__links', $output );

		preg_match( '/<ul class="ogis-panel__links">(.*?)<\/ul>/s', $output, $matches );
		$this->assertArrayHasKey( 1, $matches, 'The settings sidebar should render a links list.' );

		preg_match_all( '/<a href="([^"]+)">([^<]+) <span class="waymark-arrow" aria-hidden="true"><\/span><\/a>/', $matches[1], $links, PREG_SET_ORDER );

		$this->assertCount( 1, $links );
		$this->assertSame( [ 'https://www.ogis.org/waymark-wp/' ], array_column( $links, 1 ) );
		$this->assertSame( [ 'Read the Docs' ], array_column( $links, 2 ) );

		preg_match( '/<p class="ogis-panel__meta">(.*?)<\/p>/s', $output, $meta );
		$this->assertArrayHasKey( 1, $meta, 'The settings sidebar should render a meta line.' );

		$meta_text = wp_strip_all_tags( $meta[1] );
		$this->assertStringContainsString( 'v' . $version, $meta_text );
		$this->assertStringContainsString( 'Debug:', $meta_text );
	}

	/**
	 * The settings sidebar renders its heading and the stacked Waymark and
	 * Open GIS brand images.
	 */
	public function test_plugin_about_renders_settings_heading_and_brand_images() {
		$output = Waymark_Helper::plugin_about();

		preg_match( '/<h1 class="waymark-settings-sidebar__title">([^<]+)<\/h1>/', $output, $sidebar_title );
		$this->assertArrayHasKey( 1, $sidebar_title, 'The settings sidebar should render a title heading.' );
		$this->assertSame( 'Settings', $sidebar_title[1] );

		preg_match( '/<div class="ogis-panel__brand">(.*?)<\/div>/s', $output, $brand );
		$this->assertArrayHasKey( 1, $brand, 'The settings sidebar should render a brand block.' );

		preg_match_all( '/<img class="([^"]+)" src="([^"]+)" alt="([^"]+)" width="48" height="48" \/>/', $brand[1], $brand_images, PREG_SET_ORDER );
		$this->assertCount( 2, $brand_images, 'The brand block should contain both stacked brand images.' );
		$this->assertSame( [ 'ogis-panel__waymark', 'ogis-panel__logo' ], array_column( $brand_images, 1 ) );
		$this->assertSame( [ 'Waymark', 'Open GIS' ], array_column( $brand_images, 3 ) );
		$this->assertStringEndsWith( 'img/waymark-icon-white.png', $brand_images[0][2] );
		$this->assertStringEndsWith( 'img/ogis-logo-white.svg', $brand_images[1][2] );
	}

	/**
	 * Documentation links are appended to the configured site root, including
	 * landing-page anchors and paths with or without a leading slash.
	 */
	public function test_site_url_appends_documentation_paths() {
		$base = trailingslashit( Waymark_Config::get_item( 'site_url' ) );

		$this->assertSame( $base, Waymark_Helper::site_url() );
		$this->assertSame(
			$base . 'customising/settings/#tiles',
			Waymark_Helper::site_url( 'customising/settings/#tiles' )
		);
		$this->assertSame( $base . '#shortcodes', Waymark_Helper::site_url( '#shortcodes' ) );
		$this->assertSame(
			$base . 'features/submissions/',
			Waymark_Helper::site_url( '/features/submissions/' )
		);
	}
}
