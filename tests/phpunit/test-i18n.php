<?php
/**
 * Localisation escaping tests.
 *
 * @package Waymark
 */

/**
 * Language values must be stored raw and escaped only at the output boundary.
 */
class Test_I18n extends WP_UnitTestCase {

	/**
	 * A translation containing every character that used to be HTML-encoded.
	 *
	 * @var string
	 */
	private $raw_translation = 'Way<mark> & \'quoted\' "double"';

	/**
	 * Start every test from a pristine config and filter known msgids.
	 */
	public function set_up() {
		parent::set_up();

		add_filter( 'gettext', [ $this, 'filter_translation' ], 10, 3 );

		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();
	}

	/**
	 * Remove the filter and reset the config for the next test.
	 */
	public function tear_down() {
		remove_filter( 'gettext', [ $this, 'filter_translation' ], 10 );

		delete_option( 'Waymark_Settings' );
		Waymark_Config::init();

		parent::tear_down();
	}

	/**
	 * Replace Waymark msgids with a string containing HTML-sensitive characters.
	 *
	 * @param  string $translation Translated text.
	 * @param  string $text        Original text.
	 * @param  string $domain      Text domain.
	 * @return string              Filtered translation.
	 */
	public function filter_translation( $translation, $text, $domain ) {
		if ( 'waymark' !== $domain ) {
			return $translation;
		}

		$filtered = [
			'View Fullscreen',
			'Description',
			'The Description you enter here will be displayed on the Map Details page.',
			'Click or Hover to Wake',
			'Photo',
			'Red',
		];

		if ( in_array( $text, $filtered, true ) ) {
			return $this->raw_translation;
		}

		return $translation;
	}

	/**
	 * Replace every Waymark translation for the exhaustive raw-value check.
	 *
	 * @param  string $translation Translated text.
	 * @param  string $text        Original text.
	 * @param  string $domain      Text domain.
	 * @return string              Filtered translation.
	 */
	public function filter_all_translations( $translation, $text, $domain ) {
		if ( 'waymark' === $domain ) {
			return $this->raw_translation;
		}

		return $translation;
	}

	/**
	 * The JS language array must contain the raw translation, not HTML entities.
	 */
	public function test_js_lang_returns_raw_translated_strings() {
		$lang = Waymark_Lang::get_js_lang();

		$this->assertSame( $this->raw_translation, $lang['action_fullscreen_activate'] );

		foreach ( [ '&#039;', '&amp;', '&quot;', '&lt;', '&gt;' ] as $entity ) {
			$this->assertStringNotContainsString( $entity, $lang['action_fullscreen_activate'] );
		}
	}

	/**
	 * Every language value must be raw, not just the representative msgid.
	 */
	public function test_every_js_lang_value_is_raw() {
		add_filter( 'gettext', [ $this, 'filter_all_translations' ], 20, 3 );

		try {
			$lang = Waymark_Lang::get_js_lang();
		} finally {
			remove_filter( 'gettext', [ $this, 'filter_all_translations' ], 20 );
		}

		$this->assertCount( 68, $lang );

		foreach ( $lang as $key => $value ) {
			$this->assertSame( $this->raw_translation, $value, $key );
		}
	}

	/**
	 * The unencoded map config language block must also contain the raw value.
	 */
	public function test_map_config_language_is_raw() {
		$config = Waymark_Config::get_map_config();

		$this->assertSame( $this->raw_translation, $config['language']['action_fullscreen_activate'] );
	}

	/**
	 * Config defaults that feed settings fields and inline JS must stay raw too.
	 */
	public function test_config_defaults_return_raw_translations() {
		$this->assertSame( $this->raw_translation, Waymark_Config::get_setting( 'meta', 'inputs', 'meta_title' ) );
		$this->assertSame( $this->raw_translation, Waymark_Config::get_setting( 'meta', 'inputs', 'meta_tip' ) );
		$this->assertSame( $this->raw_translation, Waymark_Config::get_setting( 'misc', 'interaction_options', 'wake_message' ) );

		$type_defaults = [
			'markers' => [ 'marker_types', 'marker_title' ],
			'lines'   => [ 'line_types', 'line_title' ],
			'shapes'  => [ 'shape_types', 'shape_title' ],
		];

		foreach ( $type_defaults as $tab => $setting ) {
			$value = Waymark_Config::get_setting( $tab, $setting[0], $setting[1] );

			$this->assertStringContainsString( $this->raw_translation, $value );

			foreach ( [ '&#039;', '&amp;', '&quot;', '&lt;', '&gt;' ] as $entity ) {
				$this->assertStringNotContainsString( $entity, $value );
			}
		}
	}

