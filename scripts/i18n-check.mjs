import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCES = [
  {
    name: "PHP",
    file: "inc/Helpers/Waymark_Lang.php",
    parse: parsePhpLanguage,
  },
  {
    name: "JS",
    file: "waymark-js/src/js/Waymark_Map.js",
    parse: parseJsLanguage,
  },
  {
    name: "Docs",
    file: "docs/app/data/waymarkUserConfig.ts",
    parse: parseJsLanguage,
  },
];

const ADMIN_PHP = "inc/Admin/Waymark_JS.php";
const ADMIN_JS = "assets/js/admin.js";

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

// Reads a balanced block starting at an opening delimiter. Strings, template
// literals and comments are skipped so braces and brackets inside them do not
// count towards the depth.
function extractBalanced(source, startIndex, open, close) {
  let depth = 0;
  let state = "code";
  let index = startIndex;

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];

    if (state === "lineComment") {
      if (character === "\n") {
        state = "code";
      }
      index++;
      continue;
    }

    if (state === "blockComment") {
      if (character === "*" && next === "/") {
        state = "code";
        index += 2;
        continue;
      }
      index++;
      continue;
    }

    if (state === "single" || state === "double" || state === "template") {
      const closing = state === "single" ? "'" : state === "double" ? '"' : "`";
      if (character === "\\") {
        index += 2;
        continue;
      }
      if (character === closing) {
        state = "code";
      }
      index++;
      continue;
    }

    if (character === "/" && next === "/") {
      state = "lineComment";
      index += 2;
      continue;
    }

    if (character === "/" && next === "*") {
      state = "blockComment";
      index += 2;
      continue;
    }

    if (character === "'") {
      state = "single";
      index++;
      continue;
    }

    if (character === '"') {
      state = "double";
      index++;
      continue;
    }

    if (character === "`") {
      state = "template";
      index++;
      continue;
    }

    if (character === open) {
      depth++;
      index++;
      continue;
    }

    if (character === close) {
      depth--;
      if (depth === 0) {
        return source.slice(startIndex + 1, index);
      }
      index++;
      continue;
    }

    index++;
  }

  return null;
}

// Removes comments while preserving string and template literal contents.
function stripComments(source, { hashComments = false } = {}) {
  let output = "";
  let state = "code";
  let index = 0;

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];

    if (state === "lineComment") {
      if (character === "\n") {
        state = "code";
        output += character;
      }
      index++;
      continue;
    }

    if (state === "blockComment") {
      if (character === "*" && next === "/") {
        state = "code";
        index += 2;
        continue;
      }
      if (character === "\n") {
        output += character;
      }
      index++;
      continue;
    }

    if (state === "single" || state === "double" || state === "template") {
      const closing = state === "single" ? "'" : state === "double" ? '"' : "`";
      output += character;
      if (character === "\\") {
        if (next !== undefined) {
          output += next;
        }
        index += 2;
        continue;
      }
      if (character === closing) {
        state = "code";
      }
      index++;
      continue;
    }

    if (character === "/" && next === "/") {
      state = "lineComment";
      index += 2;
      continue;
    }

    if (character === "/" && next === "*") {
      state = "blockComment";
      index += 2;
      continue;
    }

    if (hashComments && character === "#") {
      state = "lineComment";
      index++;
      continue;
    }

    if (character === "'") {
      state = "single";
    } else if (character === '"') {
      state = "double";
    } else if (character === "`") {
      state = "template";
    }

    output += character;
    index++;
  }

  return output;
}

