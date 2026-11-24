<?php
/**
 * Demo seed force-mode tests.
 *
 * @package Waymark
 */

/**
 * Verifies the force-mode argument contract, refusal rules, reserved-ID
 * conflicts and artefact selection helpers used by the demo seeder.
 */
class Test_Demo_Seed_Force extends WP_UnitTestCase {

	/**
	 * Load the seed guard helpers.
	 */
	public function set_up() {
		parent::set_up();

		require_once dirname( __DIR__ ) . '/fixtures/demo/seed-guard.php';
	}

	/**
	 * Create a post that occupies a specific ID.
	 *
	 * @param int   $id        Post ID to occupy.
	 * @param array $overrides Optional post fields.
	 * @return int
	 */
	private function create_post_with_id( $id, array $overrides = [] ) {
		$post_id = wp_insert_post(
			array_merge(
				[
					'import_id'   => $id,
					'post_type'   => 'post',
					'post_title'  => 'Non-demo post ' . $id,
					'post_name'   => 'non-demo-' . $id,
					'post_status' => 'publish',
				],
				$overrides
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			$this->fail( 'Unable to create the test fixture at ID ' . $id . ': ' . $post_id->get_error_message() );
		}

		$this->assertSame( (int) $id, (int) $post_id, 'The test fixture should occupy post ID ' . $id . '.' );

		return (int) $post_id;
	}

	/**
	 * Create an attachment that occupies a specific ID.
	 *
	 * @param int         $id   Attachment ID to occupy.
	 * @param string|null $file Attached file path, or null to leave the meta unset.
	 * @return int
	 */
	private function create_attachment_with_id( $id, $file = null ) {
		$attachment_id = $this->create_post_with_id(
			$id,
			[
				'post_type'   => 'attachment',
				'post_title'  => 'Attachment ' . $id,
				'post_status' => 'inherit',
			]
		);

		if ( $file !== null ) {
			update_post_meta( $attachment_id, '_wp_attached_file', $file );
		}

		return $attachment_id;
	}

	/**
	 * Create a Collection term.
	 *
	 * @param string $name Term name.
	 * @param array  $args Optional term arguments.
	 * @return int
	 */
	private function create_collection_term( $name, array $args = [] ) {
		$term = wp_insert_term( $name, 'waymark_collection', $args );

		if ( is_wp_error( $term ) ) {
			$this->fail( 'Unable to create the Collection term "' . $name . '": ' . $term->get_error_message() );
		}

		$this->assertIsArray( $term );

		return (int) $term['term_id'];
	}

	/**
	 * Fetch Collection terms as WP_Term objects.
	 *
	 * @param int[] $term_ids Term IDs.
	 * @return WP_Term[]
	 */
	private function collection_term_objects( array $term_ids ) {
		$terms = [];

		foreach ( $term_ids as $term_id ) {
			$term = get_term( $term_id, 'waymark_collection' );

			$this->assertInstanceOf( WP_Term::class, $term );

			$terms[] = $term;
		}

		return $terms;
	}

	/**
	 * Convert terms to their IDs.
	 *
	 * @param WP_Term[] $terms Terms.
	 * @return int[]
	 */
	private function term_ids( array $terms ) {
		return array_map(
			static function ( $term ) {
				return (int) $term->term_id;
			},
			$terms
		);
	}

	/**
	 * Supported tokens produce the documented flags.
	 *
	 * @dataProvider provide_supported_arguments
	 *
	 * @param array $args  Positional arguments.
	 * @param bool  $dev   Expected dev flag.
	 * @param bool  $force Expected force flag.
	 */
	public function test_parse_args_reads_supported_tokens( array $args, $dev, $force ) {
		$this->assertSame(
			[
				'dev'   => $dev,
				'force' => $force,
			],
			waymark_demo_parse_args( $args )
		);
	}

	/**
	 * Supported argument combinations.
	 *
	 * @return array
	 */
	public function provide_supported_arguments() {
		return [
			'no arguments'              => [ [], false, false ],
			'dev'                       => [ [ 'dev' ], true, false ],
			'dev and force'             => [ [ 'dev', 'force' ], true, true ],
			'dev and force alias'       => [ [ 'dev', '--force' ], true, true ],
			'force alone'               => [ [ 'force' ], false, true ],
			'force alias alone'         => [ [ '--force' ], false, true ],
			'duplicate dev'             => [ [ 'dev', 'dev' ], true, false ],
			'duplicate force and alias' => [ [ 'dev', 'force', '--force' ], true, true ],
			'duplicate tokens reordered' => [ [ '--force', 'dev', 'force', 'dev' ], true, true ],
		];
	}

	/**
	 * Invalid tokens are rejected with a helpful message.
	 *
	 * @dataProvider provide_invalid_arguments
	 *
	 * @param array  $args    Positional arguments.
	 * @param string $message Expected exception message.
	 */
	public function test_parse_args_rejects_invalid_arguments( array $args, $message ) {
		$this->expectException( InvalidArgumentException::class );
		$this->expectExceptionMessage( $message );

		waymark_demo_parse_args( $args );
	}

	/**
	 * Invalid argument combinations.
	 *
	 * @return array
	 */
	public function provide_invalid_arguments() {
		$invalid = 'Invalid demo seed argument. Supported arguments: dev, force (or --force).';

		return [
			'unknown token'         => [ [ 'seed' ], 'Unknown demo seed argument "seed". Supported arguments: dev, force (or --force).' ],
			'unknown alias'         => [ [ '--dev' ], 'Unknown demo seed argument "--dev". Supported arguments: dev, force (or --force).' ],
			'empty token'           => [ [ '' ], $invalid ],
			'empty token after dev' => [ [ 'dev', '' ], $invalid ],
			'integer token'         => [ [ 101 ], $invalid ],
			'null token'            => [ [ null ], $invalid ],
		];
	}

	/**
	 * Force is allowed on local and development environments at the dev URL.
	 *
	 * @dataProvider provide_permitted_force_contexts
	 *
	 * @param string $environment_type Environment type.
	 * @param string $site_url         Site URL.
	 */
	public function test_force_is_allowed_on_local_and_development( $environment_type, $site_url ) {
		$this->assertNull(
			waymark_demo_force_refusal_reason(
				[
					'dev'   => true,
					'force' => true,
				],
				$environment_type,
				$site_url
			)
		);
	}

	/**
	 * Permitted force contexts.
	 *
	 * @return array
	 */
	public function provide_permitted_force_contexts() {
		return [
			'local on the development port'       => [ 'local', 'http://localhost:8888' ],
			'development on the development port' => [ 'development', 'http://localhost:8888' ],
			'local over https'                    => [ 'local', 'https://waymark.test' ],
			'development without a port'          => [ 'development', 'http://waymark.test' ],
		];
	}

	/**
	 * Force is refused outside local and development environments.
	 *
	 * @dataProvider provide_refused_environments
	 *
	 * @param string $environment_type Environment type.
	 */
	public function test_force_is_refused_outside_local_and_development( $environment_type ) {
		$this->assertSame(
			'Refusing to force-reset demo data: wp_get_environment_type() is "' . $environment_type . '". Force mode is allowed only on local or development instances.',
			waymark_demo_force_refusal_reason(
				[
					'dev'   => true,
					'force' => true,
				],
				$environment_type,
				'http://localhost:8888'
			)
		);
	}

	/**
	 * Refused environments.
	 *
	 * @return array
	 */
	public function provide_refused_environments() {
		return [
			'production' => [ 'production' ],
			'staging'    => [ 'staging' ],
			'empty'      => [ '' ],
		];
	}

	/**
	 * Force is refused on the tests instance.
	 *
	 * @dataProvider provide_tests_instance_urls
	 *
	 * @param string $environment_type Environment type.
	 * @param string $site_url         Site URL.
	 */
	public function test_force_is_refused_on_the_tests_instance( $environment_type, $site_url ) {
		$this->assertSame(
			'Refusing to force-reset demo data on the tests instance (' . $site_url . '). Force mode is for the development instance.',
			waymark_demo_force_refusal_reason(
				[
					'dev'   => true,
					'force' => true,
				],
				$environment_type,
				$site_url
			)
		);
	}

	/**
	 * Tests-instance URLs.
	 *
	 * @return array
	 */
	public function provide_tests_instance_urls() {
		return [
			'local without trailing slash'    => [ 'local', 'http://localhost:8889' ],
			'development with trailing slash' => [ 'development', 'http://localhost:8889/' ],
			'https'                           => [ 'local', 'https://waymark.test:8889' ],
		];
	}

	/**
	 * Force without dev is a usage error.
	 */
	public function test_force_without_dev_reports_usage() {
		$this->assertSame(
			'The force argument requires dev. Usage: seed.php dev force',
			waymark_demo_force_refusal_reason(
				[
					'dev'   => false,
					'force' => true,
				],
				'local',
				'http://localhost:8888'
			)
		);
	}

	/**
	 * Modes that do not request force are never refused.
	 *
	 * @dataProvider provide_non_force_arguments
	 *
	 * @param array  $parsed           Parsed arguments.
	 * @param string $environment_type Environment type.
	 * @param string $site_url         Site URL.
	 */
	public function test_non_force_modes_are_never_refused( array $parsed, $environment_type, $site_url ) {
		$this->assertNull( waymark_demo_force_refusal_reason( $parsed, $environment_type, $site_url ) );
	}

	/**
	 * Non-force argument combinations.
	 *
	 * @return array
	 */
	public function provide_non_force_arguments() {
		return [
			'no arguments on production' => [
				[
					'dev'   => false,
					'force' => false,
				],
				'production',
				'http://localhost:8888',
			],
			'dev on production'          => [
				[
					'dev'   => true,
					'force' => false,
				],
				'production',
				'http://localhost:8888',
			],
			'dev on the tests instance'  => [
				[
					'dev'   => true,
					'force' => false,
				],
				'local',
				'http://localhost:8889',
			],
		];
	}

	/**
	 * Refusal precedence is usage, then environment, then tests instance.
	 */
	public function test_refusal_precedence_is_usage_environment_then_tests_instance() {
		$force_only = [
			'dev'   => false,
			'force' => true,
		];
		$dev_force  = [
			'dev'   => true,
			'force' => true,
		];

		$this->assertSame(
			'The force argument requires dev. Usage: seed.php dev force',
			waymark_demo_force_refusal_reason( $force_only, 'production', 'http://localhost:8889' )
		);

		$this->assertStringContainsString(
			'wp_get_environment_type() is "production"',
			waymark_demo_force_refusal_reason( $dev_force, 'production', 'http://localhost:8889' )
		);

		$this->assertStringContainsString(
			'tests instance',
			waymark_demo_force_refusal_reason( $dev_force, 'local', 'http://localhost:8889' )
		);
	}

	/**
	 * The reserved IDs are exactly the ones the seeder inserts.
	 */
	public function test_required_ids_are_the_seeded_ids() {
		$this->assertSame( [ 100, 101, 102, 103, 104, 105, 110 ], waymark_demo_required_ids() );
	}

	/**
	 * Free reserved IDs produce no conflicts.
	 */
	public function test_required_id_conflicts_are_empty_when_ids_are_free() {
		$this->assertSame( [], waymark_demo_required_id_conflicts() );
	}

	/**
	 * Non-demo content at every reserved ID is reported in required-ID order.
	 */
	public function test_non_demo_posts_at_every_required_id_are_conflicts() {
		$expected = [];

		foreach ( waymark_demo_required_ids() as $id ) {
			$this->create_post_with_id( $id );

			$expected[] = [
				'id'    => $id,
				'title' => 'Non-demo post ' . $id,
			];
		}

		$this->assertSame( $expected, waymark_demo_required_id_conflicts() );
	}

	/**
	 * Demo Maps and the demo Page at required IDs are not conflicts.
	 */
	public function test_demo_maps_and_pages_at_required_ids_are_not_conflicts() {
		$this->create_post_with_id(
			100,
			[
				'post_type'  => 'waymark_map',
				'post_name'  => 'cape-scott-trail',
				'post_title' => 'Cape Scott Trail',
			]
		);
		$this->create_post_with_id(
			101,
			[
				'post_type'  => 'waymark_map',
				'post_name'  => 'san-josef-bay',
				'post_title' => 'San Josef Bay',
			]
		);
		$this->create_post_with_id(
			110,
			[
				'post_type'  => 'page',
				'post_name'  => 'waymark-demo',
				'post_title' => 'Waymark Demo',
			]
		);

		$this->assertSame( [], waymark_demo_required_id_conflicts() );
	}

	/**
	 * Trashed demo content is recognised by its __trashed slug and is not a
	 * conflict.
	 */
	public function test_trashed_demo_content_is_not_a_conflict() {
		$map_id = $this->create_post_with_id(
			101,
			[
				'post_type' => 'waymark_map',
				'post_name' => 'san-josef-bay',
			]
		);
		$page_id = $this->create_post_with_id(
			110,
			[
				'post_type' => 'page',
				'post_name' => 'waymark-demo',
			]
		);

		$this->assertInstanceOf( WP_Post::class, wp_trash_post( $map_id ) );
		$this->assertInstanceOf( WP_Post::class, wp_trash_post( $page_id ) );

		$this->assertSame( 'san-josef-bay__trashed', get_post( $map_id )->post_name );
		$this->assertSame( 'waymark-demo__trashed', get_post( $page_id )->post_name );
		$this->assertSame( [], waymark_demo_required_id_conflicts() );
	}

	/**
	 * A demo attachment at a required ID is not a conflict.
	 */
	public function test_demo_attachment_at_a_required_id_is_not_a_conflict() {
		$this->create_attachment_with_id( 105, 'waymark-demo/photo.jpg' );

		$this->assertSame( [], waymark_demo_required_id_conflicts() );
	}

	/**
	 * Only non-demo occupants of the reserved set are reported.
	 */
	public function test_only_non_demo_occupants_are_reported() {
		$this->create_post_with_id(
			100,
			[
				'post_type' => 'waymark_map',
				'post_name' => 'cape-scott-trail',
			]
		);
		$this->create_post_with_id( 101 );
		$this->create_attachment_with_id( 102, '2026/06/photo.jpg' );
		$this->create_post_with_id( 106 );

		$this->assertSame(
			[
				[
					'id'    => 101,
					'title' => 'Non-demo post 101',
				],
				[
					'id'    => 102,
					'title' => 'Attachment 102',
				],
			],
			waymark_demo_required_id_conflicts()
		);
	}

	/**
	 * Posts outside the required-ID set are never reported.
	 */
	public function test_posts_outside_the_required_ids_are_never_reported() {
		foreach ( [ 99, 106, 107, 108, 109, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120 ] as $id ) {
			$this->create_post_with_id( $id );
		}

		$this->assertSame( [], waymark_demo_required_id_conflicts() );
	}

	/**
	 * A trashed non-demo post still occupies its reserved ID.
	 */
	public function test_trashed_non_demo_post_at_a_required_id_is_still_a_conflict() {
		$post_id = $this->create_post_with_id( 101 );

		$this->assertInstanceOf( WP_Post::class, wp_trash_post( $post_id ) );

		$this->assertSame(
			[
				[
					'id'    => 101,
					'title' => 'Non-demo post 101',
				],
			],
			waymark_demo_required_id_conflicts()
		);
	}

	/**
	 * Map slugs match the Maps the seeder creates.
	 */
	public function test_map_slugs_match_the_seeded_maps() {
		$this->assertSame(
			[
				'cape-scott-trail',
				'san-josef-bay',
				'north-coast-trail',
				'circle-only',
				'empty-map',
				'flat-elevation',
			],
			waymark_demo_map_slugs()
		);
	}

	/**
	 * Each Map slug is paired with its trashed variant.
	 */
	public function test_map_slugs_with_trashed_include_both_forms() {
		$slugs = waymark_demo_map_slugs_with_trashed();

		$this->assertCount( 12, $slugs );
		$this->assertSame( $slugs, array_values( array_unique( $slugs ) ) );

		foreach ( waymark_demo_map_slugs() as $index => $slug ) {
			$this->assertSame( $slug, $slugs[ $index * 2 ] );
			$this->assertSame( $slug . '__trashed', $slugs[ $index * 2 + 1 ] );
		}
	}

	/**
	 * The demo Page has published and trashed slugs.
	 */
	public function test_page_slugs_include_the_trashed_variant() {
		$this->assertSame( [ 'waymark-demo', 'waymark-demo__trashed' ], waymark_demo_page_slugs() );
	}

	/**
	 * Collection slugs match the terms the seeder creates.
	 */
	public function test_collection_slugs_match_the_seeded_collections() {
		$this->assertSame( [ 'vancouver-island', 'day-hikes', 'backpacking' ], waymark_demo_collection_slugs() );
	}

	/**
	 * Collection terms are selected by slug only, never by name.
	 */
	public function test_collection_terms_select_by_slug_only() {
		$parent_id      = $this->create_collection_term( 'Vancouver Island' );
		$day_hikes_id   = $this->create_collection_term( 'Day Hikes', [ 'parent' => $parent_id ] );
		$decoy_id       = $this->create_collection_term( 'Backpacking', [ 'slug' => 'wild-camping' ] );
		$backpacking_id = $this->create_collection_term( 'Trail Work', [ 'slug' => 'backpacking' ] );

		$this->create_collection_term( 'Scrambling' );

		$terms = waymark_demo_collection_terms();

		foreach ( $terms as $term ) {
			$this->assertInstanceOf( WP_Term::class, $term );
		}

		$slugs = array_map(
			static function ( $term ) {
				return $term->slug;
			},
			$terms
		);
		sort( $slugs );

		$this->assertSame( [ 'backpacking', 'day-hikes', 'vancouver-island' ], $slugs );

		$selected_ids = $this->term_ids( $terms );
		sort( $selected_ids );

		$expected_ids = [ $parent_id, $day_hikes_id, $backpacking_id ];
		sort( $expected_ids );

		$this->assertSame( $expected_ids, $selected_ids );
		$this->assertNotContains( $decoy_id, $selected_ids, 'A term is selected by slug, never by its demo name.' );
	}

	/**
	 * Without demo slugs there are no Collection terms to delete.
	 */
	public function test_collection_terms_are_empty_without_demo_slugs() {
		$this->create_collection_term( 'Scrambling' );
		$this->create_collection_term( 'Backpacking', [ 'slug' => 'wild-camping' ] );

		$this->assertSame( [], waymark_demo_collection_terms() );
	}

	/**
	 * Attachments are selected only when their file sits under waymark-demo/.
	 */
	public function test_attachment_ids_select_only_files_in_the_demo_directory() {
		$demo_one = $this->create_attachment_with_id( 100, 'waymark-demo/one.jpg' );
		$demo_two = $this->create_attachment_with_id( 101, 'waymark-demo/nested/two.jpg' );

		$this->create_attachment_with_id( 102, '2026/06/three.jpg' );
		$this->create_attachment_with_id( 103, '2026/06/waymark-demo/four.jpg' );
		$this->create_attachment_with_id( 104 );

		$attachment_with_other_meta = $this->create_attachment_with_id( 105 );
		update_post_meta( $attachment_with_other_meta, '_wp_attached_file_alt', 'waymark-demo/five.jpg' );

		$ids = waymark_demo_attachment_ids();
		sort( $ids );

		$this->assertSame( [ $demo_one, $demo_two ], $ids );

		foreach ( $ids as $id ) {
			$this->assertIsInt( $id );
		}
	}

	/**
	 * Demo Maps (including trashed), Pages and attachments are recognised.
	 */
	public function test_is_demo_post_recognises_demo_artefacts() {
		$map_id = $this->create_post_with_id(
			100,
			[
				'post_type' => 'waymark_map',
				'post_name' => 'cape-scott-trail',
			]
		);

		$trashed_map_id = $this->create_post_with_id(
			101,
			[
				'post_type' => 'waymark_map',
				'post_name' => 'san-josef-bay',
			]
		);
		$this->assertInstanceOf( WP_Post::class, wp_trash_post( $trashed_map_id ) );

		// Trash the first Page so the second fixture can reuse the slug.
		$trashed_page_id = $this->create_post_with_id(
			110,
			[
				'post_type' => 'page',
				'post_name' => 'waymark-demo',
			]
		);
		$this->assertInstanceOf( WP_Post::class, wp_trash_post( $trashed_page_id ) );

		$page_id = $this->create_post_with_id(
			111,
			[
				'post_type' => 'page',
				'post_name' => 'waymark-demo',
			]
		);

		$attachment_id = $this->create_attachment_with_id( 105, 'waymark-demo/photo.jpg' );

		foreach ( [ $map_id, $trashed_map_id, $page_id, $trashed_page_id, $attachment_id ] as $id ) {
			$this->assertTrue(
				waymark_demo_is_demo_post( $id ),
				'Post #' . $id . ' should be recognised as demo content.'
			);
		}
	}

	/**
	 * A WP_Post object is accepted.
	 */
	public function test_is_demo_post_accepts_a_post_object() {
		$map_id = $this->create_post_with_id(
			100,
			[
				'post_type' => 'waymark_map',
				'post_name' => 'cape-scott-trail',
			]
		);

		$post = get_post( $map_id );

		$this->assertInstanceOf( WP_Post::class, $post );
		$this->assertTrue( waymark_demo_is_demo_post( $post ) );
	}

	/**
	 * Content whose type or slug does not match the demo set is rejected.
	 */
	public function test_is_demo_post_rejects_non_demo_content() {
		$non_demo_map_id = $this->create_post_with_id(
			100,
			[
				'post_type' => 'waymark_map',
				'post_name' => 'not-a-demo-map',
			]
		);
		$non_demo_page_id = $this->create_post_with_id(
			110,
			[
				'post_type' => 'page',
				'post_name' => 'not-a-demo-page',
			]
		);
		$non_demo_attachment_id = $this->create_attachment_with_id( 105, '2026/06/photo.jpg' );
		$attachment_without_file = $this->create_attachment_with_id( 106 );
		$post_with_demo_map_slug = $this->create_post_with_id(
			107,
			[
				'post_type' => 'post',
				'post_name' => 'cape-scott-trail',
			]
		);
		$page_with_demo_map_slug = $this->create_post_with_id(
			108,
			[
				'post_type' => 'page',
				'post_name' => 'cape-scott-trail',
			]
		);
		$map_with_demo_page_slug = $this->create_post_with_id(
			109,
			[
				'post_type' => 'waymark_map',
				'post_name' => 'waymark-demo',
			]
		);

		$non_demo_ids = [
			$non_demo_map_id,
			$non_demo_page_id,
			$non_demo_attachment_id,
			$attachment_without_file,
			$post_with_demo_map_slug,
			$page_with_demo_map_slug,
			$map_with_demo_page_slug,
		];

		foreach ( $non_demo_ids as $id ) {
			$this->assertFalse(
				waymark_demo_is_demo_post( $id ),
				'Post #' . $id . ' should not be recognised as demo content.'
			);
		}
	}

	/**
	 * Null, zero, missing IDs and non-numeric values are rejected.
	 */
	public function test_is_demo_post_rejects_invalid_input() {
		$this->assertFalse( waymark_demo_is_demo_post( null ) );
		$this->assertFalse( waymark_demo_is_demo_post( 0 ) );
		$this->assertFalse( waymark_demo_is_demo_post( 999999 ) );
		$this->assertFalse( waymark_demo_is_demo_post( 'not-a-post' ) );
	}

	/**
	 * Grandchildren sort before children, which sort before parents.
	 */
	public function test_sort_terms_children_first_orders_deepest_terms_first() {
		$parent_id     = $this->create_collection_term( 'Vancouver Island' );
		$child_id      = $this->create_collection_term( 'Day Hikes', [ 'parent' => $parent_id ] );
		$grandchild_id = $this->create_collection_term( 'Overnight', [ 'parent' => $child_id ] );

		$terms = $this->collection_term_objects( [ $parent_id, $grandchild_id, $child_id ] );

		$this->assertSame(
			[ $grandchild_id, $child_id, $parent_id ],
			$this->term_ids( waymark_demo_sort_terms_children_first( $terms ) )
		);
	}

	/**
	 * Siblings are ordered by descending term ID.
	 */
	public function test_sort_terms_children_first_orders_siblings_by_descending_term_id() {
		$parent_id = $this->create_collection_term( 'Vancouver Island' );
		$first_id  = $this->create_collection_term( 'Day Hikes', [ 'parent' => $parent_id ] );
		$second_id = $this->create_collection_term( 'Backpacking', [ 'parent' => $parent_id ] );

		$terms      = $this->collection_term_objects( [ $parent_id, $first_id, $second_id ] );
		$sorted_ids = $this->term_ids( waymark_demo_sort_terms_children_first( $terms ) );

		$expected_sibling_order = [ $first_id, $second_id ];
		rsort( $expected_sibling_order );

		$this->assertSame( $parent_id, array_pop( $sorted_ids ) );
		$this->assertSame( $expected_sibling_order, $sorted_ids );
	}

	/**
	 * A child whose parent is not in the list is treated as a root term.
	 */
	public function test_sort_terms_children_first_handles_terms_whose_parent_is_absent() {
		$parent_id = $this->create_collection_term( 'Vancouver Island' );
		$child_id  = $this->create_collection_term( 'Day Hikes', [ 'parent' => $parent_id ] );
		$root_id   = $this->create_collection_term( 'Scrambling' );

		$terms      = $this->collection_term_objects( [ $child_id, $root_id ] );
		$sorted_ids = $this->term_ids( waymark_demo_sort_terms_children_first( $terms ) );

		$expected = [ $child_id, $root_id ];
		rsort( $expected );

		$this->assertSame( $expected, $sorted_ids );
	}

	/**
	 * Empty and single-term lists are handled.
	 */
	public function test_sort_terms_children_first_handles_empty_and_single_lists() {
		$this->assertSame( [], waymark_demo_sort_terms_children_first( [] ) );

		$term_id = $this->create_collection_term( 'Scrambling' );
		$terms   = $this->collection_term_objects( [ $term_id ] );

		$this->assertSame( [ $term_id ], $this->term_ids( waymark_demo_sort_terms_children_first( $terms ) ) );
	}

	/**
	 * The demo Collection terms are deleted children first.
	 */
	public function test_demo_collection_terms_are_deleted_children_first() {
		$parent_id      = $this->create_collection_term( 'Vancouver Island' );
		$day_hikes_id   = $this->create_collection_term( 'Day Hikes', [ 'parent' => $parent_id ] );
		$backpacking_id = $this->create_collection_term( 'Backpacking', [ 'parent' => $parent_id ] );

		$sorted_ids = $this->term_ids(
			waymark_demo_sort_terms_children_first( waymark_demo_collection_terms() )
		);

		$this->assertSame( $parent_id, array_pop( $sorted_ids ) );
		$this->assertEqualSets( [ $day_hikes_id, $backpacking_id ], $sorted_ids );
	}

	/**
	 * The npm force script passes positional tokens, never --force.
	 */
	public function test_force_npm_script_passes_positional_dev_force() {
		$package = json_decode(
			(string) file_get_contents( dirname( __DIR__, 2 ) . '/package.json' ),
			true
		);

		$this->assertIsArray( $package );
		$this->assertArrayHasKey( 'scripts', $package );
		$this->assertArrayHasKey( 'seed:dev', $package['scripts'] );
		$this->assertArrayHasKey( 'seed:dev:force', $package['scripts'] );

		$this->assertSame(
			'wp-env run cli wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php dev',
			$package['scripts']['seed:dev']
		);
		$this->assertSame(
			'wp-env run cli wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php dev force',
			$package['scripts']['seed:dev:force']
		);
		$this->assertStringNotContainsString(
			'--force',
			$package['scripts']['seed:dev:force'],
			'WP-CLI eval-file rejects --force, so the script must pass positional tokens.'
		);
	}
}
