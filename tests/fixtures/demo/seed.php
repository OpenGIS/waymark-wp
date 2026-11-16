<?php
/**
 * Deterministic demo-data seeder for the Waymark README screenshots.
 *
 * Creates a small, realistic dataset (Maps, Collections, a demo Page, Media
 * and Settings) on the disposable wp-env tests instance so that browser tests
 * can capture reproducible screenshots.
 *
 * Run against the tests instance only:
 *
 *   npx wp-env run tests-cli wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php
 *
 * The seeder is idempotent. Every run force-deletes the previous demo content
 * (Maps, Page, Collections, demo attachments and their files) before recreating
 * it, so repeated runs produce byte-identical output (see seed-output.json).
 *
 * Waymark_Map::create_post()/save_meta() are POST/nonce driven and write
 * nothing from the CLI, so post meta is written directly here.
 */

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

$plugin_dir = dirname(__DIR__, 3);

require_once $plugin_dir . '/inc/Waymark_Config.php';
require_once $plugin_dir . '/inc/Helpers/Waymark_Helper.php';

// The seeder must be self-contained: PHPUnit leaves the plugin inactive, so
// load the post type and taxonomy classes directly when WordPress has not
// registered them. Guards prevent redeclaration when the plugin is active.
if (! class_exists('Waymark_Types')) {
	require_once $plugin_dir . '/inc/Waymark_Types.php';
}
if (! class_exists('Waymark_Taxonomies')) {
	require_once $plugin_dir . '/inc/Waymark_Taxonomies.php';
}

Waymark_Config::init();

// The development instance (8888) is off-limits to automation. Refuse politely.
if (strpos((string) get_site_url(), ':8888') !== false) {
	fwrite(STDERR, 'Refusing to seed the development instance (' . get_site_url() . "). Use the tests instance (8889).\n");
	exit(1);
}

global $wpdb;

$upload_subdir   = 'waymark-demo';
$demo_date       = '2026-06-15 10:30:00';
$demo_image_dir  = __DIR__ . '/images';
$tmp_dir         = $plugin_dir . '/temp/demo';
$demo_page_id    = 110;
$demo_page_slug  = 'waymark-demo';
$settings_url    = '/wp-admin/edit.php?post_type=waymark_map&page=waymark-settings&content=waymark-settings-tab-markers';

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function waymark_demo_log($message) {
	if (class_exists('WP_CLI')) {
		WP_CLI::log($message);
	} else {
		echo $message . "\n";
	}
}

function waymark_demo_fail($message) {
	if (class_exists('WP_CLI')) {
		WP_CLI::error($message);
	}
	fwrite(STDERR, $message . "\n");
	exit(1);
}

function waymark_demo_rrmdir($dir) {
	if (! is_dir($dir)) {
		return;
	}

	$iterator = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
		RecursiveIteratorIterator::CHILD_FIRST
	);

	foreach ($iterator as $item) {
		if ($item->isDir()) {
			rmdir($item->getPathname());
		} else {
			unlink($item->getPathname());
		}
	}

	rmdir($dir);
}

/**
 * Guard against invented elevation.
 *
 * Real elevation lives only in the Cape Scott GeoJSON fixture, whose
 * coordinates are copied verbatim (see the template section below). The small
 * hand-written inline Lines have no real elevation source, so they stay
 * 2-ordinate. This fails loudly if a third ordinate is ever fabricated.
 *
 * @param array  $data  Parsed GeoJSON FeatureCollection.
 * @param string $label Human-readable name for error messages.
 */
function waymark_demo_assert_no_invented_elevation($data, $label) {
	foreach ($data['features'] as $feature) {
		if (! isset($feature['geometry']['coordinates'])) {
			continue;
		}

		foreach ($feature['geometry']['coordinates'] as $point) {
			if (is_array($point) && isset($point[0]) && is_numeric($point[0]) && count($point) > 2) {
				$title = isset($feature['properties']['title']) ? $feature['properties']['title'] : 'untitled';

				waymark_demo_fail(
					'Invented elevation in ' . $label . ' (' . $title . '). Real elevation must come from the GeoJSON fixture, never be generated.'
				);
			}
		}
	}
}

