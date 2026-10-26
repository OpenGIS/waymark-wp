<?php

class Waymark_Settings {
	private $settings_id      = 'Waymark_Settings';
	private $page_slug        = 'waymark-settings';
	private $default_content  = 'waymark-settings-tab-tiles';
	private $current_settings = [];
	public $tabs              = [];
	public $settings_nav;

	public function __construct() {

		//Get current settings from DB
		$current_settings = get_option('Waymark_Settings');
		if (is_array($current_settings)) {
			$this->current_settings = $current_settings;
		}

		/**
		 * ===========================================
		 * =============== SETTINGS NAV ==============
		 * ===========================================
		 */

		$this->settings_nav = [
			'label_maps' => esc_html__('Maps', 'waymark'),
			'waymark-settings-tab-tiles' => esc_html__('Basemaps', 'waymark'),
			'waymark-settings-section-shortcode_options' => esc_html__('Shortcodes', 'waymark'),
			'waymark-settings-section-elevation_options' => esc_html__('Elevation', 'waymark'),
			'waymark-settings-tab-meta' => esc_html__('Meta', 'waymark'),
			'waymark-settings-section-interaction_options' => esc_html__('Sleep', 'waymark'),
			'waymark-settings-section-cluster_options' => esc_html__('Clustering', 'waymark'),
			'waymark-settings-section-map_options' => esc_html__('Misc.', 'waymark'),
			'label_overlays' => esc_html__('Overlays', 'waymark'),
			'waymark-settings-tab-markers' => esc_html__('Markers', 'waymark'),
			'waymark-settings-tab-lines' => esc_html__('Lines', 'waymark'),
			'waymark-settings-tab-shapes' => esc_html__('Shapes', 'waymark'),
			'waymark-settings-tab-properties' => esc_html__('Properties', 'waymark'),
			'label_sources' => esc_html__('Sources', 'waymark'),
			'waymark-settings-tab-submission' => esc_html__('Submissions', 'waymark'),
			'label_advanced' => esc_html__('Advanced', 'waymark'),
			'waymark-settings-tab-misc' => esc_html__('Advanced', 'waymark'),
		];

		/**
		 * ===========================================
		 * ================= BASEMAPS ================
		 * ===========================================
		 */

		$this->tabs['tiles'] = [
			'name' => esc_html__('Basemaps', 'waymark'),
			'description' => '',
			'sections' => [
				'layers' => [
					'repeatable' => true,
					// translators: The name of the section for adding Basemaps
					'title' => esc_html__('Basemaps', 'waymark'),
					// translators: The description of the section for adding Basemaps
					'description' => sprintf(__('<span class="waymark-lead">Waymark uses the excellent <a href="%1$s">OpenStreetMap</a> as its default Basemap and supports many <a href="%2$s">other providers</a>.<br /><br /><a href="%3$s">Thunderforest</a> and <a href="%4$s">Mapbox</a> are examples of providers that offer easy access to beautiful Basemaps (including satellite imagery). They require registration, but have a free usage tier.', 'waymark'), 'https://www.openstreetmap.org/fixthemap', 'https://leaflet-extras.github.io/leaflet-providers/preview/', 'https://www.thunderforest.com/', 'https://www.mapbox.com/maps/'),
					// translators: The footer of the section for adding Basemaps
					'footer' => '<small>' . sprintf(__('Pro Tip! If you have more than one Basemap, you can switch between them when viewing the Map. The first listed will be used as the default, unless specified in the shortcode like this: %s. Drag to re-order, remove all to restore defaults.', 'waymark'), '</small>[' . Waymark_Config::get_item('shortcode') . ' map_id=&quot;1234&quot; basemap=&quot;Basemap Name&quot;]'),
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('customising/settings/#tiles')),
						// translators: The link to the Basemaps documentation
						'text' => esc_attr__('Basemap Docs &raquo;', 'waymark'),
					],
					'fields' => [
						'layer_name' => [
							'name' => 'layer_name',
							'id' => 'layer_name',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the name of the Basemap
							'title' => esc_html__('Basemap', 'waymark') . ' ' . esc_html__('Name', 'waymark'),
							'default' => Waymark_Config::get_setting('tiles', 'layers', 'layer_name'),
							// translators: The tip for the field for the name of the Basemap
							'tip' => sprintf(esc_attr__('The Layer Name will appear in a dropdown list shown by the Map when multiple Basemaps have been entered. You can change the default basemap in the shortcode: %s', 'waymark'), '[' . Waymark_Config::get_item('shortcode') . ' map_id=&quot;1234&quot; basemap=&quot;Basemap Name&quot;]'),
							'input_processing' => [
								'not_empty',
							],
							// translators: The fallback for the name of the Basemap
							'fallback' => esc_html__('Basemap', 'waymark') . ' ' . substr(md5(wp_rand(0, 999999)), 0, 5),
						],
						'layer_url' => [
							'name' => 'layer_url',
							'id' => 'layer_url',
							'type' => 'text',
							'class' => '',
							'title' => '<span class="waymark-invisible">' . esc_html__('Basemap', 'waymark') . '</span> URL',
							'default' => Waymark_Config::get_setting('tiles', 'layers', 'layer_url'),
							// translators: The tip for the field for the URL of the Basemap
							'tip' => sprintf(esc_attr__('Many mapping services support the Slippy Map format. Waymark requires URLs that contain {z} (zoom level) and {x}/{y} (tile coordinates). For example the OpenCycleMap URL is %s.', 'waymark'), 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}@2x.png?apikey=[your_api_key]'),
							'tip_link' => 'https://www.thunderforest.com/docs/map-tiles-api/',
						],
						'layer_attribution' => [
							'name' => 'layer_attribution',
							'id' => 'layer_attribution',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the attribution of the Basemap
							'title' => '<span class="waymark-invisible">' . esc_html__('Basemap', 'waymark') . '</span> Attribution',
							'default' => Waymark_Config::get_setting('tiles', 'layers', 'layer_attribution'),
							// translators: The tip for the field for the attribution of the Basemap
							'tip' => esc_attr__('Mapping services often have the requirement that attribution is displayed by the map. Text and HTML links are supported.', 'waymark'),
							'tip_link' => 'https://www.thunderforest.com/terms/#attribution',
							'input_processing' => [
								'layer_attribution',
							],
						],
						'layer_max_zoom' => [
							'name' => 'layer_max_zoom',
							'id' => 'layer_max_zoom',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the maximum zoom level of the Basemap
							'title' => '<span class="waymark-invisible">' . esc_html__('Basemap', 'waymark') . '</span> ' . esc_html__('Max Zoom', 'waymark'),
							'default' => Waymark_Config::get_setting('tiles', 'layers', 'layer_max_zoom'),
							// translators: The tip for the field for the maximum zoom level of the Basemap
							'tip' => esc_attr__('Set a maximum zoom level for this Basemap, the default is 18.', 'waymark'),
							'input_processing' => [
								'valid_zoom',
							],
							'fallback' => 18,
						],
					],
				],
			],
		];

		/**
		 * ===========================================
		 * ================= MARKERS =================
		 * ===========================================
		 */

		$this->tabs['markers'] = [
			// translators: The name of the tab for customising Markers
			'name' => esc_html__('Markers', 'waymark'),
			'description' => '',
			'sections' => [
				'marker_types' => [
					'repeatable' => true,
					// translators: The title of the section for adding Marker Types
					'title' => esc_html__('Marker', 'waymark') . ' ' . esc_html__('Types', 'waymark'),
					'description' => '<span class="waymark-lead">' . __('Customise how Markers are displayed on the Map. Set these styles once, then select the appropriate Type when you add to the Map.', 'waymark') . '</span>',
					// translators: The footer of the section for adding Marker Types

					'footer' => '<small>' . __('<b>Pro Tip!</b> The first listed will be used as the default. Drag to re-order, remove all to restore defaults.', 'waymark') . '</small>',
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('customising/settings/#markers')),
						// translators: The link to the Marker Types documentation
						'text' => esc_attr__('Type Docs &raquo;', 'waymark'),
					],
					'fields' => [
						'marker_title' => [
							'name' => 'marker_title',
							'id' => 'marker_title',
							'type' => 'text',
							'class' => 'waymark-uneditable',
							// translators: The title of the field for the name of the Marker
							'title' => esc_html__('Marker', 'waymark') . ' ' . esc_html__('Label', 'waymark'),
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'marker_title'),
							// translators: The tip for the field for the name of the Marker
							'tip' => esc_attr__('What kind of Marker is this? E.g. "Photo", "Grocery Store", "Warning!". Once saved, Marker labels can not be edited. The Marker Label is displayed in the Tooltip (when hovering over the Marker) and in the Info Window (once the Marker is clicked). Hide in Settings > Map > Misc. > Type Labels.', 'waymark'),
							'input_processing' => [
								'not_empty',
							],
							// translators: The fallback for the name of the Marker
							'fallback' => esc_html__('Marker', 'waymark') . ' ' . substr(md5(wp_rand(0, 999999)), 0, 5),
						],
						'marker_shape' => [
							'name' => 'marker_shape',
							'id' => 'marker_shape',
							'type' => 'select',
							'class' => '',
							// translators: The title of the field for the shape of the Marker
							'title' => '<span class="waymark-invisible">' . esc_html__('Marker', 'waymark') . '</span> ' . esc_html__('Shape', 'waymark'),
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'marker_shape'),
							// translators: The tip for the field for the shape of the Marker
							'tip' => esc_attr__('Which shape of Marker to use. Circles and Squares are centered at the specified location, Markers point down to that location.', 'waymark'),
							'options' => [
								// translators: The option for a Marker that is a circle
								'marker' => esc_html__('Marker', 'waymark'),
								// translators: The option for a Marker that is a square
								'circle' => esc_html__('Circle', 'waymark'),
								// translators: The option for a Marker that is a square
								'rectangle' => esc_html__('Square', 'waymark'),
							],
						],
						'marker_size' => [
							'name' => 'marker_size',
							'id' => 'marker_size',
							'type' => 'select',
							'class' => '',
							// translators: The title of the field for the size of the Marker
							'title' => '<span class="waymark-invisible">' . esc_html__('Marker', 'waymark') . '</span> ' . esc_html__('Size', 'waymark'),
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'marker_size'),
							// translators: The tip for the field for the size of the Marker
							'tip' => esc_attr__('Which size of Marker to use.', 'waymark'),
							'options' => [
								// translators: The option for a small Marker
								'small' => esc_html__('Small', 'waymark'),
								// translators: The option for a medium Marker
								'medium' => esc_html__('Medium', 'waymark'),
								// translators: The option for a large Marker
								'large' => esc_html__('Large', 'waymark'),
							],
						],
						'marker_colour' => [
							'name' => 'marker_colour',
							'id' => 'marker_colour',
							'type' => 'text',
							'class' => 'waymark-short-input',
							'title' => '<span class="waymark-invisible">' . esc_html__('Marker', 'waymark') . '</span> ' . esc_html__('Background', 'waymark'),
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'marker_colour'),
							// translators: The tip for the field for the background colour of the Marker
							'tip' => esc_attr__('The Marker background colour. Click "Select Colour" to select.', 'waymark'),
							'input_processing' => [
								'not_empty',
							],
							'fallback' => 'white',
						],
						'marker_display' => [
							'name' => 'marker_display',
							'id' => 'marker_display',
							'type' => 'boolean',
							// translators: The title of the field for whether the Marker should be shown initially
							'title' => '<span class="waymark-invisible">' . esc_html__('Marker', 'waymark') . '</span> ' . esc_html__('Show Initially', 'waymark'),
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'marker_display'),
							// translators: The tip for the field for whether the Marker should be shown initially
							'tip' => esc_attr__('When using the Overlay Filter you can choose to show/hide certain Types when the Map initially loads.', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => 1,
						],
						'marker_submission' => [
							'name' => 'marker_submission',
							'id' => 'marker_submission',
							'type' => 'boolean',
							// translators: The title of the field for whether the Marker should be available for front-end submissions
							'title' => '<span class="waymark-invisible">' . esc_html__('Marker', 'waymark') . '</span> ' . esc_html__('Submissions?', 'waymark'),
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'marker_submission'),
							// translators: The tip for the field for whether the Marker should be available for front-end submissions
							'tip' => esc_attr__('Make this Type available in front-end Submissions?', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => 1,
						],
						'icon_type' => [
							'name' => 'icon_type',
							'id' => 'icon_type',
							'type' => 'select',
							'class' => '',
							// translators: The title of the field for the type of the Marker
							'title' => esc_html__('Icon', 'waymark') . ' ' . esc_html__('Type', 'waymark'),
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'icon_type'),
							// translators: The tip for the field for the type of the Marker
							'tip' => esc_attr__('Font Icons are available from Font Awesome and Ionic Icons. Simple Text or Emojis are supported, as well as custom HTML. So you can pretty much use anything you like!', 'waymark'),
							'tip_link' => 'https://emojifinder.com/',
							'options' => [
								// translators: The option for a Font Icon
								'icon' => esc_html__('Font Icon', 'waymark'),
								// translators: The option for a Text or Emoji
								'text' => esc_html__('Text (or Emoji!)', 'waymark'),
								// translators: The option for custom HTML
								'html' => esc_html__('HTML', 'waymark'),
							],
						],
						'marker_icon' => [
							'name' => 'marker_icon',
							'id' => 'marker_icon',
							'type' => 'text',
							'class' => 'waymark-short-input',
							'title' => '<span class="waymark-invisible">' . esc_html__('Icon', 'waymark') . '</span> <span class="waymark-icon-type">' . esc_html__('Name', 'waymark') . '</span>',
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'marker_icon'),
							// translators: The tip for the field for the name of the Marker
							'tip' => esc_attr__('The desired icon name from Ionicons or Font Awesome, e.g. "ion-camera", or "fa-camera". Click the links to see the full list of icons available.|Text to display inside the Marker, in the chosen colour. Space is very limited! Pro Tip: adjust text size using CSS; for all Markers: .waymark-icon-text{font-size: 18px}, or by Type: .waymark-marker-photo .waymark-icon-text{...}. Use your browser\'s inspector to dig for Type class names.|The HTML entered will be added inside each Marker. Pro Tip! HTML Entities supported (e.g. &amp;cross; as well as Unicode and Emojis!), or provide HTML to integrate with other Icon providers.', 'waymark'),
							'input_processing' => [
								'marker_icon',
							],
							'append' => '<div class="waymark-icons-help"><a href="https://ionic.io/ionicons/v2/cheatsheet.html">Ionic Icons</a><a href="https://fontawesome.com/v4.7.0/cheatsheet/">Font Awesome</a></div>',
						],
						'icon_colour' => [
							'name' => 'icon_colour',
							'id' => 'icon_colour',
							'type' => 'text',
							'class' => 'waymark-short-input waymark-colour-picker',
							'title' => '<span class="waymark-invisible">' . esc_html__('Icon', 'waymark') . '</span> ' . esc_html__('Colour', 'waymark'),
							'default' => Waymark_Config::get_setting('markers', 'marker_types', 'icon_colour'),
							// translators: The tip for the field for the colour of the Marker
							'tip' => esc_attr__('The colour of the icon. Click "Select Colour" to select.', 'waymark'),
							'input_processing' => [
								'not_empty',
							],
							'fallback' => '#81d742',
						],
					],
				],
			],
		];

		/**
		 * ===========================================
		 * ================== LINES ==================
		 * ===========================================
		 */

		$this->tabs['lines'] = [
			// translators: The name of the tab for customising Lines
			'name' => esc_html__('Lines', 'waymark'),
			'description' => '',
			'sections' => [
				'line_types' => [
					'repeatable' => true,
					// translators: The title of the section for adding Line Types
					'title' => esc_html__('Line', 'waymark') . ' ' . esc_html__('Types', 'waymark'),
					'description' => '<span class="waymark-lead">' . __('Customise how Lines are displayed on the Map. Set these styles once, then select the appropriate Type when you add to the Map.', 'waymark') . '</span>',
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('customising/settings/#lines')),
						// translators: The link to the Line Types documentation
						'text' => esc_attr__('Type Docs &raquo;', 'waymark'),
					],
					'footer' => '<small>' . __('<b>Pro Tip!</b> The first listed will be used as the default. Drag to re-order, remove all to restore defaults.', 'waymark') . '</small>',
					'fields' => [
						'line_title' => [
							'name' => 'line_title',
							'id' => 'line_title',
							'type' => 'text',
							'class' => 'waymark-uneditable',
							// translators: The title of the field for the name of the Line
							'title' => esc_html__('Line', 'waymark') . ' ' . esc_html__('Label', 'waymark'),
							'default' => Waymark_Config::get_setting('lines', 'line_types', 'line_title'),
							// translators: The tip for the field for the name of the Line
							'tip' => esc_attr__('What kind of Line is this? E.g. "Easy", "Walking Only", "Dark Red". The Line Label is displayed in the Tooltip (when hovering over the Line) and in the Line Info Window. Once saved, Line labels can not be edited.', 'waymark'),
							'input_processing' => [
								'not_empty',
							],
							// translators: The fallback for the name of the Line
							'fallback' => esc_html__('Line', 'waymark') . ' ' . substr(md5(wp_rand(0, 999999)), 0, 5),
						],
						'line_colour' => [
							'name' => 'line_colour',
							'id' => 'line_colour',
							'type' => 'text',
							'class' => 'waymark-short-input waymark-colour-picker',
							// translators: The title of the field for the colour of the Line
							'title' => '<span class="waymark-invisible">' . esc_html__('Line', 'waymark') . '</span> ' . esc_html__('Colour', 'waymark'),
							'default' => Waymark_Config::get_setting('lines', 'line_types', 'line_colour'),
							// translators: The tip for the field for the colour of the Line
							'tip' => esc_attr__('The colour of the Line. Click "Select Colour" to select.', 'waymark'),
							'input_processing' => [
								'not_empty',
							],
							'fallback' => '#81d742',
						],
						'line_weight' => [
							'name' => 'line_weight',
							'id' => 'line_weight',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the weight of the Line
							'title' => '<span class="waymark-invisible">' . esc_html__('Line', 'waymark') . '</span> ' . esc_html__('Weight', 'waymark'),
							'default' => Waymark_Config::get_setting('lines', 'line_types', 'line_weight'),
							// translators: The tip for the field for the weight of the Line
							'tip' => esc_attr__('The width of the Line, in pixels.', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => 3,
						],
						'line_opacity' => [
							'name' => 'line_opacity',
							'id' => 'line_opacity',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the opacity of the Line
							'title' => '<span class="waymark-invisible">' . esc_html__('Line', 'waymark') . '</span> ' . esc_html__('Opacity', 'waymark'),
							'default' => Waymark_Config::get_default('lines', 'line_types', 'line_opacity'),
							// translators: The tip for the field for the opacity of the Line
							'tip' => esc_attr__('The opacity of the Line, between 0.0 and 1.0 (e.g. "0.5").', 'waymark'),
							'input_processing' => [
								'valid_opacity',
							],
							'fallback' => 0.7,
						],
						'line_display' => [
							'name' => 'line_display',
							'id' => 'line_display',
							'type' => 'boolean',
							// translators: The title of the field for whether the Line should be shown initially
							'title' => '<span class="waymark-invisible">' . esc_html__('Line', 'waymark') . '</span> ' . esc_html__('Show Initially', 'waymark'),
							'default' => Waymark_Config::get_setting('lines', 'line_types', 'line_display'),
							// translators: The tip for the field for whether the Line should be shown initially
							'tip' => esc_attr__('When using the Overlay Filter you can choose to show/hide certain Types when the Map initially loads.', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => 1,

						],
						'line_submission' => [
							'name' => 'line_submission',
							'id' => 'line_submission',
							'type' => 'boolean',
							// translators: The title of the field for whether the Line should be available for front-end submissions
							'title' => '<span class="waymark-invisible">' . esc_html__('Line', 'waymark') . '</span> ' . esc_html__('Submissions?', 'waymark'),
							'default' => Waymark_Config::get_setting('lines', 'line_types', 'line_submission'),
							// translators: The tip for the field for whether the Line should be available for front-end submissions
							'tip' => esc_attr__('Make this Type available in front-end Submissions?', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => 1,
						],
					],
				],
			],
		];

		/**
		 * ===========================================
		 * ================= SHAPES ==================
		 * ===========================================
		 */

		$this->tabs['shapes'] = [
			// translators: The name of the tab for customising Shapes
			'name' => esc_html__('Shapes', 'waymark'),
			'description' => '',
			'sections' => [
				'shape_types' => [
					'repeatable' => true,
					// translators: The title of the section for adding Shape Types
					'title' => esc_html__('Shape', 'waymark') . ' ' . esc_html__('Types', 'waymark'),
					'description' => '<span class="waymark-lead">' . __('Customise how Shapes are displayed on the Map. Set these styles once, then select the appropriate Type when you add to the Map.', 'waymark') . '</span>',
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('customising/settings/#shapes')),
						// translators: The link to the Shape Types documentation
						'text' => esc_attr__('Type Docs &raquo;', 'waymark'),
					],
					// translators: The footer of the section for adding Shape Types
					'footer' => '<small>' . __('<b>Pro Tip!</b> The first listed will be used as the default. Drag to re-order, remove all to restore defaults.', 'waymark') . '</small>',
					'fields' => [
						'shape_title' => [
							'name' => 'shape_title',
							'id' => 'shape_title',
							'type' => 'text',
							'class' => 'waymark-uneditable',
							// translators: The title of the field for the name of the Shape
							'title' => esc_html__('Shape', 'waymark') . ' ' . esc_html__('Label', 'waymark'),
							'default' => Waymark_Config::get_setting('shapes', 'shape_types', 'shape_title'),
							// translators: The tip for the field for the name of the Shape
							'tip' => esc_attr__('What kind of Shape is this? E.g. "Park", "Danger!", "Light Blue". The Shape Label is displayed in the Tooltip (when hovering over the Shape) and in the Shape Info Window. Once saved, Shape labels can not be edited.', 'waymark'),
							'input_processing' => [
								'not_empty',
							],
							// translators: The fallback for the name of the Shape
							'fallback' => esc_html__('Shape', 'waymark') . ' ' . substr(md5(wp_rand(0, 999999)), 0, 5),
						],
						'shape_colour' => [
							'name' => 'shape_colour',
							'id' => 'shape_colour',
							'type' => 'text',
							'class' => 'waymark-short-input waymark-colour-picker',
							// translators: The title of the field for the colour of the Shape
							'title' => '<span class="waymark-invisible">' . esc_html__('Shape', 'waymark') . '</span> ' . esc_html__('Colour', 'waymark'),
							'default' => Waymark_Config::get_setting('shapes', 'shape_types', 'shape_colour'),
							// translators: The tip for the field for the colour of the Shape
							'tip' => esc_attr__('The colour of the Shape. Click "Select Colour" to select.', 'waymark'),
							'input_processing' => [
								'not_empty',
							],
							'fallback' => '#81d742',
						],
						'fill_opacity' => [
							'name' => 'fill_opacity',
							'id' => 'fill_opacity',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the opacity of the Shape
							'title' => '<span class="waymark-invisible">' . esc_html__('Shape', 'waymark') . '</span> ' . esc_html__('Fill Opacity', 'waymark'),
							'default' => Waymark_Config::get_setting('shapes', 'shape_types', 'fill_opacity'),
							// translators: The tip for the field for the opacity of the Shape
							'tip' => esc_attr__('The opacity of the inside of the shape, between 0.0 and 1.0 (e.g. "0.5").', 'waymark'),
							'input_processing' => [
								'valid_opacity',
							],
							'fallback' => 0.5,
						],
						'shape_display' => [
							'name' => 'shape_display',
							'id' => 'shape_display',
							'type' => 'boolean',
							// translators: The title of the field for whether the Shape should be shown initially
							'title' => '<span class="waymark-invisible">' . esc_html__('Shape', 'waymark') . '</span> ' . esc_html__('Show Initially', 'waymark'),
							'default' => Waymark_Config::get_setting('shapes', 'shape_types', 'shape_display'),
							// translators: The tip for the field for whether the Shape should be shown initially
							'tip' => esc_attr__('When using the Overlay Filter you can choose to show/hide certain Types when the Map initially loads.', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => 1,
						],
						'shape_submission' => [
							'name' => 'shape_submission',
							'id' => 'shape_submission',
							'type' => 'boolean',
							// translators: The title of the field for whether the Shape should be available for front-end submissions
							'title' => '<span class="waymark-invisible">' . esc_html__('Shape', 'waymark') . '</span> ' . esc_html__('Submissions?', 'waymark'),
							'default' => Waymark_Config::get_setting('shapes', 'shape_types', 'shape_submission'),
							// translators: The tip for the field for whether the Shape should be available for front-end submissions
							'tip' => esc_attr__('Make this Type available in front-end Submissions?', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => 1,
						],
					],
				],
			],
		];

		/**
		 * ===========================================
		 * =================== META ==================
		 * ===========================================
		 */

		$meta_group_options = Waymark_Helper::repeatable_setting_option_array('meta', 'groups', 'group_title');
		$meta_group_options = array_merge(['' => 'None'], $meta_group_options);

		$this->tabs['meta'] = [
			// translators: The name of the tab for customising Meta
			'name' => esc_html__('Meta', 'waymark'),
			'description' => '',
			'sections' => [
				'inputs' => [
					'repeatable' => true,
					// translators: The title of the section for adding Meta Inputs
					'title' => esc_html__('Meta', 'waymark'),
					// translators: The description of the section for adding Meta Inputs
					'description' => '<span class="waymark-lead">' . __('Create additional input fields that appear underneath the Map Editor. Any Meta that has been input is displayed on the Map Details page, and can also be displayed by the Shortcode.', 'waymark') . '</span>',
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('customising/settings/#meta')),
						// translators: The link to the Meta documentation
						'text' => esc_attr__('Meta Docs &raquo;', 'waymark'),
					],
					'footer' => '<small>' . __('<b>Pro Tip!</b> The first listed will be used as the default. Drag to re-order, remove all to restore defaults.', 'waymark') . '</small>',
					'fields' => [
						'meta_title' => [
							'name' => 'meta_title',
							'id' => 'meta_title',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the title of the Meta
							'title' => esc_html__('Meta', 'waymark') . ' ' . esc_html__('Title', 'waymark'),
							'default' => Waymark_Config::get_setting('meta', 'inputs', 'meta_title'),
							// translators: The tip for the field for the title of the Meta
							'tip' => esc_attr__('The title appears next to the input field.', 'waymark'),
							'class' => Waymark_Config::get_item('meta', 'inputs') ? 'waymark-uneditable' : '',
							'input_processing' => [
								'not_empty',
							],
							// translators: The fallback for the title of the Meta
							'fallback' => esc_html__('Meta', 'waymark') . ' ' . substr(md5(wp_rand(0, 999999)), 0, 5),
						],
						'meta_default' => [
							'name' => 'meta_default',
							'id' => 'meta_default',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the default value of the Meta
							'title' => '<span class="waymark-invisible">' . esc_html__('Meta', 'waymark') . '</span> ' . esc_html__('Default', 'waymark'),
							'default' => Waymark_Config::get_setting('meta', 'inputs', 'meta_default'),
							// translators: The tip for the field for the default value of the Meta
							'tip' => esc_attr__('The default value for the input field. For Select and Multi-Select enter the option/comma-separated options to be selected by default.', 'waymark'),
						],
						'meta_tip' => [
							'name' => 'meta_tip',
							'id' => 'meta_tip',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the tip of the Meta
							'title' => '<span class="waymark-invisible">' . esc_html__('Meta', 'waymark') . '</span> ' . esc_html__('Tip', 'waymark'),
							'default' => Waymark_Config::get_setting('meta', 'inputs', 'meta_tip'),
							// translators: The tip for the field for the tip of the Meta
							'tip' => esc_attr__('A tip provides additional information about an input field... just like this!', 'waymark'),
						],
						'meta_type' => [
							'name' => 'meta_type',
							'id' => 'meta_type',
							'type' => 'select',
							'class' => '',
							// translators: The title of the field for the type of the Meta
							'title' => '<span class="waymark-invisible">' . esc_html__('Meta', 'waymark') . '</span> ' . esc_html__('Type', 'waymark'),
							'default' => Waymark_Config::get_setting('meta', 'inputs', 'meta_type'),
							// translators: The tip for the field for the type of the Meta
							'tip' => esc_attr__('The type of input field to use.', 'waymark'),
							'options' => [
								// translators: The option for a text input
								'text' => esc_html__('Text', 'waymark'),
								// translators: The option for a rich text input
								'textarea' => esc_html__('Textarea', 'waymark'),
								// translators: The option for a rich text input
								'textarea_rich' => esc_html__('Rich Text', 'waymark'),
								// translators: The option for a select input
								'select' => esc_html__('Select', 'waymark'),
								// translators: The option for a multi-select input
								'select_multi' => esc_html__('Multi-Select', 'waymark'),
							],
						],
						'meta_options' => [
							'name' => 'meta_options',
							'id' => 'meta_options',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the options of the Meta
							'title' => '<span class="waymark-invisible">' . esc_html__('Meta', 'waymark') . '</span> ' . esc_html__('Options', 'waymark'),
							'default' => Waymark_Config::get_setting('meta', 'inputs', 'meta_options'),
							// translators: The tip for the field for the options of the Meta
							'tip' => esc_attr__('A comma-separated list of options for the input.', 'waymark'),
						],
						'meta_group' => [
							'name' => 'meta_group',
							'id' => 'meta_group',
							'type' => 'select',
							'options' => $meta_group_options,
							'class' => (sizeof($meta_group_options) === 1) ? 'waymark-hidden' : '',
							// translators: The title of the field for the group of the Meta
							'title' => '<span class="waymark-invisible">' . esc_html__('Meta', 'waymark') . '</span> ' . esc_html__('Group', 'waymark'),
							'default' => Waymark_Config::get_setting('meta', 'inputs', 'meta_group'),
							// translators: The tip for the field for the group of the Meta
							'tip' => esc_attr__('Which group this Meta belongs to (if any). Meta in the same group will be displayed together when editing and viewing Maps. Meta not in a group will be displayed above any groups.', 'waymark'),
						],
						'meta_shortcode' => [
							'name' => 'meta_shortcode',
							'id' => 'meta_shortcode',
							'type' => 'boolean',
							'class' => '',
							// translators: The title of the field for whether the Meta should be displayed in the Shortcode
							'title' => '<span class="waymark-invisible">' . esc_html__('Meta', 'waymark') . '</span> ' . esc_html__('In Shortcode?', 'waymark'),
							'default' => Waymark_Config::get_setting('meta', 'inputs', 'meta_shortcode'),
							// translators: The tip for the field for whether the Meta should be displayed in the Shortcode
							'tip' => esc_attr__('Whether this content should be displayed when embedding a Map using the Shortcode.', 'waymark'),
						],
						'meta_submission' => [
							'name' => 'meta_submission',
							'id' => 'meta_submission',
							'type' => 'boolean',
							'class' => '',
							// translators: The title of the field for whether the Meta should be available for front-end submissions
							'title' => '<span class="waymark-invisible">' . esc_html__('Meta', 'waymark') . '</span> ' . esc_html__('In Submissions?', 'waymark'),
							'default' => Waymark_Config::get_setting('meta', 'inputs', 'meta_submission'),
							// translators: The tip for the field for whether the Meta should be available for front-end submissions
							'tip' => esc_attr__('Make this Meta available in front-end Submissions?', 'waymark'),
						],
					],
				],
				'groups' => [
					'repeatable' => true,
					// translators: The title of the section for adding Meta Groups
					'title' => esc_html__('Groups', 'waymark'),
					// translators: The description of the section for adding Meta Groups
					'description' => '<span class="waymark-lead">' . __('Create groups to organise your Map Meta. Meta in the same group will be displayed together when editing and viewing Maps.', 'waymark') . '</span>',
					// translators: The footer of the section for adding Meta Groups
					'footer' => '<small>' . __('<b>Pro Tip!</b> Drag to re-order, remove all to disable groups.', 'waymark') . '</small>',
					'fields' => [
						'group_title' => [
							'name' => 'group_title',
							'id' => 'group_title',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the title of the Group
							'title' => esc_html__('Group', 'waymark') . ' ' . esc_html__('Title', 'waymark'),
							'default' => '',
							// translators: The tip for the field for the title of the Group
							'tip' => esc_attr__('The title appears above the Meta in that group.', 'waymark'),
						],
					],
				],
			],
		];

		/**
		 * ===========================================
		 * =============== PROPERTIES ================
		 * ===========================================
		 */

		$this->tabs['properties'] = [
			// translators: The name of the tab for customising Properties
			'name' => esc_html__('Properties', 'waymark'),
			'description' => '',
			'sections' => [
				'props' => [
					'repeatable' => true,
					// translators: The title of the section for adding Properties
					'title' => esc_html__('Properties', 'waymark'),
					// translators: The description of the section for adding Properties
					'description' => '<span class="waymark-lead">' . __('Read <b><a href="https://geojson.org/">GeoJSON</a></b> feature properties when importing.', 'waymark') . '</span><br /><br />' . __('If Waymark finds data for the property keys below it will be stored when it is imported. These can be automatically appended to the Overlay Description, or accessed programmatically via the <code>layer.feature.properties</code> Object.', 'waymark'),
					// translators: The footer of the section for adding Properties
					'footer' => '<small>' . sprintf(__('For example, the properties below can be accessed through the %1$s, %2$s, %3$s Property Keys:', 'waymark'), '<code>created_date</code>', '<code>updated_date</code>', '<code>expire_date</code>') . '</small>
					<pre><code>{
  "type": "FeatureCollection",
  "features": [
    {
      "geometry": { ... },
      "type": "Feature",
      "properties": {
        "created_date": "2021-07-15T00:42:41Z",
        "updated_date": "2021-07-16T00:42:41Z",
        "expire_date": "2021-07-17T00:42:41Z"
      }
    }
  ]
}
</code></pre>',

					'fields' => [
						'property_key' => [
							'name' => 'property_key',
							'id' => 'property_key',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the key of the Property
							'title' => esc_html__('Property', 'waymark') . ' ' . esc_html__('Key', 'waymark'),
							'default' => Waymark_Config::get_setting('property', 'props', 'property_key'),
							// translators: The tip for the field for the key of the Property
							'tip' => esc_attr__('This is the key associated with the data you are trying to access, i.e. "properties": {"property_key": "Some content here"}', 'waymark'),
							'input_processing' => [
								'property_key',
							],
						],
						'property_title' => [
							'name' => 'property_title',
							'id' => 'property_title',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the title of the Property
							'title' => '<span class="waymark-invisible">' . esc_html__('Property', 'waymark') . '</span> ' . esc_html__('Title', 'waymark'),
							'default' => Waymark_Config::get_setting('property', 'props', 'property_title'),
							// translators: The tip for the field for the title of the Property
							'tip' => esc_attr__('The value for this property will be added to the Overlay Description under this title.', 'waymark'),
						],
					],
				],

				'options' => [
					// translators: The title of the section for adding Properties
					'title' => esc_html__('Options', 'waymark'),
					'description' => 'Append listed Properties to the Overlay Description.',
					// translators: The footer of the section for adding Properties
					'footer' => '<small>' . sprintf(__('Pro Tip! Properties are added to the Overlay Description with class names that can be used to target them, e.g. %s.', 'waymark'), '</small><code class="waymark-code" style="display:inline">&lt;p class="waymark-property waymark-property-property_key"&gt;&lt;b&gt;property_title&lt;/b&gt;&lt;br&gt;proprty_value&lt;/p&gt;</code>'),
					'fields' => [
						'description_append' => [
							'name' => 'description_append',
							'id' => 'description_append',
							'type' => 'boolean',
							// translators: The title of the field for whether to append the Property to the Overlay Description
							'title' => esc_html__('Append', 'waymark'),
							'default' => Waymark_Config::get_setting('property', 'options', 'description_append'),
							// translators: The tip for the field for whether to append the Property to the Overlay Description
							'tip' => esc_attr__('Append the property value to the Overlay Description.', 'waymark'),

						],
					],
				],
			],
		];

		//Prepare Basemap values for editor option
		$tile_layers = Waymark_Config::get_item('tiles', 'layers', true);

		//Each layer
		$basemap_options = [];
		foreach ($tile_layers as $layer) {
			//If name exists
			if (array_key_exists('layer_name', $layer)) {
				//Add as option
				$basemap_options[$layer['layer_name']] = $layer['layer_name'];
			}
		}

		/**
		 * ===========================================
		 * =============== SUBMISSIONS ===============
		 * ===========================================
		 */

		//Build list of Collections to use as <select> options
		$collection_objects = get_terms([
			'taxonomy' => 'waymark_collection',
			'hide_empty' => false,
		]);
		$collection_array = [
			'' => ' - ',
		];
		foreach ($collection_objects as $collection) {
			$collection_array[$collection->term_id] = $collection->name;
		}

		//Roles
		if (! function_exists('get_editable_roles')) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}

		$role_options = [];
		foreach (get_editable_roles() as $key => $role) {
			$role_options[$key] = $role['name'];
		}
		unset($role_options['administrator']);

		//Public upload dir
		$upload_dir = wp_upload_dir();
		$upload_dir['subdir'] = ($upload_dir['subdir']) ? $upload_dir['subdir'] : '/';

		$this->tabs['submission'] = [
			'name' => esc_html__('Submissions', 'waymark'),
			'sections' => [
				//Global
				'global' => [
					// translators: The title of the section for configuring front-end submissions
					'title' => esc_html__('Front-End Submissions', 'waymark'),
					// translators: The description of the section for configuring front-end submissions
					'description' => sprintf(__('Use the %s Shortcode to allow Map submissions from the front-end of your site.', 'waymark'), '<span class="waymark-code">[Waymark content="submission"]</span>'),
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('features/submissions/')),
						// translators: The link to the Submissions documentation
						'text' => esc_attr__('Submission Docs &raquo;', 'waymark'),
					],
					'fields' => [
						'submission_enable' => [
							'name' => 'submission_enable',
							'id' => 'submission_enable',
							'type' => 'boolean',
							// translators: The title of the field for whether to allow submissions
							'title' => esc_html__('Allow Submissions', 'waymark'),
							'default' => Waymark_Config::get_setting('submission', 'global', 'submission_enable'),
							// translators: The tip for the field for whether to allow submissions
							'tip' => esc_attr__('Submissions will be available only to site administrators by default, but can also be allowed for registered users or even to guests without registration.', 'waymark'),
						],
					],
				],
				//By role
				'from_users' => [
					// translators: The title of the section for configuring submissions from registered users
					'title' => esc_html__('User Submissions', 'waymark'),
					// translators: The description of the section for configuring submissions from registered users
					'description' => esc_html__('Allow registered users to create Maps from the front-end.', 'waymark'),
					'fields' => [
						'submission_roles' => [
							'name' => 'submission_roles',
							'id' => 'submission_roles',
							'type' => 'select_multi',
							'class' => 'waymark-align-top',
							// translators: The title of the field for the roles that can make submissions
							'title' => esc_html__('Allow From', 'waymark'),
							'default' => Waymark_Config::get_setting('submission', 'from_users', 'submission_roles'),
							// translators: The tip for the field for the roles that can make submissions
							'tip' => esc_attr__('Users with the selected roles will be able to make Submissions through the front-end', 'waymark'),
							'options' => $role_options,
						],
						'submission_features' => [
							'name' => 'submission_features',
							'id' => 'submission_users_features',
							'type' => 'select_multi',
							'class' => 'waymark-align-top',
							// translators: The title of the field for the features available for submissions
							'title' => esc_html__('Editor Features', 'waymark'),
							'default' => Waymark_Config::get_setting('submission', 'from_users', 'submission_features'),
							// translators: The tip for the field for the features available for submissions
							'tip' => esc_attr__('What features to offer in the Editor. Important! Uploaded images are added to the Media Library, reading from file does not keep a copy of the file on the server. Whether an individual Meta input is displayed can be set in the Settings > Map > Meta.', 'waymark'),
							'options' => [
								// translators: The option for a drawing feature
								'draw' => esc_attr__('Drawing', 'waymark'),
								// translators: The option for an image upload feature
								'photo' => esc_attr__('Image upload', 'waymark'),
								// translators: The option for reading from a file
								'file' => esc_attr__('Read from File', 'waymark'),
								// translators: The option for a title input
								'title' => esc_attr__('Title', 'waymark'),
								// translators: The option for a meta input
								'meta' => esc_attr__('Meta', 'waymark'),
							],
						],
						'submission_status' => [
							'name' => 'submission_status',
							'id' => 'submission_users_status',
							'type' => 'select',
							// translators: The title of the field for the default status of submissions
							'title' => esc_html__('Default Status', 'waymark'),
							'default' => Waymark_Config::get_setting('submission', 'from_users', 'submission_status'),
							// translators: The tip for the field for the default status of submissions
							'tip' => esc_attr__('This is the initial status of the submitted Map. Note! Publish means that the Map (including any images added) will be *immediately* visible on your site.', 'waymark'),
							'options' => [
								// translators: The option for a draft status
								'publish' => esc_attr__('Publish', 'waymark'),
								// translators: The option for a published status
								'draft' => esc_attr__('Draft', 'waymark'),
							],
						],
						'submission_collection' => [
							'name' => 'submission_collection',
							'id' => 'submission_users_collection',
							'type' => 'select',
							// translators: The title of the field for the default collection for submissions
							'title' => esc_html__('Default Collection', 'waymark'),
							// translators: The tip for the field for the default collection for submissions
							'tip' => esc_attr__('If specified, user submissions will be automatically added to this Collection.', 'waymark'),
							'options' => $collection_array,
						],
					],
				],

				//Public
				'from_public' => [
					// translators: The title of the section for configuring submissions from guests
					'title' => esc_html__('Public Submissions', 'waymark'),
					// translators: The description of the section for configuring submissions from guests
					'description' => __('This will allow Submissions from <b>any visitor</b>, without registration.', 'waymark'),
					'fields' => [
						'submission_public' => [
							'name' => 'submission_public',
							'id' => 'submission_public',
							'type' => 'boolean',
							// translators: The title of the field for whether to allow submissions from guests
							'title' => esc_html__('Public Submissions', 'waymark'),
							'default' => Waymark_Config::get_setting('submission', 'from_public', 'submission_public'),
							// translators: The tip for the field for whether to allow submissions from guests
							'tip' => esc_attr__('Allow *anyone* to submit Maps to your site, without registration.', 'waymark'),
						],
						'submission_features' => [
							'name' => 'submission_features',
							'id' => 'submission_public_features',
							'type' => 'select_multi',
							'class' => 'waymark-align-top',
							// translators: The title of the field for the features available for submissions
							'title' => esc_html__('Editor Features', 'waymark'),
							'default' => Waymark_Config::get_setting('submission', 'from_public', 'submission_features'),
							// translators: The tip for the field for the features available for submissions
							'tip' => esc_attr__('What features to offer in the Editor. Important! Uploaded images are added to the Media Library (see Upload Location below), reading from file does not keep a copy of the file on the server. Whether an individual Meta input is displayed can be set in the Settings > Map > Meta.', 'waymark'),
							'options' => [
								// translators: The option for a drawing feature
								'draw' => esc_attr__('Drawing', 'waymark'),
								// translators: The option for an image upload feature
								'photo' => esc_attr__('Image upload', 'waymark'),
								// translators: The option for reading from a file
								'file' => esc_attr__('Read from File', 'waymark'),
								// translators: The option for a title input
								'title' => esc_attr__('Title', 'waymark'),
								// translators: The option for a meta input
								'meta' => esc_attr__('Meta', 'waymark'),
							],
						],
						'submission_upload_dir' => [
							'name' => 'submission_upload_dir',
							'id' => 'submission_upload_dir',
							'type' => 'select',
							// translators: The title of the field for the upload location for submissions
							'title' => esc_html__('Upload Location', 'waymark'),
							'default' => Waymark_Config::get_setting('submission', 'from_public', 'submission_upload_dir'),
							// translators: The tip for the field for the upload location for submissions
							'tip' => esc_attr__('Images upload by non-registered users can be stored seperately from other Media Library uploads, to aid with moderation. All uploaded images will be stored in a single directory (/waymark_submission) found in the upload root.', 'waymark'),
							'class' => '',
							'options' => [
								// translators: The option for the default upload location
								'waymark_submission' => esc_attr__('Seperated (/waymark_submission)', 'waymark'),
								// translators: The option for the default upload location
								'' => sprintf(esc_attr__('Media Library Default (%s)', 'waymark'), $upload_dir['subdir']),
							],
						],
						'submission_status' => [
							'name' => 'submission_status',
							'id' => 'submission_public_status',
							'type' => 'select',
							// translators: The title of the field for the default status of submissions
							'title' => esc_html__('Default Status', 'waymark'),
							'default' => Waymark_Config::get_setting('submission', 'from_public', 'submission_status'),
							// translators: The tip for the field for the default status of submissions
							'tip' => esc_attr__('This is the initial status of the submitted Map. Note! Publish means that the Map (including any images added) will be *immediately* visible on your site.', 'waymark'),
							'options' => [
								// translators: The option for a draft status
								'draft' => esc_attr__('Draft', 'waymark'),
								// translators: The option for a published status
								'publish' => esc_attr__('Publish (not recommended!)', 'waymark'),
							],
							'class' => '',
						],
						'submission_collection' => [
							'name' => 'submission_collection',
							'id' => 'submission_public_collection',
							'type' => 'select',
							// translators: The title of the field for the default collection for submissions
							'title' => esc_html__('Default Collection', 'waymark'),
							// translators: The tip for the field for the default collection for submissions
							'tip' => esc_attr__('If specified, user submissions will be automatically added to this Collection.', 'waymark'),
							'options' => $collection_array,
						],
					],
				],
			],
		];

		//Submissions not enabled
		if (! Waymark_Config::get_setting('submission', 'global', 'submission_enable')) {
			//Hide related inputs
			$this->tabs['meta']['sections']['inputs']['fields']['meta_submission']['class'] = ' waymark-hidden';

			$this->tabs['markers']['sections']['marker_types']['fields']['marker_submission']['class'] = 'waymark-hidden';
			$this->tabs['lines']['sections']['line_types']['fields']['line_submission']['class'] = 'waymark-hidden';
			$this->tabs['shapes']['sections']['shape_types']['fields']['shape_submission']['class'] = 'waymark-hidden';

			$this->tabs['submission']['sections']['from_users']['class'] = 'waymark-hidden';
			$this->tabs['submission']['sections']['from_public']['class'] = 'waymark-hidden';
			//If No public submissions
		} elseif (! Waymark_Config::get_setting('submission', 'from_public', 'submission_public')) {
			//Hide settings
			$this->tabs['submission']['sections']['from_public']['fields']['submission_features']['class'] = ' waymark-hidden';
			$this->tabs['submission']['sections']['from_public']['fields']['submission_status']['class'] = ' waymark-hidden';
// 			$this->tabs['submission']['sections']['from_public']['fields']['submission_alert']['class'] .= ' waymark-hidden';
			$this->tabs['submission']['sections']['from_public']['fields']['submission_upload_dir']['class'] = ' waymark-hidden';
			$this->tabs['submission']['sections']['from_public']['fields']['submission_collection']['class'] = ' waymark-hidden';
		}

		/**
		 * ===========================================
		 * ================== MISC ===================
		 * ===========================================
		 */

		$this->tabs['misc'] = [
			// translators: The name of the tab for miscellaneous settings
			'name' => esc_html__('Misc.', 'waymark'),
			'description' => '',
			'sections' => [
				'map_options' => [
					// translators: The title of the section for changing map options
					'title' => esc_html__('Map Options', 'waymark'),
					// translators: The description of the section for changing map options
					'description' => esc_html__('Use these options to change how Maps are displayed.', 'waymark'),
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('examples/')),
						// translators: The link to the Examples documentation
						'text' => esc_attr__('See Examples &raquo;', 'waymark'),
					],
					'fields' => [
						'map_default_latlng' => [
							'name' => 'map_default_latlng',
							'id' => 'map_default_latlng',
							'type' => 'text',
							'class' => '',
							// translators: The title of the field for the default centre of the map
							'title' => esc_html__('Default Centre', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'map_options', 'map_default_latlng'),
							// translators: The tip for the field for the default centre of the map
							'tip' => esc_attr__('Waymark centres the Map automatically when displaying data. These coordinates (Latitude,Longitude) will be used when there is no data available.', 'waymark'),
							'input_processing' => [
								'valid_latlng',
							],
							'output_processing' => [
								'not_empty',
							],
							'fallback' => Waymark_Config::get_default('misc', 'map_options', 'map_default_latlng'),
						],
						'map_height' => [
							'name' => 'map_height',
							'id' => 'map_height',
							'type' => 'text',
							'class' => 'waymark-short-input waymark-align-top',
							// translators: The title of the field for the height of the map
							'title' => esc_html__('Map Height', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'map_options', 'map_height'),
							// translators: The tip for the field for the height of the map
							'append' => '<br />' . sprintf(esc_attr__('Or set in Shortcode: %s', 'waymark'), '<code>[' . Waymark_Config::get_item('shortcode') . ' map_height=&quot;' . Waymark_Config::get_setting('misc', 'map_options', 'map_height') . '&quot; map_width=&quot;320&quot;]</code>'),
							// translators:	The tip for the field for the height of the map
							'tip' => sprintf(esc_attr__('Specify the desired height of the Map (in pixels). Pro Tip! This will affect all Maps, but you can change the height (and width) of an individual Map through the Shortcode: %s', 'waymark'), '[' . Waymark_Config::get_item('shortcode') . ' map_id=&quot;1234&quot; map_height=&quot;' . Waymark_Config::get_setting('misc', 'map_options', 'map_height') . '&quot;]'),
							'input_processing' => [
								'remove_non_numeric',
							],
							'output_processing' => [
								'not_empty',
							],
							'fallback' => Waymark_Config::get_default('misc', 'map_options', 'map_height'),
						],
						'map_default_zoom' => [
							'name' => 'map_default_zoom',
							'id' => 'map_default_zoom',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the default zoom of the map
							'title' => esc_html__('Default Zoom', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'map_options', 'map_default_zoom'),
							// translators: The tip for the field for the default zoom of the map
							'tip' => esc_attr__('Waymark zooms the Map automatically when displaying data. This zoom level (0-18) will be used when there is no data available.', 'waymark'),
							'input_processing' => [
								'valid_zoom',
							],
							'output_processing' => [
								'not_empty',
							],
							'fallback' => Waymark_Config::get_default('misc', 'map_options', 'map_default_zoom'),
						],
						'show_gallery' => [
							'name' => 'show_gallery',
							'id' => 'show_gallery',
							'type' => 'boolean',
							// translators: The title of the field for whether to show the gallery
							'title' => esc_html__('Image Gallery', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'map_options', 'show_gallery'),
							// translators: The tip for the field for whether to show the gallery
							'tip' => sprintf(esc_attr__('Whether to display an image gallery for Markers that have images associated with them. Pro Tip! This will affect all Maps, but you can choose to show/hide the gallery of an individual Map through the shortcode: %s', 'waymark'), '[' . Waymark_Config::get_item('shortcode') . ' show_gallery=&quot;1&quot;]'),
							'options' => [
								// translators: The option to show the gallery
								'1' => esc_html__('Show', 'waymark'),
								// translators: The option to hide the gallery
								'0' => esc_html__('Hide', 'waymark'),
							],
						],
						'show_filter' => [
							'name' => 'show_filter',
							'id' => 'show_filter',
							'type' => 'boolean',
							// translators: The title of the field for whether to show the filter
							'title' => esc_html__('Overlay Filter', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'map_options', 'show_filter'),
							// translators: The tip for the field for whether to show the filter
							'tip' => sprintf(esc_attr__('Allow the user to filter which Markers, Lines and Shapes are currently visible on the Map. Pro Tip! This will affect all Maps, but you can choose to show/hide the filter for individual Maps through the shortcode: %s', 'waymark'), '[' . Waymark_Config::get_item('shortcode') . ' show_filter=&quot;1&quot;]'),
							'options' => [
								// translators: The option to show the filter
								'1' => esc_html__('Show', 'waymark'),
								// translators: The option to hide the filter
								'0' => esc_html__('Hide', 'waymark'),
							],
						],
						'allow_export' => [
							'name' => 'allow_export',
							'id' => 'allow_export',
							'type' => 'boolean',
							// translators: The title of the field for whether to allow export
							'title' => esc_html__('Public Export', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'map_options', 'allow_export'),
							// translators: The tip for the field for whether to allow export
							'tip' => sprintf(esc_attr__('Offer visitors the ability to Download all Collection/Map Overlays in the Shortcode Header and on the Map Details page. GeoJSON, GPX and KML formats supported.', 'waymark')),
						],
						'show_scale' => [
							'name' => 'show_scale',
							'id' => 'show_scale',
							'type' => 'boolean',
							// translators: The title of the field for whether to show the scale
							'title' => esc_html__('Show Scale', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'map_options', 'show_scale'),
							// translators: The tip for the field for whether to show the scale
							'tip' => sprintf(esc_attr__('Show a distance scale (km and miles) on the Map.', 'waymark')),
						],
					],
				],

				//Interaction

				//Sleep
				'interaction_options' => [
					// translators: The title of the section for changing interaction options
					'title' => esc_html__('Sleep Options', 'waymark'),
					// translators: The description of the section for changing interaction options
					'description' => sprintf(__('Waymark Maps will zoom when the user scrolls. This can cause some unexpected/annoying behaviour when scrolling a page.<br /><br /><b>Sleeping</b> the Map initially and <b>Waking</b> upon user interaction (i.e. hovering/clicking/tapping) may create a better experience.', 'waymark'), Waymark_Config::get_default('misc', 'interaction_options', 'delay_seconds')),
					'fields' => [
						'delay_seconds' => [
							'name' => 'delay_seconds',
							'id' => 'delay_seconds',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the delay before waking
							'title' => esc_html__('Hover Wake Time', 'waymark'),
							// translators: The tip for the field for the delay before waking
							'append' => esc_html__('Seconds', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'interaction_options', 'delay_seconds'),
							// translators: The tip for the field for the delay before waking
							'tip' => esc_attr__('How many seconds before scroll zoom is enabled. 0 seconds will mean no delay (disabling this feature). A large number of seconds like 3600 (an hour) will esentially *disable hover to wake*, meaning the user will need to *click* to wake.', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => Waymark_Config::get_default('misc', 'interaction_options', 'delay_seconds'),
						],
						'do_message' => [
							'name' => 'do_message',
							'id' => 'do_message',
							'type' => 'boolean',
							// translators: The title of the field for whether to display the message
							'title' => esc_html__('Display Message', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'interaction_options', 'do_message'),
							// translators: The tip for the field for whether to display the message
							'tip' => esc_attr__('This message will be displayed by the Map while scroll zoom is disabled.', 'waymark'),
						],
						'wake_message' => [
							'name' => 'wake_message',
							'id' => 'wake_message',
							'type' => 'text',
							// translators: The title of the field for the message text
							'title' => '<span class="waymark-invisible">' . esc_html__('Display', 'waymark') . ' </span> ' . esc_html__('Message Text', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'interaction_options', 'wake_message'),
						],
					],
				],

				// Cluster

				'cluster_options' => [
					// translators: The title of the section for changing cluster options
					'title' => esc_html__('Cluster Options', 'waymark'),
					// translators: The description of the section for changing cluster options
					'description' => sprintf(__('With Clustering enabled, Markers will be grouped together when they are close together. This can help to reduce clutter on the Map.', 'waymark'), Waymark_Config::get_default('misc', 'cluster_options', 'cluster_threshold')),
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('customising/settings/#misc-cluster_options')),
						// translators: The link to the Clustering documentation
						'text' => esc_attr__('Clustering Docs &raquo;', 'waymark'),
					],
					'fields' => [
						'show_cluster' => [
							'name' => 'show_cluster',
							'id' => 'show_cluster',
							'type' => 'boolean',
							'options' => [
								// translators: The option to enable clustering
								'1' => esc_html__('Enabled', 'waymark'),
								// translators: The option to disable clustering
								'0' => esc_html__('Disabled', 'waymark'),
							],
							// translators: The title of the field for whether to show clustering
							'title' => esc_html__('Marker Clustering', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'cluster_options', 'show_cluster'),
							// translators: The tip for the field for whether to show clustering
							'tip' => esc_attr__('Whether to cluster (stack) Markers that are close together. Pro Tip! This will affect all Maps, but you can also enable/disable clustering through the Shortcode: [Waymark show_cluster="0"]', 'waymark'),
						],
						'cluster_threshold' => [
							'name' => 'cluster_threshold',
							'id' => 'cluster_threshold',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the cluster threshold
							'title' => esc_html__('Cluster Threshold', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'cluster_options', 'cluster_threshold'),
							// translators: The tip for the field for the cluster threshold
							'tip' => esc_attr__('Markers will not be clustered above this zoom level.', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => Waymark_Config::get_default('misc', 'cluster_options', 'cluster_threshold'),
						],
						'cluster_radius' => [
							'name' => 'cluster_radius',
							'id' => 'cluster_radius',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the cluster radius
							'title' => '<span class="waymark-invisible">' . esc_html__('Cluster', 'waymark') . ' </span> ' . esc_html__('Radius', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'cluster_options', 'cluster_radius'),
							// translators: The tip for the field for the cluster radius
							'tip' => esc_attr__('The maximum radius that a cluster will cover from the central marker (in pixels). Decreasing will make more, smaller clusters.	Default 80.', 'waymark'),
							'input_processing' => [
								'is_numeric',
							],
							'fallback' => Waymark_Config::get_default('misc', 'cluster_options', 'cluster_radius'),
						],
					],
				],

				//Shortcode

				'shortcode_options' => [
					// translators: The title of the section for changing shortcode options
					'title' => esc_html__('Shortcode Options', 'waymark'),
					// translators: The description of the section for changing shortcode options
					'description' => esc_html__('How Maps are embedded into your content using the shortcode.', 'waymark'),
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('#shortcodes')),
						// translators: The link to the Shortcodes documentation
						'text' => esc_attr__('Shortcode Docs &raquo;', 'waymark'),
					],
					'fields' => [
						'shortcode_header' => [
							'name' => 'shortcode_header',
							'id' => 'shortcode_header',
							'type' => 'select',
							// translators: The title of the field for whether to show the shortcode header
							'title' => esc_html__('Shortcode Header', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'shortcode_options', 'shortcode_header'),
							// translators: The tip for the field for whether to show the shortcode header
							'tip' => sprintf(esc_attr__('The shortcode header displays the title and link to the Map or Collection. Pro Tip! This will affect all shortcodes, but you can override the setting through the shortcode: %s (the value must be either 0 or 1).', 'waymark'), '[' . Waymark_Config::get_item('shortcode') . ' map_id=&quot;1234&quot; shortcode_header=&quot;' . Waymark_Config::get_setting('misc', 'shortcode_options', 'shortcode_header') . '&quot;]'),
							'options' => [
								// translators: The option to show the shortcode header
								'1' => esc_html__('Show', 'waymark'),
								// translators: The option to hide the shortcode header
								'0' => esc_html__('Hide', 'waymark'),
							],
						],
						'header_override' => [
							'name' => 'header_override',
							'id' => 'header_override',
							'type' => 'select',
							// translators: The title of the field for the header override
							'title' => esc_html__('Header for Admin', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'shortcode_options', 'header_override'),
							// translators: The tip for the field for the header override
							'tip' => esc_attr__('Use this Setting to always show the Shortcode Header when signed in as admin, useful for quickly navigating to embeded Maps.', 'waymark'),
							'options' => [
								// translators: The option to show the header for admin
								'0' => esc_html__('Use Setting', 'waymark'),
								// translators: The option to always show the header for admin
								'1' => esc_html__('Always Show', 'waymark'),
							],
						],
					],
				],

				//Elevation

				'elevation_options' => [
					// translators: The title of the section for changing elevation options
					'title' => esc_html__('Elevation Options', 'waymark'),
					// translators: The description of the section for changing elevation options
					'description' => esc_html__('Lines with elevation data.', 'waymark'),
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('examples/elevation-profile-colours/')),
						// translators: The link to the Elevation Profile documentation
						'text' => esc_attr__('Elevation Styling &raquo;', 'waymark'),
					],
					'fields' => [
						'show_elevation' => [
							'name' => 'show_elevation',
							'id' => 'show_elevation',
							'type' => 'select',
							// translators: The title of the field for whether to show the elevation profile
							'title' => esc_html__('Elevation Profile', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'elevation_options', 'show_elevation'),
							// translators: The tip for the field for whether to show the elevation profile
							'tip' => sprintf(esc_attr__('Display an interactive elevation profile graph below the Map for Lines that have elevation data. Pro Tip! You can choose to show/hide the elevation graph of an individual Map through the shortcode: %s', 'waymark'), '[' . Waymark_Config::get_item('shortcode') . ' map_id=&quot;1234&quot; show_elevation=&quot;1&quot;]'),
							'options' => [
								// translators: The option to show the elevation profile
								'2' => esc_html__('Show on Map Details', 'waymark'),
								// translators: The option to hide the elevation profile
								'1' => esc_html__('Show everywhere', 'waymark'),
								// translators: The option to hide the elevation profile
								'0' => esc_html__('Hide everywhere', 'waymark'),
							],
						],
						'elevation_units' => [
							'name' => 'elevation_units',
							'id' => 'elevation_units',
							'type' => 'select',
							// translators: The title of the field for the elevation units
							'title' => esc_html__('Elevation Units', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'elevation_options', 'elevation_units'),
							// translators: The tip for the field for the elevation units
							'tip' => sprintf(esc_attr__('Display elevation data in metric (m/km) or imperial (ft/mi) units.', 'waymark')),
							'options' => [
								// translators: The option for metric units
								'metric' => esc_html__('Metric (m/km)', 'waymark'),
								// translators: The option for imperial units
								'imperial' => esc_html__('Imperial (ft/mi)', 'waymark'),
							],
						],
						'elevation_colour' => [
							'name' => 'elevation_colour',
							'id' => 'elevation_colour',
							'type' => 'text',
							'class' => 'waymark-short-input waymark-colour-picker',
							// translators: The title of the field for the elevation colour
							'title' => esc_html__('Elevation Colour', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'elevation_options', 'elevation_colour'),
							// translators: The tip for the field for the elevation colour
							'tip' => sprintf(esc_attr__('The colour of the elevation graph and associated Line.', 'waymark')),
							'input_processing' => [
								'not_empty',
							],
							'fallback' => '#b42714',
						],
						'elevation_initial' => [
							'name' => 'elevation_initial',
							'id' => 'elevation_initial',
							'type' => 'boolean',
							// translators: The title of the field for whether to show the elevation profile initially
							'title' => esc_html__('Show Initially?', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'elevation_options', 'elevation_initial'),
							// translators: The tip for the field for whether to show the elevation profile initially
							'tip' => sprintf(esc_attr__('Whether to show the elevation profile when the Map loads. If set to No, the user must click on a Line in order to display the elevation data. If there are multiple Lines with elevation data, the one added to the editor first will be the one shown initially.', 'waymark')),
						],
					],
				],

				/**
				 * ===========================================
				 * ================= ADVANCED ================
				 * ===========================================
				 */

				//Collections

				'collection_options' => [
					// translators: The title of the section for changing collection options
					'title' => esc_html__('Collection Options', 'waymark'),
					// translators: The description of the section for changing collection options
					'description' => esc_html__('How Collections are displayed.', 'waymark'),
					'help' => [
						'url' => esc_attr(Waymark_Helper::site_url('customising/settings/#misc-collection_options')),
						// translators: The link to the Collections documentation
						'text' => esc_attr__('Collection Docs &raquo;', 'waymark'),
					],
					'fields' => [
						'load_method' => [
							'name' => 'load_method',
							'id' => 'load_method',
							'type' => 'select',
							'options' => [
								// translators: The option for loading in the background
								'fetch' => esc_html__('Background', 'waymark'),
								// translators: The option for embedding
								'embed' => esc_html__('Embed', 'waymark'),
							],
							'class' => 'waymark-short-input',
							// translators: The title of the field for the load method
							'title' => esc_html__('Shortcode Method', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'collection_options', 'load_method'),
							// translators: The tip for the field for the load method
							'tip' => esc_attr__('Whether to load multiple Maps in the Background (uses AJAX to improve page load) when embedding with the Shortcode, or to Embed them within the page. Embedding may be a bad idea for LARGE COLLECTIONS, but can resolve some issues where Collections are not displaying correctly.', 'waymark'),
						],
					],
				],

				//Editor

				'editor_options' => [
					// translators: The title of the section for changing editor options
					'title' => esc_html__('Editor Options', 'waymark'),
					// translators: The description of the section for changing editor options
					'description' => esc_html__('Customising the Map Editor.', 'waymark'),
					'fields' => [
						'confirm_delete' => [
							'name' => 'confirm_delete',
							'id' => 'confirm_delete',
							'type' => 'boolean',
							// translators: The title of the field for whether to confirm delete
							'title' => esc_html__('Confirm Delete?', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'editor_options', 'confirm_delete'),
							// translators: The tip for the field for whether to confirm delete
							'tip' => esc_attr__('Whether to show a confirmation dialog before deleting Markers/Lines/Shapes from the Map. Pro Tip! Even if you accidentally delete something, changes are not saved until the "Update" button is clicked.', 'waymark'),
						],
						'editor_basemap' => [
							'name' => 'editor_basemap',
							'id' => 'editor_basemap',
							'type' => 'select',
							// translators: The title of the field for the default basemap
							'title' => esc_html__('Default Basemap', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'editor_options', 'editor_basemap'),
							// translators: The tip for the field for the default basemap
							'tip' => esc_attr__('Which Basemap to use as the editor default.', 'waymark'),
							'options' => $basemap_options,
						],
					],
				],

				//Permalinks

				'permalinks' => [
					// translators: The title of the section for changing permalinks
					'title' => esc_html__('Permalinks', 'waymark'),
					'description' => 'Customise your Map and Collection URLs.',
					'footer' => '<small>For the changes to take effect you must rebuild your Permalinks by going to WP Settings > Permalinks and clicking "Save Changes".</small>',
					'fields' => [
						'permalink_slug_map' => [
							'name' => 'permalink_slug_map',
							'id' => 'permalink_slug_map',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the map slug
							'title' => esc_html__('Map Slug', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'permalinks', 'permalink_slug_map'),
							// translators: The tip for the field for the map slug
							'tip' => esc_attr__('The URL slug that will be used for links to your Maps, i.e. example.com/[map-slug]/example-map/. Only alpha-numeric characters and hyphens (-) are allowed.', 'waymark'),
							'input_processing' => [
								'remove_non_slug',
							],
							'prepend' => '<small>/</small>',
							'append' => '<small>/map-name/</small>',
						],
						'permalink_slug_collection' => [
							'name' => 'permalink_slug_collection',
							'id' => 'permalink_slug_collection',
							'type' => 'text',
							'class' => 'waymark-short-input',
							// translators: The title of the field for the collection slug
							'title' => esc_html__('Collection Slug', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'permalinks', 'permalink_slug_collection'),
							// translators: The tip for the field for the collection slug
							'tip' => esc_attr__('The URL slug that will be used for links to your Collections, i.e. example.com/[collection-slug]/example-collection/. Only alpha-numeric characters and hyphens (-) are allowed.', 'waymark'),
							'input_processing' => [
								'remove_non_slug',
							],
							'prepend' => '<small>/</small>',
							'append' => '<small>/collection-name/</small>',
						],
					],
				],

				// Custom Post Type Supports

				'post' => [
					// translators: The title of the section for changing post type options
					'title' => esc_html__('Post Type', 'waymark'),
					'description' => 'Enable Custom Post Type features.',
					'fields' => [
						'supports' => [
							'name' => 'supports',
							'id' => 'supports',
							'type' => 'select_multi',
							// translators: The title of the field for the post type supports
							'title' => esc_html__('Supports', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'post', 'supports'),
							// translators: The tip for the field for the post type supports
							'tip' => esc_attr__('Enable or disable various WordPress features of the Map Custom Post Type.', 'waymark'),
							'tip_link' => 'https://developer.wordpress.org/reference/functions/add_post_type_support/',
							'options' => [
								// translators: The option to enable the title
								'title' => esc_html__('Title', 'waymark'),
								// translators: The option to enable the author
								'author' => esc_html__('Author', 'waymark'),
								// translators: The option to enable revisions
								'revisions' => esc_html__('Revisions', 'waymark'),
								// translators: The option to enable the thumbnail
								'thumbnail' => esc_html__('Thumbnail', 'waymark'),
								// translators: The option to enable the comments
								'comments' => esc_html__('Comments', 'waymark'),
								// translators: The option to enable the excerpt
								'excerpt' => esc_html__('Excerpt', 'waymark'),
							],
						],
					],
				],

				//Debug

				'advanced' => [
					// translators: The title of the section for changing advanced options
					'title' => esc_html__('Debug', 'waymark'),
					'description' => '',
					'fields' => [
						'debug_mode' => [
							'name' => 'debug_mode',
							'id' => 'debug_mode',
							'type' => 'boolean',
							// translators: The title of the field for whether to enable debug mode
							'title' => esc_html__('Debug Mode', 'waymark'),
							'default' => Waymark_Config::get_setting('misc', 'advanced', 'debug_mode'),
							// translators: The tip for the field for whether to enable debug mode
							'tip' => esc_attr__('With debug mode enabled, the plugin will output Map and Settings data in Admin Dashboard. This may come in handy if you need to report a bug. Pro Tip! Check the browser console for Waymark output when signed in as an administrator.', 'waymark'),
							'tip_link' => Waymark_Helper::site_url('advanced/debug-mode/'),
							'options' => [
								// translators: The option to disable debug mode
								'0' => esc_html__('Disable', 'waymark'),
								// translators: The option to enable debug mode
								'1' => esc_html__('Enable', 'waymark'),
							],
						],
					],
				],
			],
		];

		add_action('admin_notices', [$this, 'admin_notices']);
		add_action('admin_init', [$this, 'register_settings']);
	}

	public function get_settings() {
		return $this->current_settings;
	}

	public function register_settings() {
		register_setting($this->page_slug, 'Waymark_Settings', [$this, 'sanitize_callback']);

		//For each tab
		foreach ($this->tabs as $tab_key => $tab_data) {
			//For each section
			foreach ($tab_data['sections'] as $section_key => $section_data) {
				//Set if blank if unset
				$section_data['title'] = (isset($section_data['title'])) ? $section_data['title'] : '';

				//Create section
				add_settings_section($section_key, $section_data['title'], [$this, 'section_text'], $this->page_slug);

				//For each field in section
				if (is_array($section_data['fields']) && sizeof($section_data['fields'])) {
					foreach ($section_data['fields'] as $field) {
						//Get set_value
						if (array_key_exists($tab_key, $this->current_settings) && array_key_exists($section_key, $this->current_settings[$tab_key])) {
							if (array_key_exists($field['name'], $this->current_settings[$tab_key][$section_key])) {
								$field['set_value'] = $this->current_settings[$tab_key][$section_key][$field['name']];
							}
						}

						//Modify name for multi-dimensional array
						$field['name'] = 'Waymark_Settings[' . $tab_key . '][' . $section_key . '][' . $field['name'] . ']';

						//Repeatable section
						if (isset($section_data['repeatable']) && $section_data['repeatable']) {
							//Get count
							$repeatable_count = Waymark_Helper::get_section_repeatable_count($section_data);

							//Must be an array
							if (! is_array($field['default'])) {
								//Make array
								$field['default'] = Waymark_Helper::convert_single_value_to_array($field['default']);
							}

							//Array size must match
							if (sizeof($field['default']) < $repeatable_count) {
								//Pad
								$field['default'] = array_pad($field['default'], $repeatable_count, $field['default'][0]);
							}
						}

						add_settings_field($field['name'], $field['title'], [$this, 'create_input'], $this->page_slug, $section_key, $field);
					}
				}
			}
		}
	}

	public function create_input($field) {
		//Set value
		if (array_key_exists('set_value', $field)) {
			$set_value = $field['set_value'];
		} else {
			$set_value = null;
		}

		echo wp_kses(Waymark_Input::create_field($field, $set_value, false), Waymark_Helper::allowable_tags('parameter'));
	}

	public function section_text($args) {
		//Unused
	}

	public function sanitize_callback($input_data) {
		//For each tab
		foreach ($this->tabs as $tab_key => $tab_data) {
			//If we have sections
			if (array_key_exists('sections', $tab_data)) {
				//Iterate over each section
				foreach ($tab_data['sections'] as $section_key => $section_data) {
					//If section has fields
					if (array_key_exists('fields', $section_data)) {
						//For each field
						foreach ($section_data['fields'] as $field_key => $field_definition) {
							//If this field was submitted
							if (isset($input_data[$tab_key][$section_key][$field_definition['name']])) {
								$value = $input_data[$tab_key][$section_key][$field_definition['name']];

								//If no input processing specified
								if (! array_key_exists('input_processing', $field_definition)) {
									//Make safe by default
									$field_definition['input_processing'][] = 'htmlspecialchars';
								}

								//Process the input
								$input_data[$tab_key][$section_key][$field_definition['name']] = Waymark_Input::process_input($field_definition, $value);
							}
						}
					}
				}
			}
		}

		return $input_data;
	}

	public function content_admin_page() {
		//Tabs - get current tab from URL (ensure is valid)
		$get_data = wp_unslash($_GET);
		$active_content = $this->default_content;
		if (isset($get_data['content'])) {
			$requested_content = esc_attr($get_data['content']);
			if (strpos($requested_content, 'label') !== 0 && array_key_exists($requested_content, $this->settings_nav)) {
				$active_content = $requested_content;
			}
		}
		$active_help = $this->get_active_help($active_content);

		echo '<div id="waymark-admin-container" class="waymark-active-' . esc_attr($active_content) . '">' . "\n";

		$this->settings_nav($active_content, $active_help);

		// About
		echo wp_kses(Waymark_Helper::plugin_about(), [
			'div' => [
				'id' => [],
				'class' => [],
			],
			'h1' => [
				'class' => [],
			],
			'img' => [
				'alt' => [],
				'src' => [],
				'width' => [],
				'height' => [],
				'class' => [],
			],
			'p' => [
				'class' => [],
			],
			'strong' => [],
			'a' => [
				'href' => [],
				'rel' => [],
				'target' => [],
			],
			'ul' => [
				'class' => [],
			],
			'li' => [],
			'hr' => [],
		]);

		echo '	<div class="card">' . "\n";

		//Open form
		echo '		<form action="' . esc_url(admin_url('options.php')) . '" method="post">' . "\n";
		settings_fields($this->page_slug);

		//For each tab
		foreach ($this->tabs as $tab_key => $tab_data) {
			echo '	<div class="waymark-settings-tab waymark-settings-tab-' . esc_attr($tab_key) . '">' . "\n";

			//Tab description?
			if (array_key_exists('description', $tab_data)) {
				echo '	<div class="waymark-settings-tab-description">' . esc_html($tab_data['description']) . '</div>' . "\n";
			}

			//For each section
			foreach ($tab_data['sections'] as $section_key => $section_data) {
				$class = (isset($section_data['class'])) ? ' ' . $section_data['class'] : '';
				echo '		<div class="waymark-settings-section waymark-settings-section-' . esc_attr($section_key . $class) . '">' . "\n";

				//Title
				if (isset($section_data['title'])) {
					echo '		<h2>' . esc_html($section_data['title']) . '</h2>' . "\n";
				}

				//Description
				if (array_key_exists('description', $section_data)) {
					echo '		<div class="waymark-settings-section-description">' . wp_kses($section_data['description'], [
						'span' => [
							'class' => [],
						],
						'a' => [
							'href' => [],
							'class' => [],
							'target' => [],
						],
						'br' => [],
					]) . '</div>' . "\n";
				}

				//Repeatable?
				if (array_key_exists('repeatable', $section_data) && $section_data['repeatable']) {
					echo '<noscript><style>#waymark-admin-container .waymark-repeatable[hidden] { display: block !important; }</style></noscript>' . "\n";
					echo '<div class="waymark-repeatable" data-count="0" hidden>' . "\n";
				}

				echo '		<table class="form-table">' . "\n";
				do_settings_fields($this->page_slug, $section_key);
				echo '		</table>' . "\n";

				//Repeatable?
				if (array_key_exists('repeatable', $section_data) && $section_data['repeatable']) {
					echo '</div>' . "\n";

					//Split the joined values as soon as the container has been parsed. The
					//function is guarded so a build that scopes it away leaves the
					//DOM-ready fallback in charge.
					echo '<script>(function () { if (typeof waymark_setup_repeatable_settings !== "function") { return; } try { waymark_setup_repeatable_settings(); } catch (error) {} })();</script>' . "\n";
				}

				//Footer
				if (array_key_exists('footer', $section_data)) {
					echo '	<div class="waymark-settings-section-footer">' . wp_kses($section_data['footer'], [
						'small' => [],
						'b' => [],
					]) . '</div>' . "\n";
				}

				echo '</div>' . "\n";
			}

			echo '	</div>' . "\n";
		}

		submit_button(null, 'primary large');
		echo '		</form>' . "\n";

		echo '	</div>' . "\n";
		echo '</div>' . "\n";
	}

	public function settings_nav($current = 'tiles', $active_help = null) {
		if ($active_help === null) {
			$active_help = $this->get_active_help($current);
		}

		echo '<nav id="waymark-settings-nav" data-init_tab_key="' . esc_attr($current) . '" aria-label="' . esc_attr__('Waymark settings', 'waymark') . '">' . "\n";
		echo '	<div class="waymark-settings-nav__links">' . "\n";

		$group_open = false;
		foreach ($this->settings_nav as $content_id => $content_title) {
			if (strpos($content_id, 'label') === 0) {
				if ($group_open) {
					echo '		</ul>' . "\n";
				}

				echo '		<ul class="waymark-settings-nav__group" role="list" aria-label="' . esc_attr($content_title) . '">' . "\n";
				$group_open = true;
			} else {
				$content_url = add_query_arg([
					'post_type' => 'waymark_map',
					'page' => $this->page_slug,
					'content' => $content_id,
				], admin_url('edit.php'));
				$is_active = ($current === $content_id);

				echo '			<li><a href="' . esc_url($content_url) . '" data-content="' . esc_attr($content_id) . '"' . ($is_active ? ' class="is-active" aria-current="page"' : '') . '>' . esc_html($content_title) . '</a></li>' . "\n";
			}
		}

		if ($group_open) {
			echo '		</ul>' . "\n";
		}

		echo '	</div>' . "\n";

		if ($active_help !== null) {
			$help_text = (isset($active_help['text'])) ? $active_help['text'] : esc_html__('View Help &raquo;', 'waymark');

			echo '	<a class="waymark-docs-link button" href="' . esc_url($active_help['url']) . '" target="_blank">' . esc_html($help_text) . '</a>' . "\n";
		}

		echo '</nav>' . "\n";
	}

	public function get_active_help($active_content) {
		if (strpos($active_content, 'waymark-settings-tab-') === 0) {
			$tab_key = substr($active_content, strlen('waymark-settings-tab-'));

			if (! array_key_exists($tab_key, $this->tabs)) {
				return null;
			}

			$skip_sections = ($tab_key === 'misc') ? ['map_options', 'interaction_options', 'cluster_options', 'shortcode_options', 'elevation_options'] : [];

			foreach ($this->tabs[$tab_key]['sections'] as $section_key => $section_data) {
				if (in_array($section_key, $skip_sections, true)) {
					continue;
				}

				if (isset($section_data['help']['url'])) {
					return $section_data['help'];
				}
			}
		} elseif (strpos($active_content, 'waymark-settings-section-') === 0) {
			$section_key = substr($active_content, strlen('waymark-settings-section-'));

			foreach ($this->tabs as $tab_data) {
				if (isset($tab_data['sections'][$section_key]['help']['url'])) {
					return $tab_data['sections'][$section_key]['help'];
				}
			}
		}

		return null;
	}

	public function admin_notices() {
		$get_data = wp_unslash($_GET);
		// Display Settings Updated Notice?
		if (isset($get_data['settings-updated']) && esc_attr($get_data['settings-updated']) == 'true') {
			echo '<div class="waymark-notice notice notice-success is-dismissible"><p>' . esc_html__('Settings Updated', 'waymark') . '.</p></div>';
		}
	}
}
