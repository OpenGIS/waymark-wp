<?php
/**
 * Read-only freshness checks and demo-artefact selection for the demo seeder.
 *
 * Dev mode seeds only an untouched instance. These helpers inspect settings,
 * content and uploads without writing anything, so the seeder can stop before
 * the first change is made. Including this file has no side effects.
 *
 * The selection helpers describe what the seeder itself creates, so a force
 * reset can remove those artefacts without touching unrelated content:
 *
 * - waymark_demo_map_slugs() and waymark_demo_map_slugs_with_trashed()
 * - waymark_demo_page_slugs()
 * - waymark_demo_collection_slugs() and waymark_demo_collection_terms()
 * - waymark_demo_attachment_ids()
 * - waymark_demo_required_ids() and waymark_demo_required_id_conflicts()
 * - waymark_demo_is_demo_post() and waymark_demo_sort_terms_children_first()
 *
 * All of them are read-only.
 *
 * The argument helpers are pure and have no WordPress dependency, so they can
 * be unit-tested without running the seeder:
 *
 * - waymark_demo_parse_args()
 * - waymark_demo_force_refusal_reason()
 */

/**
 * Parse the positional eval-file arguments.
 *
 * Supports the dev and force tokens. --force is accepted as an alias for force
 * so a direct in-container run can request a reset; the npm script never passes
 * it. Duplicate tokens are harmless. Invalid tokens raise an
 * InvalidArgumentException for the caller to report; the function itself has no
 * side effects.
 *
 * @param array $args Positional arguments from WP-CLI.
 * @return array{dev: bool, force: bool}
 * @throws InvalidArgumentException When an argument is invalid or unknown.
 */
function waymark_demo_parse_args($args) {
	$tokens = [
		'dev'   => false,
		'force' => false,
	];

	foreach ($args as $arg) {
		if (! is_string($arg) || $arg === '') {
			throw new InvalidArgumentException('Invalid demo seed argument. Supported arguments: dev, force (or --force).');
		}

		$token = $arg === '--force' ? 'force' : $arg;

		if (! array_key_exists($token, $tokens)) {
			throw new InvalidArgumentException('Unknown demo seed argument "' . $arg . '". Supported arguments: dev, force (or --force).');
		}

		$tokens[$token] = true;
	}

	return $tokens;
}

/**
 * Decide whether force mode must be refused.
 *
 * Returns null when the parsed arguments may proceed in force mode, or a
 * human-readable reason when they must be refused. The rules are:
 *
 * - force without dev is a usage error;
 * - only local or development environments may be force-reset;
 * - the tests instance (port 8889) is never force-reset.
 *
 * The helper is pure: it reads no state and performs no writes.
 *
 * @param array  $parsed          Parsed tokens from waymark_demo_parse_args().
 * @param string $environmentType Value of wp_get_environment_type().
 * @param string $siteUrl         Current site URL.
 * @return string|null
 */
function waymark_demo_force_refusal_reason(array $parsed, string $environmentType, string $siteUrl): ?string {
	$force = ! empty($parsed['force']);
	$dev   = ! empty($parsed['dev']);

	if ($force && ! $dev) {
		return 'The force argument requires dev. Usage: seed.php dev force';
	}

	if (! $force) {
		return null;
	}

	if (! in_array($environmentType, ['local', 'development'], true)) {
		return 'Refusing to force-reset demo data: wp_get_environment_type() is "' . $environmentType . '". Force mode is allowed only on local or development instances.';
	}

	if (strpos($siteUrl, ':8889') !== false) {
		return 'Refusing to force-reset demo data on the tests instance (' . $siteUrl . '). Force mode is for the development instance.';
	}

	return null;
}

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

/**
 * Slugs of the Maps the seeder creates.
 *
 * @return string[]
 */
function waymark_demo_map_slugs() {
	return [
		'cape-scott-trail',
		'san-josef-bay',
		'north-coast-trail',
		'circle-only',
		'empty-map',
		'flat-elevation',
	];
}

/**
 * Demo Map slugs including WordPress' trashed suffix.
 *
 * WordPress rewrites a trashed post's slug to "<slug>__trashed", so force
 * selection must include both forms.
 *
 * @return string[]
 */
function waymark_demo_map_slugs_with_trashed() {
	$slugs = [];

	foreach (waymark_demo_map_slugs() as $slug) {
		$slugs[] = $slug;
		$slugs[] = $slug . '__trashed';
	}

	return $slugs;
}

