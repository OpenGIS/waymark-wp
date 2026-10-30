<?php

class Waymark_Taxonomies
{
    private $taxonomies;

    public function __construct()
    {
        add_action('init', [$this, 'register_taxonomies']);
    }

    public function register_taxonomies()
    {
        $this->taxonomies = [
            [
                'key'  => 'waymark_collection',
                'type' => ['waymark_map'],
                'args' => [
                    'labels'            => [
                        'name'                       => __('Collections', 'waymark'),
                        'singular_name'              => __('Collection', 'waymark'),
                        'menu_name'                  => __('Collections', 'waymark'),
                        'all_items'                  => __('All Collections', 'waymark'),
                        'parent_item'                => __('Parent Collection', 'waymark'),
                        'parent_item_colon'          => __('Parent Collection:', 'waymark'),
                        'new_item_name'              => __('New Collection Name', 'waymark'),
                        'add_new_item'               => __('Add New Collection', 'waymark'),
                        'edit_item'                  => __('Edit Collection', 'waymark'),
                        'update_item'                => __('Update Collection', 'waymark'),
                        'view_item'                  => __('View Collection', 'waymark'),
                        'separate_items_with_commas' => __('Separate Collections with commas', 'waymark'),
                        'add_or_remove_items'        => __('Add or remove Collections', 'waymark'),
                        'choose_from_most_used'      => __('Choose from the most used Collections', 'waymark'),
                        'popular_items'              => __('Popular Collections', 'waymark'),
                        'search_items'               => __('Search Collections', 'waymark'),
                        'not_found'                  => __('No Collections found.', 'waymark'),
                        'no_terms'                   => __('No Collections', 'waymark'),
                        'items_list'                 => __('Collections list', 'waymark'),
                        'items_list_navigation'      => __('Collections list navigation', 'waymark'),
                        'back_to_items'              => __('Back to Collections', 'waymark'),
                    ],
                    'hierarchical'      => true,
                    'public'            => true,
                    'rewrite'           => [
                        'slug' => Waymark_Config::get_setting('misc', 'permalinks', 'permalink_slug_collection'),
                    ],
                    'show_ui'           => true,
                    'show_admin_column' => true,
                    'show_in_nav_menus' => true,
                    'show_tagcloud'     => true,
                    'show_in_rest'      => true,
                    'rest_base'         => Waymark_Config::get_setting('misc', 'permalinks', 'permalink_slug_collection'),
                ],
            ],
        ];

        foreach ($this->taxonomies as $taxonomy) {
            register_taxonomy($taxonomy['key'], $taxonomy['type'], $taxonomy['args']);
        }
    }
}
