import {App, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';

interface TranslatePluginSettings {
	apiKey: string;
	targetLanguage: string;
}

const DEFAULT_SETTINGS: TranslatePluginSettings = {
	apiKey: '',
	targetLanguage: 'vi'
}

export default class TranslatePlugin extends Plugin {
	settings: TranslatePluginSettings;
	popup: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();
		console.log('Hí anh em');
		this.addRibbonIcon('languages', 'Translate', () => {
			new Notice('Translate Plugin Loaded');
		});

		this.addCommand({
			id: 'translate-text',
			name: 'Translate Text',
			callback: () => {
				new TranslateModal(this.app, this.settings.apiKey, this.settings.targetLanguage).open();
			}
		});

		this.addSettingTab(new TranslateSettingTab(this.app, this));

		// Add event listener for text selection
		document.addEventListener('mouseup', async (event) => {
			const selectedText = window.getSelection()?.toString().trim();
			if (selectedText) {
				const translatedText = await this.translateText(selectedText);
				this.showPopup(event.pageX, event.pageY, translatedText);
			}
		});

		// Add event listener for selection change to hide popup
		document.addEventListener('selectionchange', () => {
			if (!window.getSelection()?.toString().trim() && this.popup) {
				document.body.removeChild(this.popup);
				this.popup = null;
			}
		});
	}

	onunload() {
		console.log('Unloading Translate Plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async translateText(text: string): Promise<string> {
		const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.settings.apiKey}`, {
			method: 'POST',
			body: JSON.stringify({
				q: text,
				target: this.settings.targetLanguage
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		return data.data.translations[0].translatedText;
	}

	showPopup(x: number, y: number, text: string) {
		if (this.popup) {
			document.body.removeChild(this.popup);
		}

		this.popup = document.createElement('div');
		this.popup.style.position = 'absolute';
		this.popup.style.left = `${x}px`;
		this.popup.style.top = `${y}px`;
		this.popup.style.backgroundColor = 'white';
		this.popup.style.color = 'black';
		this.popup.style.border = '1px solid black';
		this.popup.style.padding = '10px';
		this.popup.style.zIndex = '1000';
		this.popup.textContent = text;

		document.body.appendChild(this.popup);
	}
}

class TranslateModal extends Modal {
	apiKey: string;
	targetLanguage: string;

	constructor(app: App, apiKey: string, targetLanguage: string) {
		super(app);
		this.apiKey = apiKey;
		this.targetLanguage = targetLanguage;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl('h2', {text: 'Translate Text'});

		const input = contentEl.createEl('textarea', {placeholder: 'Enter text to translate...'});
		// @ts-ignore
		const output = contentEl.createEl('textarea', {placeholder: 'Translation will appear here...', readOnly: true});

		input.addEventListener('input', async () => {
			const text = input.value.replace(/[*]/g, '');
			const translatedText = await this.translateText(text);
			output.value = translatedText;
		});
	}

	async translateText(text: string): Promise<string> {
		const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
			method: 'POST',
			body: JSON.stringify({
				q: text,
				target: this.targetLanguage
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		return data.data.translations[0].translatedText;
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class TranslateSettingTab extends PluginSettingTab {
	plugin: TranslatePlugin;

	constructor(app: App, plugin: TranslatePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'Translate Plugin Settings'});

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Enter your Google Translate API key')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Target Language')
			.setDesc('Select the target language for translation')
			.addDropdown(dropdown => dropdown
				.addOptions({
					'en': 'English',
					'vi': 'Vietnamese',
					'es': 'Spanish',
					'fr': 'French',
					'de': 'German',
					'ja': 'Japanese'
				})
				.setValue(this.plugin.settings.targetLanguage)
				.onChange(async (value) => {
					this.plugin.settings.targetLanguage = value;
					await this.plugin.saveSettings();
				}));
	}
}
