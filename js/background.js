// Upon extension being installed, listen for when a Reddit
// tab is active.
chrome.runtime.onInstalled.addListener( () => {

    // Create a persistent variable in storage that will continuously
    // get updated as the user spends more time on Reddit.
    chrome.storage.sync.set({totalTime: 0}, () => {
        console.log("Reddit time logging has started.");
    });
});