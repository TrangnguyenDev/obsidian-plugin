import { Notice, Plugin } from 'obsidian';

export default class ExportMarkdownPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: 'export-md-file',
			name: 'Export Markdown File',
			callback: () => {
				this.exportMarkdownFile();
			}
		});
	}

	async exportMarkdownFile() {
		const activeFile = this.app.workspace.getActiveFile();
		if (activeFile) {
			const content = await this.app.vault.read(activeFile);
			this.saveFile(activeFile.name, content);
		} else {
			new Notice('No active file to export');
		}
	}

	saveFile(fileName: string, content: string) {
		const blob = new Blob([content], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}