// ---------------------------------------------------------------------------
// 1. Settings: curated Types, Meta (inputs + groups), a second Basemap and
//    map options. Everything else falls back to the code defaults.
// ---------------------------------------------------------------------------

$settings = [
	// A second Basemap after the default OSM entry.
	'tiles' => [
		'layers' => [
			'layer_name' => ['OpenStreetMap', 'OpenTopoMap'],
			'layer_url' => [
				'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
			],
			'layer_attribution' => [
				'&copy; &lt;a href=&quot;https://www.openstreetmap.org/copyright&quot;&gt;OpenStreetMap&lt;/a&gt; contributors',
				'&copy; &lt;a href=&quot;https://opentopomap.org&quot;&gt;OpenTopoMap&lt;/a&gt; (CC-BY-SA)',
			],
			'layer_max_zoom' => ['18', '17'],
		],
	],
	'misc' => [
		'map_options' => [
			'allow_export' => '1',
		],
	],
	// Marker Types used by the demo Map.
	'markers' => [
		'marker_types' => [
			'marker_title'      => ['Beer', 'Food', 'Photo', 'Alert', 'Information', 'Camp'],
			'marker_shape'      => ['marker', 'marker', 'marker', 'marker', 'marker', 'marker'],
			'marker_size'       => ['large', 'large', 'large', 'large', 'large', 'medium'],
			'icon_type'         => ['icon', 'icon', 'icon', 'icon', 'icon', 'icon'],
			'marker_icon'       => ['ion-beer', 'ion-pizza', 'ion-camera', 'ion-android-alert', 'ion-information-circled', 'ion-home'],
			'marker_colour'     => ['white', 'red', 'white', 'red', 'white', 'darkgreen'],
			'icon_colour'       => ['#754423', '#ffba00', '#475260', 'white', '#0069a5', 'white'],
			'marker_display'    => ['1', '1', '1', '1', '1', '1'],
			'marker_submission' => ['1', '1', '1', '1', '1', '1'],
		],
	],
	// Line Types ("Green" is used by the demo route).
	'lines' => [
		'line_types' => [
			'line_title'      => ['Red', 'Green', 'Blue'],
			'line_colour'     => ['#d84848', '#3cbc47', '#487bd9'],
			'line_weight'     => ['3', '3', '3'],
			'line_opacity'    => ['0.7', '0.7', '0.7'],
			'line_display'    => ['1', '1', '1'],
			'line_submission' => ['1', '1', '1'],
		],
	],
	// Shape Types ("Green" polygon + "Blue" circle are used by the demo Map).
	'shapes' => [
		'shape_types' => [
			'shape_title'      => ['Red', 'Green', 'Blue'],
			'shape_colour'     => ['#d84848', '#3cbc47', '#487bd9'],
			'fill_opacity'     => ['0.5', '0.5', '0.5'],
			'shape_display'    => ['1', '1', '1'],
			'shape_submission' => ['1', '1', '1'],
		],
	],
	// Meta: a base Description plus two groups (About, Details).
	'meta' => [
		'inputs' => [
			'meta_title'      => ['Description', 'Journal Entry', 'Date', 'Distance (km)', 'Weather'],
			'meta_default'    => ['', '', '', '', ''],
			'meta_tip'        => [
				'A summary of this Map, shown on the Map Details page.',
				'A longer account of the route.',
				'When the route was ridden.',
				'Total distance in kilometres.',
				'The weather when the Map was created.',
			],
			'meta_type'       => ['textarea_rich', 'textarea_rich', 'text', 'text', 'text'],
			'meta_group'      => ['', 'about', 'details', 'details', 'details'],
			'meta_options'    => ['', '', '', '', ''],
			'meta_shortcode'  => ['1', '1', '1', '1', '1'],
			'meta_submission' => ['0', '0', '0', '0', '0'],
		],
		'groups' => [
			'group_title' => ['About', 'Details'],
		],
	],
];

update_option('Waymark_Settings', $settings);