/**
 * Slugs of the demo Page, including the trashed variant.
 *
 * @return string[]
 */
function waymark_demo_page_slugs() {
	return [
		'waymark-demo',
		'waymark-demo__trashed',
	];
}

/**
 * Slugs of the Collection terms the seeder creates.
 *
 * Force selection matches by slug only; a term's name is never used.
 *
 * @return string[]
 */
function waymark_demo_collection_slugs() {
	return [
		'vancouver-island',
		'day-hikes',
		'backpacking',
	];
}

/**
 * Reserved post IDs the seeder inserts by import_id.
 *
 * @return int[]
 */
function waymark_demo_required_ids() {
	return [100, 101, 102, 103, 104, 105, 110];
}

/**
 * Attachment IDs whose file sits in the demo upload subdirectory.
 *
 * @return int[]
 */
function waymark_demo_attachment_ids() {
	global $wpdb;

	$ids = $wpdb->get_col($wpdb->prepare(
		"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_wp_attached_file' AND meta_value LIKE %s",
		$wpdb->esc_like('waymark-demo/') . '%'
	));

	return array_map('intval', $ids);
}

/**
 * Demo Collection terms selected by slug.
 *
 * @return WP_Term[]
 */
function waymark_demo_collection_terms() {
	$terms = get_terms([
		'taxonomy'   => 'waymark_collection',
		'hide_empty' => false,
		'slug'       => waymark_demo_collection_slugs(),
	]);

	return is_wp_error($terms) ? [] : $terms;
}

/**
 * Order terms so children are deleted before their parents.
 *
 * @param WP_Term[] $terms Terms to sort.
 * @return WP_Term[]
 */
function waymark_demo_sort_terms_children_first(array $terms) {
	$by_id = [];
	foreach ($terms as $term) {
		$by_id[(int) $term->term_id] = $term;
	}

	$depth = function ($term) use ($by_id) {
		$level  = 0;
		$parent = (int) $term->parent;
		$seen   = [];

		while ($parent && isset($by_id[$parent]) && ! isset($seen[$parent])) {
			$seen[$parent] = true;
			$level++;
			$parent = (int) $by_id[$parent]->parent;
		}

		return $level;
	};

	usort($terms, function ($a, $b) use ($depth) {
		$depth_a = $depth($a);
		$depth_b = $depth($b);

		if ($depth_a === $depth_b) {
			return (int) $b->term_id <=> (int) $a->term_id;
		}

		return $depth_b <=> $depth_a;
	});

	return $terms;
}

/**
 * Whether a post is an artefact the seeder created.
 *
 * A post is demo content when it is a Map or Page carrying a demo slug
 * (including the trashed variant), or an attachment whose file sits in the
 * demo upload subdirectory.
 *
 * @param int|WP_Post|null $post Post ID, object or null.
 * @return bool
 */
function waymark_demo_is_demo_post($post) {
	if ($post instanceof WP_Post) {
		$post_object = $post;
	} elseif (is_numeric($post)) {
		$post_object = get_post((int) $post);
	} else {
		return false;
	}

	if (! $post_object instanceof WP_Post) {
		return false;
	}

	if ($post_object->post_type === 'waymark_map' && in_array($post_object->post_name, waymark_demo_map_slugs_with_trashed(), true)) {
		return true;
	}

	if ($post_object->post_type === 'page' && in_array($post_object->post_name, waymark_demo_page_slugs(), true)) {
		return true;
	}

	if ($post_object->post_type === 'attachment') {
		$file = get_post_meta($post_object->ID, '_wp_attached_file', true);

		return is_string($file) && strpos($file, 'waymark-demo/') === 0;
	}

	return false;
}

/**
 * Reserved demo IDs occupied by content the seeder did not create.
 *
 * Only the IDs inserted by import_id (100-105 and 110) are checked. Content
 * outside that set is ignored, and only a non-demo occupant is reported.
 *
 * @return array<int, array{id: int, title: string}>
 */
function waymark_demo_required_id_conflicts() {
	$conflicts = [];

	foreach (waymark_demo_required_ids() as $id) {
		$post = get_post($id);
		if (! $post) {
			continue;
		}

		if (waymark_demo_is_demo_post($post)) {
			continue;
		}

		$conflicts[] = [
			'id'    => (int) $id,
			'title' => get_the_title($post),
		];
	}

	return $conflicts;
}