	/**
	 * The encoded map config must hex-escape HTML-sensitive characters for inline JS.
	 */
	public function test_encoded_map_config_hex_escapes_special_characters() {
		$json = Waymark_Config::get_map_config( true );

		$this->assertStringContainsString( '\u003C', $json );
		$this->assertStringContainsString( '\u0026', $json );
		$this->assertStringContainsString( '\u0027', $json );
		$this->assertStringContainsString( '\u0022', $json );
		$this->assertStringNotContainsString( '<mark>', $json );
	}

	/**
	 * Build a GeoJSON FeatureCollection containing a fixed number of features.
	 *
	 * @param  int   $count Number of features.
	 * @return array        GeoJSON FeatureCollection.
	 */
	private function feature_collection( $count ) {
		$features = [];

		for ( $i = 0; $i < $count; $i++ ) {
			$features[] = [
				'type'       => 'Feature',
				'geometry'   => [
					'type'        => 'Point',
					'coordinates' => [ -68.74923, 51.38436 ],
				],
				'properties' => [
					'title' => 'Feature ' . $i,
				],
			];
		}

		return [
			'type'     => 'FeatureCollection',
			'features' => $features,
		];
	}

	/**
	 * Create a Map whose stored waymark_map_data contains the given features.
	 *
	 * @param  int   $count Number of features.
	 * @return object       The created Map post.
	 */
	private function create_map_with_features( $count ) {
		$post_id = self::factory()->post->create(
			[
				'post_type'   => 'waymark_map',
				'post_status' => 'publish',
				'post_title'  => 'Revisions map',
			]
		);

		$map_data = wp_json_encode( $this->feature_collection( $count ) );

		// update_post_meta() expects slashed data, exactly like a real save.
		update_post_meta( $post_id, 'waymark_map_data', wp_slash( $map_data ) );

		return get_post( $post_id );
	}

	/**
	 * Revision summaries must use a singular string for one feature.
	 */
	public function test_revision_summary_uses_singular_for_one_feature() {
		$compare = $this->create_map_with_features( 1 );
		$summary = ( new Waymark_Revisions() )->revision_diff_field_value( '', 'waymark_map_data', $compare );

		$this->assertSame( '1 feature', $summary );
	}

	/**
	 * Revision summaries must use a plural string for more than one feature and
	 * format the count with number_format_i18n().
	 */
	public function test_revision_summary_uses_plural_and_locale_number_format() {
		$compare = $this->create_map_with_features( 2 );
		$summary = ( new Waymark_Revisions() )->revision_diff_field_value( '', 'waymark_map_data', $compare );

		$this->assertSame( '2 features', $summary );

		$large  = $this->create_map_with_features( 1000 );
		$plural = ( new Waymark_Revisions() )->revision_diff_field_value( '', 'waymark_map_data', $large );

		$this->assertSame( number_format_i18n( 1000 ) . ' features', $plural );
	}

