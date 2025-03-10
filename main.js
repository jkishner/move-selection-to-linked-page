const { Plugin, Notice, Modal } = require("obsidian");

class MoveSelectionToLinkedPage extends Plugin {
    async onload() {
        this.addCommand({
            id: "move-selection-to-linked-page",
            name: "Move selection",
            callback: async () => {
                await this.moveSelection();
            },
        });
    }

    async moveSelection() {
        const editor = this.app.workspace.activeEditor?.editor;
        if (!editor) return;

        const selection = editor.getSelection();
        if (!selection) return;

        const file = this.app.workspace.getActiveFile();
        if (!file) return;

        // Extract the date from the filename, even when in a subfolder like "Daily/2025-03-05.md"
        const dateMatch = file.basename.match(/\d{4}-\d{2}-\d{2}/);
        if (!dateMatch) return;
        const noteDate = `**${dateMatch[0]}**`;

        const linkMatch = selection.match(/\[\[(.*?)(\|(.*?))?\]\]/);
        if (!linkMatch) return;
        const linkedPageName = linkMatch[1];
        const alias = linkMatch[3] ? linkMatch[3] : linkedPageName;

        // Remove the timestamp from the selection (assumes format "**time**: text")
        let cleanedSelection = selection.replace(/^\*\*\d{1,2}:\d{2}\s?[APap][Mm]\*\*: /, "");
        
        // Replace the alias or link with just the alias name
        cleanedSelection = cleanedSelection.replace(/\[\[(.*?)(\|(.*?))?\]\]/, alias);

        // Search for all files that match the linked page name
        const allFiles = this.app.vault.getFiles();
        const matchingFiles = allFiles.filter(f => f.basename === linkedPageName);

        let linkedFile;
        if (matchingFiles.length === 1) {
            linkedFile = matchingFiles[0];
        } else if (matchingFiles.length > 1) {
            // Prompt user to select the correct file if multiple are found
            const selectedFile = await this.promptUserForFileChoice(matchingFiles.map(f => f.path));
            if (!selectedFile) return;
            linkedFile = this.app.vault.getAbstractFileByPath(selectedFile);
        } else {
            linkedFile = await this.app.vault.create(linkedPageName + ".md", "");
        }

        let content = await this.app.vault.read(linkedFile);
        let insertIndex = content.length;

        // Check if "# LOG" or "# LOG\n%%LOG%%" exists and set the insertion point after them
        const logPattern = /^(# LOG(?:\n%%LOG%%)?)$/m;
        const logMatch = content.match(logPattern);
        
        if (logMatch) {
            insertIndex = logMatch.index + logMatch[0].length;
        } else {
            // If no log section is found, insert right after YAML front matter
            const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
            insertIndex = yamlMatch ? yamlMatch[0].length + 1 : 0;
        }

        // Ensure proper formatting with a newline before the bullet point
        const logEntry = `\n- ${noteDate}: ${cleanedSelection}\n`;
        
        // Insert the log entry at the correct position
        content = content.slice(0, insertIndex) + logEntry + content.slice(insertIndex);
        await this.app.vault.modify(linkedFile, content);

        // Remove the original selection from the daily note
        const newDailyContent = editor.getValue().replace(selection, "").trim();
        await this.app.vault.modify(file, newDailyContent);
    }

    async promptUserForFileChoice(filePaths) {
        return new Promise((resolve) => {
            const modal = new FileSelectionModal(this.app, filePaths, resolve);
            modal.open();
        });
    }
}

class FileSelectionModal extends Modal {
    constructor(app, filePaths, resolve) {
        super(app);
        this.filePaths = filePaths;
        this.resolve = resolve;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Select a file to move the selection to:" });

        this.filePaths.forEach((path) => {
            const button = contentEl.createEl("button", { text: path });
            button.addEventListener("click", () => {
                this.resolve(path);
                this.close();
            });
        });
    }

    onClose() {
        this.resolve(null);
    }
}

module.exports = MoveSelectionToLinkedPage;
