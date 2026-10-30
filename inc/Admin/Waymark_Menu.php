<?php

class Waymark_Menu {

	private $admin_url_request;
	private $menu_slug = 'edit.php?post_type=waymark_map';

	function __construct() {
		$server_data = wp_unslash($_SERVER);
		if (isset($server_data['REQUEST_URI'])) {
			$this->admin_url_request = basename(esc_url($server_data['REQUEST_URI']));
		} else {
			$this->admin_url_request = '';
		}

		//Top-level
		add_menu_page(Waymark_Config::get_name(true), Waymark_Config::get_name(true), 'edit_posts', $this->menu_slug, '', 'none', 21);

		//Maps
		add_submenu_page($this->menu_slug, __('Maps', 'waymark'), __('Maps', 'waymark'), 'edit_posts', 'edit.php?post_type=waymark_map');
		add_submenu_page($this->menu_slug, __('New Map', 'waymark'), __('New Map', 'waymark'), 'edit_posts', 'post-new.php?post_type=waymark_map');

		//Collections
		add_submenu_page($this->menu_slug, __('Collections', 'waymark'), __('Collections', 'waymark'), 'manage_categories', 'edit-tags.php?taxonomy=waymark_collection&post_type=waymark_map');

		//Help
		add_submenu_page($this->menu_slug, __('Documentation', 'waymark'), __('Documentation', 'waymark') . ' <i style="font-size:12px" class="fa fa-external-link"></i>', 'edit_posts', Waymark_Helper::site_url());

		//Settings
		add_submenu_page($this->menu_slug, __('Settings', 'waymark'), __('Settings', 'waymark'), 'manage_options', 'waymark-settings', [new Waymark_Settings, 'content_admin_page']);

		add_action('admin_menu', [$this, 'modify_menu'], 1000);

		Waymark_CSS::add_chunk('
.wp-has-submenu.toplevel_page_waymark-top ul.wp-submenu li.wp-first-item {
	display: none;
}
			');
	}

	function modify_menu() {
		global $menu, $submenu, $pagenow;

		//Waymark menu
		foreach ($menu as &$m) {
			if ($m[2] == $this->menu_slug) {
				//Map Posts
				$get_data = wp_unslash($_GET);
				if ($pagenow == 'post.php' && array_key_exists('post', $get_data)) {
					// Is the current post a Map?
					$post_type = get_post_type(esc_attr($get_data['post']));
					if (Waymark_Config::is_custom_type($post_type)) {
						$m[4] .= ' wp-has-current-submenu';
					}
				}
			}
		}

		//Waymark sub menu
		if (array_key_exists($this->menu_slug, $submenu)) {
			foreach ($submenu[$this->menu_slug] as &$sub_menu) {
				//Hide the New Map link; match on the slug so translated labels are not load-bearing.
				if ($sub_menu[2] === 'post-new.php?post_type=waymark_map') {
					$sub_menu[4] = 'hidden';
				}

				//Make the parent link active when adding a new Map or Collection.
				if (
					$sub_menu[2] === 'edit.php?post_type=waymark_map' && $this->admin_url_request === 'post-new.php?post_type=waymark_map'
					||
					$sub_menu[2] === 'edit-tags.php?taxonomy=waymark_collection&post_type=waymark_map' && (strpos($this->admin_url_request, 'edit-tags.php?taxonomy=waymark_collection') !== false)
				) {
					$sub_menu[4] = 'current';
				}
			}
		}
	}

	function show_setup_menu($show = true) {
		//Show
		if ($show) {
			Waymark_CSS::add_chunk('
.wp-has-submenu.toplevel_page_waymark-top ul.wp-submenu li {
	display: none;
}
.wp-has-submenu.toplevel_page_waymark-top ul.wp-submenu li.wp-first-item {
	display: block;
}
			');
			//Hide
		} else {
			Waymark_CSS::add_chunk('
.wp-has-submenu.toplevel_page_waymark-top ul.wp-submenu li.wp-first-item {
	display: none;
}
			');
		}
	}
}
new Waymark_Menu;
