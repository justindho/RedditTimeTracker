/**
 * Initialize global time variables.
 */
let todaySec = 0;
let weekSec = 0;
let monthSec = 0;
let yearSec = 0;
let alltimeSec = 0;

/**
 * Initialize time variables in local storage.
 */
chrome.runtime.onInstalled.addListener( () => {    
    chrome.storage.local.set({'todaySec': 0, 'weekSec': 0, 'monthSec': 0, 'yearSec': 0, 'alltimeSec': 0}, () => {
        todaySec = 0;
        weekSec = 0;
        monthSec = 0;
        yearSec = 0;
        alltimeSec = 0;
        console.log('Local time variables have been created and stored.');
    });
});