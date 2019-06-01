console.log('Background.js started.');

chrome.runtime.onInstalled.addListener( () => {    
    // Create and store time variables in storage.
    chrome.storage.sync.set({'todayMin': 0, 'weekMin': 0, 'monthMin': 0, 'yearMin': 0, 'alltimeMin': 0}, () => {
        console.log('Time variables have been created and stored.');
    });

});

chrome.storage.sync.get(['todayMin', 'weekMin'], (result) => {
    console.log('todayMin = ' + result.todayMin);
    console.log('weekMin = ' + result.weekMin);
});

// Upon extension being installed, listen for when a Reddit
// tab is active.
chrome.runtime.onInstalled.addListener( () => {

    // Continuously update time variables as the user spends more time on Reddit.
    chrome.storage.sync.set({totalTime: 0}, () => {
        console.log("Reddit time logging has started.");
    });
    alert('hello');
    console.log('asdf');
});

chrome.runtime.onMessage.addListener( (response, sender, sendResponse) => {
    // 'response' is whatever response is sent by the contentscript.js
    alert(response);
    // 'sender' holds information about the tab (tab.id, tab info)

    // 'sendReponse' is any response we want to send back to the content scripts 
});






// When there is a tab change
// https://developers.chrome.com/extensions/events
// https://developers.chrome.com/extensions/runtime
// https://developers.chrome.com/extensions/tabs
// https://developers.chrome.com/extensions/webRequest
// https://developers.chrome.com/extensions/webNavigation

    // While the active tab is reddit.com:

        // Get the relevant time variables from storage (todayMin, weekMin, monthMin, yearMin, alltimeMin)
        // https://developers.chrome.com/extensions/storage

        // After each minute, add 1 to each of these variables

    // Store updated time variables in storage
    // https://developers.chrome.com/extensions/storage



// Listen for browser action click
// https://developers.chrome.com/extensions/events

    // Get time variables from local storage
    // https://developers.chrome.com/extensions/storage

    // Pass time variables to popup.js
    // https://developers.chrome.com/extensions/extension