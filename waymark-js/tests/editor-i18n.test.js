import { describe, it, expect, beforeEach, vi } from "vitest";

// French strings exercise both grammar (gendered articles, punctuation) and
// casing: `Waymark.title_case()` would render these as "Modifier La Ligne"
// and so on, which the exact assertions below catch.
const language = {
  action_edit_line: "Modifier la ligne",
  action_edit_done: "Terminer la modification",
  action_duplicate_line: "Dupliquer la ligne",
  action_delete_line: "Supprimer la ligne",
  action_delete_confirm_line: "Voulez-vous vraiment supprimer cette ligne ?",
  object_type_label_line: "Type de ligne :",
  object_title_placeholder_line: "Titre de la ligne",
  object_description_placeholder_line: "Description de la ligne",
  object_image_placeholder: "URL de l'image",
  action_upload_image: "Téléverser une image",
  marker_latlng_label: "Lat,Lng",
  no_direction: "Sans direction",
  show_direction: "Afficher la direction",
  reverse_direction: "Inverser la direction",
};

const feature = {
  properties: {
    title: "",
    description: "",
    image_large_url: "",
    type: "",
    direction: "",
  },
};

function build_line_content(editor) {
  const content = editor.build_content("line", feature, {});
  document.body.appendChild(content[0]);

  return content;
}

describe("editor per-type i18n strings", () => {
  let editor;

  beforeEach(() => {
    document.body.innerHTML = "";

    editor = window.Waymark_Map_Factory.editor();
    editor.config = {
      map_options: { line_types: [] },
      editor_options: { confirm_delete: "1" },
      line_data_defaults: {
        type: undefined,
        title: undefined,
        image_thumbnail_url: undefined,
        image_medium_url: undefined,
        image_large_url: undefined,
        description: undefined,
        direction: undefined,
      },
      language,
    };
  });

  it("uses complete per-type strings without title-casing", () => {
    const content = build_line_content(editor);

    expect(content.find(".waymark-info-edit button").attr("title")).toBe(
      "Modifier la ligne",
    );
    expect(content.find(".waymark-info-duplicate button").attr("title")).toBe(
      "Dupliquer la ligne",
    );
    expect(content.find(".waymark-info-delete button").attr("title")).toBe(
      "Supprimer la ligne",
    );

    expect(content.find(".waymark-info-type option").first().text()).toBe(
      "Type de ligne :",
    );
    expect(content.find('input[placeholder="Titre de la ligne"]')).toHaveLength(
      1,
    );
    expect(
      content.find('textarea[placeholder="Description de la ligne"]'),
    ).toHaveLength(1);
  });

  it("preserves the supplied casing of the direction options", () => {
    const content = build_line_content(editor);

    const direction_labels = content
      .find(".waymark-line-direction select option")
      .map((index, option) => jQuery(option).text())
      .get();

    expect(direction_labels).toEqual([
      "Sans direction",
      "Afficher la direction",
      "Inverser la direction",
    ]);
  });

  it("confirms deletion with the complete per-type message", () => {
    const confirm_spy = vi.spyOn(window, "confirm").mockReturnValue(false);

    try {
      const content = build_line_content(editor);

      content.find(".waymark-info-delete button").trigger("click");

      expect(confirm_spy).toHaveBeenCalledWith(
        "Voulez-vous vraiment supprimer cette ligne ?",
      );
    } finally {
      confirm_spy.mockRestore();
    }
  });
});
