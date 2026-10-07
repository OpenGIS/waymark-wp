<?php
/**
 * Revision and autosave integration tests.
 *
 * @package Waymark
 */

/**
 * Regression tests for issue #77: escaped quotes in waymark_map_data must
 * survive autosave capture and revision restore.
 */
class Test_Revisions extends WP_UnitTestCase {

	/**
	 * Clean up request state after each test.
	 */
	public function tear_down() {
		$_POST = [];
		unset( $GLOBALS['post'] );

		parent::tear_down();
	}

	/**
	 * Build a minimal GeoJSON FeatureCollection for a single marker.
	 *
	 * @param string $description Overlay description.
	 * @param string $title       Overlay title.
	 * @return array              GeoJSON FeatureCollection.
	 */
	private function feature_collection( $description = '', $title = '' ) {
		return [
			'type'     => 'FeatureCollection',
			'features' => [
				[
					'type'       => 'Feature',
					'geometry'   => [
						'type'        => 'Point',
						'coordinates' => [ -68.74923, 51.38436 ],
					],
					'properties' => [
						'title'       => $title,
						'description' => $description,
					],
				],
			],
		];
	}

	/**
	 * Create a published Map with a stored waymark_map_data value.
	 *
	 * @param string $description Overlay description for the stored value.
	 * @return array              [ post ID, stored map data string ]
	 */
	private function create_map_with_data( $description ) {
		$post_id = self::factory()->post->create(
			[
				'post_type'   => 'waymark_map',
				'post_status' => 'publish',
				'post_title'  => 'Revisions map',
			]
		);

		$map_data = wp_json_encode( $this->feature_collection( $description ) );

		// update_post_meta() expects slashed data, exactly like a real save.
		update_post_meta( $post_id, 'waymark_map_data', wp_slash( $map_data ) );

		return [ $post_id, $map_data ];
	}

	/**
	 * Autosave capture must not overwrite the parent Map's data, and must store
	 * the posted value on the autosave revision itself.
	 *
	 * @group issue-77
	 */
	public function test_autosave_capture_preserves_parent_map_data_and_stores_autosave_value() {
		list( $post_id, $map_data_a ) = $this->create_map_with_data( 'Original <a href="https://example.com/a">link A</a>' );

		// Create the autosave revision the way core does for a new autosave.
		$autosave_id = _wp_put_post_revision( [ 'ID' => $post_id ], true );

		$this->assertIsInt( $autosave_id );
		$this->assertSame( $post_id, wp_is_post_autosave( $autosave_id ) );

		$map_data_b = wp_json_encode( $this->feature_collection( 'Autosaved <a href="https://example.com/b">link B</a>' ) );

		// A real request arrives slashed; the handler is responsible for unslashing once.
		$_POST = wp_slash( [ 'map_data' => $map_data_b ] );

		do_action(
			'wp_creating_autosave',
			[
				'ID'          => $autosave_id,
				'post_parent' => $post_id,
				'post_type'   => 'revision',
				'post_status' => 'inherit',
			]
		);

		// The parent must keep its original, valid JSON.
		$parent_stored = get_post_meta( $post_id, 'waymark_map_data', true );

		$this->assertSame( $map_data_a, $parent_stored, 'Autosave capture must not overwrite the parent post meta.' );
		$this->assertIsArray(
			json_decode( $parent_stored, true ),
			'Parent map data must remain valid JSON after autosave: ' . json_last_error_msg()
		);

		// The captured value must live on the autosave revision.
		$autosave_stored = get_post_meta( $autosave_id, 'waymark_map_data', true );

		$this->assertSame( $map_data_b, $autosave_stored, 'Autosave revision must store the posted map data.' );
	}

	/**
	 * Restoring a revision must copy its map data back to the parent without
	 * losing the backslashes that escape quotes in the JSON.
	 *
	 * @group issue-77
	 */
	public function test_revision_restore_keeps_escaped_quotes_intact() {
		list( $post_id, $map_data_a ) = $this->create_map_with_data( 'Current <a href="https://example.com/a">link A</a>' );

		// Put the post into the state the revision should capture (value B).
		$map_data_b = wp_json_encode( $this->feature_collection( 'Revised <a href="https://example.com/b">link B</a>' ) );
		update_post_meta( $post_id, 'waymark_map_data', wp_slash( $map_data_b ) );

		// Create a revision of the current state and copy the revisioned meta into it.
		$revision_id = _wp_put_post_revision( [ 'ID' => $post_id ] );

		$this->assertIsInt( $revision_id );

		wp_save_revisioned_meta_fields( $revision_id, $post_id );

		$this->assertSame( $map_data_b, get_post_meta( $revision_id, 'waymark_map_data', true ) );

		// The live post changes again before the revision is restored (back to A).
		update_post_meta( $post_id, 'waymark_map_data', wp_slash( $map_data_a ) );

		$restored_id = wp_restore_post_revision( $revision_id );

		$this->assertSame( $post_id, $restored_id );

		$stored = get_post_meta( $post_id, 'waymark_map_data', true );

		$this->assertSame( $map_data_b, $stored, 'Restored map data must match the revision exactly.' );
		$this->assertIsArray(
			json_decode( $stored, true ),
			'Restored map data must be valid JSON: ' . json_last_error_msg()
		);
	}
}
