<?php

class Waymark_Meta {

	private $Waymark_Object;

	public function __construct() {
		//Map
		add_meta_box('waymark_map_meta', esc_html__('Map Editor', 'waymark'), [$this, 'get_map_form'], 'waymark_map', 'normal', 'high');

		//Map
		add_meta_box('waymark_map_shortcode', __('Shortcode', 'waymark'), [$this, 'map_shortcode_content'], 'waymark_map', 'side', 'default');
		add_meta_box('waymark_map_export', __('Export', 'waymark'), [$this, 'map_export_content'], 'waymark_map', 'side', 'default');

		add_action('post_edit_form_tag', [$this, 'add_post_enctype']);
		add_action('post_updated', [$this, 'post_updated'], 10, 2);

		//Waymark JS
		//CSS
		wp_register_style('waymark-js', Waymark_Helper::plugin_url('waymark-js/dist/css/waymark-js.min.css'), [], Waymark_Config::get_version());
		wp_enqueue_style('waymark-js');

		//JS

		// Use human readble version of Waymark JS if debug is on :)
		$waymark_js_filename = (Waymark_Helper::is_debug()) ? 'waymark-js.js' : 'waymark-js.min.js';

		wp_register_script('waymark-js', Waymark_Helper::plugin_url('waymark-js/dist/js/' . $waymark_js_filename), ['jquery'], Waymark_Config::get_version());
		//Localize
		wp_localize_script('waymark-js', 'waymark_js', [
			'ajaxurl' => admin_url('admin-ajax.php'),
			'lang' => Waymark_Lang::get_js_lang(),
		]);
		wp_enqueue_script('waymark-js');
	}

	public function add_post_enctype() {
		global $post;

		if (in_array($post->post_type, ['waymark_map'])) {
			echo ' enctype="multipart/form-data"';
		}
	}

	public function post_updated() {
		global $post;

		$post_data = wp_unslash($_POST);

		// Check nonce
		if (array_key_exists(Waymark_Config::get_item('nonce_string'), $post_data) && wp_verify_nonce($post_data[Waymark_Config::get_item('nonce_string')], 'create_form')) {
			if (is_object($post) && ! (wp_is_post_revision($post->ID) || wp_is_post_autosave($post->ID))) {
				switch ($post->post_type) {
				//Map
				case 'waymark_map':
					// Add slashes
					$post_data = wp_slash($post_data);

					$Map = new Waymark_Map;
					$Map->set_data($post_data);
					$Map->save_meta($post->ID);

					break;
				}
			}
		}
	}

	public function map_export_content() {
		global $post;

		$Map = new Waymark_Map($post->ID);

		$has_features = array_key_exists('map_data', $Map->data) && Waymark_GeoJSON::get_feature_count($Map->data['map_data']);
		if ($has_features) {
			echo '<a data-title="' . esc_attr__('Download the Overlays added to this Map in the selected format.', 'waymark') . '" href="#" onclick="return false;" class="waymark-tooltip">?</a>';

			// Escape HTML output
			echo wp_kses(Waymark_Helper::map_export_html($Map), [
				'form' => [
					'id' => [],
					'class' => [],
					'action' => [],
					'method' => [],
					'data-map_slug' => [],
					'data-map_id' => [],
				],
				'select' => [
					'name' => [],
				],
				'option' => [
					'value' => [],
					'name' => [],
				],
				'input' => [
					'type' => [],
					'value' => [],
					'name' => [],
				],
				'div' => [
					'id' => [],
					'class' => [],
					'action' => [],
					'method' => [],
					'data-map_slug' => [],
					'data-map_id' => [],
				],
			]);
		}
	}

	public function map_shortcode_content() {
		global $post;

		//Shortcode output
		echo '<a data-title="' . esc_attr__('Add this Map to your content with this Shortcode. Click here for more details.', 'waymark') . '" href="' . esc_url(Waymark_Helper::site_url('#shortcodes')) . '" class="waymark-tooltip">?</a>';
		echo '<input type="text" value="[' . esc_attr(Waymark_Config::get_item('shortcode')) . ' map_id=&quot;' . esc_attr($post->ID) . '&quot;]" />';
		//echo '<p>' . sprintf(__('Add this Map to your content with this <a href="%s">Shortcode</a>.', 'waymark'), ) . '</p>';
	}

	public function get_map_form() {
		//WP Media Library
		wp_enqueue_media();

		//WP TinyMCE
		wp_enqueue_editor();

		global $post;

		// Create new Map object
		$Map = new Waymark_Map($post->ID);

		// Add Editor
		Waymark_JS::add_editor($Map->get_geojson());

		// Map Form (inc. Meta)
		echo wp_kses($Map->create_form(), Waymark_Helper::allowable_tags('parameter'));

		// translators: %s: Link to Waymark Settings
		echo '<p>' . sprintf(wp_kses(__('You can manage Meta fields in <a href="%s">Settings</a>.', 'waymark'), ['a' => ['href' => []]]), esc_url(admin_url('edit.php?post_type=waymark_map&page=waymark-settings&content=waymark-settings-tab-meta'))) . '</p>';
	}
}
new Waymark_Meta;
