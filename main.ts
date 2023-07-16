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

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

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

				this.app.vault.read(file).then((content) => {
					// get the content of the file, split by words, remove urls and words containting {, }, [, ], (, ) and #
					// get so many words that 100 chars are not exceeded
					const words = content
						.split(" ")
						.filter(
							(word) =>
								!word.includes("{") &&
								!word.includes("}") &&
								!word.includes("[") &&
								!word.includes("]") &&
								!word.includes("(") &&
								!word.includes(")") &&
								!word.includes("#") &&
								!word.includes("http") &&
								!word.includes("---") &&
								!word.includes(":") &&
								!word.includes("www")
 						)
						.slice(0, 100)
						

					let fileName = '';
					// add words to filename until 100 chars are exceeded
					let index = 0;
					while (fileName.length < 100 && index <= words.length - 1) {
						fileName += '_';
						fileName += words[index]
						index += 1
					}
					// remove first char from fileName
					fileName = fileName.slice(1, fileName.length)

					console.log('FILENAME:', fileName);
					const newPath = `${file.parent!.path}/foobar.md`;
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
