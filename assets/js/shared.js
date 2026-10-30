function waymark_setup_map_export() {
	//Each Export field
	jQuery(".waymark-map-export, .waymark-collection-export").each(function () {
		var export_container = jQuery(this);

		if (export_container) {
			//Shortcode
			var shortcode_container = export_container.parents(".waymark-shortcode");
			if (shortcode_container.length) {
				var map_container = jQuery(".waymark-map", shortcode_container);
				//Map Details & Admin
			} else {
				var map_container = jQuery(".waymark-map");
			}

			//Container
			var export_parent = export_container.parents(".waymark-meta-export_data");
			if (!export_parent.length) {
				export_parent = export_container.parent("div");
			}

			//If not form (i.e. admin - Wordpress strips out the form)
			if (export_container.get(0).tagName != "FORM") {
				//Clones contents
				var form_container = jQuery("<form>").append(
					export_container.contents(),
				);
				var form_attributes = export_container.get(0).attributes;

				for (var i = form_attributes.length - 1; i >= 0; i--) {
					form_container.attr(
						form_attributes[i].name,
						form_attributes[i].value,
					);
				}

				//Replace with form
				export_container.replaceWith(form_container);
				export_container = form_container;
			}

			var input_map_data = jQuery('input[name="map_data"]', export_container);

			//Hide Export row if no data to export
			var Waymark_Instance = map_container.data("Waymark");
			if (typeof Waymark_Instance !== "undefined") {
				Waymark_Instance.map.on("layerremove layeradd", function () {
					var active_layer_count = 0;
					Waymark_Instance.map_data.eachLayer(function (layer) {
						//If visible
						if (Waymark_Instance.map.hasLayer(layer)) {
							active_layer_count++;
						}
					});

					if (active_layer_count > 0) {
						export_parent.show();
					} else {
						export_parent.hide();
					}
				});
			}

			//When clicked
			export_container.on("submit", function (e) {
				var export_select = jQuery("select", export_container);
				var export_format = export_select.val()
					? export_select.val()
					: "geojson";

				// Layer Group to hold download data
				var map_export_layers = Waymark_L.layerGroup();

				// Get Waymark instance
				Waymark_Instance = map_container.data("Waymark");

				// Iterate through each layer
				Waymark_Instance.map_data.eachLayer(function (layer) {
					// Modify layer data
					for (key in layer.feature.properties) {
						//If we have something
						if (typeof layer.feature.properties[key] != "undefined") {
							if (key == "title" && export_format == "kml") {
								layer.feature.properties["name"] =
									layer.feature.properties[key];

								delete layer.feature.properties[key];
							}
							//Nothing here
						} else {
							//Get rid of it
							delete layer.feature.properties[key];
						}

						//Clean up description
						if (
							key == "description" &&
							typeof layer.feature.properties["description"] !== "undefined"
						) {
							//Remove HTML
							var description = layer.feature.properties["description"];
							var link_pos = description.indexOf(
								'<div class="waymark-description-link',
							);

							if (link_pos !== -1) {
								description = description.substring(0, link_pos);
							}

							//Single quotes
							description = description.replace("'", "&apos;");

							layer.feature.properties["description"] = description;
						}
					}

					map_export_layers.addLayer(layer);
				});

				var map_data_geojson = map_export_layers.toGeoJSON();

				switch (export_select.val()) {
					//GPX
					case "gpx":
						const options = {
							metadata: {},
						};

						// Name Metadata
						var map_title = jQuery(
							'input[name="map_title"]',
							export_container,
						).val();

						if (map_title) {
							options.metadata.name = map_title;
						}

						//Convert to GPX
						//Thanks! https://github.com/tyrasd/togpx
						var map_data = togpx(map_data_geojson, options);
						var map_data_type = "application/gpx+xml;charset=utf-8";
						var map_data_extension = "gpx";

						break;

					//KML
					case "kml":
						//Convert to KML
						//Thanks! https://github.com/mapbox/tokml & https://github.com/maphubs/tokml
						var map_data = tokml(map_data_geojson);
						var map_data_type =
							"application/vnd.google-earth.kml+xml;charset=utf-8";
						var map_data_extension = "kml";

						break;

					//GeoJSON
					default:
					case "geojson":
						var map_data = JSON.stringify(map_data_geojson);
						var map_data_type = "application/geo+json;charset=utf-8";
						var map_data_extension = "geojson";

						break;
				}

				//Set Map data in form
				input_map_data.val(encodeURIComponent(map_data));

				//Form gets submitted...
			});
		}
	});
}

