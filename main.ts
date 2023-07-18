import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

const removeMd = require("remove-markdown");

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	onlyFirstLine: boolean;
	maxNrOfWords: number;
	ignoreFrontmatter: boolean;
	stripMarkdown: boolean;
	replacePeriods: boolean;
	replaceSpaces: boolean;
	stripSpecialChars: boolean;
	stripNonAlphaNumChars: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	maxNrOfWords: 10,
	onlyFirstLine: true,
	ignoreFrontmatter: true,
	stripMarkdown: true,
	replacePeriods: false,
	replaceSpaces: false,
	stripSpecialChars: false,
	stripNonAlphaNumChars: false,
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "set-filename",
			name: "Extract Title and Filename From Note Content",
			callback: async () => {
				// check if there's a currently open file
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice("No active file");
					return;
				}

				this.app.vault.read(file).then(async (content) => {
					function returnFirstLine(markdown: string) {
						const lines = markdown.trim().split("\n");
						return lines[0];
					}

					function removeFrontmatter(markdown: string) {
						const lines = markdown.trim().split("\n");
						if (lines[0] === "---") {
							let frontmatterEndIndex = lines.findIndex(
								(line, index) => index > 0 && line === "---"
							);
							if (frontmatterEndIndex !== -1) {
								const frontmatterLines = lines.slice(
									0,
									frontmatterEndIndex + 1
								);
								if (frontmatterLines.length >= 2) {
									return lines
										.slice(frontmatterEndIndex + 1)
										.join("\n")
										.trimStart();
								}
							}
						}
						return markdown;
					}

					function replacePeriods(markdown: string) {
						return markdown.replace('.', '_');
					}

					function replaceSpaces(markdown: string) {
						return markdown.replace(/\s/g, "_");
					}

					function stripSpecialChars(markdown: string) {
						const specialCharsRegex = /[^\p{L}\p{N}_\-?]/gu;
						return markdown.replace(specialCharsRegex, "");
					}

					function stripNonAlphaNumChars(markdown: string) {
						// remove everything that isnt aZ09_-
						return markdown.replace(/[^a-zA-Z0-9_\-?]/g, "");
					}

					// go through each settings and call the corresponding function if true
					// always clear /\ and : from the filename
					let cleanContent = content.replace(/\/|:/g, '_');

					if (this.settings.ignoreFrontmatter) {
						cleanContent = removeFrontmatter(cleanContent);
					
					}
					if (this.settings.onlyFirstLine) {
						cleanContent = returnFirstLine(cleanContent);
					}

					if (this.settings.stripMarkdown) {
						cleanContent = removeMd(cleanContent);
						
					}
					if (this.settings.replacePeriods) {
						cleanContent = replacePeriods(cleanContent);
						
					}
					if (this.settings.replaceSpaces) {
						cleanContent = replaceSpaces(cleanContent);
						
					}
					if (this.settings.stripSpecialChars) {
						cleanContent = stripSpecialChars(cleanContent);
						
					}
					if (this.settings.stripNonAlphaNumChars) {
						cleanContent = stripNonAlphaNumChars(cleanContent);
					
					}

					function capStringWithCharacters(
						str: string,
						maxLength: number
					) {
						if (str.length <= maxLength) {
							return str;
						} else {
							let cappedString = str.slice(0, maxLength);
							let lastCharacter = cappedString.charAt(
								cappedString.length - 1
							);
							let charactersToCheck = ["_", "-", " ", "."];

							// Check if the last character is one of the special characters
							if (charactersToCheck.includes(lastCharacter)) {
								return cappedString;
							}

							// If the last character is not a special character, find the last occurrence
							for (let i = cappedString.length - 2; i >= 0; i--) {
								if (
									charactersToCheck.includes(
										cappedString.charAt(i)
									)
								) {
									cappedString = cappedString.slice(0, i + 1);
									break;
								}
							}
							return cappedString;
						}
					}


					cleanContent = capStringWithCharacters(
						cleanContent,
						this.settings.maxNrOfWords
					);
					// if last character is a special character (' ', '.', '_', '-') remove it
					const lastCharacter = cleanContent.charAt(
						cleanContent.length - 1
					);
					const charactersToCheck = ["_", "-", " ", ".", ","];
					if (charactersToCheck.includes(lastCharacter)) {
						cleanContent = cleanContent.slice(0, -1);
					}


					const fileName = cleanContent;

					const newPath = `${file.parent!.path}/${fileName}.md`;
					try {
						await this.app.fileManager.renameFile(file, newPath);
					} catch (error) {
						console.error(`Attempted to name note \n ${fileName}.md \n\n ..but encountered error: \n${error}`);
						new Notice(
							"Error renaming file, check console for details."
						);
					}
				});
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Title Extractor Settings" });
		containerEl.createEl("h3", { text: "Style" });

		new Setting(containerEl)
			.setName("Maximum length of the title")
			.addText((number) =>
				number
					.setPlaceholder("128")
					.setValue(this.plugin.settings.maxNrOfWords.toString())
					.onChange(async (value) => {
						this.plugin.settings.maxNrOfWords = parseInt(value);
						await this.plugin.saveSettings();
					})
			);

		// bool: ignore frontmatter
		new Setting(containerEl)
			.setName("Exclude frontmatter")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.ignoreFrontmatter)
					.onChange(async (value) => {
						this.plugin.settings.ignoreFrontmatter = value;
						await this.plugin.saveSettings();
					})
			);

		// bool: consider only first line
		new Setting(containerEl)
			.setName("Consider only first line")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.onlyFirstLine)
					.onChange(async (value) => {
						this.plugin.settings.onlyFirstLine = value;
						await this.plugin.saveSettings();
					})
			);

		// bool: strip markdown
		new Setting(containerEl).setName("Strip markdown").addToggle((toggle) =>
			toggle
				.setValue(this.plugin.settings.stripMarkdown)
				.onChange(async (value) => {
					this.plugin.settings.stripMarkdown = value;
					await this.plugin.saveSettings();
				})
		);

		containerEl.createEl("h3", { text: "Compability" });

		// bool: strip periods
		new Setting(containerEl).setName("Strip periods").addToggle((toggle) =>
			toggle
				.setValue(this.plugin.settings.replacePeriods)
				.onChange(async (value) => {
					this.plugin.settings.replacePeriods = value;
					await this.plugin.saveSettings();
				})
		);


		// bool: replace spaces
		new Setting(containerEl)
			.setName("Replace spaces with underscores")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.replaceSpaces)
					.onChange(async (value) => {
						this.plugin.settings.replaceSpaces = value;
						await this.plugin.saveSettings();
					})
			);

		// bool: strip special chars
		new Setting(containerEl)

			.setName(
				"Strip all characters that are not letters, dashes or underscores"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.stripSpecialChars)
					.onChange(async (value) => {
						this.plugin.settings.stripSpecialChars = value;
						await this.plugin.saveSettings();
					})
			);

		// bool: strip nonalphanumeric chars
		new Setting(containerEl)
			.setName(
				"Strip all characters that are not English letters, dashes or underscores"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.stripNonAlphaNumChars)
					.onChange(async (value) => {
						this.plugin.settings.stripNonAlphaNumChars = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
