import { App, ButtonComponent, PluginSettingTab, SearchComponent, Setting, TextAreaComponent, ToggleComponent } from "obsidian";
import type BetterWordCount from "src/main";
import { addStatusBarSettings } from "./StatusBarSettings";
// import { getAuth, signInWithPopup, GoogleAuthProvider, browserPopupRedirectResolver } from "firebase/auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseSignIn } from "src/firebase/firebase";


export default class BetterWordCountSettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: BetterWordCount) {
    super(app, plugin);
  }

  email:string;
  password:string;

  display(): void {
    let { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h3", { text: "Better Word Count Settings" });

    // General Settings
    containerEl.createEl("h4", { text: "General Settings" });
    new Setting(containerEl)
      .setName("Collect Statistics")
      .setDesc(
        "Reload Required for change to take effect. Turn on to start collecting daily statistics of your writing. Stored in the vault-stats.json file in the .obsidian of your vault. This is required for counts of the day as well as total counts."
      )
      .addToggle((cb: ToggleComponent) => {
        cb.setValue(this.plugin.settings.collectStats);
        cb.onChange(async (value: boolean) => {
          this.plugin.settings.collectStats = value;
          await this.plugin.saveSettings();
        });
      });
    new Setting(containerEl)
      .setName("Don't Count Comments")
      .setDesc("Turn on if you don't want markdown comments to be counted.")
      .addToggle((cb: ToggleComponent) => {
        cb.setValue(this.plugin.settings.countComments);
        cb.onChange(async (value: boolean) => {
          this.plugin.settings.countComments = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Sign in")
      .setDesc("Sign in so that your stats get synced")
      .addTextArea((cb: TextAreaComponent) => {
        cb.onChange(async () => {
          this.email = cb.getValue()
          console.log(this.email)
        })
      })
      .addTextArea((cb: TextAreaComponent) => {
        cb.onChange(async () => {
          this.password = cb.getValue()
          console.log(this.email)
        })
      })
      .addButton((cb: ButtonComponent) => {
        cb.setButtonText('sign in')
        cb.onClick(async () => {
          console.log('huzzah!')
          firebaseSignIn(this.email, this.password)

          // Google Auth – issues with electron apps and signInWithPopup method
          // const auth = getAuth();
          // const provider = new GoogleAuthProvider();

          // signInWithPopup(auth, provider, browserPopupRedirectResolver)
          //   .then((result) => {
          //     // This gives you a Google Access Token. You can use it to access the Google API.
          //     const credential = GoogleAuthProvider.credentialFromResult(result);
          //     const token = credential.accessToken;
          //     // The signed-in user info.
          //     const user = result.user;
          //     // IdP data available using getAdditionalUserInfo(result)
          //     // ...
          //   }).catch((error) => {
          //     // Handle Errors here.
          //     const errorCode = error.code;
          //     const errorMessage = error.message;
          //     // The email of the user's account used.
          //     const email = error.customData.email;
          //     // The AuthCredential type that was used.
          //     const credential = GoogleAuthProvider.credentialFromError(error);
          //     // ...
          //   });
        })
      });

    // Status Bar Settings
    addStatusBarSettings(this.plugin, containerEl);
  }
}
