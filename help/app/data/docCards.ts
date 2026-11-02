export type DocCardSection =
  "tutorials" | "examples" | "advanced" | "customising" | "features";

export interface DocCard {
  title: string;
  description: string;
  href: string;
  image?: string;
  imagePosition?: string;
}

export const docCards: Record<DocCardSection, DocCard[]> = {
  tutorials: [
    {
      title: "Creating Your First Map",
      description:
        "In this tutorial we will use Waymark to create a Map with a single Marker.",
      href: "/tutorials/creating-your-first-map/",
      image: "/assets/img/cards/creating-your-first-map.png",
    },
    {
      title: "Drawing a Route",
      description: "In this tutorial we will use Waymark to create a Route.",
      href: "/tutorials/drawing-a-route/",
      image: "/assets/img/cards/drawing-a-route.png",
    },
  ],
  examples: [
    {
      title: "Elevation Profile Colours",
      description: "Change the colours of the elevation profile with CSS.",
      href: "/examples/elevation-profile-colours/",
      image: "/assets/img/cards/elevation-profile-colours.png",
      imagePosition: "center top",
    },
    {
      title: "Hide Locate Button",
      description: "Hide the Locate button on a Map with CSS.",
      href: "/examples/hide-locate-button/",
      image: "/assets/img/cards/hide-locate-button.png",
    },
    {
      title: "Hide Tooltip Type Labels",
      description: "Hide the Type labels that appear in Marker tooltips.",
      href: "/examples/hide-tooltip-type-labels/",
      image: "/assets/img/cards/hide-tooltip-type-labels.png",
    },
    {
      title: "Hiding Map Controls",
      description: "Hide the Locate, Layers, Fullscreen and Zoom controls.",
      href: "/examples/hiding-map-controls/",
      image: "/assets/img/cards/hiding-map-controls.png",
    },
    {
      title: "Marker Without Background",
      description: "Remove a Marker background and restyle its icon.",
      href: "/examples/marker-without-background/",
      image: "/assets/img/cards/marker-without-background.png",
    },
    {
      title: "Move the Locate Button",
      description: "Move the Locate button to a different corner with jQuery.",
      href: "/examples/move-the-locate-button/",
      image: "/assets/img/cards/move-the-locate-button.png",
      imagePosition: "left center",
    },
    {
      title: "Show/Hide Types Initially",
      description: "Control which Overlay Types are visible when a Map loads.",
      href: "/examples/show-hide-types-initially/",
      image: "/assets/img/cards/show-hide-types-initially.png",
      imagePosition: "center top",
    },
    {
      title: "Text Markers",
      description: "Create Markers that display text instead of an icon.",
      href: "/examples/text-markers/",
      image: "/assets/img/cards/text-markers.png",
      imagePosition: "center top",
    },
  ],
  advanced: [
    {
      title: "Debug Mode",
      description:
        "Display extra information in the browser console for debugging.",
      href: "/advanced/debug-mode/",
    },
    {
      title: "Import/Export/Move Waymark Data",
      description: "Move Maps, Settings and Images between WordPress sites.",
      href: "/advanced/import-export-move-waymark-data/",
    },
    {
      title: "Using the Global Callback Function",
      description:
        "Run code once a Map has loaded, such as adding a Refresh button.",
      href: "/advanced/using-the-global-callback-function/",
    },
  ],
  customising: [
    {
      title: "Markers",
      description:
        "Learn how Markers are displayed, including icons, markup and CSS.",
      href: "/customising/markers/",
    },
    {
      title: "Settings",
      description:
        "Configure Basemaps, Markers, Lines, Shapes, Meta, Submissions and other Map options.",
      href: "/customising/settings/",
    },
    {
      title: "Styling With CSS Selectors",
      description:
        "Use WordPress and Waymark class names to style Maps, Collections, Shortcodes and Markers.",
      href: "/customising/styling-with-css-selectors/",
    },
  ],
  features: [
    {
      title: "Submissions",
      description:
        "Allow registered users or guests to create Maps from the front-end of your site.",
      href: "/features/submissions/",
    },
  ],
};
