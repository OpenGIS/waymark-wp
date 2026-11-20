<?php
/**
 * Read-only freshness checks for the demo seeder.
 *
 * Dev mode seeds only an untouched instance. These helpers inspect settings,
 * content and uploads without writing anything, so the seeder can stop before
 * the first change is made. Including this file has no side effects.
 */

/**
 * Whether a directory contains any entry other than . and ..
 *
 * A missing directory is empty. An unreadable directory counts as touched.
 *
 * @param string $dir Directory path.
 * @return bool
 */
function waymark_demo_dir_has_files($dir) {
	if (! is_dir($dir)) {
		return false;
	}

	$handle = @opendir($dir);
	if ($handle === false) {
		return true;
	}

	while (($entry = readdir($handle)) !== false) {
		if ($entry !== '.' && $entry !== '..') {
			closedir($handle);

			return true;
		}
	}

	closedir($handle);

	return false;
}

/**
 * Read the demo-relevant state of the current instance.
 *
 * @param string|null $uploads_basedir Uploads base directory, or null to resolve it.
 * @param string      $upload_subdir   Demo upload subdirectory.
 * @return array State flags and counts.
 */
function waymark_demo_state($uploads_basedir = null, $upload_subdir = 'waymark-demo') {
	global $wpdb;

	$map_ids = get_posts([
		'post_type'   => 'waymark_map',
		'post_status' => array_values(get_post_stati()),
		'numberposts' => -1,
		'fields'      => 'ids',
	]);

	$page_ids = get_posts([
		'post_type'   => 'page',
		'post_status' => array_values(get_post_stati()),
		'numberposts' => -1,
		'fields'      => 'ids',
		'name'        => 'waymark-demo',
	]);

	$collections = (int) $wpdb->get_var($wpdb->prepare(
		"SELECT COUNT(*) FROM {$wpdb->term_taxonomy} WHERE taxonomy = %s",
		'waymark_collection'
	));

	$demo_media = (int) $wpdb->get_var($wpdb->prepare(
		"SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = '_wp_attached_file' AND meta_value LIKE %s",
		$wpdb->esc_like('waymark-demo/') . '%'
	));

	$reserved_ids = [];
	for ($id = 100; $id <= 119; $id++) {
		if (get_post($id)) {
			$reserved_ids[] = $id;
		}
	}

	if ($uploads_basedir === null) {
		$uploads         = wp_get_upload_dir();
		$uploads_basedir = isset($uploads['basedir']) ? $uploads['basedir'] : '';
	}

	$demo_uploads = false;
	if (! empty($uploads_basedir)) {
		$demo_dir     = rtrim($uploads_basedir, '/\\') . '/' . ltrim($upload_subdir, '/\\');
		$demo_uploads = waymark_demo_dir_has_files($demo_dir);
	}

	return [
		'seeded'       => (bool) get_option('waymark_demo_dev_seeded'),
		'settings'     => get_option('Waymark_Settings') !== false,
		'maps'         => count($map_ids),
		'collections'  => $collections,
		'demo_page'    => count($page_ids),
		'demo_media'   => $demo_media,
		'demo_uploads' => $demo_uploads,
		'reserved_ids' => $reserved_ids,
	];
}

/**
 * Return the first reason the instance is not untouched, or null.
 *
 * @param array $state State from waymark_demo_state().
 * @return string|null
 */
function waymark_demo_reason_for_state(array $state) {
	if (! empty($state['seeded'])) {
		return 'the demo has already been seeded on this instance';
	}

	if (! empty($state['settings'])) {
		return 'Waymark settings already exist';
	}

	if (! empty($state['maps'])) {
		return 'Waymark Maps already exist';
	}

	if (! empty($state['collections'])) {
		return 'Waymark Collections already exist';
	}

	if (! empty($state['demo_page'])) {
		return 'the demo Page already exists';
	}

	if (! empty($state['demo_media'])) {
		return 'demo media already exists';
	}

	if (! empty($state['demo_uploads'])) {
		return 'the demo upload directory is not empty';
	}

	if (! empty($state['reserved_ids'])) {
		return 'reserved demo post IDs are in use: ' . implode(', ', $state['reserved_ids']);
	}

	return null;
}

/**
 * Return the reason the instance is not untouched, or null.
 *
 * @param string|null $uploads_basedir Uploads base directory, or null to resolve it.
 * @param string      $upload_subdir   Demo upload subdirectory.
 * @return string|null
 */
function waymark_demo_untouched_reason($uploads_basedir = null, $upload_subdir = 'waymark-demo') {
	return waymark_demo_reason_for_state(waymark_demo_state($uploads_basedir, $upload_subdir));
}

/**
 * Whether the instance is safe to seed in dev mode.
 *
 * @param string|null $uploads_basedir Uploads base directory, or null to resolve it.
 * @param string      $upload_subdir   Demo upload subdirectory.
 * @return bool
 */
function waymark_demo_is_untouched($uploads_basedir = null, $upload_subdir = 'waymark-demo') {
	return waymark_demo_untouched_reason($uploads_basedir, $upload_subdir) === null;
}