// Re-read settings so later lookups (permalinks, meta keys) use them.
Waymark_Config::init();

// ---------------------------------------------------------------------------
// 2. Site settings
// ---------------------------------------------------------------------------

update_option('timezone_string', 'America/Vancouver');
update_option('date_format', 'M j, Y');
update_option('time_format', 'H:i');

// Deterministic demo-site branding. The wp-env default site title ("Test Blog")
// shows in the admin bar of the admin-viewport README captures, so the demo
// site carries its own name and an empty tagline instead.
update_option('blogname', 'Waymark Demo');
update_option('blogdescription', '');

// Sync the rewrite engine with the new structure before flushing, otherwise
// WP_Rewrite keeps its (empty) structure from before the option was written.
global $wp_rewrite;
update_option('permalink_structure', '/%postname%/');
if ($wp_rewrite instanceof WP_Rewrite) {
	$wp_rewrite->set_permalink_structure('/%postname%/');
}

// PHPUnit can leave the plugin inactive. Register the demo post type and
// taxonomy explicitly so permalinks and collection terms are available.
if (! post_type_exists('waymark_map')) {
	$waymark_types = new Waymark_Types();
	$waymark_types->register_types();
}
if (! taxonomy_exists('waymark_collection')) {
	$waymark_taxonomies = new Waymark_Taxonomies();
	$waymark_taxonomies->register_taxonomies();
}

flush_rewrite_rules();

// WP-CLI has no web server, so got_mod_rewrite() is false and flush_rewrite_rules()
// never writes .htaccess. Write the rules directly so pretty permalinks resolve.
require_once ABSPATH . 'wp-admin/includes/misc.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
if (function_exists('insert_with_markers') && $wp_rewrite instanceof WP_Rewrite) {
	$htaccess_file = get_home_path() . '.htaccess';
	insert_with_markers($htaccess_file, 'WordPress', explode("\n", $wp_rewrite->mod_rewrite_rules()));
}

// ---------------------------------------------------------------------------
// 3. Idempotent reset
// ---------------------------------------------------------------------------

// Waymark Maps (including trashed).
$map_ids = get_posts([
	'post_type'      => 'waymark_map',
	'post_status'    => array_values(get_post_stati()),
	'numberposts'    => -1,
	'fields'         => 'ids',
]);
foreach ($map_ids as $map_id) {
	wp_delete_post($map_id, true);
}

// Demo Page(s).
$page_ids = get_posts([
	'post_type'   => 'page',
	'post_status' => array_values(get_post_stati()),
	'numberposts' => -1,
	'fields'      => 'ids',
	'name'        => $demo_page_slug,
]);
foreach ($page_ids as $page_id) {
	wp_delete_post($page_id, true);
}

// Collections.
$collection_terms = get_terms([
	'taxonomy'   => 'waymark_collection',
	'hide_empty' => false,
]);
if (! is_wp_error($collection_terms)) {
	foreach ($collection_terms as $term) {
		wp_delete_term($term->term_id, 'waymark_collection');
	}
}

// Demo attachments (identified by their fixed upload subdir) and their files.
$attachment_ids = $wpdb->get_col($wpdb->prepare(
	"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_wp_attached_file' AND meta_value LIKE %s",
	$wpdb->esc_like($upload_subdir . '/') . '%'
));
foreach ($attachment_ids as $attachment_id) {
	wp_delete_attachment((int) $attachment_id, true);
}

// Any leftover files in the fixed subdir.
$uploads = wp_upload_dir();
waymark_demo_rrmdir($uploads['basedir'] . '/' . $upload_subdir);

// Free the reserved demo post IDs so import_id inserts are safe. The tests
// instance is disposable, so it is fine to force-delete whatever holds them.
for ($id = 100; $id <= 119; $id++) {
	if (get_post($id)) {
		wp_delete_post($id, true);
	}
}

// Deterministic admin screens: the activation redirect is the only persistent
// plugin state that disturbs the admin UI, so drop it. Waymark's other notices
// are either transient (the "Settings Updated" notice only renders on
// ?settings-updated=true) or non-dismissible informational cards.
delete_option('waymark_activation_redirect');

