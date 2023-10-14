import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface ScrollToBottomOnOpenSettings {
	notesToScrollToBottom: string;
}

const DEFAULT_SETTINGS: ScrollToBottomOnSettings = {
	//mySetting: 'default'
}

export default class ScrollToBottomOnOpen extends Plugin {
	settings: ScrollToBottomOnSettings;

	async onload() {
		await this.loadSettings();
		
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => this.scrollToBottomOfNote(file))
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ScrollToBottomOnOpenSettingTab(this.app, this));
		
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'scroll-to-bottom',
			name: 'Scroll to bottom of current note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				//console.log(editor.getSelection());
				this.scrollToBottomOfNote();
			}
		});
	}

	onunload() {

	}
	
	//todo: test on mobile
	
	async scrollToBottomOfNote(file) {
		//console.log('loaded');
		//new Notice('loaded');
		//console.log(file);
		//console.log(this.settings.notesToScrollToBottom);
		let activeFilesArray = this.settings.notesToScrollToBottom.split(",").map(s => s.trim());
		if ((file && activeFilesArray.includes(file.name)) || !file) {
			let editor = this.getEditor();
			if (editor) {
				let doc = editor.getDoc();
				//console.log(doc);
				let cursorHead = editor.getCursor("head");
				//console.log(cursorHead);
				let lineLength = doc.getLine(cursorHead.line).length;
				//console.log(lineLength);
				let scrollInfo = editor.getScrollInfo();
				//console.log(scrollInfo);
				let lines = editor.lineCount();
				//console.log(lines);
				editor.setCursor(lines);
			}
		}
		
	}
	
	private getEditor(): Editor {
		return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ScrollToBottomOnOpenSettingTab extends PluginSettingTab {
	plugin: ScrollToBottomOnOpen;

	constructor(app: App, plugin: ScrollToBottomOnOpen) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('File Names To Scroll To Bottom On Open')
			.setDesc('Enter the names of the files you want to scroll to the bottom of on open, comma separated.')
			.addTextArea(text => text
				.setPlaceholder('Enter file names, comma separated')
				.setValue(this.plugin.settings.notesToScrollToBottom)
				.onChange(async (value) => {
					this.plugin.settings.notesToScrollToBottom = value;
					await this.plugin.saveSettings();
				}));
	}
}