// Blanks out comments and string contents while preserving length, so block
// candidates can be found without matching commented-out code or prose.
function maskCommentsAndStrings(source) {
  let output = "";
  let state = "code";
  let index = 0;

  const blank = (character) => (character === "\n" ? "\n" : " ");

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];

    if (state === "lineComment") {
      output += blank(character);
      if (character === "\n") {
        state = "code";
      }
      index++;
      continue;
    }

    if (state === "blockComment") {
      output += blank(character);
      if (character === "*" && next === "/") {
        output += " ";
        state = "code";
        index += 2;
        continue;
      }
      index++;
      continue;
    }

    if (state === "single" || state === "double" || state === "template") {
      const closing = state === "single" ? "'" : state === "double" ? '"' : "`";
      if (character === "\\" && next !== undefined) {
        output += blank(character) + blank(next);
        index += 2;
        continue;
      }
      output += blank(character);
      if (character === closing) {
        state = "code";
      }
      index++;
      continue;
    }

    if (character === "/" && next === "/") {
      output += "  ";
      state = "lineComment";
      index += 2;
      continue;
    }

    if (character === "/" && next === "*") {
      output += "  ";
      state = "blockComment";
      index += 2;
      continue;
    }

    if (character === "'") {
      state = "single";
      output += " ";
      index++;
      continue;
    }

    if (character === '"') {
      state = "double";
      output += " ";
      index++;
      continue;
    }

    if (character === "`") {
      state = "template";
      output += " ";
      index++;
      continue;
    }

    output += character;
    index++;
  }

  return output;
}

