<?php

class Waymark_Lang {
	public static function get_js_lang() {
		return [
			//Viewer
			'action_fullscreen_activate' => __('View Fullscreen', 'waymark'),
			'action_fullscreen_deactivate' => __('Exit Fullscreen', 'waymark'),
			'action_locate_activate' => __('Show me where I am', 'waymark'),
			'action_zoom_in' => __('Zoom in', 'waymark'),
			'action_zoom_out' => __('Zoom out', 'waymark'),
			'label_total_length' => __('Total Length:', 'waymark'),
			'label_max_elevation' => __('Max Elevation:', 'waymark'),
			'label_min_elevation' => __('Min Elevation:', 'waymark'),
			'label_ascent' => __('Total Ascent:', 'waymark'),
			'label_descent' => __('Total Descent:', 'waymark'),
			'label_altitude' => __('Altitude', 'waymark'),
			'label_download' => __('Download', 'waymark'),
			/* translators: Unit symbol for kilometres. */
			'label_unit_km' => __('km', 'waymark'),
			/* translators: Unit symbol for metres. */
			'label_unit_m' => __('m', 'waymark'),
			/* translators: Unit symbol for miles. */
			'label_unit_mi' => __('mi', 'waymark'),
			/* translators: Unit symbol for feet. */
			'label_unit_ft' => __('ft', 'waymark'),
			/* translators: Shown when the geocoder search returns no results. */
			'error_geocoder' => __('Nothing found.', 'waymark'),

			//Editor
			'add_line_title' => __('Draw a Line', 'waymark'),
			'add_photo_title' => __('Upload Image', 'waymark'),
			'add_marker_title' => __('Place a Marker', 'waymark'),
			'add_rectangle_title' => __('Draw a Rectangle', 'waymark'),
			'add_polygon_title' => __('Draw a Polygon', 'waymark'),
			'add_circle_title' => __('Draw a Circle', 'waymark'),
			'upload_file_title' => __('Read Lines and Markers from file (GPX/KML/GeoJSON supported, which most apps should Export to)', 'waymark'),
			'action_edit_marker' => __('Edit Marker', 'waymark'),
			'action_edit_line' => __('Edit Line', 'waymark'),
			'action_edit_shape' => __('Edit Shape', 'waymark'),
			'action_edit_done' => __('Finish editing', 'waymark'),
			'action_duplicate_marker' => __('Duplicate Marker', 'waymark'),
			'action_duplicate_line' => __('Duplicate Line', 'waymark'),
			'action_duplicate_shape' => __('Duplicate Shape', 'waymark'),
			'action_delete_marker' => __('Delete Marker', 'waymark'),
			'action_delete_line' => __('Delete Line', 'waymark'),
			'action_delete_shape' => __('Delete Shape', 'waymark'),
			'action_delete_confirm_marker' => __('Are you sure you want to delete this Marker?', 'waymark'),
			'action_delete_confirm_line' => __('Are you sure you want to delete this Line?', 'waymark'),
			'action_delete_confirm_shape' => __('Are you sure you want to delete this Shape?', 'waymark'),
			'action_upload_image' => __('Upload Image', 'waymark'),
			'object_type_label_marker' => __('Marker type:', 'waymark'),
			'object_type_label_line' => __('Line type:', 'waymark'),
			'object_type_label_shape' => __('Shape type:', 'waymark'),
			'object_title_placeholder_marker' => __('Marker title', 'waymark'),
			'object_title_placeholder_line' => __('Line title', 'waymark'),
			'object_title_placeholder_shape' => __('Shape title', 'waymark'),
			'object_image_placeholder' => __('Image URL', 'waymark'),
			'object_description_placeholder_marker' => __('Marker description', 'waymark'),
			'object_description_placeholder_line' => __('Line description', 'waymark'),
			'object_description_placeholder_shape' => __('Shape description', 'waymark'),
			/* translators: Abbreviation for latitude and longitude. */
			'marker_latlng_label' => __('Lat,Lng', 'waymark'),
			'action_search_placeholder' => __('Search...', 'waymark'),
			'object_label_marker' => __('Marker', 'waymark'),
			'object_label_line' => __('Line', 'waymark'),
			'object_label_shape' => __('Shape', 'waymark'),
			'object_label_marker_plural' => __('Markers', 'waymark'),
			'object_label_line_plural' => __('Lines', 'waymark'),
			'object_label_shape_plural' => __('Shapes', 'waymark'),
			'error_message_prefix' => __('Waymark Error', 'waymark'),
			'info_message_prefix' => __('Waymark Info', 'waymark'),
			'debug_message_prefix' => __('Waymark Debug', 'waymark'),
			'error_file_type' => __('This file type is not supported.', 'waymark'),
			'error_file_conversion' => __('Could not convert this file to GeoJSON.', 'waymark'),
			'error_file_upload' => __('File upload error.', 'waymark'),
			'error_photo_meta' => __('Could not retrieve Image metadata.', 'waymark'),
			'info_exif_yes' => __('Image location metadata (EXIF) detected!', 'waymark'),
			'info_exif_no' => __('Image location metadata (EXIF) NOT detected.', 'waymark'),
			'no_direction' => __('No Direction', 'waymark'),
			'show_direction' => __('Show Direction', 'waymark'),
			'reverse_direction' => __('Reverse Direction', 'waymark'),
		];
	}
}