import { Plugin, TFile, WorkspaceLeaf } from "obsidian";
import BetterWordCountSettingsTab from "./settings/SettingsTab";
import StatsManager from "./stats/StatsManager";
import StatusBar from "./status/StatusBar";
import type { EditorView } from "@codemirror/view";
import { editorPlugin } from "./editor/EditorPlugin";
import {
  BetterWordCountSettings,
  DEFAULT_SETTINGS,
} from "src/settings/Settings";
import { settingsStore } from "./utils/SvelteStores";
import { auth, sendStats, sourceRef, usersRef } from "./firebase/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";


export default class BetterWordCount extends Plugin {

  public settings: BetterWordCountSettings;
  public statusBar: StatusBar;
  public statsManager: StatsManager;
  
  public async pulse() {
    
  }
  
  async onunload(): Promise<void> {
    this.statsManager = null;
    this.statusBar = null;
  }

  async onload() {

    // auth.signOut();

    // Check if user is logged in
    auth.onAuthStateChanged(async firebaseUser => {
      
      // User is logged in
      if (firebaseUser) {

        // Recurringly check if user has typed something
        let wordCountBeforePulse:number;
        setInterval(async () => {
            
          // user hasn't typed any characters
          if (this.statsManager.getDailyCharacters() == wordCountBeforePulse) {
            console.log('not typed anything')
          }
          
          // user has typed some characters
          else {
            let statsData = this.statsManager.vaultStats
            console.log(statsData);
            console.log('has typed something')
      
            // send data to firebase
            await setDoc(doc(usersRef, firebaseUser.uid, sourceRef, "history"), statsData.history);
      
          }
          wordCountBeforePulse = this.statsManager.getDailyCharacters()
        }, 30000);
      }

      // User is not logged in
      else {
        console.log('not logged in')
      }
    });

    // Settings Store
    // this.register(
    //   settingsStore.subscribe((value) => {
    //     this.settings = value;
    //   })
    // );
    // Handle Settings
  

    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new BetterWordCountSettingsTab(this.app, this));

    // Handle Statistics
    if (this.settings.collectStats) {
      this.statsManager = new StatsManager(this.app.vault, this.app.workspace);
    }

    // Handle Status Bar
    let statusBarEl = this.addStatusBarItem();
    this.statusBar = new StatusBar(statusBarEl, this);

    // Handle the Editor Plugin
    this.registerEditorExtension(editorPlugin);

    this.app.workspace.onLayoutReady(() => {
      this.giveEditorPlugin(this.app.workspace.getMostRecentLeaf());
    });

    this.registerEvent(
      this.app.workspace.on(
        "active-leaf-change",
        async (leaf: WorkspaceLeaf) => {
          this.giveEditorPlugin(leaf);
          if (leaf.view.getViewType() !== "markdown") {
            this.statusBar.updateAltBar();
          }

          if (!this.settings.collectStats) return;
          await this.statsManager.recalcTotals();
        }
      )
    );

    this.registerEvent(
      this.app.vault.on("delete", async () => {
        if (!this.settings.collectStats) return;
        await this.statsManager.recalcTotals();
      })
    );
  }

  giveEditorPlugin(leaf: WorkspaceLeaf): void {
    //@ts-expect-error, not typed
    const editor = leaf?.view?.editor;
    if (editor) {
      const editorView = editor.cm as EditorView;
      const editorPlug = editorView.plugin(editorPlugin);
      editorPlug.addPlugin(this);
      //@ts-expect-error, not typed
      const data: string = leaf.view.data;
      this.statusBar.updateStatusBar(data);
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
