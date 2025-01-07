import { Plugin } from "obsidian";

export default class ExamplePlugin extends Plugin {
	onload(): Promise<void> | void {
		console.log("Hello world!");
	}
}
