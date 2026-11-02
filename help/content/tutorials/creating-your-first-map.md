---
title: Creating Your First Map
description: In this tutorial we will use Waymark to create a Map with a single Marker.
---

You will be guided through how to install the plugin, create a Marker at a specific location and associate an Image and Description with it.

This tutorial assumes you have a WordPress site (self-hosted) and are logged in as an administrator. Waymark requires WordPress 6.4 or later and PHP 8.3 or later.

::map-demo{demo="creating-your-first-map" height="300"}
::

This Map illustrates the end result. Try clicking on the Marker Icon to view the Image and description.

Click on any screenshot to enlarge.

## 1. Activating the Plugin

In this step we are going to search for, install and activate the Waymark plugin.

::docs-figure{src="/assets/img/first-map-step-1-1024x658.png" srcset="/assets/img/first-map-step-1-1024x658.png 1024w, /assets/img/first-map-step-1-700x450.png 700w, /assets/img/first-map-step-1-768x494.png 768w, /assets/img/first-map-step-1-1536x988.png 1536w, /assets/img/first-map-step-1.png 2000w" alt="" sizes="(max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**1.1** In the “Plugins” administration page click on the “Add New Plugin” button.
::

::docs-figure{src="/assets/img/first-map-step-2-1024x658.png" srcset="/assets/img/first-map-step-2-1024x658.png 1024w, /assets/img/first-map-step-2-700x450.png 700w, /assets/img/first-map-step-2-768x494.png 768w, /assets/img/first-map-step-2-1536x988.png 1536w, /assets/img/first-map-step-2.png 2000w" alt="" sizes="(max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**1.2** In the top right “Search Plugins” text field enter “Waymark”. Then click “Install Plugin” next to Waymark in the search results. Once installed, the button text will change to “Activate”. Click this to activate the plugin.
::

## 2. Creating a Map

Next we are going to create a new Map and give it a title.

::docs-figure{src="/assets/img/first-map-step-3-1024x658.png" srcset="/assets/img/first-map-step-3-1024x658.png 1024w, /assets/img/first-map-step-3-700x450.png 700w, /assets/img/first-map-step-3-768x494.png 768w, /assets/img/first-map-step-3-1536x988.png 1536w, /assets/img/first-map-step-3.png 2000w" alt="" sizes="(max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**2.1** Once the plugin is activated you will be taken to the “Maps” page. This screen lists all of the Maps created, which is empty right now. Click “Add New Map”.
::

::docs-figure{src="/assets/img/first-map-step-4-1024x658.png" srcset="/assets/img/first-map-step-4-1024x658.png 1024w, /assets/img/first-map-step-4-700x450.png 700w, /assets/img/first-map-step-4-768x494.png 768w, /assets/img/first-map-step-4-1536x988.png 1536w, /assets/img/first-map-step-4.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**2.2** You will be taken to the Map edit screen. Give the Map the title “Tower Bridge” in the top “Add title” text field.
::

## 3. Adding a Marker

We will now search for a location and add a Marker there.

::docs-figure{src="/assets/img/first-map-step-5-1024x658.png" srcset="/assets/img/first-map-step-5-1024x658.png 1024w, /assets/img/first-map-step-5-700x450.png 700w, /assets/img/first-map-step-5-768x494.png 768w, /assets/img/first-map-step-5-1536x988.png 1536w, /assets/img/first-map-step-5.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**3.1** Scroll down to the Map and click on the search icon (magnifying glass) to the bottom right of the Map. Enter “Tower Bridge, London” into the search text field and **hit return/enter** to submit the search. A list of locations will appear, click on the top result.
::

::docs-figure{src="/assets/img/first-map-step-6-1024x658.png" srcset="/assets/img/first-map-step-6-1024x658.png 1024w, /assets/img/first-map-step-6-700x450.png 700w, /assets/img/first-map-step-6-768x494.png 768w, /assets/img/first-map-step-6-1536x988.png 1536w, /assets/img/first-map-step-6.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**3.2** The Map should now be centred on Tower Bridge as in the screenshot (if it isn’t try some of the other search results, but anywhere is fine for this tutorial). Click the Marker icon (the third icon) on the Toolbar to the left of the Map to add a Marker.
::

::docs-figure{src="/assets/img/first-map-step-7-1024x658.png" srcset="/assets/img/first-map-step-7-1024x658.png 1024w, /assets/img/first-map-step-7-700x450.png 700w, /assets/img/first-map-step-7-768x494.png 768w, /assets/img/first-map-step-7-1536x988.png 1536w, /assets/img/first-map-step-7.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**3.3** This will add a Marker to the middle of the Map, on the bridge. Click on the newly added Marker to open the Overlay editor popup.
::

## 4. Adding an Image

With the Marker added we will now attach an image to it.

The image we will use first needs to be downloaded onto your computer. Click [this link](https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/1024px-Tower_Bridge_at_Dawn.jpg?20140924042649=&download=) to download it from [Wikimedia](https://commons.wikimedia.org/wiki/File:Tower_Bridge_at_Dawn.jpg), the file is called “1024px-Tower_Bridge_at_Dawn.jpg”. We can use this image as long as we provide attribution, which we will do in the next step.

::docs-figure{src="/assets/img/first-map-step-8-1-1024x658.png" srcset="/assets/img/first-map-step-8-1-1024x658.png 1024w, /assets/img/first-map-step-8-1-700x450.png 700w, /assets/img/first-map-step-8-1-768x494.png 768w, /assets/img/first-map-step-8-1-1536x988.png 1536w, /assets/img/first-map-step-8-1.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**4.1** In the popup editor click the “Upload Image” button. This will open the standard WordPress Media Library dialog.
::

::docs-figure{src="/assets/img/first-map-step-9-1024x658.png" srcset="/assets/img/first-map-step-9-1024x658.png 1024w, /assets/img/first-map-step-9-700x450.png 700w, /assets/img/first-map-step-9-768x494.png 768w, /assets/img/first-map-step-9-1536x988.png 1536w, /assets/img/first-map-step-9.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**4.2** Click on the “Select Files” button to upload an Image.
::

::docs-figure{src="/assets/img/first-map-step-10-1024x658.jpg" srcset="/assets/img/first-map-step-10-1024x658.jpg 1024w, /assets/img/first-map-step-10-700x450.jpg 700w, /assets/img/first-map-step-10-768x494.jpg 768w, /assets/img/first-map-step-10-1536x988.jpg 1536w, /assets/img/first-map-step-10.jpg 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**4.3** Locate the Tower Bridge image on your computer using the file browser and click “Upload”.
::

::docs-figure{src="/assets/img/first-map-step-11-1024x658.png" srcset="/assets/img/first-map-step-11-1024x658.png 1024w, /assets/img/first-map-step-11-700x450.png 700w, /assets/img/first-map-step-11-768x494.png 768w, /assets/img/first-map-step-11-1536x988.png 1536w, /assets/img/first-map-step-11.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**4.4** Once the image has finished uploading, you will see a thumbnail appear in the Media Library. Click on the “Insert into post” button.
::

## 5. Adding a Description

Let’s add the required attribution in the Marker description.

::docs-figure{src="/assets/img/first-map-step-12-1024x658.png" srcset="/assets/img/first-map-step-12-1024x658.png 1024w, /assets/img/first-map-step-12-700x450.png 700w, /assets/img/first-map-step-12-768x494.png 768w, /assets/img/first-map-step-12-1536x988.png 1536w, /assets/img/first-map-step-12.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**5.1** In the large text area, enter the provided attribution text. Highlight “Fuzzypiggy” and click on the link icon above the Description field. Add the appropriate link in the text field that appears. Repeat for the “CC BY-SA 3.0” text, adding the appropriate link.
::

#### Attribution Text

“[Fuzzypiggy](https://commons.wikimedia.org/wiki/File:Tower_Bridge_at_Dawn.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0), via Wikimedia Commons”

This includes the following two links:

- **Fuzzypiggy** – [https://commons.wikimedia.org/wiki/File:Tower_Bridge_at_Dawn.jpg](https://commons.wikimedia.org/wiki/File:Tower_Bridge_at_Dawn.jpg)
- **CC BY-SA 3.0** – [https://creativecommons.org/licenses/by-sa/3.0](https://creativecommons.org/licenses/by-sa/3.0)

## 6. Publishing the Map

We are now ready to publish the Map and make it publicly accessible on your site.

::docs-figure{src="/assets/img/first-map-step-13-1024x658.png" srcset="/assets/img/first-map-step-13-1024x658.png 1024w, /assets/img/first-map-step-13-700x450.png 700w, /assets/img/first-map-step-13-768x494.png 768w, /assets/img/first-map-step-13-1536x988.png 1536w, /assets/img/first-map-step-13.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**6.1** Give the Marker the title “Tower Bridge” in the “Marker Title” field. Then click the “Publish” button to publish the Map.
::

::docs-figure{src="/assets/img/first-map-step-14-1024x658.png" srcset="/assets/img/first-map-step-14-1024x658.png 1024w, /assets/img/first-map-step-14-700x450.png 700w, /assets/img/first-map-step-14-768x494.png 768w, /assets/img/first-map-step-14-1536x988.png 1536w, /assets/img/first-map-step-14.png 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**6.2** Once the Map has been published, you will be provided with the “Permalink” for the Map. Click on the permalink above the Map.
::

::docs-figure{src="/assets/img/first-map-step-15-1024x658.jpg" srcset="/assets/img/first-map-step-15-1024x658.jpg 1024w, /assets/img/first-map-step-15-700x450.jpg 700w, /assets/img/first-map-step-15-768x494.jpg 768w, /assets/img/first-map-step-15-1536x988.jpg 1536w, /assets/img/first-map-step-15.jpg 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
**6.3** You will be taken to your interactive Map on the front-end of your site.
::

**Congratulations!**

You have just created your first Map.

Feel free to go back to the Editor to explore more features, either by:

- Clicking on the “Edit Map” button in the top admin toolbar, or
- Clicking the “Waymark > Maps” admin menu link.

::docs-figure{src="/assets/img/first-map-step-16-1024x658.jpg" srcset="/assets/img/first-map-step-16-1024x658.jpg 1024w, /assets/img/first-map-step-16-700x450.jpg 700w, /assets/img/first-map-step-16-768x494.jpg 768w, /assets/img/first-map-step-16-1536x988.jpg 1536w, /assets/img/first-map-step-16.jpg 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
Click “Edit Map” When viewing a Map to go back to the Editor.
::

::docs-figure{src="/assets/img/first-map-step-17-1024x658.jpg" srcset="/assets/img/first-map-step-17-1024x658.jpg 1024w, /assets/img/first-map-step-17-700x450.jpg 700w, /assets/img/first-map-step-17-768x494.jpg 768w, /assets/img/first-map-step-17-1536x988.jpg 1536w, /assets/img/first-map-step-17.jpg 2000w" alt="" sizes="auto, (max-width: 1024px) 100vw, 1024px" :width="1024" :height="658"}
Click the “Maps” admin menu link to view a list of all of your Maps. Your Map should be listed there. Click the Map “Tower Bridge” to open the Editor.
::