// ---------------------------------------------------------------------------
// 4. Media: sideload the referenced photos into a fixed upload subdir.
// ---------------------------------------------------------------------------

add_filter('upload_dir', function ($uploads) use ($upload_subdir) {
	$uploads['subdir'] = '/' . $upload_subdir;
	$uploads['path']   = $uploads['basedir'] . '/' . $upload_subdir;
	$uploads['url']    = $uploads['baseurl'] . '/' . $upload_subdir;

	return $uploads;
});

require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

if (! is_dir($tmp_dir)) {
	wp_mkdir_p($tmp_dir);
}

// key => [file, title, alt].
$demo_images = [
	'holberg-road'          => ['holberg-road.jpg', 'Holberg Road', 'Gravel forestry road near Holberg.'],
	'scarlet-ibis'          => ['scarlet-ibis.jpeg', 'The Scarlet Ibis', 'The Scarlet Ibis pub.'],
	'nahwitti-lake-camp'    => ['nahwitti-lake-camp.jpg', 'Nahwitti Lake Recreation Site', 'Camping at Nahwitti Lake.'],
	'shoe-tree'             => ['shoe-tree.jpg', 'The Shoe Tree', 'The Shoe Tree near Holberg.'],
	'san-josef-bay'         => ['san-josef-bay.jpg', 'San Josef Bay', 'Sea stacks at San Josef Bay.'],
	'cape-scott-lighthouse' => ['cape-scott-lighthouse.jpeg', 'Cape Scott Lighthouse', 'Cape Scott Lighthouse at the trail end.'],
	'cape-scott-coast'      => ['cape-scott-coast.jpeg', 'Cape Scott Coast', 'The rugged Cape Scott coastline.'],
	'nahwitti-lake'         => ['nahwitti-lake.jpg', 'Nahwitti Lake', 'Nahwitti Lake on the Holberg road.'],
	'port-hardy-cape-scott' => ['port-hardy-cape-scott.jpg', 'Port Hardy to Cape Scott', 'The route from Port Hardy to Cape Scott.'],
];

$image_urls = [];
$image_ids  = [];

foreach ($demo_images as $key => $image) {
	list($file, $title, $alt) = $image;

	$source = $demo_image_dir . '/' . $file;
	if (! file_exists($source)) {
		waymark_demo_fail('Missing demo image: ' . $source);
	}

	// media_handle_sideload() moves the file, so work on a throwaway copy.
	$copy = $tmp_dir . '/' . $file;
	copy($source, $copy);

	$attachment_id = media_handle_sideload(
		['name' => $file, 'tmp_name' => $copy],
		0,
		$title
	);

	if (is_wp_error($attachment_id)) {
		waymark_demo_fail('Failed to sideload ' . $file . ': ' . $attachment_id->get_error_message());
	}

	wp_update_post(['ID' => $attachment_id, 'post_title' => $title]);
	update_post_meta($attachment_id, '_wp_attachment_image_alt', $alt);

	$sizes = [];
	foreach (['thumbnail', 'medium', 'large'] as $size) {
		$src = wp_get_attachment_image_src($attachment_id, $size);
		$sizes[$size] = $src ? $src[0] : '';
	}

	$image_urls[$key] = $sizes;
	$image_ids[$key]  = $attachment_id;
}

// Build the token resolution map: %%IMG:<key>:<size>%% => absolute URL.
$token_map = [];
foreach ($image_urls as $key => $sizes) {
	foreach ($sizes as $size => $url) {
		$token_map['%%IMG:' . $key . ':' . $size . '%%'] = $url;
	}
}

// ---------------------------------------------------------------------------
// 5. Maps
// ---------------------------------------------------------------------------

$template = file_get_contents(__DIR__ . '/maps/cape-scott-trail.geojson');
if ($template === false) {
	waymark_demo_fail('Unable to read the Cape Scott GeoJSON template.');
}

