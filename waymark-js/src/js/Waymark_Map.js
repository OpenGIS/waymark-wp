/*
	==================================
	=============== MAP ==============
	==================================
*/

function Waymark_Map() {
  this.init = function (user_config = {}) {
    Waymark = this;

    //Start timer
    Waymark.start_time = new Date().getTime();

    // jQuery Map Container
    Waymark.jq_map_container = null;

    //Default config
    Waymark.config = {
      // Locale (BCP-47)

      locale: "",

      // Map (Common Options)

      map_options: {
        debug_mode: 0,

        map_height: null,
        map_div_id: "waymark-map",
        map_width: null,
        map_init_zoom: null,
        map_init_latlng: null,
        map_init_basemap: null,
        map_max_zoom: null,

        // Basemaps

        tile_layers: [
          {
            layer_name: "OpenStreetMap",
            layer_url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?r=1",
            layer_attribution:
              '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            layer_max_zoom: "18",
          },
        ],

        line_types: [],
        shape_types: [],
        marker_types: [],

        // Common Features
        show_scale: 0,
      },

      // Viewer

      viewer_options: {
        // Features
        show_gallery: 0,
        show_filter: 1,

        // Cluster
        show_cluster: 1,
        cluster_radius: 80,
        cluster_threshold: 14,

        // Elevation
        show_elevation: 0,
        elevation_div_id: "waymark-elevation",
        elevation_units: "metric",
        elevation_initial: 1,
        elevation_colour: "green",

        // Sleep
        sleep_delay_seconds: 2,
        sleep_do_message: 0,
        sleep_wake_message: "Click or Hover to Wake",
      },

      // Editor

      editor_options: {
        confirm_delete: 1,
        data_div_id: "waymark-data",
      },

      // Legacy overlay type key aliases

      type_aliases: {
        marker: {},
        line: {},
        shape: {},
      },

      // Media Library

      image_size_names: ["thumbnail", "medium", "large", "full"],

      // Type Defaults

      marker_type_defaults: {
        marker_title: "Marker",
        marker_shape: "marker",
        marker_size: "medium",
        marker_colour: "#b42714",
        marker_icon: "fa-star",
        icon_type: "font",
        icon_colour: "white",
      },

      line_type_defaults: {
        line_title: "Line",
        line_colour: "#b42714",
        line_weight: "2",
        line_opacity: "0.7",
      },

      shape_type_defaults: {
        shape_title: "Shape",
        shape_colour: "red",
        fill_opacity: "0.4",
      },

      // Data Properties

      marker_data_defaults: {
        title: undefined,
        type: undefined,
        image_thumbnail_url: undefined,
        image_medium_url: undefined,
        image_large_url: undefined,
        description: undefined,
      },
      line_data_defaults: {
        type: undefined,
        title: undefined,
        image_thumbnail_url: undefined,
        image_medium_url: undefined,
        image_large_url: undefined,
        description: undefined,
        direction: undefined,
      },
      shape_data_defaults: {
        type: undefined,
        title: undefined,
        image_thumbnail_url: undefined,
        image_medium_url: undefined,
        image_large_url: undefined,
        description: undefined,
      },

      // Localisation

      language: {
        //Viewer
        action_fullscreen_activate: "View Fullscreen",
        action_fullscreen_deactivate: "Exit Fullscreen",
        action_locate_activate: "Show me where I am",
        action_zoom_in: "Zoom in",
        action_zoom_out: "Zoom out",
        label_total_length: "Total Length:",
        label_max_elevation: "Max Elevation:",
        label_min_elevation: "Min Elevation:",
        label_ascent: "Total Ascent:",
        label_descent: "Total Descent:",
        label_altitude: "Altitude",
        label_download: "Download",
        label_unit_km: "km",
        label_unit_m: "m",
        label_unit_mi: "mi",
        label_unit_ft: "ft",
        error_geocoder: "Nothing found.",
        //Editor
        add_line_title: "Draw a Line",
        add_photo_title: "Upload Image",
        add_marker_title: "Place a Marker",
        add_rectangle_title: "Draw a Rectangle",
        add_polygon_title: "Draw a Polygon",
        add_circle_title: "Draw a Circle",
        upload_file_title:
          "Read Lines and Markers from file (GPX/KML/GeoJSON supported, which most apps should Export to)",
        action_edit_marker: "Edit Marker",
        action_edit_line: "Edit Line",
        action_edit_shape: "Edit Shape",
        action_edit_done: "Finish editing",
        action_duplicate_marker: "Duplicate Marker",
        action_duplicate_line: "Duplicate Line",
        action_duplicate_shape: "Duplicate Shape",
        action_delete_marker: "Delete Marker",
        action_delete_line: "Delete Line",
        action_delete_shape: "Delete Shape",
        action_delete_confirm_marker:
          "Are you sure you want to delete this Marker?",
        action_delete_confirm_line:
          "Are you sure you want to delete this Line?",
        action_delete_confirm_shape:
          "Are you sure you want to delete this Shape?",
        action_upload_image: "Upload Image",
        object_type_label_marker: "Marker type:",
        object_type_label_line: "Line type:",
        object_type_label_shape: "Shape type:",
        object_title_placeholder_marker: "Marker title",
        object_title_placeholder_line: "Line title",
        object_title_placeholder_shape: "Shape title",
        object_image_placeholder: "Image URL",
        object_description_placeholder_marker: "Marker description",
        object_description_placeholder_line: "Line description",
        object_description_placeholder_shape: "Shape description",
        marker_latlng_label: "Lat,Lng",
        action_search_placeholder: "Search...",
        object_label_marker: "Marker",
        object_label_line: "Line",
        object_label_shape: "Shape",
        object_label_marker_plural: "Markers",
        object_label_line_plural: "Lines",
        object_label_shape_plural: "Shapes",
        error_message_prefix: "Waymark Error",
        info_message_prefix: "Waymark Info",
        debug_message_prefix: "Waymark Debug",
        error_file_type: "This file type is not supported.",
        error_file_conversion: "Could not convert this file to GeoJSON.",
        error_file_upload: "File upload error.",
        error_photo_meta: "Could not retrieve Image metadata.",
        info_exif_yes: "Image location metadata (EXIF) detected!",
        info_exif_no: "Image location metadata (EXIF) NOT detected.",
        no_direction: "No Direction",
        show_direction: "Show Direction",
        reverse_direction: "Reverse Direction",
      },
    };

    // Merge config

    //Iterate over user config (Only map_options, viewer_options, editor_options, type_aliases)

    for (key in user_config) {
      // Only allow the following keys: map_options, viewer_options, editor_options, type_aliases, language
      if (
        [
          "map_options",
          "viewer_options",
          "editor_options",
          "type_aliases",
          "language",
        ].indexOf(key) > -1
      ) {
        //Iterate over user config
        for (sub_key in user_config[key]) {
          //Check key exists
          if (typeof Waymark.config[key][sub_key] !== "undefined") {
            // If Object
            if (typeof user_config[key][sub_key] === "object") {
              // Keep Arrays	as Arrays
              if (Array.isArray(user_config[key][sub_key])) {
                Waymark.config[key][sub_key] = user_config[key][sub_key];
                // Else, merge
              } else {
                Waymark.config[key][sub_key] = Object.assign(
                  {},
                  Waymark.config[key][sub_key],
                  user_config[key][sub_key],
                );
              }
              // Else, set
            } else {
              Waymark.config[key][sub_key] = user_config[key][sub_key];
            }
          }
        }
      }
    }

    //Locale (BCP-47) is a top-level scalar
    if (typeof user_config.locale !== "undefined") {
      Waymark.config.locale = user_config.locale;
    }

    //Set defaults
    var default_line_type = Waymark.get_type("line");
    var default_line_type_key =
      default_line_type.type_key ||
      Waymark.make_key(default_line_type.line_title);
    Waymark.config.line_data_defaults.type = default_line_type_key;

    var default_shape_type = Waymark.get_type("shape");
    var default_shape_type_key =
      default_shape_type.type_key ||
      Waymark.make_key(default_shape_type.shape_title);
    Waymark.config.shape_data_defaults.type = default_shape_type_key;

    var default_marker_type = Waymark.get_type("marker");
    var default_marker_type_key =
      default_marker_type.type_key ||
      Waymark.make_key(default_marker_type.marker_title);
    Waymark.config.marker_data_defaults.type = default_marker_type_key;

    // Debug
    if (Waymark.config.map_options.debug_mode) {
      console.log(Waymark.config);
    }

    //Groups
    Waymark.marker_parent_group = Waymark_L.layerGroup();
    Waymark.marker_sub_groups = {};
    Waymark.line_parent_group = Waymark_L.layerGroup();
    Waymark.line_sub_groups = {};
    Waymark.shape_parent_group = Waymark_L.layerGroup();
    Waymark.shape_sub_groups = {};

    Waymark.active_layer = null;

    //Setup...
    Waymark.pre_map_setup();
    Waymark.setup_map();
    Waymark.handle_resize();
    Waymark.init_done();
    Waymark.load_done();
  };

  //Sanitise user-authored description HTML (allowlist only)
  this.sanitize_description = function (html) {
    //DOMPurify is vendored into the concatenated bundle
    if (typeof window.DOMPurify === "undefined") {
      return html;
    }

    return window.DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "a",
        "br",
        "b",
        "strong",
        "em",
        "i",
        "u",
        "ul",
        "ol",
        "li",
        "div",
        "span",
        "blockquote",
      ],
      ALLOWED_ATTR: ["class", "href", "target", "title"],
    });
  };

  //Allow only http(s) URLs
  this.is_safe_url = function (url) {
    return /^https?:\/\//i.test(url);
  };

  //Convert plain text to a safe HTML string
  this.escape_html = function (str) {
    return jQuery("<span />").text(str).html();
  };

  //Format a number using the configured locale
  this.format_number = function (value, decimals) {
    var locale =
      this.config.locale || document.documentElement.lang || undefined;

    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    } catch (error) {
      return Number(value).toFixed(decimals);
    }
  };

  //Format a coordinate value for display, preserving non-numeric values
  this.format_coordinate = function (value, decimals) {
    var number = typeof value === "number" ? value : parseFloat(value);

    if (!isFinite(number)) {
      return value;
    }

    return this.format_number(number, decimals);
  };

  //Thanks! https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
  this.get_property = function (obj, ...args) {
    return args.reduce((obj, level) => obj && obj[level], obj);
  };

  /**
   *
   * Output debugging content
   * 	- Only if config.map_options.debug_mode is enabled
   *
   * @param  {string} thing  Thing to debug
   * @param  {string} output Output method (console|alert)
   * @return {void}
   * @since  0.9
   *
   * @example
   * Waymark.debug('Hello World');
   * Waymark.debug({foo: 'bar'});
   * Waymark.debug({foo: 'bar'}, 'alert');
   *
   */
  this.debug = function (thing, output = "console") {
    if (this.config.map_options.debug_mode) {
      //String
      if (typeof thing === "string") {
        this.message(thing, "debug", output);

        //Object
      } else {
        // Ensure if plain object
        if (typeof thing === "object" && thing !== null) {
          thing = JSON.parse(JSON.stringify(thing));
        }

        // Console
        if (output == "console") {
          console.debug(thing);

          //Alert
        } else {
          this.message(JSON.stringify(thing), "debug", output);
        }
      }
    }
  };

  this.message = function (text = null, type = "info", output = "console") {
    if (text) {
      var prefix = "";

      switch (type) {
        case "debug":
        case "error":
          prefix = Waymark.config.language[type + "_message_prefix"];

          break;
        default:
        case "info":
          prefix = Waymark.config.language.info_message_prefix;

          break;
      }

      if (prefix) {
        prefix = "[" + prefix + "] ";
      }

      if (output == "console") {
        if (type == "error") {
          console.error(prefix + text);
        } else if (type == "debug") {
          console.debug(prefix + text);
        } else {
          console.log(prefix + text);
        }
      } else {
        alert(prefix + text);
      }
    }
  };

  this.title_case = function (str) {
    return str.replace(/(?:^|\s)\w/g, function (match) {
      return match.toUpperCase();
    });
  };

  //Cyrillic to latin

  // TODO - move to... somewhere

  //Thanks! https://stackoverflow.com/a/11404121
  this.transliterate = function (word) {
    var a = {
      Ё: "YO",
      Й: "I",
      Ц: "TS",
      У: "U",
      К: "K",
      Е: "E",
      Н: "N",
      Г: "G",
      Ш: "SH",
      Щ: "SCH",
      З: "Z",
      Х: "H",
      Ъ: "'",
      ё: "yo",
      й: "i",
      ц: "ts",
      у: "u",
      к: "k",
      е: "e",
      н: "n",
      г: "g",
      ш: "sh",
      щ: "sch",
      з: "z",
      х: "h",
      ъ: "'",
      Ф: "F",
      Ы: "I",
      В: "V",
      А: "a",
      П: "P",
      Р: "R",
      О: "O",
      Л: "L",
      Д: "D",
      Ж: "ZH",
      Э: "E",
      ф: "f",
      ы: "i",
      в: "v",
      а: "a",
      п: "p",
      р: "r",
      о: "o",
      л: "l",
      д: "d",
      ж: "zh",
      э: "e",
      Я: "Ya",
      Ч: "CH",
      С: "S",
      М: "M",
      И: "I",
      Т: "T",
      Ь: "'",
      Б: "B",
      Ю: "YU",
      я: "ya",
      ч: "ch",
      с: "s",
      м: "m",
      и: "i",
      т: "t",
      ь: "'",
      б: "b",
      ю: "yu",
    };

    return word
      .split("")
      .map(function (char) {
        return a[char] || char;
      })
      .join("");
  };

  this.make_key = function (str_in) {
    if (!str_in) {
      return str_in;
    }

    //No cyrillic
    str_out = this.transliterate(str_in);

    //No underscores
    str_out = str_out.replace(/[^a-z0-9+]+/gi, "");

    //Lower
    str_out = str_out.toLowerCase();

    // Check for empty str_out
    if (!str_out) {
      // Convert to hex
      str_out = str_in
        .split("")
        .map(function (char) {
          return char.charCodeAt(0).toString(16);
        })
        .join("");
    }

    return str_out;
  };

  this.get_feature_overlay_type = function (feature) {
    if (typeof feature.geometry.type == "undefined") {
      return false;
    }

    switch (feature.geometry.type) {
      // CIRCLES & MARKERS

      case "Point":
        //Circle
        if (feature.properties.radius) {
          return "shape";

          //Marker
        } else {
          return "marker";
        }

      // LINES
      case "LineString":
      case "MultiLineString":
        return "line";

      // Polygon & Rectangle
      case "Polygon":
      case "MultiPolygon":
        //Is this a retangle?
        //				if(feature.properties.rectangle) {}

        return "shape";

        break;
    }

    return false;
  };

  /*
	==================================
	========= COMMOM METHODS =========
	==================================
*/

  this.setup_map = function () {
    Waymark = this;

    Waymark.jq_map_container = jQuery(
      "#" + Waymark.config.map_options.map_div_id,
    );
    Waymark.jq_map_container.addClass("waymark-map-container");

    const map_height = Waymark.config.map_options.map_height
      ? Waymark.config.map_options.map_height + "px"
      : "100%";

    Waymark.jq_map_container.css("height", map_height);

    //Create Map
    var map_options = {
      fullscreenControl: false,
      attributionControl: false,
      editable: true,
      zoomControl: false,
      sleep: false,
    };

    // === Viewer ===

    if (Waymark.mode == "view") {
      //START Sleep
      //  			map_options.scrollWheelZoom = false;
      //Let Sleep enable this on Wake
      map_options.dragging = false;

      //Sleep
      map_options.sleep = true;
      map_options.wakeTime =
        1000 * Waymark.config.viewer_options.sleep_delay_seconds;

      //If Sleep Note
      if (Waymark.config.viewer_options.sleep_do_message === "1") {
        map_options.sleepNote = true;
        map_options.wakeMessage =
          Waymark.config.viewer_options.sleep_wake_message;
        //No Sleep Note
      } else {
        map_options.sleepNote = false;
        map_options.wakeMessage = false;
      }

      // 	    hoverToWake: false,
      map_options.sleepOpacity = 1;
      //END Sleep

      // === Editor ===
    } else {
      //Sleep not used, enable
      map_options.dragging = true;
    }

    //Merge Map options
    if (typeof Waymark.config.map_options !== "undefined") {
      // If not undefined
      if (
        typeof Waymark.config.map_options.map_max_zoom !== "undefined" &&
        Waymark.config.map_options.map_max_zoom
      ) {
        // Set
        map_options.maxZoom = Waymark.config.map_options.map_max_zoom;

        console.log("Max Zoom: " + map_options.maxZoom);
      }
    }

    //Create Map

    Waymark.map = Waymark_L.map(
      Waymark.config.map_options.map_div_id,
      map_options,
    );
    Waymark_L.control
      .attribution({
        prefix:
          '<a href="https://www.ogis.org/waymark-js/" title="Make Meaningful Maps">Waymark</a> ' +
          '<span aria-hidden="true">|</span> ' +
          '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' +
          '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag">' +
          '<path fill="#4C7BE1" d="M0 0h12v4H0z"></path>' +
          '<path fill="#FFD500" d="M0 4h12v3H0z"></path>' +
          '<path fill="#E0BC00" d="M0 7h12v1H0z"></path>' +
          "</svg>&nbsp;Leaflet</a>",
      })
      .addTo(Waymark.map);

    // All attribution links should open in a new tab. The control rebuilds
    // its contents whenever attributions change (e.g. a basemap switch),
    // so re-apply the attributes on every update.
    var attribution_control = Waymark.map
      .getContainer()
      .querySelector(".leaflet-control-attribution");

    var set_attribution_targets = function () {
      var links = attribution_control.querySelectorAll("a");

      for (var i = 0; i < links.length; i++) {
        links[i].setAttribute("target", "_blank");
        links[i].setAttribute("rel", "noopener noreferrer");
      }
    };

    set_attribution_targets();

    new MutationObserver(set_attribution_targets).observe(attribution_control, {
      childList: true,
      subtree: true,
    });

    //Show scale?
    if (Waymark.config.map_options.show_scale == true) {
      Waymark_L.control.scale().addTo(Waymark.map);
    }

    //Add reference
    Waymark.jq_map_container.data("Waymark", Waymark);

    //View
    let initial_latlng = Waymark.config.map_options.map_init_latlng;
    if (typeof initial_latlng !== "undefined" && initial_latlng) {
      Waymark.map.setView(initial_latlng);
    } else {
      initial_latlng = false;
    }

    let initial_zoom = Waymark.config.map_options.map_init_zoom;
    if (typeof initial_zoom !== "undefined" && initial_zoom) {
      Waymark.map.setZoom(initial_zoom);
    } else {
      initial_zoom = false;
    }

    // If no initial latlng or zoom
    if (!initial_latlng && !initial_zoom) {
      Waymark.debug("No initial latlng or zoom set! 🌍");

      // Random country bounds
      // let fallback_bounds = Waymark.country_code_to_bounds();

      // // Fit
      // Waymark.map.fitBounds(fallback_bounds, {
      // 	padding: [50, 50],
      // });
    }

    //Set default style
    Waymark_L.Path.mergeOptions({
      color: "#b42714",
    });

    //Zoom Control
    Waymark_L.control
      .zoom({
        position: "topleft",
        zoomInTitle: Waymark.config.language.action_zoom_in,
        zoomOutTitle: Waymark.config.language.action_zoom_out,
      })
      .addTo(Waymark.map);

    //Locate Button
    Waymark_L.control
      .locate({
        position: "bottomright",
        icon: "ion ion-android-locate",
        drawCircle: false,
        strings: {
          title: Waymark.config.language.action_locate_activate,
        },
        locateOptions: {
          enableHighAccuracy: true,
        },
      })
      .addTo(Waymark.map);

    //Fullscreen Control
    Waymark_L.control
      .fullscreen({
        position: "topleft",
        title: {
          false: Waymark.config.language.action_fullscreen_activate,
          true: Waymark.config.language.action_fullscreen_deactivate,
        },
      })
      .addTo(Waymark.map);

    //Add parent groups to map
    Waymark.marker_parent_group.addTo(Waymark.map);
    Waymark.line_parent_group.addTo(Waymark.map);
    Waymark.shape_parent_group.addTo(Waymark.map);

    //Setup
    Waymark.setup_layers();
    Waymark.create_data_layer();
    Waymark.create_buttons();
  };

  this.create_data_layer = function () {
    Waymark = this;

    //Create data layer
    Waymark.map_data = Waymark_L.geoJSON(null, {
      pointToLayer: function (feature, latlng) {
        if (
          typeof feature.properties !== "undefined" &&
          feature.properties.radius
        ) {
          return new Waymark_L.Circle(
            latlng,
            parseFloat(feature.properties.radius),
          );
        } else {
          return Waymark.create_marker(latlng);
        }
      },
      onEachFeature: function (feature, layer) {
        // Active
        layer.on("popupopen", function (e) {
          Waymark.active_layer = layer;
        });
        layer.on("popupclose", function (e) {
          Waymark.active_layer = null;
        });

        switch (feature.geometry.type) {
          // CIRCLES & MARKERS

          case "Point":
            //Circle
            if (feature.properties.radius) {
              //Build Waymark data
              feature.properties = Waymark.parse_layer_data(
                "shape",
                feature.properties,
              );

              //Set style
              var type = Waymark.get_type("shape", feature.properties.type);
              layer.setStyle({
                color: type.shape_colour,
                fillOpacity: type.fill_opacity,
              });

              //Set info window
              Waymark.info_window("shape", feature, layer);

              //Set title tooltip
              Waymark.tooltip("shape", feature, layer);

              //Add to group
              Waymark.add_to_group("shape", layer);
              //Marker
            } else {
              //Build Waymark data
              feature.properties = Waymark.parse_layer_data(
                "marker",
                feature.properties,
              );

              //Set marker style
              var type = Waymark.get_type("marker", feature.properties.type);

              //Create Icon
              layer.setIcon(Waymark_L.divIcon(Waymark.build_icon_data(type)));

              //Add any photos to photo gallery
              if (typeof Waymark.gallery_images !== "undefined") {
                Waymark.add_to_gallery(layer);
              }

              //Set info window
              Waymark.info_window("marker", feature, layer);

              //Set title tooltip
              Waymark.tooltip("marker", feature, layer);

              //Add to group
              Waymark.add_to_group("marker", layer);
            }

            break;

          // LINES

          case "LineString":
          case "MultiLineString":
            //Build Waymark data
            feature.properties = Waymark.parse_layer_data(
              "line",
              feature.properties,
            );

            //Set line style
            var type = Waymark.get_type("line", feature.properties.type);
            layer.setStyle({
              color: type.line_colour,
              weight: type.line_weight,
              opacity: type.line_opacity,
            });

            //Set info window
            Waymark.info_window("line", feature, layer);

            //Set title tooltip
            Waymark.tooltip("line", feature, layer);

            //Line direction, shown initially?
            var show_initially = parseInt(type.line_display);
            Waymark.draw_line_direction(layer, show_initially);

            //Add to group
            Waymark.add_to_group("line", layer);

            break;

          // Polygon & Rectangle

          case "Polygon":
          case "MultiPolygon":
            //Build Waymark data
            feature.properties = Waymark.parse_layer_data(
              "shape",
              feature.properties,
            );

            //Is this a rectangle?
            if (feature.properties.rectangle) {
              //...
            }

            //Set shape style
            var type = Waymark.get_type("shape", feature.properties.type);
            layer.setStyle({
              color: type.shape_colour,
              fillOpacity: type.fill_opacity,
            });

            //Set info window
            Waymark.info_window("shape", feature, layer);

            //Set title tooltip
            Waymark.tooltip("shape", feature, layer);

            //Add to group
            Waymark.add_to_group("shape", layer);

            break;
        }
      },
    });
  };

  this.draw_line_direction = function (layer, show_initially = true) {
    var feature = layer.feature;
    var direction = feature.properties.direction;
    var type = Waymark.get_type("line", feature.properties.type);

    if (typeof layer.direction_layer === "object") {
      Waymark.map.removeLayer(layer.direction_layer);
    }

    //Valid direction
    if (
      typeof direction === "string" &&
      (direction == "default" || direction == "reverse")
    ) {
      var head_angle = 45;
      //Reverse
      if (direction == "reverse") {
        head_angle = 360 - head_angle;
      }

      var decorator = Waymark_L.polylineDecorator(layer, {
        patterns: [
          {
            // 	            	offset: 25,
            repeat: 100,
            symbol: L.Symbol.arrowHead({
              pixelSize: 15,
              headAngle: head_angle,
              polygon: true,
              pathOptions: {
                color: "#fff",
                fillColor: type.line_colour,
                opacity: "0.7",
                stroke: true,
                fillOpacity: 0.7,
                weight: 2,
              },
            }),
          },
        ],
      });

      if (show_initially) {
        decorator.addTo(Waymark.map);
      }

      layer.direction_layer = decorator;
    }
  };

  this.setup_layers = function () {
    Waymark = this;

    Waymark.layer_control = Waymark_L.control.layers();

    var basemaps = [];
    var initial_basemap_index = 0;

    //Determine initial basemap
    //Set by name?
    if (
      typeof Waymark.config.map_options.map_init_basemap !== "undefined" &&
      Waymark.config.map_options.map_init_basemap
    ) {
      //Search
      for (var i in Waymark.config.map_options.tile_layers) {
        var init_basemap_name =
          Waymark.config.map_options.map_init_basemap.toUpperCase();
        var this_basemap_name =
          Waymark.config.map_options.tile_layers[i].layer_name.toUpperCase();

        //Found
        if (init_basemap_name === this_basemap_name) {
          //Use
          initial_basemap_index = i;
        }
      }
    }

    //For each tile layer
    for (var i in Waymark.config.map_options.tile_layers) {
      //Append URL?
      if (
        typeof Waymark.config.map_options.tile_layers[i].append !== "undefined"
      ) {
        Waymark.config.map_options.tile_layers[i].layer_url +=
          Waymark.config.map_options.tile_layers[i].append;
      }

      //Create key
      var basemap_key = Waymark.config.map_options.tile_layers[
        i
      ].layer_name.replace(/ /g, "");

      //Create tile layer
      var layer_options = {
        id: basemap_key,
        attribution:
          Waymark.config.map_options.tile_layers[i].layer_attribution,
      };

      //Max zoom?
      var layer_max_zoom = parseInt(
        Waymark.config.map_options.tile_layers[i].layer_max_zoom,
      );
      if (layer_max_zoom) {
        layer_options.maxZoom = layer_max_zoom;
      }

      var basemap = Waymark_L.tileLayer(
        Waymark.config.map_options.tile_layers[i].layer_url,
        layer_options,
      );
      basemaps[Waymark.config.map_options.tile_layers[i].layer_name] = basemap;

      //Set initial basemap
      if (i == initial_basemap_index) {
        basemap.addTo(Waymark.map);
      }
    }

    //More than one tile layer
    if (i >= 1) {
      //Layer control
      Waymark.layer_control.addTo(Waymark.map);
      for (basemap_name in basemaps) {
        Waymark.layer_control.addBaseLayer(
          basemaps[basemap_name],
          basemap_name,
        );
      }
    }
  };

  this.resolve_type_key = function (layer_type, type_key) {
    Waymark = this;

    if (
      typeof type_key === "undefined" ||
      type_key === null ||
      type_key === ""
    ) {
      return "";
    }

    var aliases =
      (Waymark.config.type_aliases &&
        Waymark.config.type_aliases[layer_type]) ||
      {};

    //Direct alias
    if (Object.prototype.hasOwnProperty.call(aliases, type_key)) {
      return aliases[type_key];
    }

    //Compare through make_key so legacy underscores and casing still match
    var made_key = Waymark.make_key(type_key);
    for (var alias in aliases) {
      if (Waymark.make_key(alias) == made_key) {
        return aliases[alias];
      }
    }

    return type_key;
  };

  this.get_type = function (layer_type, type_key) {
    Waymark = this;

    var type = null;
    var requested_key = Waymark.resolve_type_key(layer_type, type_key);
    var requested_made_key = Waymark.make_key(requested_key);
    var config_types = Waymark.config.map_options[layer_type + "_types"];

    //Iterate over all types
    for (var i in config_types) {
      //Use first as default
      if (i == 0) {
        type = config_types[i];
      }

      var config_type = config_types[i];
      var explicit_key = config_type.type_key;
      var type_title = config_type[layer_type + "_title"];

      //Found by explicit key
      var explicit_match =
        typeof explicit_key !== "undefined" &&
        explicit_key !== null &&
        explicit_key !== "" &&
        (explicit_key == requested_key ||
          Waymark.make_key(explicit_key) == requested_made_key);

      //Legacy fallback, title derived key
      var title_match =
        type_title && Waymark.make_key(type_title) == requested_made_key;

      if (explicit_match || title_match) {
        type = config_type;
      }
    }

    //Set key
    type = Waymark.parse_type(type, layer_type);

    return type;
  };

  //Checks for types
  this.parse_type = function (type = {}, layer_type = "marker") {
    Waymark = this;

    if (typeof type === "undefined" || type === null) {
      type = {};
    }

    // Start with fallbacks
    var fallback = Waymark.config[layer_type + "_type_defaults"];

    // Merge
    type = Object.assign({}, fallback, type);

    //Set key, keeping an explicit key
    if (
      typeof type.type_key === "undefined" ||
      type.type_key === null ||
      type.type_key === ""
    ) {
      type.type_key = Waymark.make_key(type[layer_type + "_title"]);
    }

    return type;
  };

  this.handle_resize = function () {
    Waymark = this;

    jQuery(window).on("resize", function () {
      Waymark.config.map_options.map_height = Waymark.jq_map_container.height();
      Waymark.config.map_options.map_width = Waymark.jq_map_container.width();

      if (typeof Waymark.size_gallery === "function") {
        Waymark.size_gallery();
      }
    });
  };

  this.tooltip = function (layer_type, feature, layer) {
    Waymark = this;

    var text = "";

    //Displaying Type?
    var type = Waymark.get_type(layer_type, feature.properties.type);

    if (type && typeof type[layer_type + "_title"] !== "undefined") {
      var title = type[layer_type + "_title"];
      text = '<span class="waymark-type-label">[' + title + "]</span> ";
    }

    //Title
    if (feature.properties.title) {
      text += Waymark.escape_html(feature.properties.title);
    }

    if (!text) {
      return;
    }

    layer.bindTooltip(text);

    layer.on("mouseover", function (e) {
      var tooltip = e.target.getTooltip();
      tooltip.setLatLng(e.latlng);
      tooltip.openTooltip();
    });

    layer.on("mousemove", function (e) {
      var tooltip = e.target.getTooltip();
      tooltip.setLatLng(e.latlng);
    });
  };

  this.get_data_defaults = function (layer_type) {
    return Object.assign({}, Waymark.config[layer_type + "_data_defaults"]);
  };

  this.parse_layer_data = function (layer_type, data_in) {
    let data_out = {};

    // Iterate over input data
    for (key in data_in) {
      // Has value
      if (data_in[key]) {
        switch (key) {
          // Migrate some keys

          case "name":
            data_out.title = data_in[key];

            break;
          case "desc":
          case "notes":
            data_out.description = data_in[key];

            break;

          case "radius":
            data_out.radius = parseFloat(data_in[key]);

            break;

          // Store all other properties!

          default:
            data_out[key] = data_in[key];

            break;
        }
      }
    }

    return data_out;
  };

  this.add_to_group = function (layer_type, layer) {
    Waymark = this;

    var feature = layer.feature;

    //If we have a type
    if (typeof feature.properties.type !== "undefined") {
      //Get Type
      var type_key = feature.properties.type;
      var type = Waymark.get_type(layer_type, type_key);

      if (
        typeof Waymark[layer_type + "_sub_groups"][type.type_key] == "undefined"
      ) {
        //Create the sub-group
        var group = Waymark_L.featureGroup.subGroup(
          Waymark[layer_type + "_parent_group"],
        );

        //Add to groups
        Waymark[layer_type + "_sub_groups"][type.type_key] = group;

        //Add to Map
        if (
          Waymark.mode == "view" &&
          typeof type[layer_type + "_display"] !== "undefined"
        ) {
          if (type[layer_type + "_display"] == "1") {
            group.addTo(Waymark.map);
          }
        } else {
          group.addTo(Waymark.map);
        }
      }

      //Add Layer to group
      layer.addTo(Waymark[layer_type + "_sub_groups"][type.type_key]);
      //Direction layer?
      if (layer_type == "line" && typeof layer.direction_layer === "object") {
        layer.direction_layer.addTo(
          Waymark[layer_type + "_sub_groups"][type.type_key],
        );
      }

      //If Overlay Filter is enabled
      if (
        parseInt(Waymark.config.viewer_options.show_filter) &&
        Waymark.mode == "view"
      ) {
        //Ensure the control is added
        Waymark.layer_control.addTo(Waymark.map);

        //Redraw in layer Control
        Waymark.layer_control.removeLayer(
          Waymark[layer_type + "_parent_group"],
        );
        Waymark.layer_control.addOverlay(
          Waymark[layer_type + "_parent_group"],
          "<b>" +
            Waymark.escape_html(
              Waymark.config.language["object_label_" + layer_type + "_plural"],
            ) +
            "</b>",
        );

        Waymark_L.stamp(Waymark[layer_type + "_parent_group"]);
        for (key in Waymark[layer_type + "_sub_groups"]) {
          var this_type = Waymark.get_type(layer_type, key);
          var group = Waymark[layer_type + "_sub_groups"][key];

          //(Re-?)add to control
          Waymark.layer_control.removeLayer(group);
          Waymark.layer_control.addOverlay(
            group,
            Waymark.type_to_text(layer_type, this_type),
          );
        }
      }
      //No type key - just add to Map
    } else {
      layer.addTo(Waymark[layer_type + "_parent_group"]);
    }
  };

  //Represent Type as text
  this.type_to_text = function (layer_type = "", type = {}, ele = "span") {
    Waymark = this;

    var preview_class = "waymark-type-text waymark-" + layer_type + "-type";
    var preview_style = "";

    switch (layer_type) {
      case "marker":
        preview_style += "color:" + type.icon_colour + ";";
        preview_style +=
          "background:" + Waymark.get_marker_background(type.marker_colour);

        break;
      case "line":
        preview_style += "background:" + type.line_colour;

        break;
      case "shape":
        preview_style += "background:" + type.shape_colour;

        break;
    }

    return (
      "<" +
      ele +
      ' class="' +
      preview_class +
      '" style="' +
      preview_style +
      '">' +
      Waymark.escape_html(type[layer_type + "_title"]) +
      "</" +
      ele +
      ">"
    );
  };

  //Create marker
  this.create_marker = function (latlng) {
    return Waymark_L.marker(latlng);
  };

  this.build_icon_data = function (type = {}) {
    Waymark = this;

    // Ensure is a an object with a non-empty type key
    if (typeof type !== "object" || typeof type.type_key === "undefined") {
      return false;
    }

    var icon_data = {
      className: "waymark-marker waymark-marker-" + type.type_key,
    };

    //Shape
    if (
      typeof type.marker_shape !== "undefined" &&
      typeof type.marker_size !== "undefined"
    ) {
      icon_data.className += " waymark-marker-" + type.marker_shape;
      icon_data.className += " waymark-marker-" + type.marker_size;

      switch (type.marker_shape) {
        //Markers & Circles
        case "rectangle":
        case "circle":
        case "marker":
          //Size
          switch (type.marker_size) {
            case "small":
              icon_data.iconSize = [16, 16];

              break;
            case "medium":
              icon_data.iconSize = [25, 25];

              break;
            default:
            case "large":
              icon_data.iconSize = [32, 32];

              break;
          }

          break;
      }

      //Marker only
      if (type.marker_shape == "marker") {
        icon_data.iconAnchor = [
          icon_data.iconSize[0] / 2,
          icon_data.iconSize[1] * 1.25,
        ];
      }
    }

    //CSS Styles
    var background_css =
      "background:" + Waymark.get_marker_background(type.marker_colour) + ";";
    var icon_css = "color:" + type.icon_colour + ";";

    //HTML
    icon_data.html =
      '<div class="waymark-marker-background" style="' +
      background_css +
      '"></div>';

    // Ensure we have type.marker_icon
    if (typeof type.marker_icon === "undefined") {
      Waymark.debug(
        "No marker_icon for type: " + JSON.stringify(type),
        "alert",
      );
    }

    //Classes
    var icon_class = "waymark-marker-icon";

    //Text, HTML or Icon Name
    switch (type.icon_type) {
      //Text
      case "text":
        icon_class += " waymark-icon-text";

        icon_data.html +=
          '<div style="' +
          icon_css +
          '" class="' +
          icon_class +
          '">' +
          type.marker_icon +
          "</div>";

        break;

      //HTML
      case "html":
        icon_class += " waymark-icon-html";

        //Decode HTML entities using jQuery
        var icon_html = jQuery("<div/>").html(type.marker_icon).text();

        icon_data.html +=
          '<div class="' + icon_class + '">' + icon_html + "</div>";

        break;

      //Icon Name
      case "icon":
      default:
        icon_class += " waymark-icon-icon";

        //If Ionic Icons
        if (type.marker_icon.indexOf("ion-") === 0) {
          icon_class += " ion ";
          icon_class += " " + type.marker_icon;
          //Font Awesome
        } else if (type.marker_icon.indexOf("fa-") === 0) {
          icon_class += " fa";
          icon_class += " " + type.marker_icon;
          //Default to Ionic
        } else {
          icon_class += " ion";
          icon_class += " ion-" + type.marker_icon;
        }

        icon_data.html +=
          '<i style="' + icon_css + '" class="' + icon_class + '"></i>';

        break;
    }

    return icon_data;
  };

  this.build_type_heading = function (
    overlay_type = "marker",
    type_key = null,
  ) {
    Waymark = this;

    //Default to the first configured type
    if (type_key === null) {
      type_key = Waymark.get_type(overlay_type).type_key;
    }

    //Get Type
    const type = Waymark.get_type(overlay_type, type_key);

    if (!type) {
      Waymark.message("Type not found: " + type_key, "error");
    }

    // Defaults
    let text_color = "inherit";
    let background_color = type.shape_colour;

    // Switch
    switch (overlay_type) {
      case "marker":
        background_color = Waymark.get_marker_background(type.marker_colour);

        break;
      case "line":
        background_color = type.line_colour;

        break;

      case "shape":
        background_color = type.shape_colour;

        break;
    }

    if (type) {
      heading = `
				<div class="waymark-type-heading" style="background:${background_color}">
					${Waymark.type_preview(overlay_type, type)}
					${Waymark.type_to_text(overlay_type, type)}
				</div>
			`;
    }

    return heading;
  };

  this.type_preview = function (
    overlay_type = "marker",
    type = {},
    ele = "div",
  ) {
    Waymark = this;

    let out = `<${ele} class="waymark-type-preview waymark-${overlay_type}-type waymark-${overlay_type}-${type.type_key}">`;

    // By overlay type
    switch (overlay_type) {
      case "marker":
        // Get Icon Data
        const icon_data = Waymark.build_icon_data(type);

        // Add Icon
        out += `<div class="${icon_data.className}" style="width:${icon_data.iconSize[0]}px;height:${icon_data.iconSize[1]}px;">${icon_data.html}</div>`;

        break;
      case "line":
        out += Waymark.type_to_text(overlay_type, type, "span");

        break;

      case "shape":
        out += Waymark.type_to_text(overlay_type, type, "span");

        break;
    }

    out += `</${ele}>`;

    return out;
  };

  this.get_marker_background = function (colour) {
    var old_background_options = [
      "red",
      "darkred",
      "orange",
      "green",
      "darkgreen",
      "blue",
      "purple",
      "darkpurple",
      "cadetblue",
      "white",
      "black",
    ];

    //Convert
    if (old_background_options.includes(colour)) {
      switch (colour) {
        case "red":
          return "#da3d20";
          break;
        case "darkred":
          return "#a43233";
          break;
        case "orange":
          return "#f9960a";
          break;
        case "green":
          return "#70af00";
          break;
        case "darkgreen":
          return "#72820d";
          break;
        case "blue":
          return "#2aabe1";
          break;
        case "purple":
          return "#d553bd";
          break;
        case "darkpurple":
          return "#5c3a6e";
          break;
        case "cadetblue":
          return "#416979";
          break;
        case "white":
          return "#fbfbfb";
          break;
        case "black":
          return "#303030";
          break;
      }
    }

    return colour;
  };

  this.create_marker_json = function (lat_lng, properties = {}) {
    var marker_properties = Object.assign(
      {},
      Waymark.config.marker_data_defaults,
      properties,
    );

    var marker_json = {
      geometry: {
        type: "Point",
        coordinates: [lat_lng.lng, lat_lng.lat],
      },
      type: "Feature",
      properties: marker_properties,
    };

    return marker_json;
  };

  this.get_exif_latlng = function (data) {
    if (
      data.GPSLatitudeNum &&
      !isNaN(data.GPSLatitudeNum) &&
      data.GPSLongitudeNum &&
      !isNaN(data.GPSLongitudeNum)
    ) {
      Waymark.debug(Waymark.config.language.info_exif_yes);

      return L.latLng(data.GPSLatitudeNum, data.GPSLongitudeNum);
    } else {
      Waymark.debug(Waymark.config.language.info_exif_no);
    }

    return false;
  };

  this.get_image_sizes = function (data, fallback) {
    Waymark = this;

    var image_sizes = {};

    //Grab these
    for (var i in Waymark.config.image_size_names) {
      //Use fallback
      image_sizes["image_" + Waymark.config.image_size_names[i] + "_url"] =
        fallback;

      //We have the data we want
      if (
        typeof data[Waymark.config.image_size_names[i]] !== "undefined" &&
        typeof data[Waymark.config.image_size_names[i]]["url"] !== "undefined"
      ) {
        //Use it
        image_sizes["image_" + Waymark.config.image_size_names[i] + "_url"] =
          data[Waymark.config.image_size_names[i]]["url"];
      }
    }

    return image_sizes;
  };

  this.build_overlay_content = function (
    feature = [],
    feature_type = "",
    type_data = [],
  ) {
    Waymark = this;

    const has_title = feature.properties.title
      ? "waymark-overlay-has-title"
      : "";
    const has_desc = feature.properties.description
      ? "waymark-overlay-has-desc"
      : "";
    const has_image = feature.properties.image_large_url
      ? "waymark-overlay-has-image"
      : "";

    var content = `<div class="waymark-overlay-content ${has_title} ${has_desc} ${has_image} waymark-overlay-${feature_type}">`;

    //Expected Waymark properties
    const property_keys = ["type", "title", "description", "image_large_url"];
    //Iterate over each

    for (index in property_keys) {
      var property_key = property_keys[index];

      //Wrap in div
      content += `<div class="waymark-overlay-property waymark-overlay-property-${property_key}">`;

      switch (property_key) {
        //Type
        case "type":
          content += Waymark.type_to_text(feature_type, type_data);

          break;

        //Title
        case "title":
          content += feature.properties.title
            ? Waymark.escape_html(feature.properties.title)
            : "<em>Untitled " +
              Waymark.escape_html(type_data[feature_type + "_title"]) +
              " " +
              Waymark.escape_html(
                Waymark.config.language["object_label_" + feature_type],
              ) +
              "</em>";

          break;

        //Description
        case "description":
          var description = feature.properties.description;
          var safe_desc = Waymark.sanitize_description(description);

          //We have a description
          if (description) {
            //HTML
            if (description.indexOf("<") === 0) {
              content += safe_desc;
              //Plain text
            } else {
              content += `<p>${safe_desc}</p>`;
            }
          }

          break;

        //Image
        case "image_large_url":
          //We have an image
          if (!feature.properties.image_large_url) {
            break;
          }

          //Validate the URL
          if (!Waymark.is_safe_url(feature.properties.image_large_url)) {
            break;
          }

          //We have an image
          if (feature.properties.image_large_url) {
            //Use Medium if we have it
            var thumb_url = feature.properties.image_large_url;
            if (
              feature.properties.image_medium_url &&
              Waymark.is_safe_url(feature.properties.image_medium_url)
            ) {
              thumb_url = feature.properties.image_medium_url;
            }

            content += `<a href="${feature.properties.image_large_url}" target="_blank" style="background-image:url(${thumb_url})"></a>`;
          }

          break;
      }

      content += "</div>";
    }

    content += "</div>";

    return content;
  };

  this.load_done = function () {
    Waymark = this;

    // Calculate execution time
    let end_time = new Date().getTime();
    let execution_time = (end_time - Waymark.start_time) / 1000;

    Waymark.debug(
      "Waymark Loaded in " + execution_time.toFixed(3) + " seconds",
    );

    // Check for callback waymark_loaded_callback
    if (typeof waymark_loaded_callback === "function") {
      Waymark.debug(
        "Global Callback detected! waymark_loaded_callback(waymark_instance)",
      );

      // Call it
      waymark_loaded_callback(Waymark);
    } else {
      Waymark.debug("No Global Callback detected.");
    }
  };

  this.country_code_to_bounds = function (country_code = "") {
    let coords = [-140.99778, 41.6751050889, -52.6480987209, 83.23324];

    var country_bounding_boxes = {
      AF: [60.5284298033, 29.318572496, 75.1580277851, 38.4862816432],
      AO: [11.6400960629, -17.9306364885, 24.0799052263, -4.43802336998],
      AL: [19.3044861183, 39.624997667, 21.0200403175, 42.6882473822],
      AE: [51.5795186705, 22.4969475367, 56.3968473651, 26.055464179],
      AR: [-73.4154357571, -55.25, -53.628348965, -21.8323104794],
      AM: [43.5827458026, 38.7412014837, 46.5057198423, 41.2481285671],
      AQ: [-180.0, -90.0, 180.0, -63.2706604895],
      TF: [68.72, -49.775, 70.56, -48.625],
      AU: [113.338953078, -43.6345972634, 153.569469029, -10.6681857235],
      AT: [9.47996951665, 46.4318173285, 16.9796667823, 49.0390742051],
      AZ: [44.7939896991, 38.2703775091, 50.3928210793, 41.8606751572],
      BI: [29.0249263852, -4.49998341229, 30.752262811, -2.34848683025],
      BE: [2.51357303225, 49.5294835476, 6.15665815596, 51.4750237087],
      BJ: [0.772335646171, 6.14215770103, 3.79711225751, 12.2356358912],
      BF: [-5.47056494793, 9.61083486576, 2.17710778159, 15.1161577418],
      BD: [88.0844222351, 20.670883287, 92.6727209818, 26.4465255803],
      BG: [22.3805257504, 41.2344859889, 28.5580814959, 44.2349230007],
      BS: [-78.98, 23.71, -77.0, 27.04],
      BA: [15.7500260759, 42.65, 19.59976, 45.2337767604],
      BY: [23.1994938494, 51.3195034857, 32.6936430193, 56.1691299506],
      BZ: [-89.2291216703, 15.8869375676, -88.1068129138, 18.4999822047],
      BO: [-69.5904237535, -22.8729187965, -57.4983711412, -9.76198780685],
      BR: [-73.9872354804, -33.7683777809, -34.7299934555, 5.24448639569],
      BN: [114.204016555, 4.007636827, 115.450710484, 5.44772980389],
      BT: [88.8142484883, 26.7194029811, 92.1037117859, 28.2964385035],
      BW: [19.8954577979, -26.8285429827, 29.4321883481, -17.6618156877],
      CF: [14.4594071794, 2.2676396753, 27.3742261085, 11.1423951278],
      CA: [-140.99778, 41.6751050889, -52.6480987209, 83.23324],
      CH: [6.02260949059, 45.7769477403, 10.4427014502, 47.8308275417],
      CL: [-75.6443953112, -55.61183, -66.95992, -17.5800118954],
      CN: [73.6753792663, 18.197700914, 135.026311477, 53.4588044297],
      CI: [-8.60288021487, 4.33828847902, -2.56218950033, 10.5240607772],
      CM: [8.48881554529, 1.72767263428, 16.0128524106, 12.8593962671],
      CD: [12.1823368669, -13.2572266578, 31.1741492042, 5.25608775474],
      CG: [11.0937728207, -5.03798674888, 18.4530652198, 3.72819651938],
      CO: [-78.9909352282, -4.29818694419, -66.8763258531, 12.4373031682],
      CR: [-85.94172543, 8.22502798099, -82.5461962552, 11.2171192489],
      CU: [-84.9749110583, 19.8554808619, -74.1780248685, 23.1886107447],
      CY: [32.2566671079, 34.5718694118, 34.0048808123, 35.1731247015],
      CZ: [12.2401111182, 48.5553052842, 18.8531441586, 51.1172677679],
      DE: [5.98865807458, 47.3024876979, 15.0169958839, 54.983104153],
      DJ: [41.66176, 10.9268785669, 43.3178524107, 12.6996385767],
      DK: [8.08997684086, 54.8000145534, 12.6900061378, 57.730016588],
      DO: [-71.9451120673, 17.598564358, -68.3179432848, 19.8849105901],
      DZ: [-8.68439978681, 19.0573642034, 11.9995056495, 37.1183806422],
      EC: [-80.9677654691, -4.95912851321, -75.2337227037, 1.3809237736],
      EG: [24.70007, 22.0, 36.86623, 31.58568],
      ER: [36.3231889178, 12.4554157577, 43.0812260272, 17.9983074],
      ES: [-9.39288367353, 35.946850084, 3.03948408368, 43.7483377142],
      EE: [23.3397953631, 57.4745283067, 28.1316992531, 59.6110903998],
      ET: [32.95418, 3.42206, 47.78942, 14.95943],
      FI: [20.6455928891, 59.846373196, 31.5160921567, 70.1641930203],
      FJ: [-180.0, -18.28799, 180.0, -16.0208822567],
      FK: [-61.2, -52.3, -57.75, -51.1],
      FR: [-54.5247541978, 2.05338918702, 9.56001631027, 51.1485061713],
      GA: [8.79799563969, -3.97882659263, 14.4254557634, 2.32675751384],
      GB: [-7.57216793459, 49.959999905, 1.68153079591, 58.6350001085],
      GE: [39.9550085793, 41.0644446885, 46.6379081561, 43.553104153],
      GH: [-3.24437008301, 4.71046214438, 1.0601216976, 11.0983409693],
      GN: [-15.1303112452, 7.3090373804, -7.83210038902, 12.5861829696],
      GM: [-16.8415246241, 13.1302841252, -13.8449633448, 13.8764918075],
      GW: [-16.6774519516, 11.0404116887, -13.7004760401, 12.6281700708],
      GQ: [9.3056132341, 1.01011953369, 11.285078973, 2.28386607504],
      GR: [20.1500159034, 34.9199876979, 26.6041955909, 41.8269046087],
      GL: [-73.297, 60.03676, -12.20855, 83.64513],
      GT: [-92.2292486234, 13.7353376327, -88.2250227526, 17.8193260767],
      GY: [-61.4103029039, 1.26808828369, -56.5393857489, 8.36703481692],
      HN: [-89.3533259753, 12.9846857772, -83.147219001, 16.0054057886],
      HR: [13.6569755388, 42.47999136, 19.3904757016, 46.5037509222],
      HT: [-74.4580336168, 18.0309927434, -71.6248732164, 19.9156839055],
      HU: [16.2022982113, 45.7594811061, 22.710531447, 48.6238540716],
      ID: [95.2930261576, -10.3599874813, 141.03385176, 5.47982086834],
      IN: [68.1766451354, 7.96553477623, 97.4025614766, 35.4940095078],
      IE: [-9.97708574059, 51.6693012559, -6.03298539878, 55.1316222195],
      IR: [44.1092252948, 25.0782370061, 63.3166317076, 39.7130026312],
      IQ: [38.7923405291, 29.0990251735, 48.5679712258, 37.3852635768],
      IS: [-24.3261840479, 63.4963829617, -13.609732225, 66.5267923041],
      IL: [34.2654333839, 29.5013261988, 35.8363969256, 33.2774264593],
      IT: [6.7499552751, 36.619987291, 18.4802470232, 47.1153931748],
      JM: [-78.3377192858, 17.7011162379, -76.1996585761, 18.5242184514],
      JO: [34.9226025734, 29.1974946152, 39.1954683774, 33.3786864284],
      JP: [129.408463169, 31.0295791692, 145.543137242, 45.5514834662],
      KZ: [46.4664457538, 40.6623245306, 87.3599703308, 55.3852501491],
      KE: [33.8935689697, -4.67677, 41.8550830926, 5.506],
      KG: [69.464886916, 39.2794632025, 80.2599902689, 43.2983393418],
      KH: [102.3480994, 10.4865436874, 107.614547968, 14.5705838078],
      KR: [126.117397903, 34.3900458847, 129.468304478, 38.6122429469],
      KW: [46.5687134133, 28.5260627304, 48.4160941913, 30.0590699326],
      LA: [100.115987583, 13.88109101, 107.564525181, 22.4647531194],
      LB: [35.1260526873, 33.0890400254, 36.6117501157, 34.6449140488],
      LR: [-11.4387794662, 4.35575511313, -7.53971513511, 8.54105520267],
      LY: [9.31941084152, 19.58047, 25.16482, 33.1369957545],
      LK: [79.6951668639, 5.96836985923, 81.7879590189, 9.82407766361],
      LS: [26.9992619158, -30.6451058896, 29.3251664568, -28.6475017229],
      LT: [21.0558004086, 53.9057022162, 26.5882792498, 56.3725283881],
      LU: [5.67405195478, 49.4426671413, 6.24275109216, 50.1280516628],
      LV: [21.0558004086, 55.61510692, 28.1767094256, 57.9701569688],
      MA: [-17.0204284327, 21.4207341578, -1.12455115397, 35.7599881048],
      MD: [26.6193367856, 45.4882831895, 30.0246586443, 48.4671194525],
      MG: [43.2541870461, -25.6014344215, 50.4765368996, -12.0405567359],
      MX: [-117.12776, 14.5388286402, -86.811982388, 32.72083],
      MK: [20.46315, 40.8427269557, 22.9523771502, 42.3202595078],
      ML: [-12.1707502914, 10.0963607854, 4.27020999514, 24.9745740829],
      MM: [92.3032344909, 9.93295990645, 101.180005324, 28.335945136],
      ME: [18.45, 41.87755, 20.3398, 43.52384],
      MN: [87.7512642761, 41.5974095729, 119.772823928, 52.0473660345],
      MZ: [30.1794812355, -26.7421916643, 40.7754752948, -10.3170960425],
      MR: [-17.0634232243, 14.6168342147, -4.92333736817, 27.3957441269],
      MW: [32.6881653175, -16.8012997372, 35.7719047381, -9.23059905359],
      MY: [100.085756871, 0.773131415201, 119.181903925, 6.92805288332],
      NA: [11.7341988461, -29.045461928, 25.0844433937, -16.9413428687],
      NC: [164.029605748, -22.3999760881, 167.120011428, -20.1056458473],
      NE: [0.295646396495, 11.6601671412, 15.9032466977, 23.4716684026],
      NG: [2.69170169436, 4.24059418377, 14.5771777686, 13.8659239771],
      NI: [-87.6684934151, 10.7268390975, -83.147219001, 15.0162671981],
      NL: [3.31497114423, 50.803721015, 7.09205325687, 53.5104033474],
      NO: [4.99207807783, 58.0788841824, 31.29341841, 80.6571442736],
      NP: [80.0884245137, 26.3978980576, 88.1748043151, 30.4227169866],
      NZ: [166.509144322, -46.641235447, 178.517093541, -34.4506617165],
      OM: [52.0000098, 16.6510511337, 59.8080603372, 26.3959343531],
      PK: [60.8742484882, 23.6919650335, 77.8374507995, 37.1330309108],
      PA: [-82.9657830472, 7.2205414901, -77.2425664944, 9.61161001224],
      PE: [-81.4109425524, -18.3479753557, -68.6650797187, -0.0572054988649],
      PH: [117.17427453, 5.58100332277, 126.537423944, 18.5052273625],
      PG: [141.000210403, -10.6524760881, 156.019965448, -2.50000212973],
      PL: [14.0745211117, 49.0273953314, 24.0299857927, 54.8515359564],
      PR: [-67.2424275377, 17.946553453, -65.5910037909, 18.5206011011],
      KP: [124.265624628, 37.669070543, 130.780007359, 42.9853868678],
      PT: [-9.52657060387, 36.838268541, -6.3890876937, 42.280468655],
      PY: [-62.6850571357, -27.5484990374, -54.2929595608, -19.3427466773],
      QA: [50.7439107603, 24.5563308782, 51.6067004738, 26.1145820175],
      RO: [20.2201924985, 43.6884447292, 29.62654341, 48.2208812526],
      RU: [-180.0, 41.151416124, 180.0, 81.2504],
      RW: [29.0249263852, -2.91785776125, 30.8161348813, -1.13465911215],
      SA: [34.6323360532, 16.3478913436, 55.6666593769, 32.161008816],
      SD: [21.93681, 8.61972971293, 38.4100899595, 22.0],
      SS: [23.8869795809, 3.50917, 35.2980071182, 12.2480077571],
      SN: [-17.6250426905, 12.332089952, -11.4678991358, 16.5982636581],
      SB: [156.491357864, -10.8263672828, 162.398645868, -6.59933847415],
      SL: [-13.2465502588, 6.78591685631, -10.2300935531, 10.0469839543],
      SV: [-90.0955545723, 13.1490168319, -87.7235029772, 14.4241327987],
      SO: [40.98105, -1.68325, 51.13387, 12.02464],
      RS: [18.82982, 42.2452243971, 22.9860185076, 46.1717298447],
      SR: [-58.0446943834, 1.81766714112, -53.9580446031, 6.0252914494],
      SK: [16.8799829444, 47.7584288601, 22.5581376482, 49.5715740017],
      SI: [13.6981099789, 45.4523163926, 16.5648083839, 46.8523859727],
      SE: [11.0273686052, 55.3617373725, 23.9033785336, 69.1062472602],
      SZ: [30.6766085141, -27.2858794085, 32.0716654803, -25.660190525],
      SY: [35.7007979673, 32.312937527, 42.3495910988, 37.2298725449],
      TD: [13.5403935076, 7.42192454674, 23.88689, 23.40972],
      TG: [-0.0497847151599, 5.92883738853, 1.86524051271, 11.0186817489],
      TH: [97.3758964376, 5.69138418215, 105.589038527, 20.4178496363],
      TJ: [67.4422196796, 36.7381712916, 74.9800024759, 40.9602133245],
      TM: [52.5024597512, 35.2706639674, 66.5461503437, 42.7515510117],
      TL: [124.968682489, -9.39317310958, 127.335928176, -8.27334482181],
      TT: [-61.95, 10.0, -60.895, 10.89],
      TN: [7.52448164229, 30.3075560572, 11.4887874691, 37.3499944118],
      TR: [26.0433512713, 35.8215347357, 44.7939896991, 42.1414848903],
      TW: [120.106188593, 21.9705713974, 121.951243931, 25.2954588893],
      TZ: [29.3399975929, -11.7209380022, 40.31659, -0.95],
      UG: [29.5794661801, -1.44332244223, 35.03599, 4.24988494736],
      UA: [22.0856083513, 44.3614785833, 40.0807890155, 52.3350745713],
      UY: [-58.4270741441, -34.9526465797, -53.209588996, -30.1096863746],
      US: [-171.791110603, 18.91619, -66.96466, 71.3577635769],
      UZ: [55.9289172707, 37.1449940049, 73.055417108, 45.5868043076],
      VE: [-73.3049515449, 0.724452215982, -59.7582848782, 12.1623070337],
      VN: [102.170435826, 8.59975962975, 109.33526981, 23.3520633001],
      VU: [166.629136998, -16.5978496233, 167.844876744, -14.6264970842],
      PS: [34.9274084816, 31.3534353704, 35.5456653175, 32.5325106878],
      YE: [42.6048726743, 12.5859504257, 53.1085726255, 19.0000033635],
      ZA: [16.3449768409, -34.8191663551, 32.830120477, -22.0913127581],
      ZM: [21.887842645, -17.9612289364, 33.4856876971, -8.23825652429],
      ZW: [25.2642257016, -22.2716118303, 32.8498608742, -15.5077869605],
    };

    if (country_bounding_boxes[country_code]) {
      coords = country_bounding_boxes[country_code];
    } else {
      // Pick random country
      var keys = Object.keys(country_bounding_boxes);
      var random_key = keys[Math.floor(Math.random() * keys.length)];

      coords = country_bounding_boxes[random_key];
    }

    // Convert into Leaflet LatLngBounds
    return Waymark_L.latLngBounds(
      [coords[1], coords[0]],
      [coords[3], coords[2]],
    );
  };

  this.clear_json = function () {
    Waymark = this;

    // Iterate over data layer
    Waymark.map_data.eachLayer(function (layer) {
      // Remove it
      Waymark.map.removeLayer(layer);
      Waymark.map_data.removeLayer(layer);

      // Direction layer?
      if (typeof layer.direction_layer === "object") {
        Waymark.map.removeLayer(layer.direction_layer);
      }
    });

    Waymark.map_data.clearLayers();
  };

  /*
	==================================
	======== ABSTRACT METHODS ========
	==================================
*/

  this.pre_map_setup = function () {};
  this.init_done = function () {};
  this.info_window = function (layer_type, feature, layer) {};
  this.build_content = function (layer_type, feature) {};
}
