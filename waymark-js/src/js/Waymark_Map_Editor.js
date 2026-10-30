/*
	==================================
	============= EDITOR =============
	==================================
*/

function Waymark_Map_Editor() {
  /*
		==================================
		============= ABSTRACT ===========
		==================================
	*/

  this.pre_map_setup = function () {
    Waymark = this;

    Waymark.mode = "edit";
  };

  this.init_done = function () {
    Waymark = this;

    //This is the editor
    Waymark.jq_map_container.addClass("waymark-is-editor");

    // Set up data container
    const data_div_id = Waymark.config.editor_options.data_div_id;
    Waymark.jq_data_container = jQuery("#" + data_div_id);

    //Data container found
    if (Waymark.jq_data_container.length) {
      // Get existing data
      const map_data = Waymark.jq_data_container.val();

      // Ensure is valid GeoJSON
      try {
        // Parse
        const parsed_data = JSON.parse(map_data);

        // Load
        Waymark.load_json(parsed_data);

        Waymark.debug(
          `Data container (#${data_div_id}) found, valid GeoJSON added to Map.`,
        );
      } catch (error) {
        Waymark.debug(
          `Data container (#${data_div_id}) found, but not valid GeoJSON.`,
        );
      }
      // Data container not found
    } else {
      // Add to map container

      Waymark.debug(
        `Data container (#${data_div_id}) not found, adding to DOM.`,
      );

      Waymark.jq_data_container = jQuery("<textarea />")
        .attr({
          id: data_div_id,
          name: "map_data",
        })
        .addClass("waymark-input waymark-input-map_data")
        .appendTo(Waymark.jq_map_container);
    }

    //Add loading
    Waymark.jq_map_container.append(
      jQuery("<div />")
        .attr({
          id: "waymark-loading",
        })
        .html('<div class="waymark-spinner"></div>'),
    );

    //Every time a layer is created
    Waymark.map.on("editable:drawing:commit", function (e) {
      layer = e.layer;

      //Initialize feature
      if (typeof layer.feature == "undefined") {
        layer.feature = {
          type: "Feature",
          properties: {},
        };
      }

      //Use default type data
      switch (true) {
        case layer instanceof Waymark_L.Circle:
          layer.feature.properties = Waymark.config.shape_data_defaults;

          //Set radius
          layer.feature.properties.radius = layer.getRadius();

          break;
        case layer instanceof Waymark_L.Rectangle:
          layer.feature.properties = Waymark.config.shape_data_defaults;

          //Remember that this is a rectangle, not any old polygon
          layer.feature.properties.rectangle = true;

          break;
        case layer instanceof Waymark_L.Polygon:
          layer.feature.properties = Waymark.config.shape_data_defaults;

          break;

        case layer instanceof Waymark_L.Polyline:
          layer.feature.properties = Waymark.config.line_data_defaults;

          break;
      }

      //Add to data layer
      Waymark.map_data.addData(layer.toGeoJSON());

      //We're done with this now
      Waymark.map.removeLayer(layer);

      //Save
      Waymark.map_was_edited();
    });

    //Every time a layer is edited
    Waymark.map.on("editable:editing", function (e) {
      layer = e.layer;

      //Circle?
      if (
        typeof layer.feature !== "undefined" &&
        layer.feature.properties.radius
      ) {
        layer.feature.properties.radius = layer.getRadius();
      }

      Waymark.map_was_edited();
    });
  };

  this.create_marker = function (latlng) {
    Waymark = this;

    //Create marker
    var marker = Waymark_L.marker(latlng, { draggable: true });

    //Dragged
    marker.on("moveend", function (e) {
      var layer = e.target;
      var feature = layer.feature;

      //Update feature with new coordinates
      feature.geometry.coordinates = [
        Number(layer._latlng.lng.toFixed(6)),
        Number(layer._latlng.lat.toFixed(6)),
      ];

      //Update content to reflect change in position
      Waymark.info_window("marker", feature, layer);

      Waymark.map_was_edited();
    });

    return marker;
  };

  //Update meta field
  this.save_data_layer = function () {
    Waymark = this;

    //Map Data
    var map_data_string = JSON.stringify(Waymark.map_data.toGeoJSON());

    //Update custom field form
    Waymark.jq_data_container.val(map_data_string);
  };

  //Something was edited
  this.map_was_edited = function () {
    Waymark = this;

    // Save... always save!
    Waymark.save_data_layer();
  };

  this.loading_start = function () {
    Waymark = this;

    Waymark.jq_map_container.addClass("waymark-loading");
  };

  this.loading_stop = function () {
    Waymark = this;

    Waymark.jq_map_container.removeClass("waymark-loading");
  };

  this.create_buttons = function () {
    Waymark = this;

    //Geocoder
    var geocoder_options = {
      position: "bottomright",
      defaultMarkGeocode: false,
      placeholder: Waymark.config.language.action_search_placeholder,
      errorMessage: Waymark.escape_html(Waymark.config.language.error_geocoder),
    };

    if (Waymark.config.locale) {
      geocoder_options.geocodingQueryParams = {
        "accept-language": Waymark.config.locale,
      };
    }

    var geocoder = Waymark_L.Control.geocoder(geocoder_options);
    geocoder.on("markgeocode", function (e) {
      Waymark.map.fitBounds(e.geocode.bbox);
    });
    geocoder.addTo(Waymark.map);

    //Edit Toolbar
    var edit_toolbar_control = Waymark_L.Control.extend({
      options: {
        position: "bottomleft",
      },
      onAdd: function (map) {
        var toolbar = Waymark_L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control waymark-leaflet-control waymark-edit-toolbar",
        );

        //Line
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-icon waymark-edit-button waymark-edit-line",
          toolbar,
        );
        button.setAttribute("title", Waymark.config.language.add_line_title);
        button.onclick = function () {
          Waymark.map.editTools.startPolyline();
        };

        //Image Upload
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-image",
          toolbar,
        );
        button.innerHTML = '<i class="ion ion-image"></i>';
        button.setAttribute("title", Waymark.config.language.add_photo_title);

        // Hide initially
        button.classList.add("waymark-hidden");

        // TODO - Implement image upload

        //Marker
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-marker",
          toolbar,
        );
        button.innerHTML = '<i class="ion ion-location"></i>';
        button.setAttribute("title", Waymark.config.language.add_marker_title);
        button.onclick = function () {
          //Create JSON
          var marker_json = Waymark.create_marker_json(Waymark.map.getCenter());

          //Add Marker
          Waymark.map_data.addData(marker_json);

          //Save
          Waymark.map_was_edited();
        };

        //Rectangle
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-rectangle",
          toolbar,
        );
        button.innerHTML =
          '<i class="ion ion-android-checkbox-outline-blank"></i>';
        button.setAttribute(
          "title",
          Waymark.config.language.add_rectangle_title,
        );
        button.onclick = function () {
          Waymark.map.editTools.startRectangle();
        };

        //Polygon
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-polygon",
          toolbar,
        );
        button.innerHTML = '<i class="ion ion-android-star-outline"></i>';
        button.setAttribute("title", Waymark.config.language.add_polygon_title);
        button.onclick = function () {
          Waymark.map.editTools.startPolygon();
        };

        //Circle
        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-circle",
          toolbar,
        );
        button.innerHTML = '<i class="ion ion-ios-circle-outline"></i>';
        button.setAttribute("title", Waymark.config.language.add_circle_title);
        button.onclick = function () {
          Waymark.map.editTools.startCircle();
        };

        //File Upload

        var button = Waymark_L.DomUtil.create(
          "a",
          "waymark-edit-button waymark-edit-upload waymark-hidden",
          toolbar,
        );
        button.innerHTML =
          '<i class="ion ion-document"></i><i class="ion ion-arrow-up-c"></i>';
        button.setAttribute("title", Waymark.config.language.upload_file_title);

        //Thanks to: https://stackoverflow.com/a/24939229
        var file_input = jQuery("<input />")
          .attr({
            type: "file",
            name: "add_file",
          })
          .css("display", "none")
          .change(function () {
            Waymark.handle_file_upload(jQuery(this));
          });

        jQuery("#waymark-edit-toolbar").append(file_input);

        button.onclick = function () {
          //Fire the form
          file_input.trigger("click");

          //Weird circle bug fix...
          Waymark.map.editTools.stopDrawing();
        };

        return toolbar;
      },
    });
    Waymark.map.addControl(new edit_toolbar_control());
  };

  this.handle_file_upload = function (input, data = {}) {
    Waymark = this;

    Waymark.loading_start();

    //Create form data
    var form_data = new FormData();
    form_data.append("waymark_security", waymark_security);
    form_data.append("action", "waymark_read_file");
    form_data.append(input.attr("name"), input[0].files[0]);

    jQuery.ajax({
      type: "POST",
      url: waymark_js.ajaxurl,
      data: form_data,
      dataType: "json",
      processData: false,
      contentType: false,
      success: function (response) {
        Waymark.debug("File upload response:");
        Waymark.debug(response);

        //Error?
        if (response === null) {
          Waymark.message(Waymark.config.language.error_file_upload, "error");
          Waymark.loading_stop();

          return false;
        } else if (response.error) {
          Waymark.message(response.error, "error");
          Waymark.loading_stop();

          return false;
        }

        switch (input.attr("name")) {
          case "add_file":
            Waymark.load_file_contents(
              response.file_contents,
              response.file_type,
            );

            break;

          case "add_photo":
            //Ensure we have the data we want
            if (typeof response.url === "undefined") {
              return false;
            }

            //Default centre
            var marker_latlng = Waymark.map.getCenter();

            //Extract EXIF location
            if ((latlng = Waymark.get_exif_latlng(response))) {
              marker_latlng = latlng;

              //Center on it
              Waymark.map.setView(marker_latlng);
            }

            //Get Image URLs
            var image_sizes = Waymark.get_image_sizes(
              response.sizes,
              response.url,
            );

            //Create JSON
            var marker_json = Waymark.create_marker_json(
              marker_latlng,
              image_sizes,
            );

            //Add Marker
            Waymark.map_data.addData(marker_json);

            break;

          case "marker_photo":
            //Ensure we have the data we want
            if (typeof response.url === "undefined") {
              return false;
            }

            //Get Image URLs
            var image_sizes = Waymark.get_image_sizes(
              response.sizes,
              response.url,
            );

            //Update data
            data.feature.properties = Object.assign(
              {},
              data.feature.properties,
              image_sizes,
            );

            //Update preview
            data.img_view.attr("href", data.feature.properties.image_large_url);
            jQuery("img", data.img_view).attr(
              "src",
              data.feature.properties.image_thumbnail_url,
            );

            //Update input
            data.img_input.val(data.feature.properties.image_large_url);

            break;
        }

        Waymark.map_was_edited();

        Waymark.loading_stop();

        return;
      },
    });
  };

  this.build_content = function (layer_type, feature, layer) {
    Waymark = this;

    //Build output
    var content = jQuery("<div />");
    var list = jQuery("<ul />").addClass("waymark-info");

    //Edit button
    if (layer_type == "line" || layer_type == "shape") {
      var ele = jQuery("<button />")
        .html('<i class="ion-edit"></i>')
        .addClass("button")
        .attr("title", Waymark.config.language["action_edit_" + layer_type])
        .on("click", function (e) {
          e.preventDefault();

          //Get the element we need
          var button = jQuery(this);
          var icon = jQuery("i", button);

          //Finish
          if (layer.editEnabled()) {
            //Disable edit
            layer.disableEdit();

            //Change title
            button.attr(
              "title",
              Waymark.config.language["action_edit_" + layer_type],
            );

            //Change icon
            icon.attr("class", "ion-edit");
            //Start
          } else {
            //Enable edit
            layer.enableEdit();

            //Close popup
            layer.closePopup();

            //Change title
            button.attr("title", Waymark.config.language.action_edit_done);

            //Change icon
            icon.attr("class", "ion-android-done");
          }

          return false;
        });
      list.append(
        jQuery("<li />")
          .addClass(
            "waymark-info-button waymark-info-edit waymark-" +
              layer_type +
              "-edit",
          )
          .append(ele),
      );
    }

    //Duplicate button
    var ele = jQuery("<button />")
      .html('<i class="ion-ios-copy"></i>')
      .addClass("button")
      .attr("title", Waymark.config.language["action_duplicate_" + layer_type])
      .on("click", function (e) {
        e.preventDefault();

        //Clone
        Waymark.load_json(Object.assign({}, layer.feature));

        Waymark.map_was_edited();

        return false;
      });
    list.append(
      jQuery("<li />")
        .addClass(
          "waymark-info-button waymark-info-duplicate waymark-" +
            layer_type +
            "-duplicate",
        )
        .append(ele),
    );

    //Delete button
    var ele = jQuery("<button />")
      .html('<i class="ion-trash-a"></i>')
      .addClass("button")
      .attr("title", Waymark.config.language["action_delete_" + layer_type])
      .on("click", function (e) {
        e.preventDefault();

        //Confirm delete...
        if (Waymark.config.editor_options.confirm_delete == "1") {
          if (
            !confirm(
              Waymark.config.language["action_delete_confirm_" + layer_type],
            )
          ) {
            return false;
          }
        }

        //Remove from Map
        Waymark.map.removeLayer(layer);
        //Remove from data later
        Waymark.map_data.removeLayer(layer);

        Waymark.map_was_edited();

        return false;
      });
    list.append(
      jQuery("<li />")
        .addClass(
          "waymark-info-button waymark-info-delete waymark-" +
            layer_type +
            "-delete",
        )
        .append(ele),
    );

    //Type
    var config_types = Waymark.config.map_options[layer_type + "_types"];
    var types_data = [];

    // ================================
    // ===== DIRECTION SELECTOR =======
    // ================================

    if (layer_type == "line") {
      var jq_line_direction_select = jQuery("<select />");

      //Options
      jq_line_direction_select.append(
        jQuery("<option />").val("").text(Waymark.config.language.no_direction),
        jQuery("<option />")
          .val("default")
          .text(Waymark.config.language.show_direction),
        jQuery("<option />")
          .val("reverse")
          .text(Waymark.config.language.reverse_direction),
      );

      //On change
      jq_line_direction_select.change(function () {
        var selected_input = jQuery("option:selected", jQuery(this));

        //Get direction value
        var selected_direction = jQuery(this).val();

        //Update data layer
        feature.properties.direction = selected_direction;

        //Redraw - layer Direction
        Waymark.draw_line_direction(layer);

        Waymark.map_was_edited();
      });

      //Add item
      list.append(
        jQuery("<li />")
          .addClass("waymark-info-direction waymark-line-direction")
          .append(jq_line_direction_select),
      );

      //Set selected
      if (typeof feature.properties.direction === "string") {
        jQuery("option", jq_line_direction_select)
          .filter(function () {
            return (
              jQuery(this).val() ==
              Waymark.make_key(feature.properties.direction)
            );
          })
          .attr("selected", "selected");
      }
    }

    // ================================
    // ======== TYPE SELECTOR =========
    // ================================

    var jq_layer_type_select = jQuery("<select />");

    jq_layer_type_select.append(
      jQuery("<option />")
        .attr({
          disabled: "disabled",
        })
        .text(Waymark.config.language["object_type_label_" + layer_type]),
    );

    //Pre-defined config_types
    for (var i in config_types) {
      //Get Key
      var type_key =
        config_types[i].type_key ||
        Waymark.make_key(config_types[i][layer_type + "_title"]);

      //Add option
      jq_layer_type_select.append(
        jQuery("<option />")
          .val(type_key)
          .text(config_types[i][layer_type + "_title"]),
      );
    }

    //On change
    jq_layer_type_select.change(function () {
      var selected_input = jQuery("option:selected", jQuery(this));

      //Get type value
      var selected_type = jQuery(this).val();

      //Update data layer
      feature.properties.type = selected_type;

      //Predefined
      if (typeof selected_type != "object") {
        var type = Waymark.get_type(layer_type, feature.properties.type);
      }

      //Change live style
      switch (layer_type) {
        case "line":
          layer.setStyle({
            color: type.line_colour,
            weight: type.line_weight,
            opacity: type.line_opacity,
          });

          break;
        case "shape":
          layer.setStyle({
            color: type.shape_colour,
            fillOpacity: type.fill_opacity,
          });

          break;
        case "marker":
          //Create Icon
          layer.setIcon(Waymark_L.divIcon(Waymark.build_icon_data(type)));

          break;
      }

      Waymark.map_was_edited();
    });
    list.append(
      jQuery("<li />")
        .addClass("waymark-info-type waymark-" + layer_type + "-type")
        .append(jq_layer_type_select),
    );

    //Set selected
    var resolved_feature_type = Waymark.resolve_type_key(
      layer_type,
      feature.properties.type,
    );

    jQuery("option", jq_layer_type_select)
      .filter(function () {
        return jQuery(this).val() == resolved_feature_type;
      })
      .attr("selected", "selected");

    // ================================
    // ========= TYPE PREVIEW =========
    // ================================

    var jq_overlay_preview_container = jQuery("<div />").addClass(
      "waymark-overlay-preview waymark-" + layer_type + "-preview",
    );
    //Pre-defined config_types
    for (var i in config_types) {
      var type_title = config_types[i][layer_type + "_title"];

      //Get Key
      var type_key = config_types[i].type_key || Waymark.make_key(type_title);
      var type = Waymark.get_type(layer_type, type_key);

      // Markers, Lines & Shapes...

      var overlay_preview = jQuery("<div />")
        .addClass("waymark-type")
        .data("type_key", type_key)
        .attr("title", type_title);
      switch (layer_type) {
        //Markers
        case "marker":
          //Icon
          var icon_data = Waymark.build_icon_data(type);

          //Marker DIV
          overlay_preview
            .addClass(icon_data.className)
            .html(icon_data.html)
            .css({
              width: icon_data.iconSize[0],
              height: icon_data.iconSize[1],
            });

          break;

        //Lines
        case "line":
          overlay_preview.addClass("waymark-line").append(
            jQuery("<div />").css({
              margin: "15px 0",
              height: "1px",
              borderTop: type.line_weight + "px solid " + type.line_colour,
            }),
          );

          break;

        //Shapes
        case "shape":
          overlay_preview
            .addClass("waymark-shape")
            .css({
              border: "3px solid " + type.shape_colour,
            })
            .append(
              jQuery("<div />").css({
                height: "20px",
                background: type.shape_colour,
                opacity: type.fill_opacity,
              }),
            );

          break;
      }

      //Wrap
      var overlay_preview_wrap = jQuery("<div />")
        .addClass("waymark-overlay-wrap waymark-" + layer_type + "-wrap")
        .attr("title", type_title);

      //Append actual preview
      overlay_preview_wrap.append(overlay_preview);

      //On Click
      overlay_preview_wrap.on("click", function () {
        overlay_preview = jQuery(".waymark-type", jQuery(this));

        var clicked_type_key = overlay_preview.data("type_key");

        //Set selected
        jQuery("option", jq_layer_type_select).each(function () {
          if (overlay_preview.val() == clicked_type_key) {
            overlay_preview.attr("selected", "selected");
          } else {
            overlay_preview.removeAttr("selected");
          }
        });

        //Update actual select
        jq_layer_type_select.val(clicked_type_key);
        jq_layer_type_select.trigger("change");

        //Active
        jQuery(
          ".waymark-" + layer_type + "-wrap",
          jq_overlay_preview_container,
        ).each(function () {
          jQuery(this).removeClass("waymark-active");
        });
        overlay_preview
          .parent(".waymark-" + layer_type + "-wrap")
          .addClass("waymark-active");
      });

      //Current?
      if (type_key == resolved_feature_type) {
        overlay_preview_wrap.addClass("waymark-active");

        //Prepend
        jq_overlay_preview_container.prepend(overlay_preview_wrap);
      } else {
        //Append
        jq_overlay_preview_container.append(overlay_preview_wrap);
      }
    }

    list.append(jq_overlay_preview_container);

    // ================================
    // ============= DATA =============
    // ================================

    for (key in Waymark.config[layer_type + "_data_defaults"]) {
      var ele = null;

      switch (key) {
        case "title":
          var ele = jQuery("<input />")
            .attr({
              type: "text",
              value: feature.properties.title,
              placeholder:
                Waymark.config.language[
                  "object_title_placeholder_" + layer_type
                ],
            })
            .on("change", function () {
              //Update properties
              feature.properties.title = jQuery(this).val();

              Waymark.map_was_edited();
            });

          break;
        case "description":
          var ele_id = "waymark-info-description";

          var ele = jQuery("<textarea />")
            .attr({
              id: ele_id,
              class: "wp-editor",
              placeholder:
                Waymark.config.language[
                  "object_description_placeholder_" + layer_type
                ],
            })
            .val(feature.properties.description)
            .on("change", function () {
              //Update properties
              feature.properties.description = jQuery(this).val();

              Waymark.map_was_edited();
            });

          break;
        case "image_large_url":
          var img_input = jQuery("<input />")
            .attr({
              value: feature.properties.image_large_url,
              placeholder: Waymark.config.language.object_image_placeholder,
            })
            .on("change", function () {
              //Update properties
              feature.properties.image_large_url = jQuery(this).val();

              Waymark.map_was_edited();
            });

          if (typeof feature.properties.image_thumbnail_url !== "undefined") {
            var thumb_url = feature.properties.image_thumbnail_url;
          } else {
            var thumb_url = feature.properties.image_large_url;
          }

          //Image Preview
          var img_ele = jQuery("<img />").attr({
            src: thumb_url,
            width: 160,
          });
          img_input.on("change", function () {
            img_ele.attr("src", jQuery(this).val());
          });

          var img_view = jQuery("<a />")
            .attr({
              href: feature.properties.image_large_url,
              target: "_blank",
            })
            .append(img_ele)
            .hover(
              function () {
                jQuery(this).addClass("waymark-hover");
              },
              function () {
                jQuery(this).removeClass("waymark-hover");
              },
            );

          //Upload

          const img_upload = jQuery("<div />")
            .text(Waymark.config.language.action_upload_image)
            // Hide initially
            .addClass("button button-small waymark-hidden");

          // TODO - Info window image upload integration

          var ele = jQuery("<div />").append(img_view, img_input, img_upload);
      }

      if (ele) {
        list.append(
          jQuery("<li />")
            .addClass(
              "waymark-info-" + key + " waymark-" + layer_type + "-info-" + key,
            )
            .append(ele),
        );
      }
    }

    //Position
    if (
      layer_type == "marker" &&
      typeof layer.feature.geometry.coordinates != "undefined"
    ) {
      var latlng = layer.feature.geometry.coordinates;
      var lat = layer.feature.geometry.coordinates[1];
      var lng = layer.feature.geometry.coordinates[0];
      //Format for display only; stored coordinates stay dot-decimal
      lng = Waymark.format_coordinate(lng, 6);
      lat = Waymark.format_coordinate(lat, 6);

      //Output
      ele = jQuery("<small>").html(
        "<b>" +
          Waymark.escape_html(Waymark.config.language.marker_latlng_label) +
          "</b>: " +
          lat +
          "," +
          lng,
      );
      list.append(
        jQuery("<li />")
          .addClass("waymark-info-latlng waymark-marker-info-latlng")
          .append(ele),
      );
    }

    //Content
    if (list.children().length) {
      content.append(list);
    }

    return content;
  };

  this.info_window = function (layer_type, feature, layer) {
    Waymark = this;

    //Build content
    var content = Waymark.build_content(layer_type, feature, layer);
    var content_html = content.get(0);

    //Bind content to info window
    layer.bindPopup(content_html).openPopup();
  };

  this.load_file_contents = function (file_contents, file_type) {
    Waymark = this;

    //The DOMParser doesn't like whitespace
    file_contents = file_contents.trim();

    //Ignore case
    file_type = file_type.toLowerCase();

    switch (file_type) {
      case "gpx":
        var gpx_doc = new DOMParser().parseFromString(
          file_contents,
          "text/xml",
        );
        var geo_json = toGeoJSON.gpx(gpx_doc);

        break;
      case "kml":
        var kml_doc = new DOMParser().parseFromString(
          file_contents,
          "text/xml",
        );
        var geo_json = toGeoJSON.kml(kml_doc);

        break;
      case "json":
      case "geojson":
        var geo_json = JSON.parse(file_contents);

        break;
      default:
        Waymark.message(Waymark.config.language.error_file_type, "error");
    }

    //Valid data
    if (typeof geo_json !== "undefined") {
      //Only keep specific properties
      //var keep_properties = ['title', 'name', 'description', 'photos'];
      // 			var keep_properties = ['title', 'name', 'description'];
      // 			//Each feature
      // 			for(var i in geo_json.features) {
      // 				//Each property
      // 				for(key in geo_json.features[i].properties) {
      // 					//We want this
      // 					if(keep_properties.includes(key)) {
      // 						switch(key) {
      // 							case 'photos' :
      // 								//geo_json.features[i].properties[key];
      //
      // 								break;
      // 						}
      // 					//We don't want this
      // 					} else {
      // 						//Delete
      // 						delete geo_json.features[i].properties[key];
      // 					}
      // 				}
      // 			}

      //Add to map
      this.load_json(geo_json);
      //Invalid data
    } else {
      Waymark.message(Waymark.config.language.error_file_conversion, "error");
    }
  };

  /*
	==================================
	============ OVERLOAD ============
	==================================
*/

  //Add GeoJSON to map
  this.load_json = function (json) {
    Waymark = this;

    if (typeof json === "object") {
      //Add JSON
      Waymark.map_data.addData(json);

      //Save
      Waymark.map_was_edited();

      //Update map bounds (if we have)
      var bounds = Waymark.map_data.getBounds();
      if (bounds.isValid()) {
        Waymark.map.fitBounds(bounds);
      }
    }
  };
}
