// Filesystem roots shared by the video tooling.
//
// The help site and its delivery assets live under `help/` at the repository
// root. Keeping the paths here means a future move updates one file instead of
// every script that reads or writes them.
"use strict";

import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
export const PUBLIC_DIR = path.join(REPO_ROOT, "help", "public");
export const CONTENT_DIR = path.join(REPO_ROOT, "help", "content");
export const DELIVERY_DIR = path.join(PUBLIC_DIR, "assets", "video");
