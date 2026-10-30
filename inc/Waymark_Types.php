<?php

class Waymark_Types {
	private $types;

	function __construct() {
		add_action('init', array($this, 'register_types'), 0);
	}

	function register_types() {
		$this->types = array(
			//Map
			'waymark_map' => array(
				'label' => __('Map', 'waymark'),
				'description' => '',
				'labels' => array(
					'name' => __('Maps', 'waymark'),
					'singular_name' => __('Map', 'waymark'),
					'menu_name' => __('Maps', 'waymark'),
					'name_admin_bar' => __('Map', 'waymark'),
					'archives' => __('Map Archives', 'waymark'),
					'attributes' => __('Map Attributes', 'waymark'),
					'parent_item_colon' => __('Parent Map:', 'waymark'),
					'all_items' => __('All Maps', 'waymark'),
					'add_new_item' => __('Add New Map', 'waymark'),
					'add_new' => __('Add New', 'waymark'),
					'new_item' => __('New Map', 'waymark'),
					'edit_item' => __('Edit Map', 'waymark'),
					'update_item' => __('Update Map', 'waymark'),
					'view_item' => __('View Map', 'waymark'),
					'view_items' => __('View Maps', 'waymark'),
					'search_items' => __('Search Maps', 'waymark'),
					'not_found' => __('No Maps found.', 'waymark'),
					'not_found_in_trash' => __('No Maps found in Trash.', 'waymark'),
					'featured_image' => __('Featured Image', 'waymark'),
					'set_featured_image' => __('Set featured image', 'waymark'),
					'remove_featured_image' => __('Remove featured image', 'waymark'),
					'use_featured_image' => __('Use as featured image', 'waymark'),
					'insert_into_item' => __('Insert into Map', 'waymark'),
					'uploaded_to_this_item' => __('Uploaded to this Map', 'waymark'),
					'items_list' => __('Maps list', 'waymark'),
					'items_list_navigation' => __('Maps list navigation', 'waymark'),
					'filter_items_list' => __('Filter Maps list', 'waymark'),
				),
				// Default - overridden below
				'supports' => array('title'),
				'hierarchical' => false,
				'public' => true,
				'show_ui' => true,
				'show_in_menu' => false,
				'show_in_rest' => true,
				'rest_base' => Waymark_Config::get_setting('misc', 'permalinks', 'permalink_slug_map'),
				'menu_position' => 5,
				'show_in_admin_bar' => true,
				'show_in_nav_menus' => true,
				'can_export' => true,
				'has_archive' => false,
				'exclude_from_search' => false,
				'publicly_queryable' => true,
				'rewrite' => array(
					'slug' => Waymark_Config::get_setting('misc', 'permalinks', 'permalink_slug_map'),
					'with_front' => false,
				),
				'capability_type' => 'post',
			),
		);

		// Custom post support
		$supports = Waymark_Config::get_setting('misc', 'post', 'supports');
		if (is_array($supports) && sizeof($supports)) {
			// Override default supports
			$this->types['waymark_map']['supports'] = [];

			foreach ($supports as $support) {
				$this->types['waymark_map']['supports'][] = $support;
			}
		}

		//Show if debug
		if (Waymark_Config::get_setting('misc', 'advanced', 'debug_mode') == true) {
			$this->types['waymark_map']['supports'][] = 'custom-fields';
		}

		//Add Featured Image Support
		add_theme_support('post-thumbnails', array('waymark_map'));

		$types = array();
		foreach ($this->types as $type_id => $type_data) {
			$types[] = $type_id;
			register_post_type($type_id, $type_data);
		}

		Waymark_Config::set_item('custom_types', $types);
	}

	function delete_posts() {
		//For each custom type
		foreach ($this->types as $type_id => $type_data) {
			//Get posts
			$posts = get_posts(array(
				'post_type' => $type_id,
			));

			//For each post
			foreach ($posts as $post) {
				//Force delete post
				wp_delete_post($post->ID, true);
			}
		}
	}
}
