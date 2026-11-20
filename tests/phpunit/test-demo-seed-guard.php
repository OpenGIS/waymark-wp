<?php
/**
 * Demo seed guard tests.
 *
 * @package Waymark
 */

/**
 * Verifies the read-only freshness checks that let dev-mode seeding skip an
 * instance which is not untouched.
 */
class Test_Demo_Seed_Guard extends WP_UnitTestCase {

	/**
	 * Load the guard helpers.
	 */
	public function set_up() {
		parent::set_up();

		require_once dirname( __DIR__ ) . '/fixtures/demo/seed-guard.php';
	}

	/**
	 * Build an all-clear synthetic state.
	 *
	 * @return array
	 */
	private function clean_state() {
		return [
			'seeded'       => false,
			'settings'     => false,
			'maps'         => 0,
			'collections'  => 0,
			'demo_page'    => 0,
			'demo_media'   => 0,
			'demo_uploads' => false,
			'reserved_ids' => [],
		];
	}

	/**
	 * An all-clear state has no reason to skip.
	 */
	public function test_clean_state_has_no_reason() {
		$this->assertNull( waymark_demo_reason_for_state( $this->clean_state() ) );
	}

	/**
	 * Each individual flag produces its expected reason.
	 */
	public function test_each_flag_returns_its_reason() {
		$cases = [
			[
				'state'  => [ 'seeded' => true ],
				'reason' => 'the demo has already been seeded on this instance',
			],
			[
				'state'  => [ 'settings' => true ],
				'reason' => 'Waymark settings already exist',
			],
			[
				'state'  => [ 'maps' => 1 ],
				'reason' => 'Waymark Maps already exist',
			],
			[
				'state'  => [ 'collections' => 1 ],
				'reason' => 'Waymark Collections already exist',
			],
			[
				'state'  => [ 'demo_page' => 1 ],
				'reason' => 'the demo Page already exists',
			],
			[
				'state'  => [ 'demo_media' => 1 ],
				'reason' => 'demo media already exists',
			],
			[
				'state'  => [ 'demo_uploads' => true ],
				'reason' => 'the demo upload directory is not empty',
			],
			[
				'state'  => [ 'reserved_ids' => [ 100 ] ],
				'reason' => 'reserved demo post IDs are in use: 100',
			],
		];

		foreach ( $cases as $case ) {
			$state = array_merge( $this->clean_state(), $case['state'] );

			$this->assertSame( $case['reason'], waymark_demo_reason_for_state( $state ) );
		}
	}

	/**
	 * Reasons are reported in precedence order.
	 */
	public function test_reason_precedence() {
		$state = [
			'seeded'       => true,
			'settings'     => true,
			'maps'         => 1,
			'collections'  => 1,
			'demo_page'    => 1,
			'demo_media'   => 1,
			'demo_uploads' => true,
			'reserved_ids' => [ 100 ],
		];

		$expectations = [
			[
				'key'    => 'seeded',
				'clear'  => false,
				'reason' => 'the demo has already been seeded on this instance',
			],
			[
				'key'    => 'settings',
				'clear'  => false,
				'reason' => 'Waymark settings already exist',
			],
			[
				'key'    => 'maps',
				'clear'  => 0,
				'reason' => 'Waymark Maps already exist',
			],
			[
				'key'    => 'collections',
				'clear'  => 0,
				'reason' => 'Waymark Collections already exist',
			],
			[
				'key'    => 'demo_page',
				'clear'  => 0,
				'reason' => 'the demo Page already exists',
			],
			[
				'key'    => 'demo_media',
				'clear'  => 0,
				'reason' => 'demo media already exists',
			],
			[
				'key'    => 'demo_uploads',
				'clear'  => false,
				'reason' => 'the demo upload directory is not empty',
			],
			[
				'key'    => 'reserved_ids',
				'clear'  => [],
				'reason' => 'reserved demo post IDs are in use: 100',
			],
		];

		foreach ( $expectations as $expectation ) {
			$this->assertSame( $expectation['reason'], waymark_demo_reason_for_state( $state ) );
			$state[ $expectation['key'] ] = $expectation['clear'];
		}

		$this->assertNull( waymark_demo_reason_for_state( $state ) );
	}

	/**
	 * Missing directories are empty; a non-empty directory counts as touched.
	 */
	public function test_dir_has_files_for_missing_and_non_empty_directories() {
		$fixture_dir = dirname( __DIR__ ) . '/fixtures/demo/images';

		$this->assertFalse( waymark_demo_dir_has_files( dirname( __DIR__ ) . '/fixtures/demo/images-does-not-exist' ) );
		$this->assertTrue( waymark_demo_dir_has_files( $fixture_dir ) );
	}

	/**
	 * The real state reader returns the documented shape and types.
	 */
	public function test_state_shape_with_missing_uploads_directory() {
		$missing_uploads = dirname( __DIR__ ) . '/fixtures/demo/uploads-does-not-exist';
		$state           = waymark_demo_state( $missing_uploads );

		$this->assertArrayHasKey( 'seeded', $state );
		$this->assertIsBool( $state['seeded'] );

		$this->assertArrayHasKey( 'settings', $state );
		$this->assertIsBool( $state['settings'] );

		$this->assertArrayHasKey( 'maps', $state );
		$this->assertIsInt( $state['maps'] );

		$this->assertArrayHasKey( 'collections', $state );
		$this->assertIsInt( $state['collections'] );

		$this->assertArrayHasKey( 'demo_page', $state );
		$this->assertIsInt( $state['demo_page'] );

		$this->assertArrayHasKey( 'demo_media', $state );
		$this->assertIsInt( $state['demo_media'] );

		$this->assertArrayHasKey( 'demo_uploads', $state );
		$this->assertIsBool( $state['demo_uploads'] );
		$this->assertFalse( $state['demo_uploads'] );

		$this->assertArrayHasKey( 'reserved_ids', $state );
		$this->assertIsArray( $state['reserved_ids'] );
	}
}
