// After Waymark JS has loaded, but not yet fired the waymark_loaded_callback()
// Link in to some WordPress functionality
function waymark_setup_map_editor(waymark_editor = {}) {
	// Ensure waymark_editor.map exists
	if (!waymark_editor.map) {
		waymark_editor.message("waymark_editor.map not available", "error");

		return;
	}

	// Show File upload button in toolbar
	jQuery(".waymark-edit-toolbar a.waymark-edit-upload").removeClass("waymark-hidden");

	// Add Image upload to toolbar

	const image_button = jQuery(".waymark-edit-toolbar a.waymark-edit-image");

	if (image_button.length) {
		waymark_editor.debug("Enabling Front-End Image Uploads.");

		image_button.removeClass("waymark-hidden");

		// On click
		image_button.on("click", function (e) {
			e.preventDefault();

			// button.onclick = function () {
			// 	//Thanks to: https://stackoverflow.com/a/24939229
			var photo_input = jQuery("<input />")
				.attr({
					type: "file",
					name: "add_photo",
				})
				.css("display", "none")
				.on("change", function () {
					waymark_editor.handle_file_upload(jQuery(this));
				});

			jQuery("#waymark-edit-toolbar").append(photo_input);

			//Fire the form
			photo_input.trigger("click");

			return false;
		});
	}

	// Editor Popup Integration

	waymark_editor.map.on("popupopen", function (e) {
		const feature = e.popup._source.feature;
		const info_container = jQuery(".waymark-map .waymark-info").first();

		// Add Overlay "Image Upload" button to info window

		const image_button = jQuery(
			".waymark-info-image_large_url .button",
			info_container,
		);

		if (image_button.length) {
			image_button.removeClass("waymark-hidden");

			image_button.on("click", function (e) {
				e.preventDefault();

				//Thanks to: https://stackoverflow.com/a/24939229
				var photo_input = jQuery("<input />")
					.attr({
						type: "file",
						name: "marker_photo",
					})
					.css("display", "none")
					.on("change", function () {
						waymark_editor.handle_file_upload(jQuery(this), {
							feature: feature,
							img_view: jQuery(
								".waymark-info-image_large_url a",
								info_container,
							),
							img_input: jQuery(
								".waymark-info-image_large_url input",
								info_container,
							),
						});
					});

				info_container.append(photo_input);

				//Fire the form
				photo_input.trigger("click");

				return false;
			});
		}
	});
}

function waymark_setup_map_shortcode() {
	jQuery(".waymark-shortcode").each(function () {
		var shortcode = jQuery(this);

		//Header
		jQuery(".waymark-header", shortcode).each(function () {
			var header = jQuery(this);
			var open = jQuery(".waymark-link", header).first();
			var meta = jQuery(".waymark-meta", header);

			//Do we have shortcode meta?
			if (meta.length) {
				var has_export = jQuery(".waymark-map-export", meta).length;
				var meta_items = jQuery(".waymark-meta-item", meta);

				//Is export the only meta being displayed?
				var export_only = has_export && meta_items.length === 1;

				//Only export on mobile
				// 				if(export_only && waymark_is_touch_device()) {
				// 					return;
				// 				}

				//Open button
				open.on("click", function () {
					meta.show();

					return false;
				});
				jQuery("i", open).attr("class", "ion ion-map");

				//Setup Meta
				meta.css("height", shortcode.height() + "px");

				//Close button
				var close = jQuery("<i />")
					.attr({
						class: "waymark-meta-close ion ion-close",
					})
					.on("click", function () {
						meta.hide();
					});
				meta.append(close);
			}
		});
	});
}

jQuery(document).ready(function () {
	waymark_setup_map_shortcode();
});
