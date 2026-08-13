// After Waymark JS has loaded, but not yet fired the waymark_loaded_callback()
// Link in to some WordPress functionality
function waymark_setup_map_editor(waymark_editor = {}) {
  // Ensure both waymark_editor.map and wp.editor exist
  if (!waymark_editor.map || !wp.editor || !wp.media) {
    waymark_editor.message(
      "waymark_editor.map/wp.editor/wp.media not available",
      "error",
    );

    return;
  }

  waymark_editor.debug("Admin Editor Integrations");

  // TODO - Add unsaved changes warning

  //Warn user about navigating away from page before Publish/Update
  //I'm not sure why, but we have to return something here to get the desired behaviour :-/
  // self::add_call('waymark_editor.map_was_edited = function() {
  // 	jQuery(window).on(\'beforeunload.edit-post\', function() {
  // 		return null;
  // 	});
  // }');

  // Show File upload button in toolbar
  jQuery(".waymark-edit-toolbar a.waymark-edit-upload").removeClass(
    "waymark-hidden",
  );

  // Add Image upload to toolbar

  const image_button = jQuery(".waymark-edit-toolbar a.waymark-edit-image");

  if (image_button.length && typeof wp.media !== "undefined") {
    waymark_editor.debug("Enabling Media Library for Image Uploads");

    image_button.removeClass("waymark-hidden");

    // On click
    image_button.on("click", function (e) {
      e.preventDefault();

      //Thanks to: https://mycyberuniverse.com/integration-wordpress-media-uploader-plugin-options-page.html
      wp.media.editor.send.attachment = function (props, attachment) {
        //Ensure we have the data we want
        if (typeof attachment.url === "undefined") {
          return false;
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
              Waymark.message(waymark_js.lang.error_photo_meta, "error");

              return;
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
      };
      wp.media.editor.open();

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
      waymark_editor.debug("Popup Media Library Integration");

      image_button.removeClass("waymark-hidden");

      image_button.on("click", function (e) {
        e.preventDefault();

        //Thanks to: https://mycyberuniverse.com/integration-wordpress-media-uploader-plugin-options-page.html
        wp.media.editor.send.attachment = function (props, attachment) {
          //Ensure we have the data we want
          if (typeof attachment.url === "undefined") {
            return false;
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
          // .end();

          //Save
          waymark_editor.map_was_edited();
        };
        wp.media.editor.open();

        return false;
      }); // End click
    }

    // Rich Text Editor Integration (TinyMCE)

    // Convert desc textarea to rich text editor (delay required)
    setTimeout(function () {
      waymark_editor.debug("Popup Rich Text Editor Integration");

      // Rich text editor
      wp.editor.initialize("waymark-info-description", {
        tinymce: {
          toolbar1: "styleselect | bullist numlist | link image",
          setup: function (editor) {
            editor.on("change", function (e) {
              //Update properties
              feature.properties.description = wp.editor.getContent(
                "waymark-info-description",
              );

              waymark_editor.map_was_edited();
            });
          },
        },
      });
    }, 200);
  });

  //Remove rich text editor

  waymark_editor.map.on("popupclose", function (e) {
    wp.editor.remove("waymark-info-description");
    jQuery("#waymark-info-description").show();
  });
}

function waymark_setup_colour_pickers() {
  jQuery(".waymark-colour-picker .waymark-input").wpColorPicker();
}

function waymark_setup_repeatable_settings() {
  //Each container
  jQuery(".waymark-settings-tab .waymark-repeatable").each(function () {
    var container = jQuery(this);

    //Each form table
    jQuery(".form-table", container).each(function () {
      var form = jQuery(this);
      var clones = [];

      form.remove();

      //Each input
      jQuery(".waymark-input", form).each(function () {
        var input = jQuery(this);
        //Copy ID to class
        input.addClass("waymark-" + input.data("id"));

        //Get values
        if (input.get(0).nodeName != "SELECT") {
          var values = input.val();
        } else {
          var values = input.data("multi-value");
        }

        //Ensure is string
        if (typeof values != "string") {
          values = values.toString();
        }

        //Determine clone values
        values = values.split(waymark_multi_value_seperator);
        for (i in values) {
          if (typeof clones[i] !== "object") {
            clones[i] = {};
          }
          clones[i][input.data("id")] = values[i];
        }
      });

      //Each clone
      for (i = 0; i < clones.length; i++) {
        var clone = form.clone();

        //Create input
        for (var j in clones[i]) {
          var set_value = clones[i][j];

          var input = jQuery(".waymark-input-" + j, clone);
          input.attr("name", input.attr("name") + "[" + i + "]");

          //This is a Select without a valid option
          if (
            input.get(0).nodeName == "SELECT" &&
            !jQuery("option[value='" + clones[i][j] + "']", input).length
          ) {
            //Use first as default
            set_value = jQuery("option", input).first().val();
          }

          //Set value
          input.attr("value", set_value).val(set_value);

          //Make uneditable
          if (
            input
              .parents(".waymark-control-group")
              .hasClass("waymark-uneditable")
          ) {
            input.attr("readonly", "readonly");
          }
        }

        //Delete button
        var delete_button = jQuery("<div />")
          .text("x")
          .attr("title", waymark_php_lang.repeatable_delete_title)
          .addClass("waymark-delete")
          .on("click", function (e) {
            e.preventDefault();

            var form = jQuery(this).parents(".form-table");
            form.remove();

            return false;
          });
        clone.append(delete_button);

        container.append(clone);
        container.attr("data-count", i);
        waymark_setup_parameter_tooltips();
      }

      var add_button = jQuery("<button />")
        .html('<i class="ion ion-plus"></i>')
        .addClass("button waymark-add")
        .on("click", function (e) {
          e.preventDefault();

          //Increment count
          var container = jQuery(this).parents(".waymark-repeatable");
          var count_old = parseInt(container.attr("data-count"));
          var count_new = count_old + 1;
          container.attr("data-count", count_new);

          //Modify clone
          var clone = form.clone();
          jQuery(".waymark-input", clone).each(function () {
            var input = jQuery(this);
            var input_name = input.attr("name") + "[" + count_new + "]";

            //Update
            input.attr("name", input_name);
            input.attr("placeholder", "");

            //Clear text inputs
            if (input.get(0).nodeName != "SELECT") {
              input.val("");
            }

            switch (input.data("id")) {
              case "line_colour":
              case "shape_colour":
              case "icon_colour":
              case "marker_colour":
                input.wpColorPicker();

                break;

              case "meta_options":
                input.parents("tr").hide();

                break;
            }
          });

          jQuery(this).before(clone);
          waymark_setup_parameter_tooltips();
          waymark_setup_select_meta_type();
          waymark_setup_select_icon_type();

          return false;
        });
      container.append(add_button);
      //form.wrap(container);
      container.sortable();
    });
  });
}

function waymark_setup_marker_tab() {
  //Icon name
  var marker_icon_inputs = jQuery(".waymark-input.waymark-marker_icon");
  marker_icon_inputs.each(function () {
    var input = jQuery(this);

    //Icon class
    var icon_class = "";
    if (input.val().indexOf("ion-") === 0) {
      icon_class += "ion " + input.val();
    } else if (input.val().indexOf("fa-") === 0) {
      icon_class += "fa " + input.val();
    } else {
      icon_class += "ion ion-" + input.val();
    }

    var preview = jQuery("<i />").addClass(icon_class);

    input.parents(".waymark-controls").prepend(preview);
  });

  //Marker Colour
  var marker_colour_inputs = jQuery(".waymark-input.waymark-marker_colour");

  //Convert old colours (using Waymark_Map Object)
  if (typeof Waymark_Map === "function") {
    var Map_Object = new Waymark_Map();

    marker_colour_inputs.each(function () {
      jQuery(this).val(Map_Object.get_marker_background(jQuery(this).val()));

      jQuery(this).wpColorPicker();
    });
  }
}

// function waymark_setup_marker_colour_input(input) {
// 	//input.hide();
//
// 	var options = ['red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpurple', 'cadetblue', 'white', 'black'];
//
// 	var swatch_container = jQuery('<div />').addClass('waymark-swatch-container waymark-self-clear')
//
// 	for(i in options) {
// 		var value = options[i];
//
// 		var swatch = jQuery('<div />')
// 			.addClass('waymark-swatch waymark-swatch-' + value)
// 			.attr({
// 				'data-value': value,
// 				'title': value
// 			})
// 			.text(' ')
// /*
// 			.on('hover', function() {
// 				jQuery('.waymark-swatch', swatch_container).each(function() {
// 					jQuery(this).removeClass('waymark-selected');
// 				})
// 			})
// */
// 			.on('click', { 'input' : input }, function(e) {
// 				var swatch = jQuery(this);
//
// 				//Clear selected
// 				jQuery('.waymark-swatch', swatch_container).each(function() {
// 					jQuery(this).removeClass('waymark-selected');
// 				});
//
// 				input.val(swatch.data('value'));
// 				swatch.addClass('waymark-selected');
// 			});
//
// 			//Set selected
// 			if(value == input.val()) {
// 				swatch.addClass('waymark-selected');
// 			}
//
// 			swatch_container.append(swatch);
// 	};
//
// 	input.parents('.waymark-controls').append(swatch_container);
// }

function waymark_setup_external_links() {
  //Each link in each Settings tab
  jQuery(".waymark-settings-tab a,#waymark_map_meta a").each(function () {
    //If External
    if (!(location.hostname === this.hostname || !this.hostname.length)) {
      //If does not have target attr
      if (typeof jQuery(this).attr("target") === "undefined") {
        //Add as blank
        jQuery(this).attr("target", "_blank");
      }
    }
  });
}

function waymark_setup_select_meta_type() {
  jQuery("select.waymark-meta_type").each(function () {
    var select = jQuery(this);
    var container = select.parents(".form-table");
    var options_row = jQuery(
      ".waymark-input.waymark-meta_options",
      container,
    ).parents("tr");

    //On load
    if (select.val() == "select" || select.val() == "select_multi") {
      options_row.show();
    } else {
      options_row.hide();
    }

    //On change
    select.change(function () {
      if (select.val() == "select" || select.val() == "select_multi") {
        options_row.show();
      } else {
        options_row.hide();
      }
    });
  });
}

function waymark_setup_select_icon_type() {
  jQuery("select.waymark-icon_type").each(function () {
    var select = jQuery(this);

    var container = select.parents(".form-table");
    var colour_row = jQuery(
      ".waymark-input.waymark-icon_colour",
      container,
    ).parents("tr");
    var icon_input = jQuery(".waymark-input.waymark-marker_icon", container);
    var icon_content_row = icon_input.parents("tr");
    var icon_name_text = jQuery(".waymark-icon-type", icon_content_row);
    var icon_preview = jQuery(".waymark-controls i", icon_content_row);
    var icon_help = jQuery(".waymark-icons-help", icon_content_row);

    var icon_tip = jQuery(".waymark-tooltip", icon_content_row);
    var icon_tips = icon_tip.attr("data-title").split("|");

    //Update logic
    var update_row = function (type) {
      switch (type) {
        case "icon":
          icon_preview.show();
          icon_help.show();
          colour_row.show();
          icon_input.css("maxWidth", "unset");
          icon_name_text.text(waymark_php_lang.marker_icon_icon_label);
          icon_tip.data("title", icon_tips[0]);

          break;
        case "text":
          icon_preview.hide();
          icon_help.hide();
          colour_row.show();
          icon_input.css("maxWidth", "45px");
          icon_name_text.text(waymark_php_lang.marker_icon_text_label);
          icon_tip.data("title", icon_tips[1]);

          break;
        case "html":
          icon_preview.hide();
          icon_help.hide();
          colour_row.hide();
          icon_input.css("maxWidth", "unset");
          icon_name_text.text(waymark_php_lang.marker_icon_html_label);
          icon_tip.data("title", icon_tips[2]);

          break;
      }

      //Update tooltips
      waymark_setup_parameter_tooltips();
    };

    //On load
    update_row(select.val());

    //On change
    select.change(function () {
      update_row(select.val());
    });
  });
}

function waymark_setup_dropdowns() {
  jQuery(".waymark-parameters-container").each(function () {
    var container = jQuery(this);

    jQuery("select", container).each(function () {
      //Prefix
      var class_string = "waymark-dropdown-" + jQuery(this).data("id") + "-";

      //Add new
      class_string += jQuery(this).val();
      container.addClass(class_string);

      //On Change
      jQuery(this).on("change", function () {
        //Prefix
        var class_string = "waymark-dropdown-" + jQuery(this).data("id") + "-";

        //Remove old
        jQuery("option", jQuery(this)).each(function () {
          container.removeClass(class_string + jQuery(this).attr("value"));
        });

        //Add new
        class_string += jQuery(this).val();
        container.addClass(class_string);
      });
    });
  });
}

function waymark_setup_settings_nav() {
  var nav_container = jQuery(
    "body.wp-admin.waymark_page_waymark-settings #waymark-settings-nav",
  );

  if (!nav_container) {
    return false;
  }

  var admin_container = jQuery("#waymark-admin-container");
  var form = jQuery("form", admin_container);

  var tabs = jQuery(".waymark-settings-tab", admin_container);
  var init_tab_key = nav_container.data("init_tab_key");

  //Change
  var select = jQuery("select", nav_container);
  select.hover(
    function () {
      jQuery(this).attr("size", jQuery("option", jQuery(this)).length);
    },
    function () {
      jQuery(this).removeAttr("size");
    },
  );

  select.change(function () {
    select.removeAttr("size");

    var selected_content_id = jQuery(this).val();
    admin_container.attr("class", "");

    //Update form redirect
    var redirect_input = jQuery('input[name="_wp_http_referer"]', form);
    var redirect_to = document.location.toString();
    if (redirect_to.indexOf("content=") > 0) {
      redirect_to = redirect_to.replace(
        "content=" + init_tab_key,
        "content=" + selected_content_id,
      );
    } else {
      redirect_to = redirect_to + "&content=" + selected_content_id;
    }
    redirect_input.val(redirect_to);

    var show_content = jQuery("." + selected_content_id).first();

    //Each Tab
    jQuery(".waymark-settings-tab").each(function () {
      var tab = jQuery(this);
      tab.hide();

      //Entire Tab
      if (selected_content_id.indexOf("settings-tab")) {
        //Selected
        if (tab.hasClass(selected_content_id)) {
          tab.show();
          admin_container.addClass("waymark-active-" + selected_content_id);

          //Specific Tabs
          // 					switch(true) {
          // 						case tab.hasClass('waymark-settings-tab-query') :
          //
          // 							break;
          // 					}
        }
      }

      //Each Section
      jQuery(".waymark-settings-section", tab).each(function () {
        var section = jQuery(this);

        if (selected_content_id.indexOf("settings-tab") > 0) {
          section.show();
        } else if (selected_content_id.indexOf("settings-section") > 0) {
          section.hide();

          //Selected
          if (section.hasClass(selected_content_id)) {
            tab.show();
            section.show();
            admin_container.addClass("waymark-active-" + selected_content_id);
          }
        }
      });
    });
  });
  select.trigger("change");
}

function waymark_handle_repeatable_clone(clone) {
  //Must be jQuery
  if ((!clone) instanceof jQuery) {
    return;
  }

  //Get context
  var form = clone.parents(".waymark-form");

  //Map Queries
  // if(form && form.hasClass('waymark-map-query')) {
  // 	var waymark_container = jQuery('.waymark-instance').first();
  // 	var Waymark_Instance = waymark_container.data('Waymark');
  // }

  return clone;
}

function waymark_setup_repeatable_parameters() {
  jQuery(".waymark-repeatable-container").each(function () {
    var repeatable_container = jQuery(this);
    var repeatable_count = repeatable_container.data("count");

    var template = jQuery(".waymark-repeatable-template", repeatable_container);
    template.removeClass("waymark-repeatable-template");

    //Do stuff to template (while it's still in the DOM)...
    // 		template = waymark_handle_repeatable_template(template);

    template.remove();

    //Each
    jQuery(".waymark-parameters-container", repeatable_container).each(
      function () {
        var parameter_container = jQuery(this);

        var delete_button = jQuery("<button />")
          .html('<i class="ion ion-android-delete"></i>')
          .addClass("button waymark-delete")
          .on("click", function (e) {
            e.preventDefault();

            parameter_container.remove();
          });
        parameter_container.append(delete_button);
      },
    );

    //Add
    var add_button = jQuery(
      ".waymark-repeatable-add",
      repeatable_container,
    ).first();
    add_button.on("click", function (e) {
      e.preventDefault();

      var clone = template.clone();

      //Update inputs
      jQuery(".waymark-input", clone).each(function () {
        var input = jQuery(this);

        input.attr(
          "name",
          input.attr("name").replace("__count__", repeatable_count),
        );
      });

      jQuery(".waymark-control-label", clone).each(function () {
        var label = jQuery(this);

        label.attr(
          "for",
          label.attr("for").replace("__count__", repeatable_count),
        );
      });

      //Add
      add_button.before(clone);

      //Do stuff to clone (now it's in the DOM)...
      clone = waymark_handle_repeatable_clone(clone);

      waymark_setup_dropdowns();

      //Update count
      repeatable_container.data("count", ++repeatable_count);

      return false;
    });
  });
}

function waymark_admin_message(
  text = null,
  type = "info",
  container_selector = "#wpbody-content",
) {
  if (text) {
    var prefix = "";

    //Prefix available?
    if (
      typeof waymark_admin_js.lang[type + "_message_prefix"] !== "undefined"
    ) {
      prefix = waymark_admin_js.lang[type + "_message_prefix"];
    }

    switch (type) {
      // 			case 'error' :
      //
      // 				break;
      default:
        // 			case 'info' :

        break;
    }

    if (prefix) {
      prefix = "<b>[" + prefix + "]</b> ";
    }

    var message = prefix + text;

    //Get container
    var container = jQuery(container_selector).first();

    //Container exists
    if (container.length) {
      //Remove existing
      jQuery(".waymark-notice", container).each(function () {
        jQuery(this).remove();
      });

      var notice_div = jQuery("<div />").attr({
        class: "waymark-notice notice notice-" + type,
      });
      var notice_p = jQuery("<p />").html(message);
      //Put together
      notice_div.append(notice_p);

      //Display
      container.prepend(notice_div);
    } else {
      alert(message);
    }
  }
}

jQuery(document).ready(function () {
  waymark_setup_settings_nav();
  waymark_setup_repeatable_settings();
  waymark_setup_marker_tab();
  waymark_setup_colour_pickers();
  waymark_setup_external_links();
  waymark_setup_select_meta_type();
  waymark_setup_select_icon_type();
  waymark_setup_dropdowns();
});