	/**
	 * Revision summaries must keep the em dash fallback for an empty collection.
	 */
	public function test_revision_summary_uses_dash_for_zero_features() {
		$compare = $this->create_map_with_features( 0 );
		$summary = ( new Waymark_Revisions() )->revision_diff_field_value( '', 'waymark_map_data', $compare );

		$this->assertSame( '—', $summary );
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
	 * @return array Entries indexed by "msgctxt\0msgid".
	 */
	private function pot_entries() {
		$pot = file_get_contents( dirname( __DIR__, 2 ) . '/languages/waymark.pot' );

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
	 * The translation template must contain the new plural forms.
	 */
	public function test_pot_contains_plural_feature_forms() {
		$entries = $this->pot_entries();

		$this->assertArrayHasKey( "\0%s feature", $entries );

		$entry = $entries["\0%s feature"];

		$this->assertSame( '%s feature', $entry['msgid'] );
		$this->assertSame( '%s features', $entry['plural'] );
		$this->assertContains( 'translators: %s: Number of features.', $entry['comments'] );
		$this->assertArrayNotHasKey( "\0%d feature(s)", $entries );
	}

	/**
	 * The translation template must carry contexts for the remaining ambiguous
	 * strings and must not carry contexts retired with complete field labels.
	 */
	public function test_pot_contains_contexts_for_ambiguous_strings() {
		$entries = $this->pot_entries();

		$expected = [
			[ 'loading method', 'Background' ],
			[ 'section heading', 'Options' ],
			[ 'input type', 'Text' ],
		];

		foreach ( $expected as list( $context, $msgid ) ) {
			$this->assertArrayHasKey( $context . "\0" . $msgid, $entries, $context . ' / ' . $msgid );
		}

		$retired = [
			[ 'marker colour', 'Background' ],
			[ 'meta field choices', 'Options' ],
			[ 'marker icon type', 'Text' ],
		];

		foreach ( $retired as list( $context, $msgid ) ) {
			$this->assertArrayNotHasKey( $context . "\0" . $msgid, $entries, $context . ' / ' . $msgid );
		}
	}

	/**
	 * Settings field labels must be complete msgids, not translated fragments.
	 */
	public function test_pot_contains_complete_settings_field_labels() {
		$entries = $this->pot_entries();

		$expected = [
			'Basemap Name',
			'Basemap URL',
			'Basemap Attribution',
			'Basemap Max Zoom',
			'Marker Types',
			'Marker Label',
			'Marker Shape',
			'Marker Size',
			'Marker Background',
			'Marker Show Initially',
			'Marker Submissions',
			'Icon Type',
			'Icon Name',
			'Icon Colour',
			'Line Types',
			'Line Label',
			'Line Colour',
			'Line Width',
			'Line Opacity',
			'Line Show Initially',
			'Line Submissions',
			'Shape Types',
			'Shape Label',
			'Shape Colour',
			'Shape Fill Opacity',
			'Shape Show Initially',
			'Shape Submissions',
			'Meta Title',
			'Meta Default',
			'Meta Tip',
			'Meta Type',
			'Meta Options',
			'Meta Group',
			'Meta In Shortcode',
			'Meta In Submissions',
			'Group Title',
			'Property Key',
			'Property Title',
			'Display Message Text',
			'Cluster Radius',
		];

		foreach ( $expected as $msgid ) {
			$this->assertArrayHasKey( "\0" . $msgid, $entries, $msgid );
		}
	}

	/**
	 * The remaining untranslated interface strings must be in the template.
	 */
	public function test_pot_contains_wrapped_interface_strings() {
		$entries = $this->pot_entries();

		$expected = [
			'Shortcode',
			'Map Data',
			'None',
			'Click to expand',
			'Settings Updated.',
			'Append listed Properties to the Overlay Description.',
			'Customise your Map and Collection URLs.',
			'<small>For the changes to take effect you must rebuild your Permalinks by going to WP Settings > Permalinks and clicking "Save Changes".</small>',
			'Enable Custom Post Type features.',
			'You are seeing the Map Data (in GeoJSON format) because you have the Waymark Debug Mode enabled. The amount of text shown here can get VERY large, so your browser might struggle to scroll through it. You can disable Debug Mode in Settings &gt; Misc. &gt; Advanced.',
			'Choose how the Marker icon is displayed.',
			'The desired icon name from Ionicons or Font Awesome, e.g. "ion-camera", or "fa-camera". Click the links to see the full list of icons available.',
			'Text to display inside the Marker, in the chosen colour. Space is very limited! Pro Tip: adjust text size using CSS; for all Markers: .waymark-icon-text{font-size: 18px}, or by Type: .waymark-marker-photo .waymark-icon-text{...}. Use your browser\'s inspector to dig for Type class names.',
			'The HTML entered will be added inside each Marker. Pro Tip! HTML Entities supported (e.g. &amp;cross; as well as Unicode and Emojis!), or provide HTML to integrate with other Icon providers.',
		];

		foreach ( $expected as $msgid ) {
			$this->assertArrayHasKey( "\0" . $msgid, $entries, $msgid );
		}
	}

	/**
	 * The icon help texts are independent msgids, not one pipe-delimited string.
	 */
	public function test_pot_does_not_contain_pipe_delimited_icon_tip() {
		$entries = $this->pot_entries();

		$old_icon_tip = 'The desired icon name from Ionicons or Font Awesome, e.g. "ion-camera", or "fa-camera". Click the links to see the full list of icons available.'
			. '|Text to display inside the Marker, in the chosen colour. Space is very limited! Pro Tip: adjust text size using CSS; for all Markers: .waymark-icon-text{font-size: 18px}, or by Type: .waymark-marker-photo .waymark-icon-text{...}. Use your browser\'s inspector to dig for Type class names.'
			. '|The HTML entered will be added inside each Marker. Pro Tip! HTML Entities supported (e.g. &amp;cross; as well as Unicode and Emojis!), or provide HTML to integrate with other Icon providers.';

		$this->assertArrayNotHasKey( "\0" . $old_icon_tip, $entries );

		foreach ( $entries as $entry ) {
			if ( null === $entry['msgid'] ) {
				continue;
			}

			$this->assertStringNotContainsString( '|Text to display inside the Marker', $entry['msgid'] );
		}
	}

	/**
	 * The success notice carries its punctuation inside the translatable string.
	 */
	public function test_pot_does_not_contain_unpunctuated_settings_updated() {
		$entries = $this->pot_entries();

		$this->assertArrayNotHasKey( "\0Settings Updated", $entries );
	}
}
