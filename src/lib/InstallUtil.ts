export default class InstallUtil {
  public static async handleInstalled(
    reason: browser.runtime.OnInstalledReason
  ): Promise<void> {
    if (reason !== "install") return

    const url = browser.i18n.getMessage("homepage")
    await browser.tabs.create({ url })
  }
}
