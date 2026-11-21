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

			//Media Library
			if (
				typeof wp !== "undefined" &&
				wp.media &&
				typeof waymark_js !== "undefined" &&
				waymark_js.media_library
			) {
				const frame = wp.media({
					title: waymark_js.lang.media_frame_title,
					button: { text: waymark_js.lang.media_frame_button },
					library: { type: "image" },
					multiple: false,
				});

				frame.on("select", function () {
					const attachment = frame.state().get("selection").first().toJSON();

					//Ensure we have the data we want
					if (typeof attachment.url === "undefined") {
						return;
					}

					//Get Image EXIF
					var form_data = new FormData();
					form_data.append("waymark_security", waymark_security);
					form_data.append("action", "waymark_get_attatchment_meta");
					form_data.append("attachment_id", attachment.id);

					jQuery.ajax({
						type: "POST",
						url: waymark_js.ajaxurl,
						data: form_data,
						dataType: "json",
						processData: false,
						contentType: false,
						success: function (response) {
							Waymark.debug("waymark_get_attatchment_meta");

							if (response === null) {
								Waymark.message(
									Waymark.config.language.error_photo_meta,
									"error",
								);

								return;
							}

							//Default centre
							var marker_latlng = Waymark.map.getCenter();

							//Extract EXIF location
							var exif_latlng = Waymark.get_exif_latlng(response);

							if (exif_latlng) {
								marker_latlng = exif_latlng;

								//Center on it
								Waymark.map.setView(marker_latlng);
							}

							//Get Image URLs
							var image_sizes = Waymark.get_image_sizes(
								attachment.sizes,
								attachment.url,
							);

							//Create JSON
							var marker_json = Waymark.create_marker_json(
								marker_latlng,
								image_sizes,
							);

							//Add Marker
							Waymark.map_data.addData(marker_json);

							//Save
							Waymark.map_was_edited();
						},
					});
				});

				frame.open();
				frame.content.mode("browse");

				return false;
			}

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

			jQuery(".waymark-edit-toolbar").append(photo_input);

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

				//Media Library
				if (
					typeof wp !== "undefined" &&
					wp.media &&
					typeof waymark_js !== "undefined" &&
					waymark_js.media_library
				) {
					const frame = wp.media({
						title: waymark_js.lang.media_frame_title,
						button: { text: waymark_js.lang.media_frame_button },
						library: { type: "image" },
						multiple: false,
					});

					frame.on("select", function () {
						const attachment = frame.state().get("selection").first().toJSON();

						//Ensure we have the data we want
						if (typeof attachment.url === "undefined") {
							return;
						}

						//Get Image URLs
						var image_sizes = Waymark.get_image_sizes(
							attachment.sizes,
							attachment.url,
						);

						//Update data
						feature.properties = Object.assign(
							{},
							feature.properties,
							image_sizes,
						);

						//Update preview
						var image_large_url =
							feature.properties.image_large_url &&
							/^https?:\/\//i.test(feature.properties.image_large_url)
								? feature.properties.image_large_url
								: false;
						var image_thumbnail_url =
							feature.properties.image_thumbnail_url &&
							/^https?:\/\//i.test(feature.properties.image_thumbnail_url)
								? feature.properties.image_thumbnail_url
								: false;

						jQuery(".waymark-info-image_large_url", info_container)
							.find("a")
							.attr("href", image_large_url || null)
							.end()
							.find("img")
							.attr("src", image_thumbnail_url || null)
							.end()
							.find("input")
							.val(feature.properties.image_large_url);

						//Save
						Waymark.map_was_edited();
					});

					frame.open();
					frame.content.mode("browse");

					return false;
				}

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
