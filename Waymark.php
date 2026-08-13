<?php

/*
Plugin Name: Waymark
Plugin URI: https://www.ogis.org/waymark-wp/
Description: Mapping with WordPress made easy. With Waymark enabled, click on the "Maps" link in the sidebar to create and edit Maps. Once you are happy with your Map, copy the Waymark shortcode and add it to your content.
Version: 1.6.0
Text Domain: waymark
Author: Joe Hawes
Author URI: https://www.morehawes.ca/
License: GPLv2
 */

//Base
require_once 'inc/Waymark_Config.php';
require_once 'inc/Waymark_Types.php';
require_once 'inc/Waymark_Taxonomies.php';
require_once 'inc/Waymark_Install.php';

//Objects
require_once 'inc/Objects/Waymark_Map.php';
require_once 'inc/Objects/Waymark_Collection.php';

//Helpers
require_once 'inc/Helpers/Waymark_Helper.php';
require_once 'inc/Helpers/Waymark_Input.php';
require_once 'inc/Helpers/Waymark_GeoJSON.php';
require_once 'inc/Helpers/Waymark_Lang.php';

//Front
require_once 'inc/Waymark_Front.php';

//Admin
require_once 'inc/Waymark_Admin.php';

// Activation and uninstall hooks must be registered at file-load time,
// before plugins_loaded fires, so that WordPress can call them during activation.
Waymark_Install::init();

// Initialise config during the init action so translations are available.
// Priority -1 ensures config is ready before post types (priority 0) and
// taxonomies (priority 10) are registered on the same hook.
add_action('init', function () {
	Waymark_Config::init();
}, -1);

// Instantiate plugin components once all plugins have loaded.
// Constructors only register hooks at this point; actual work (including any
// translation calls) is deferred to init or later hooks.
add_action('plugins_loaded', function () {
	new Waymark_Types;
	new Waymark_Taxonomies;
	new Waymark_Front;
	new Waymark_Admin;
});