function unescapePhpString(value, quote) {
  if (quote === "'") {
    return value.replace(/\\([\\'])/g, "$1");
  }

  return value.replace(/\\([\\'"$nrtvef])/g, (match, escaped) => {
    switch (escaped) {
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "v":
        return "\v";
      case "e":
        return "\x1b";
      case "f":
        return "\f";
      default:
        return escaped;
    }
  });
}

function parsePhpLanguage(source) {
  const functionIndex = source.indexOf("function get_js_lang");
  if (functionIndex === -1) {
    throw new Error("Could not find Waymark_Lang::get_js_lang()");
  }

  const returnIndex = source.indexOf("return", functionIndex);
  if (returnIndex === -1) {
    throw new Error("Could not find the get_js_lang() return value");
  }

  const arrayIndex = source.indexOf("[", returnIndex);
  if (arrayIndex === -1) {
    throw new Error("Could not find the get_js_lang() array");
  }

  const body = extractBalanced(source, arrayIndex, "[", "]");
  if (body === null) {
    throw new Error("Could not read the get_js_lang() array");
  }

  const entries = new Map();
  const pattern =
    /(['"])([A-Za-z0-9_]+)\1\s*=>\s*(?:__|esc_html__|esc_attr__|_x)\s*\(\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")/g;
  const clean = stripComments(body, { hashComments: true });

  let match;
  while ((match = pattern.exec(clean)) !== null) {
    const isSingleQuoted = match[3] !== undefined;
    const value = isSingleQuoted ? match[3] : match[4];
    entries.set(match[2], unescapePhpString(value, isSingleQuoted ? "'" : '"'));
  }

  if (entries.size === 0) {
    throw new Error("No translatable entries found in get_js_lang()");
  }

  return entries;
}

function unescapeJsString(literal) {
  if (literal[0] === '"') {
    return JSON.parse(literal);
  }

  const body = literal.slice(1, -1);
  return body.replace(
    /\\(u\{[0-9A-Fa-f]+\}|u[0-9A-Fa-f]{4}|x[0-9A-Fa-f]{2}|\r\n|[\s\S])/g,
    (match, escaped) => {
      if (escaped === "\n" || escaped === "\r\n") {
        return "";
      }

      if (escaped.startsWith("u{")) {
        return String.fromCodePoint(parseInt(escaped.slice(2, -1), 16));
      }

      if (escaped.startsWith("u") && escaped.length === 5) {
        return String.fromCharCode(parseInt(escaped.slice(1), 16));
      }

      if (escaped.startsWith("x") && escaped.length === 3) {
        return String.fromCharCode(parseInt(escaped.slice(1), 16));
      }

      switch (escaped) {
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "b":
          return "\b";
        case "f":
          return "\f";
        case "v":
          return "\v";
        case "0":
          return "\0";
        default:
          return escaped;
      }
    },
  );
}

function parseJsEntries(body) {
  const entries = new Map();
  const clean = stripComments(body);
  const pattern =
    /(?<=^|[,{\s])([A-Za-z_$][\w$]*)\s*:\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;

  let match;
  while ((match = pattern.exec(clean)) !== null) {
    entries.set(match[1], unescapeJsString(match[2]));
  }

  return entries;
}

// The defaults are identified by a language block that contains
// action_fullscreen_activate, which avoids any other object with a language
// member. The outer "language" key itself is never part of the parsed body.
function parseJsLanguage(source) {
  const masked = maskCommentsAndStrings(source);
  const candidates = /(?:^|[^\w$])language\s*:\s*\{/g;
  let best = null;

  let match;
  while ((match = candidates.exec(masked)) !== null) {
    const braceIndex = masked.indexOf("{", match.index);
    const body = extractBalanced(source, braceIndex, "{", "}");
    if (body === null) {
      continue;
    }

    const entries = parseJsEntries(body);
    if (
      entries.has("action_fullscreen_activate") &&
      (best === null || entries.size > best.size)
    ) {
      best = entries;
    }
  }

  if (best === null) {
    throw new Error("Could not find the language defaults block");
  }

  return best;
}

function collectProblems(sources) {
  const problems = [];
  const keys = new Set();

  for (const source of sources) {
    for (const key of source.entries.keys()) {
      keys.add(key);
    }
  }

  for (const key of [...keys].sort()) {
    const present = sources.filter((source) => source.entries.has(key));

    for (const source of sources) {
      if (!source.entries.has(key)) {
        problems.push(`missing from ${source.name}: ${key}`);
      }
    }

    if (present.length > 1) {
      const values = new Set(present.map((source) => source.entries.get(key)));
      if (values.size > 1) {
        const detail = present
          .map(
            (source) =>
              `${source.name}=${JSON.stringify(source.entries.get(key))}`,
          )
          .join(", ");
        problems.push(`value differs for ${key}: ${detail}`);
      }
    }
  }

  return problems;
}

function parseAdminLocalisedKeys(source) {
  const marker = /['"]waymark_php_lang['"]\s*,\s*\[/.exec(source);
  if (marker === null) {
    throw new Error("Could not find the waymark_php_lang localisation array");
  }

  const bracketIndex = source.indexOf("[", marker.index + marker[0].length - 1);
  const body = extractBalanced(source, bracketIndex, "[", "]");
  if (body === null) {
    throw new Error("Could not read the waymark_php_lang localisation array");
  }

  const keys = new Set();
  const pattern = /(['"])([A-Za-z0-9_]+)\1\s*=>/g;
  const clean = stripComments(body, { hashComments: true });

  let match;
  while ((match = pattern.exec(clean)) !== null) {
    keys.add(match[2]);
  }

  return keys;
}

function parseAdminReadKeys(source) {
  const keys = new Set();
  const clean = stripComments(source);
  const pattern = /\bwaymark_php_lang\.([A-Za-z_$][\w$]*)/g;

  let match;
  while ((match = pattern.exec(clean)) !== null) {
    keys.add(match[1]);
  }

  return keys;
}

function main() {
  const sources = [];
  const problems = [];

  for (const definition of SOURCES) {
    try {
      const entries = definition.parse(read(definition.file));
      sources.push({ name: definition.name, file: definition.file, entries });
    } catch (error) {
      problems.push(
        `${definition.name}: ${error.message} (${definition.file})`,
      );
    }
  }

  if (sources.length === SOURCES.length) {
    problems.push(...collectProblems(sources));
  }

  let localisedKeys = new Set();
  let readKeys = new Set();

  try {
    localisedKeys = parseAdminLocalisedKeys(read(ADMIN_PHP));
    readKeys = parseAdminReadKeys(read(ADMIN_JS));

    for (const key of [...localisedKeys].sort()) {
      if (!readKeys.has(key)) {
        problems.push(`waymark_php_lang key localised but never read: ${key}`);
      }
    }

    for (const key of [...readKeys].sort()) {
      if (!localisedKeys.has(key)) {
        problems.push(`waymark_php_lang key read but not localised: ${key}`);
      }
    }
  } catch (error) {
    problems.push(`waymark_php_lang: ${error.message}`);
  }

  console.log("i18n parity check");
  for (const source of sources) {
    console.log(
      `  ${source.name.padEnd(5)} ${String(source.entries.size).padStart(3)} keys  ${source.file}`,
    );
  }
  console.log(
    `  admin ${String(localisedKeys.size).padStart(3)} localised, ${String(readKeys.size).padStart(3)} read  ${ADMIN_PHP} -> ${ADMIN_JS}`,
  );

  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s):`);
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    "\nOK: language keys and values match, waymark_php_lang is balanced.",
  );
}

main();
