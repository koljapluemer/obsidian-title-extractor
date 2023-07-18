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

const removeMd = require('remove-markdown');


// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
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

				this.app.vault.read(file).then( async (content) => {

					function removeFrontmatter(markdown) {
						const lines = markdown.trim().split('\n');
						if (lines[0] === '---') {
						  let frontmatterEndIndex = lines.findIndex((line, index) => index > 0 && line === '---');
						  if (frontmatterEndIndex !== -1) {
							const frontmatterLines = lines.slice(0, frontmatterEndIndex + 1);
							if (frontmatterLines.length >= 2) {
							  return lines.slice(frontmatterEndIndex + 1).join('\n').trimStart();
							}
						  }
						}
						return markdown;
					  }
					
					const words = removeMd(removeFrontmatter(content))

					console.log('WORDS', words);

					console.log('FIRST LINE', words.split(/\r?\n/)[0]);
						
					let fileName = '';
					// add words to filename until 100 chars are exceeded
					let index = 0;
					while (fileName.length < 100 && index <= words.length - 1) {
						fileName += ' ';
						fileName += words[index]
						index += 1
					}
					// remove first char from fileName
					fileName = fileName.slice(1, fileName.length)

					console.log('FILENAME:', fileName);
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

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