// Coordinates — including the third ordinate (elevation) — are copied verbatim
// from the fixture via a token-only strtr(). Never round, scale or synthesise
// elevation here: the chart must show the authentic route profile.
$cape_scott_data = strtr($template, $token_map);
if (json_decode($cape_scott_data, true) === null) {
	waymark_demo_fail('Resolved Cape Scott GeoJSON is not valid JSON.');
}

$san_josef = [
	'type'     => 'FeatureCollection',
	'features' => [
		[
			'type'       => 'Feature',
			'properties' => ['type' => 'green', 'title' => 'San Josef Bay Trail', 'direction' => 'default'],
			'geometry'   => [
				'type'        => 'LineString',
				'coordinates' => [
					[-128.285, 50.661],
					[-128.283, 50.664],
					[-128.281, 50.667],
					[-128.279, 50.671],
					[-128.277, 50.673],
				],
			],
		],
		[
			'type'       => 'Feature',
			'properties' => [
				'type'                => 'photo',
				'title'               => 'San Josef Bay',
				'image_thumbnail_url' => '%%IMG:san-josef-bay:thumbnail%%',
				'image_medium_url'    => '%%IMG:san-josef-bay:medium%%',
				'image_large_url'     => '%%IMG:san-josef-bay:large%%',
			],
			'geometry'   => ['type' => 'Point', 'coordinates' => [-128.277, 50.673]],
		],
		[
			'type'       => 'Feature',
			'properties' => ['type' => 'camp', 'title' => 'Eric Lake Camp'],
			'geometry'   => ['type' => 'Point', 'coordinates' => [-128.281, 50.667]],
		],
	],
];

$north_coast = [
	'type'     => 'FeatureCollection',
	'features' => [
		[
			'type'       => 'Feature',
			'properties' => ['type' => 'green', 'title' => 'North Coast Trail', 'direction' => 'reverse'],
			'geometry'   => [
				'type'        => 'LineString',
				'coordinates' => [
					[-127.902, 50.721],
					[-128.005, 50.702],
					[-128.152, 50.690],
					[-128.301, 50.702],
					[-128.420, 50.782],
				],
			],
		],
		[
			'type'       => 'Feature',
			'properties' => ['type' => 'information', 'title' => 'Nissen Bight'],
			'geometry'   => ['type' => 'Point', 'coordinates' => [-128.152, 50.690]],
		],
		[
			'type'       => 'Feature',
			'properties' => ['type' => 'camp', 'title' => 'Nels Bight'],
			'geometry'   => ['type' => 'Point', 'coordinates' => [-128.350, 50.782]],
		],
		[
			'type'       => 'Feature',
			'properties' => ['type' => 'alert', 'title' => 'Tidal Crossing', 'description' => 'Only cross at low tide.'],
			'geometry'   => ['type' => 'Point', 'coordinates' => [-128.301, 50.702]],
		],
	],
];

// The inline Lines have no real elevation source, so they must stay flat.
waymark_demo_assert_no_invented_elevation($san_josef, 'San Josef Bay');
waymark_demo_assert_no_invented_elevation($north_coast, 'North Coast Trail');