//Tooltips
function waymark_setup_parameter_tooltips() {
	jQuery("a.waymark-tooltip").on({
		mouseenter: function (e) {
			var title = jQuery(this).data("title");
			jQuery("#waymark-tooltip-active").remove();
			jQuery('<p id="waymark-tooltip-active"></p>')
				.text(title)
				.appendTo("body")
				.fadeIn("slow");
		},
		mouseleave: function (e) {
			jQuery("#waymark-tooltip-active").remove();
		},
		mousemove: function (e) {
			if (waymark_is_touch_device()) {
				var mousex = e.pageX - 250;
			} else {
				var mousex = e.pageX - 220;
			}

			var mousey = e.pageY + 5;
			jQuery("#waymark-tooltip-active").css({ top: mousey, left: mousex });
		},
	});
}

//Touch device?
//Thanks https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
function waymark_is_touch_device() {
	var prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
	var mq = function (media_qry) {
		return window.matchMedia(media_qry).matches;
	};

	if (
		"ontouchstart" in window ||
		(window.DocumentTouch && document instanceof DocumentTouch)
	) {
		return true;
	}

	// include the 'heartz' as a way to have a non matching MQ to help terminate the join
	// https://git.io/vznFH
	var media_qry = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join(
		"",
	);
	return mq(media_qry);
}

function waymark_setup_accordions() {
	var accordion_container = jQuery(".waymark-accordion-container");

	if (!accordion_container.length) {
		return;
	}

	accordion_container.addClass("waymark-self-clear");

	//For each accordion
	accordion_container.each(function () {
		//Hide all but first initially
		var group_index = 0;

		//Each group
		jQuery(".waymark-accordion-group", jQuery(this)).each(function () {
			jQuery(this).addClass("waymark-self-clear");
			jQuery(this).data("waymark-index", group_index);

			var group_content = jQuery(
				".waymark-accordion-group-content",
				jQuery(this),
			);

			//Show first
			if (group_index == 0) {
				jQuery(this).addClass("waymark-first");
				group_content.show().addClass(group_index);
				//Hide others
			} else {
				group_content.hide().addClass(group_index);
			}

			//Each legend
			jQuery("legend", jQuery(this)).each(function () {
				//Append text to legend
				var legend_text = jQuery(this).html();
				if (legend_text.indexOf("[+]") == -1) {
					jQuery(this).html(legend_text + " <span>[+]</span>");
				}

				//Slide
				jQuery(this).click(function () {
					var clicked_group_index = jQuery(this)
						.parents(".waymark-accordion-group")
						.data("waymark-index");

					//For each parameter group
					jQuery(
						".waymark-accordion-group",
						jQuery(this).parents(".waymark-accordion-container"),
					).each(function () {
						//If this was clicked
						if (jQuery(this).data("waymark-index") == clicked_group_index) {
							jQuery(
								".waymark-accordion-group-content",
								jQuery(this),
							).slideDown();
						} else {
							jQuery(
								".waymark-accordion-group-content",
								jQuery(this),
							).slideUp();
						}
					});
				});
			});

			group_index++;
		});
	});
}

jQuery(document).ready(function () {
	waymark_setup_parameter_tooltips();
	waymark_setup_map_export();
	waymark_setup_accordions();
});
