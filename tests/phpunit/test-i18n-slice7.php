<?php
/**
 * Slice 7 localisation regression tests: split sentences and kses allowlists.
 *
 * @package Waymark
 */

require_once ABSPATH . 'wp-admin/includes/screen.php';
require_once dirname( __DIR__, 2 ) . '/inc/Admin/Waymark_Settings.php';

/**
 * Covers the oversized-string split and the admin/settings kses allowlists.
 */
class Test_I18n_Slice7 extends WP_UnitTestCase {

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
	 * Reset globals and options after each test.
	 */
	public function tear_down() {
		unset( $_GET['content'] );
		unset( $GLOBALS['post'] );

		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();

		parent::tear_down();
	}

	/**
	 * Decode a quoted string from a POT entry.
	 *
	 * @param  string $value Quoted string, including the surrounding quotes.
	 * @return string        Decoded string.
	 */
	private function pot_unquote( $value ) {
		return stripcslashes( substr( $value, 1, -1 ) );
	}

	/**
	 * Parse the translation template into entries keyed by context and msgid.
	 *
	 * @param  string $path Optional POT path.
	 * @return array        Entries indexed by "msgctxt\0msgid".
	 */
	private function pot_entries( $path = null ) {
		if ( null === $path ) {
			$path = dirname( __DIR__, 2 ) . '/languages/waymark.pot';
		}

		$pot = file_get_contents( $path );

		$this->assertIsString( $pot );

		$entries = [];

		foreach ( preg_split( '/\R{2,}/', $pot ) as $block ) {
			$entry = [
				'comments' => [],
				'msgctxt'  => null,
				'msgid'    => null,
				'plural'   => null,
			];

			$field = null;

			foreach ( preg_split( '/\R/', $block ) as $line ) {
				$line = rtrim( $line );

				if ( '' === $line ) {
					continue;
				}

				if ( 0 === strpos( $line, '#.' ) ) {
					$entry['comments'][] = trim( substr( $line, 2 ) );
					$field               = null;
					continue;
				}

				if ( 0 === strpos( $line, '#' ) ) {
					$field = null;
					continue;
				}

				if ( preg_match( '/^(msgctxt|msgid_plural|msgid)\s+(".*")$/', $line, $matches ) ) {
					$field = 'msgid_plural' === $matches[1] ? 'plural' : $matches[1];

					$entry[ $field ] = $this->pot_unquote( $matches[2] );
					continue;
				}

				if ( '"' === substr( $line, 0, 1 ) && null !== $field ) {
					$entry[ $field ] .= $this->pot_unquote( $line );
					continue;
				}

				$field = null;
			}

			$entries[ $entry['msgctxt'] . "\0" . $entry['msgid'] ] = $entry;
		}

		return $entries;
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
	 * Render the admin notice for a fabricated screen.
	 *
	 * @param  object $screen Screen object.
	 * @return string         Rendered HTML.
	 */
	private function render_admin_notice( $screen ) {
		$admin = new Waymark_Admin();

		$property = new ReflectionProperty( Waymark_Admin::class, 'current_screen' );
		$property->setAccessible( true );
		$property->setValue( $admin, $screen );

		ob_start();
		$admin->admin_notices();
		$html = ob_get_clean();

		return $html;
	}

	/**
	 * Build a fake current-screen object.
	 *
	 * @param  array $properties Screen properties.
	 * @return object            Screen object.
	 */
	private function screen( array $properties ) {
		return (object) array_merge(
			[
				'base'      => '',
				'taxonomy'  => null,
				'post_type' => '',
				'id'        => '',
				'action'    => '',
			],
			$properties
		);
	}

	/**
	 * Return the section description HTML for a section key.
	 *
	 * @param  string $html       Rendered settings HTML.
	 * @param  string $section    Section key.
	 * @return string             Description HTML.
	 */
	private function section_description( $html, $section ) {
		$pattern = '/<div class="waymark-settings-section waymark-settings-section-' . preg_quote( $section, '/' ) . '">.*?<div class="waymark-settings-section-description">(.*?)<\/div>/s';

		$this->assertSame( 1, preg_match( $pattern, $html, $matches ), 'Missing description for ' . $section );

		return $matches[1];
	}

	/**
	 * Return the section footer HTML for a section key.
	 *
	 * @param  string $html       Rendered settings HTML.
	 * @param  string $section    Section key.
	 * @return string             Footer HTML.
	 */
	private function section_footer( $html, $section ) {
		$pattern = '/<div class="waymark-settings-section waymark-settings-section-' . preg_quote( $section, '/' ) . '">.*?<div class="waymark-settings-section-footer">(.*?)<\/div>/s';

		$this->assertSame( 1, preg_match( $pattern, $html, $matches ), 'Missing footer for ' . $section );

		return $matches[1];
	}

	/**
	 * Slice 7 splits every oversized string into complete sentences.
	 */
	public function test_pot_contains_slice7_split_sentences() {
		$entries = $this->pot_entries();

		$expected = [
			// Basemaps.
			'Waymark uses the excellent <a href="%1$s">OpenStreetMap</a> as its default Basemap and supports many <a href="%2$s">other providers</a>.',
			'<a href="%1$s">Thunderforest</a> and <a href="%2$s">Mapbox</a> are examples of providers that offer easy access to beautiful Basemaps (including satellite imagery).',
			'They require registration, but have a free usage tier.',
			// Marker Label.
			'What kind of Marker is this? E.g. "Photo", "Grocery Store", "Warning!".',
			'Once saved, Marker labels cannot be edited.',
			'The Marker Label is displayed in the Tooltip (when hovering over the Marker) and in the Info Window (once the Marker is clicked).',
			'Hide in Settings > Misc. > Type Labels.',
			// Properties.
			'Read <a href="%s">GeoJSON</a> feature properties when importing.',
			'If Waymark finds data for the property keys below it will be stored when it is imported.',
			'These can be automatically appended to the Overlay Description, or accessed programmatically via the %s Object.',
			// Editor Features, both variants.
			'What features to offer in the Editor.',
			'Important! Uploaded images are added to the Media Library, reading from file does not keep a copy of the file on the server.',
			'Important! Uploaded images are added to the Media Library (see Upload Location below), reading from file does not keep a copy of the file on the server.',
			'Whether an individual Meta input is displayed can be set in Settings > Meta.',
			// Upload Location.
			'Images uploaded by non-registered users can be stored separately from other Media Library uploads, to aid with moderation.',
			'All uploaded images will be stored in a single directory (%s) found in the upload root.',
			// Sleep Options.
			'Waymark Maps will zoom when the user scrolls.',
			'This can cause some unexpected/annoying behaviour when scrolling a page.',
			'<b>Sleeping</b> the Map initially and <b>Waking</b> upon user interaction (i.e. hovering/clicking/tapping) may create a better experience.',
			// Shortcode Method.
			'Whether to load multiple Maps in the Background (uses AJAX to improve page load) when embedding with the Shortcode, or to Embed them within the page.',
			'Embedding may be a bad idea for LARGE COLLECTIONS, but can resolve some issues where Collections are not displaying correctly.',
			// Collections notice.
			'Collections allow you to organise your Maps.',
			'Use the <a href="%s">Shortcode</a> to display all Maps in a Collection at once.',
			'Read the Docs',
			// Creating a Map notice.
			'Use the Map <a href="%s">Editor</a> to place Markers, draw Lines/Shapes and display Images.',
			'Each can be given a <a target="_blank" href="%s">Type</a>, title, description and an image.',
			'You can add the Map to your content using the %1$s <a href="%2$s">Shortcode</a>.',
		];

		foreach ( $expected as $msgid ) {
			$this->assertArrayHasKey( "\0" . $msgid, $entries, $msgid );
		}
	}

	/**
	 * The combined Slice 7 strings must be gone from the template.
	 */
	public function test_pot_does_not_contain_slice7_combined_sentences() {
		$entries = $this->pot_entries();

		$retired = [
			'<span class="waymark-lead">Waymark uses the excellent <a href="%1$s">OpenStreetMap</a> as its default Basemap and supports many <a href="%2$s">other providers</a>.<br /><br /><a href="%3$s">Thunderforest</a> and <a href="%4$s">Mapbox</a> are examples of providers that offer easy access to beautiful Basemaps (including satellite imagery). They require registration, but have a free usage tier.',
			'What kind of Marker is this? E.g. "Photo", "Grocery Store", "Warning!". Once saved, Marker labels can not be edited. The Marker Label is displayed in the Tooltip (when hovering over the Marker) and in the Info Window (once the Marker is clicked). Hide in Settings > Map > Misc. > Type Labels.',
			'If Waymark finds data for the property keys below it will be stored when it is imported. These can be automatically appended to the Overlay Description, or accessed programmatically via the <code>layer.feature.properties</code> Object.',
			'Read <b><a href="https://geojson.org/">GeoJSON</a></b> feature properties when importing.',
			'What features to offer in the Editor. Important! Uploaded images are added to the Media Library, reading from file does not keep a copy of the file on the server. Whether an individual Meta input is displayed can be set in the Settings > Map > Meta.',
			'What features to offer in the Editor. Important! Uploaded images are added to the Media Library (see Upload Location below), reading from file does not keep a copy of the file on the server. Whether an individual Meta input is displayed can be set in the Settings > Map > Meta.',
			'Images upload by non-registered users can be stored seperately from other Media Library uploads, to aid with moderation. All uploaded images will be stored in a single directory (/waymark_submission) found in the upload root.',
			'Waymark Maps will zoom when the user scrolls. This can cause some unexpected/annoying behaviour when scrolling a page.<br /><br /><b>Sleeping</b> the Map initially and <b>Waking</b> upon user interaction (i.e. hovering/clicking/tapping) may create a better experience.',
			'Whether to load multiple Maps in the Background (uses AJAX to improve page load) when embedding with the Shortcode, or to Embed them within the page. Embedding may be a bad idea for LARGE COLLECTIONS, but can resolve some issues where Collections are not displaying correctly.',
			'Collections allow you to organise your Maps. Use the <a href="%1$s">Shortcode</a> to display all Maps in a Collection at once. <a href="%2$s" class="button waymark-right">Read the Docs &raquo;</a>',
			'<span class="waymark-lead">Use the Map <a href="%1$s">Editor</a> to place Markers, draw Lines/Shapes and display Photos. Each can be given a <a target="_blank" href="%2$s">Type</a>, title, description and an image.</span><br /><br />You can add the Map to your content using the %3$s <a href="%4$s">Shortcode</a>.',
		];

		foreach ( $retired as $msgid ) {
			$this->assertArrayNotHasKey( "\0" . $msgid, $entries, $msgid );
		}
	}

	/**
	 * No closing small tag may remain inside a placeholder-bearing msgid.
	 */
	public function test_pot_does_not_contain_small_tag_inside_placeholder() {
		$entries = $this->pot_entries();

		foreach ( $entries as $entry ) {
			if ( null === $entry['msgid'] || false === strpos( $entry['msgid'], '</small>' ) ) {
				continue;
			}

			$this->assertDoesNotMatchRegularExpression(
				'/%(\d+\$)?s/',
				$entry['msgid'],
				'The </small> tag must sit outside the sprintf placeholder: ' . $entry['msgid']
			);
		}

		$this->assertArrayNotHasKey( "\0" . 'Pro Tip! If you have more than one Basemap, you can switch between them when viewing the Map. The first listed will be used as the default, unless specified in the shortcode like this: %s. Drag to re-order, remove all to restore defaults.</small>', $entries );
	}

	/**
	 * The Collections sentence must not carry the Shortcode URL comment.
	 */
	public function test_pot_collections_placeholder_comment_is_on_the_shortcode_sentence() {
		$entries = $this->pot_entries();

		$plain    = 'Collections allow you to organise your Maps.';
		$sentence = 'Use the <a href="%s">Shortcode</a> to display all Maps in a Collection at once.';

		$this->assertArrayHasKey( "\0" . $plain, $entries );
		$this->assertArrayHasKey( "\0" . $sentence, $entries );

		$plain_comment = implode( ' ', $entries[ "\0" . $plain ]['comments'] );
		$link_comment  = implode( ' ', $entries[ "\0" . $sentence ]['comments'] );

		$this->assertDoesNotMatchRegularExpression( '/%(\d+\$)?s/', $plain_comment, 'The placeholder-free Collections sentence must not describe a placeholder.' );
		$this->assertStringContainsString( '%s', $link_comment, 'The Shortcode sentence must describe its URL placeholder.' );
	}

	/**
	 * The upload-location path comment must sit on the sentence with the path.
	 */
	public function test_pot_upload_location_placeholder_comment_is_on_the_directory_sentence() {
		$entries = $this->pot_entries();

		$plain    = 'Images uploaded by non-registered users can be stored separately from other Media Library uploads, to aid with moderation.';
		$sentence = 'All uploaded images will be stored in a single directory (%s) found in the upload root.';

		$this->assertArrayHasKey( "\0" . $plain, $entries );
		$this->assertArrayHasKey( "\0" . $sentence, $entries );

		$plain_comment    = implode( ' ', $entries[ "\0" . $plain ]['comments'] );
		$sentence_comment = implode( ' ', $entries[ "\0" . $sentence ]['comments'] );

		$this->assertDoesNotMatchRegularExpression( '/%(\d+\$)?s/', $plain_comment, 'The placeholder-free moderation sentence must not describe a placeholder.' );
		$this->assertStringContainsString( '%s', $sentence_comment, 'The upload directory sentence must describe its path placeholder.' );
	}

	/**
	 * The Basemaps description renders as one closed lead span with four links.
	 */
	public function test_basemaps_description_renders_closed_lead_span_with_links() {
		$html        = $this->render_settings_page( 'waymark-settings-tab-tiles' );
		$description = $this->section_description( $html, 'layers' );

		$this->assertSame( 1, preg_match( '/<span class="waymark-lead">(.*?)<\/span>/s', $description, $matches ), 'The lead span should be closed.' );

		$lead = $matches[1];

		$this->assertStringContainsString( 'Waymark uses the excellent <a href="https://www.openstreetmap.org/fixthemap">OpenStreetMap</a>', $lead );
		$this->assertStringContainsString( '<a href="https://leaflet-extras.github.io/leaflet-providers/preview/">other providers</a>', $lead );
		$this->assertStringContainsString( '<br /><br />', $lead );
		$this->assertStringContainsString( '<a href="https://www.thunderforest.com/">Thunderforest</a>', $lead );
		$this->assertStringContainsString( '<a href="https://www.mapbox.com/maps/">Mapbox</a>', $lead );
		$this->assertStringContainsString( 'They require registration, but have a free usage tier.', $lead );

		$this->assertSame( 4, substr_count( $description, '<a href=' ) );
		$this->assertStringNotContainsString( '&lt;span', $description );

		$footer = $this->section_footer( $html, 'layers' );
		$this->assertStringContainsString( '<small>Pro Tip!', $footer );
		$this->assertStringContainsString( 'Drag to re-order, remove all to restore defaults.</small>', $footer );
		$this->assertStringContainsString( 'map_id=&quot;1234&quot; basemap=&quot;Basemap Name&quot;', $footer );
	}

	/**
	 * The Properties tab keeps its JSON example and its code sample.
	 */
	public function test_properties_description_and_footer_keep_markup() {
		$html = $this->render_settings_page( 'waymark-settings-tab-properties' );

		$description = $this->section_description( $html, 'props' );
		$this->assertStringContainsString( '<b>Read <a href="https://geojson.org/">GeoJSON</a> feature properties when importing.</b>', $description );
		$this->assertStringContainsString( '<code>layer.feature.properties</code>', $description );

		$props_footer = $this->section_footer( $html, 'props' );
		$this->assertMatchesRegularExpression( '/<\/small>\s*<pre><code>/', $props_footer );
		$this->assertStringContainsString( '<pre><code>', $props_footer );
		$this->assertStringContainsString( '"type": "FeatureCollection"', $props_footer );
		$this->assertStringContainsString( '"created_date": "2021-07-15T00:42:41Z"', $props_footer );
		$this->assertStringNotContainsString( '&lt;pre&gt;', $props_footer );

		$options_footer = $this->section_footer( $html, 'options' );
		$this->assertStringContainsString( '<code class="waymark-code">', $options_footer );
		$this->assertStringContainsString( 'waymark-property-property_key', $options_footer );
		$this->assertStringContainsString( 'property_value', $options_footer );
		$this->assertStringNotContainsString( 'proprty_value', $options_footer );
	}

	/**
	 * The Marker Label tip keeps all four sentences without entity artefacts.
	 */
	public function test_marker_label_tip_renders_four_sentences() {
		$html = $this->render_settings_page( 'waymark-settings-tab-markers' );

		$this->assertSame( 1, preg_match( '/<div class="[^"]*marker_title-container">(.*?)<\/div>/s', $html, $matches ), 'Missing the Marker Label field.' );

		$this->assertSame( 1, preg_match( '/data-title="([^"]*)"/', $matches[1], $tip ), 'Missing the Marker Label tip.' );

		$raw      = $tip[1];
		$decoded  = html_entity_decode( $raw, ENT_QUOTES | ENT_HTML5, 'UTF-8' );

		$this->assertStringContainsString( 'What kind of Marker is this? E.g. "Photo", "Grocery Store", "Warning!".', $decoded );
		$this->assertStringContainsString( 'Once saved, Marker labels cannot be edited.', $decoded );
		$this->assertStringContainsString( 'The Marker Label is displayed in the Tooltip (when hovering over the Marker) and in the Info Window (once the Marker is clicked).', $decoded );
		$this->assertStringContainsString( 'Hide in Settings > Misc. > Type Labels.', $decoded );

		$this->assertStringNotContainsString( '&#039;', $decoded );
		$this->assertStringNotContainsString( '&amp;', $decoded );
		$this->assertStringNotContainsString( '&amp;#039;', $raw );
		$this->assertStringNotContainsString( '&amp;amp;', $raw );
	}

	/**
	 * The Sleep Options description keeps its bold emphasis.
	 */
	public function test_sleep_description_renders_bold_emphasis() {
		$html        = $this->render_settings_page( 'waymark-settings-section-interaction_options' );
		$description = $this->section_description( $html, 'interaction_options' );

		$this->assertStringContainsString( '<b>Sleeping</b>', $description );
		$this->assertStringContainsString( '<b>Waking</b>', $description );
		$this->assertStringContainsString( 'Waymark Maps will zoom when the user scrolls.', $description );
		$this->assertStringContainsString( 'This can cause some unexpected/annoying behaviour when scrolling a page.', $description );
		$this->assertStringContainsString( 'may create a better experience.', $description );
	}

	/**
	 * The Collections notice keeps its sentences and button link after kses.
	 */
	public function test_admin_collections_notice_renders_markup() {
		$html = $this->render_admin_notice(
			$this->screen(
				[
					'base'      => 'edit-tags',
					'taxonomy'  => 'waymark_collection',
					'post_type' => 'waymark_map',
					'id'        => 'edit-waymark_collection',
				]
			)
		);

		$this->assertStringContainsString( 'Collections allow you to organise your Maps.', $html );
		$this->assertStringContainsString( 'Use the <a href="https://www.ogis.org/waymark-wp/#shortcodes">Shortcode</a> to display all Maps in a Collection at once.', $html );
		$this->assertStringContainsString( 'class="button waymark-right"', $html );
		$this->assertStringContainsString( '>Read the Docs <span class="waymark-arrow" aria-hidden="true"></span></a>', $html );
		$this->assertStringContainsString( 'customising/settings/#misc-collection_options', $html );

		$this->assertStringNotContainsString( '&lt;a href', $html );
		$this->assertStringNotContainsString( '&lt;span', $html );
	}

	/**
	 * The zero-Map "Creating a Map" notice keeps its lead, link target and code.
	 */
	public function test_admin_creating_a_map_notice_renders_markup_on_empty_site() {
		$GLOBALS['post'] = (object) [ 'ID' => 123 ];

		$filter = static function ( $posts, $query ) {
			if ( 'waymark_map' === $query->get( 'post_type' ) ) {
				return [];
			}

			return $posts;
		};

		add_filter( 'posts_pre_query', $filter, 10, 2 );

		try {
			$html = $this->render_admin_notice(
				$this->screen(
					[
						'base'      => 'post-new',
						'post_type' => 'waymark_map',
						'id'        => 'waymark_map',
						'action'    => 'add',
					]
				)
			);
		} finally {
			remove_filter( 'posts_pre_query', $filter, 10 );
		}

		$this->assertStringContainsString( '<span class="waymark-lead">', $html );
		$this->assertStringContainsString( '</span><br /><br />', $html );
		$this->assertStringContainsString( 'Use the Map <a href="https://www.ogis.org/waymark-wp/tutorials/creating-your-first-map/">Editor</a> to place Markers, draw Lines/Shapes and display Images.', $html );
		$this->assertStringContainsString( '<a target="_blank" href="https://www.ogis.org/waymark-wp/customising/settings/#markers">Type</a>', $html );
		$this->assertStringContainsString( '<code class="waymark-code">[Waymark map_id=&quot;123&quot;]</code>', $html );
		$this->assertStringContainsString( 'You can add the Map to your content using the', $html );

		$this->assertStringNotContainsString( '&lt;span', $html );
		$this->assertStringNotContainsString( '&lt;code', $html );
	}

	/**
	 * Mutation check: restoring a combined msgid must fail the absence assertion.
	 */
	public function test_pot_combined_absence_check_catches_a_restored_combined_string() {
		$pot = file_get_contents( dirname( __DIR__, 2 ) . '/languages/waymark.pot' );

		$this->assertIsString( $pot );

		$combined = '<span class="waymark-lead">Waymark uses the excellent <a href="%1$s">OpenStreetMap</a> as its default Basemap and supports many <a href="%2$s">other providers</a>.<br /><br /><a href="%3$s">Thunderforest</a> and <a href="%4$s">Mapbox</a> are examples of providers that offer easy access to beautiful Basemaps (including satellite imagery). They require registration, but have a free usage tier.';

		$mutated = $pot . "\n\n#: inc/Admin/Waymark_Settings.php:62\nmsgid \"\"\n\"" . str_replace( '"', '\\"', $combined ) . "\"\nmsgstr \"\"\n";

		$path = dirname( __DIR__, 2 ) . '/.opencode/tmp/slice7-waymark.mutated.pot';

		file_put_contents( $path, $mutated );

		$entries = $this->pot_entries( $path );

		$this->assertArrayHasKey( "\0" . $combined, $entries, 'The mutation should restore the combined msgid.' );

		$this->expectException( PHPUnit\Framework\AssertionFailedError::class );
		$this->assertArrayNotHasKey( "\0" . $combined, $entries, 'The production assertion must fail when the combined msgid is restored.' );
	}

	/**
	 * Mutation check: removing `pre` from the footer allowlist strips the JSON
	 * example, which is what the production Properties render test guards.
	 */
	public function test_removing_pre_from_the_footer_allowlist_strips_the_json_example() {
		$source = file_get_contents( dirname( __DIR__, 2 ) . '/inc/Admin/Waymark_Settings.php' );

		$this->assertIsString( $source );

		$mutated = str_replace( "'pre' => [],", '', $source );
		$mutated = str_replace( 'class Waymark_Settings {', 'class Waymark_Settings_Mutated {', $mutated );

		$this->assertNotSame( $source, $mutated, 'The mutation should change the source.' );

		$path = dirname( __DIR__, 2 ) . '/.opencode/tmp/Waymark_Settings_Mutated.php';

		file_put_contents( $path, $mutated );
		require_once $path;

		$settings = new Waymark_Settings_Mutated();
		$settings->register_settings();

		$_GET['content'] = 'waymark-settings-tab-properties';

		ob_start();
		$settings->content_admin_page();
		$html = ob_get_clean();

		unset( $_GET['content'] );

		$this->assertStringNotContainsString( '<pre>', $html );
		$this->assertStringContainsString( '"type": "FeatureCollection"', $html );
	}
}
