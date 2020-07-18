declare namespace browser.storage.sync {
    // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/get
    function get(setting: object|string|Array<string>|null): Promise<object>
    // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/set
    function set(setting: object): Promise<void>
    // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/remove
    function remove(key: string|string[]): Promise<void>
    // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/clear
    function clear(): Promise<void>
}
declare namespace browser.tabs {
    type activeInfo = {
        tabId: number
        windowId: number
    }
}