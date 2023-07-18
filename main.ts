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
	stripPeriods: boolean;
	replaceSpaces: boolean;
	stripSpecialChars: boolean;
	stripNonAlphaNumChars: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	maxNrOfWords: 10,
	onlyFirstLine: true,
	ignoreFrontmatter: true,
	stripMarkdown: true,
	stripPeriods: false,
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
			name: "Give me a filename!",
			callback: async () => {
				// check if there's a currently open file
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice("No active file");
					return;
				}

				this.app.vault.read(file).then(async (content) => {
					function removeFrontmatter(markdown) {
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

					const words = removeMd(removeFrontmatter(content));

					console.log("WORDS", words);

					console.log("FIRST LINE", words.split(/\r?\n/)[0]);

					let fileName = "";
					// add words to filename until 100 chars are exceeded
					let index = 0;
					while (fileName.length < 100 && index <= words.length - 1) {
						fileName += " ";
						fileName += words[index];
						index += 1;
					}
					// remove first char from fileName
					fileName = fileName.slice(1, fileName.length);

					console.log("FILENAME:", fileName);
					const newPath = `${file.parent!.path}/${fileName}.md`;
					// await this.app.fileManager.renameFile(file, newPath);
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

		new Setting(containerEl)
			.setName("Maximum number of words in the title")
			.addText((number) =>
				number
					.setPlaceholder('10')
					.setValue(this.plugin.settings.maxNrOfWords.toString())
					.onChange(async (value) => {
						this.plugin.settings.maxNrOfWords = parseInt(value);
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

		// bool: ignore frontmatter
		new Setting(containerEl)
			.setName("Ignore frontmatter")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.ignoreFrontmatter)
					.onChange(async (value) => {
						this.plugin.settings.ignoreFrontmatter = value;
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

		// bool: strip periods
		new Setting(containerEl).setName("Strip periods").addToggle((toggle) =>
			toggle
				.setValue(this.plugin.settings.stripPeriods)
				.onChange(async (value) => {
					this.plugin.settings.stripPeriods = value;
					await this.plugin.saveSettings();
				})
		);

		// bool: replace spaces
		new Setting(containerEl).setName("Replace spaces").addToggle((toggle) =>
			toggle
				.setValue(this.plugin.settings.replaceSpaces)
				.onChange(async (value) => {
					this.plugin.settings.replaceSpaces = value;
					await this.plugin.saveSettings();
				})
		);

		// bool: strip special chars
		new Setting(containerEl)

			.setName("Strip special chars")
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
			.setName("Strip nonalphanumeric chars")
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