$demo_maps = [
	[
		'id'          => 100,
		'slug'        => 'cape-scott-trail',
		'title'       => 'Cape Scott Trail',
		'data'        => $cape_scott_data,
		'thumbnail'   => 'cape-scott-lighthouse',
		'description' => '<p>Ride from Port Hardy to the Cape Scott trailhead, then hike out to the lighthouse. Gravel roads, big views and a well-earned beer at the end.</p>',
		'journal'     => '<p>Day one was the Holberg road and a night at Nahwitti Lake. Day two carried on to San Josef Bay before the final push to the lighthouse.</p>',
		'date'        => '2026-06-15',
		'distance'    => '91.4',
		'weather'     => 'Overcast',
	],
	[
		'id'          => 101,
		'slug'        => 'san-josef-bay',
		'title'       => 'San Josef Bay',
		'data'        => strtr(json_encode($san_josef, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $token_map),
		'thumbnail'   => 'san-josef-bay',
		'description' => '<p>A short out-and-back to the sea stacks and wide sand of San Josef Bay.</p>',
		'journal'     => '<p>An easy afternoon stroll with the camera.</p>',
		'date'        => '2026-06-14',
		'distance'    => '9.2',
	],
	[
		'id'          => 102,
		'slug'        => 'north-coast-trail',
		'title'       => 'North Coast Trail',
		'data'        => strtr(json_encode($north_coast, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $token_map),
		'thumbnail'   => 'port-hardy-cape-scott',
		'description' => '<p>A demanding coastal route with tidal crossings and soft sand. Full pack, several days out.</p>',
		'journal'     => '<p>Tide tables ruled the schedule. Nels Bight was the highlight: empty beach, huge driftwood, no phone signal.</p>',
		'date'        => '2026-06-18',
		'distance'    => '43.0',
	],
];

$map_permalinks = [];

foreach ($demo_maps as $demo_map) {
	if (json_decode($demo_map['data'], true) === null) {
		waymark_demo_fail('Invalid GeoJSON for map ' . $demo_map['slug']);
	}

	$post_id = wp_insert_post([
		'import_id'   => $demo_map['id'],
		'post_type'   => 'waymark_map',
		'post_title'  => $demo_map['title'],
		'post_name'   => $demo_map['slug'],
		'post_status' => 'publish',
		'post_date'   => $demo_date,
		'post_author' => 1,
	], true);

	if (is_wp_error($post_id)) {
		waymark_demo_fail('Failed to insert map ' . $demo_map['slug'] . ': ' . $post_id->get_error_message());
	}
	if ((int) $post_id !== (int) $demo_map['id']) {
		waymark_demo_fail('Map ' . $demo_map['slug'] . ' got unexpected ID ' . $post_id);
	}

	// Map meta is written directly (the plugin's save_meta() requires POST/nonce).
	update_post_meta($post_id, 'waymark_map_data', wp_slash($demo_map['data']));
	update_post_meta($post_id, 'waymark_map_description', wp_slash($demo_map['description']));
	update_post_meta($post_id, 'waymark_map_journal_entry', wp_slash($demo_map['journal']));
	update_post_meta($post_id, 'waymark_map_date', $demo_map['date']);
	update_post_meta($post_id, 'waymark_map_distance_km', $demo_map['distance']);
	if (isset($demo_map['weather'])) {
		update_post_meta($post_id, 'waymark_map_weather', wp_slash($demo_map['weather']));
	}

	if (isset($image_ids[$demo_map['thumbnail']])) {
		set_post_thumbnail($post_id, $image_ids[$demo_map['thumbnail']]);
	}

	$map_permalinks[$demo_map['id']] = [
		'id'        => $demo_map['id'],
		'slug'      => $demo_map['slug'],
		'title'     => $demo_map['title'],
		// Build the canonical Map permalink directly. PHPUnit can leave the
		// rewrite permastruct unregistered in the seeding process, which makes
		// get_permalink() fall back to a query string.
		'permalink' => home_url('/' . trim(Waymark_Config::get_setting('misc', 'permalinks', 'permalink_slug_map') ?: 'map', '/') . '/' . $demo_map['slug'] . '/'),
	];
}

// ---------------------------------------------------------------------------
// 6. Collections (deterministic term IDs)
// ---------------------------------------------------------------------------

$max_term_id = (int) $wpdb->get_var("SELECT MAX(term_id) FROM {$wpdb->terms}");
$max_tt_id   = (int) $wpdb->get_var("SELECT MAX(term_taxonomy_id) FROM {$wpdb->term_taxonomy}");
$next_id     = max($max_term_id, $max_tt_id, 0) + 1;

// Reset both auto-increments to the same value so that inserted term_id and
// term_taxonomy_id stay in lockstep (Waymark_Collection mixes the two).
$wpdb->query("ALTER TABLE {$wpdb->terms} AUTO_INCREMENT = {$next_id}");
$wpdb->query("ALTER TABLE {$wpdb->term_taxonomy} AUTO_INCREMENT = {$next_id}");

$parent_term = wp_insert_term('Vancouver Island', 'waymark_collection');
if (is_wp_error($parent_term)) {
	waymark_demo_fail('Failed to insert parent collection: ' . $parent_term->get_error_message());
}
$day_term = wp_insert_term('Day Hikes', 'waymark_collection', ['parent' => $parent_term['term_id']]);
if (is_wp_error($day_term)) {
	waymark_demo_fail('Failed to insert "Day Hikes": ' . $day_term->get_error_message());
}
$backpack_term = wp_insert_term('Backpacking', 'waymark_collection', ['parent' => $parent_term['term_id']]);
if (is_wp_error($backpack_term)) {
	waymark_demo_fail('Failed to insert "Backpacking": ' . $backpack_term->get_error_message());
}

$associations = [
	100 => [$parent_term['term_id'], $backpack_term['term_id']],
	101 => [$parent_term['term_id'], $day_term['term_id']],
	102 => [$parent_term['term_id'], $backpack_term['term_id']],
];

foreach ($associations as $map_id => $term_ids) {
	wp_set_object_terms($map_id, $term_ids, 'waymark_collection', false);
}

$collection_output = [];
foreach ([$parent_term, $day_term, $backpack_term] as $term_result) {
	$term = get_term($term_result['term_id'], 'waymark_collection');
	$collection_output[] = [
		'term_id' => (int) $term->term_id,
		'slug'    => $term->slug,
		'name'    => $term->name,
		'parent'  => (int) $term->parent,
	];
}

// ---------------------------------------------------------------------------
// 7. Demo Page (Map shortcode + Collection shortcode)
// ---------------------------------------------------------------------------

$page_content = '<h2>Cape Scott Trail</h2>' . "\n\n"
	. '[Waymark map_id="100" show_elevation="1"]' . "\n\n"
	. '<h2>Vancouver Island</h2>' . "\n\n"
	. '[Waymark collection_id="' . $parent_term['term_id'] . '"]';

$page_id = wp_insert_post([
	'import_id'   => $demo_page_id,
	'post_type'   => 'page',
	'post_title'  => 'Waymark Demo',
	'post_name'   => $demo_page_slug,
	'post_status' => 'publish',
	'post_date'   => $demo_date,
	'post_content' => $page_content,
	'post_author' => 1,
], true);

if (is_wp_error($page_id)) {
	waymark_demo_fail('Failed to insert demo page: ' . $page_id->get_error_message());
}

// ---------------------------------------------------------------------------
// 8. Emit seed-output.json (deterministic; no attachment IDs)
// ---------------------------------------------------------------------------

$seed_output = [
	'maps'         => array_values($map_permalinks),
	'page'         => [
		'id'    => (int) $page_id,
		'slug'  => get_post_field('post_name', $page_id),
		'title' => get_the_title($page_id),
		'url'   => get_permalink($page_id),
	],
	'collections'  => $collection_output,
	'images'       => $image_urls,
	'settings_url' => $settings_url,
];

$output_path = __DIR__ . '/seed-output.json';
file_put_contents(
	$output_path,
	json_encode($seed_output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n"
);

// ---------------------------------------------------------------------------
// 9. Summary
// ---------------------------------------------------------------------------

waymark_demo_log('');
waymark_demo_log('Waymark demo data seeded');
waymark_demo_log('  Maps:');
foreach ($map_permalinks as $map) {
	waymark_demo_log('    #' . $map['id'] . '  ' . $map['title'] . '  ->  ' . $map['permalink']);
}
waymark_demo_log('  Page: #' . $page_id . '  ' . get_the_title($page_id) . '  ->  ' . get_permalink($page_id));
waymark_demo_log('  Collections:');
foreach ($collection_output as $collection) {
	waymark_demo_log('    #' . $collection['term_id'] . '  ' . $collection['name'] . '  (parent ' . $collection['parent'] . ')');
}
waymark_demo_log('  Images: ' . count($image_urls) . ' sideloaded to ' . $uploads['baseurl'] . '/' . $upload_subdir . '/');
waymark_demo_log('  Output: ' . $output_path);
waymark_demo_log('');
