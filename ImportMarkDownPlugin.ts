import { Plugin, TFile, Vault } from 'obsidian';

export default class ImportMarkdownPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: 'import-md-file',
			name: 'Import Markdown File',
			callback: () => {
				this.importMarkdownFile();
			}
		});
	}

	async importMarkdownFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.md';
		input.onchange = async (event: Event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				const content = await file.text();
				this.createMarkdownFile(file.name, content);
			}
		};
		input.click();
	}

	async createMarkdownFile(fileName: string, content: string) {
		const vault: Vault = this.app.vault;
		let newFileName = fileName;
		let counter = 1;

		// Check if file with the same name exists and append a unique identifier if it does
		while (await vault.adapter.exists(newFileName)) {
			const nameWithoutExtension = fileName.replace(/\.md$/, '');
			newFileName = `${nameWithoutExtension}-${counter}.md`;
			counter++;
		}

		const newFile: TFile = await vault.create(newFileName, content);
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(newFile);
	}
}
