import { Plugin } from 'obsidian';
import TranslatePlugin from "./TranslatePlugin";
import ImportMarkdownPlugin from "./ImportMarkdownPlugin";
import ExportMarkdownPlugin from './ExportMarkdownPlugin';

export default class MainPlugin extends Plugin {
	async onload() {
		const importMarkdownPlugin = new ImportMarkdownPlugin(this.app, this.manifest);
		await importMarkdownPlugin.onload();

		const translatePlugin = new TranslatePlugin(this.app, this.manifest);
		await translatePlugin.onload();

		const exportMarkdownPlugin = new ExportMarkdownPlugin(this.app, this.manifest);
		await exportMarkdownPlugin.onload();
	}

	onunload() {
		console.log('Unloading Main Plugin');
	}
}
