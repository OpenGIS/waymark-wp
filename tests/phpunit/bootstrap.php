<?php
/**
 * PHPUnit bootstrap for the Waymark plugin.
 *
 * Follows the standard WP-CLI scaffold pattern: load the WordPress test
 * library bundled with wp-env, then load the plugin the way WordPress would.
 *
 * @package Waymark
 */

// wp-env sets WP_TESTS_DIR in the tests containers.
$waymark_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $waymark_tests_dir ) {
	$waymark_tests_dir = '/wordpress-phpunit';
}
$waymark_tests_dir = rtrim( $waymark_tests_dir, '/\\' );

/*
 * The WordPress test suite requires the Yoast PHPUnit Polyfills, which wp-env
 * does not bundle. Load the globally installed copy in the tests container
 * before the core bootstrap runs its own check.
 */
if ( ! class_exists( 'Yoast\PHPUnitPolyfills\Autoload' ) ) {
	$waymark_composer_home = getenv( 'COMPOSER_HOME' );
	if ( ! $waymark_composer_home ) {
		$waymark_composer_home = getenv( 'HOME' ) . '/.composer';
	}

	$waymark_polyfills = $waymark_composer_home . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';

	if ( file_exists( $waymark_polyfills ) ) {
		require_once $waymark_polyfills;
	}
}

require_once $waymark_tests_dir . '/includes/functions.php';

// Load the plugin before WordPress finishes booting, as an ordinary plugin would.
tests_add_filter(
	'muplugins_loaded',
	function () {
		require dirname( __DIR__, 2 ) . '/Waymark.php';
	}
);

/*
 * Waymark_Meta and Waymark_Revisions are only loaded from Waymark_Admin's
 * admin_init callback, which does not run in the test environment because
 * is_admin() is false during boot. Load them explicitly once the plugin's own
 * init callbacks (config at -1, post types at 0) have run so that the admin
 * save and revision handlers are available to tests.
 *
 * Waymark_Meta registers meta boxes, so the admin template functions it
 * depends on must be loaded first.
 */
tests_add_filter(
	'init',
	function () {
		require_once ABSPATH . 'wp-admin/includes/template.php';
		require_once dirname( __DIR__, 2 ) . '/inc/Admin/Waymark_Meta.php';
		require_once dirname( __DIR__, 2 ) . '/inc/Admin/Waymark_Revisions.php';
	},
	20
);

require $waymark_tests_dir . '/includes/bootstrap.php';
