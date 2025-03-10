# Move Selection to Linked Page

## Overview
This Obsidian plugin allows users to move selected text from a daily note to a linked page, ensuring structured logging and efficient note-taking. It scans the destination page for an existing `# LOG` section and appends the text after it, or places it right below the YAML front matter if no log section is found.

## Features
- Moves selected text from a daily note to a linked page.
- Preserves date formatting and structures entries as bullet points.
- Detects `# LOG` or `# LOG\n%%LOG%%` sections and appends the text there.
- If no log section exists, places the text below the YAML front matter.
- Removes timestamps and unnecessary link brackets from the entry.
- Scans the vault for the correct destination file, preventing duplicate file creation.
- If multiple destination files match, prompts the user to select the correct one.
- Works seamlessly with Obsidian's command palette.

## How to Use
1. Select a line of text in a daily note that contains a `[[Linked Page]]` reference.
2. Open the command palette and run **"Move selection"**.
3. The selected text will be removed from the daily note and added to the referenced page under `# LOG`, or below YAML if no log section exists.
4. If the destination file was moved, the plugin will detect it.
5. If multiple destination files match, a prompt will ask you to select the correct one.

## Installation
1. Copy the plugin files into your Obsidian vault under `.obsidian/plugins/move-selection-to-linked-page/`.
2. Enable the plugin in **Settings > Community Plugins**.

## Credits
- **Jeffrey Kishner** conceived the idea, problem-solved the workflow, and user-tested the plugin.
- **ChatGPT** wrote the code based on Jeffrey’s requirements and iterative feedback.

---

For feature requests or bug reports, please submit an issue on GitHub!
