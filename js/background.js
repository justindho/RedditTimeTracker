// Set up environment on extension installation.
chrome.runtime.onInstalled.addListener( () => {    
    // Set extension installation time data.
    let now = new Date();
    let day = now.getDay();
    let result = getWeekNumber(now);
    let week = result[1];
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    // Get offset between current time and the next midnight.
    let then = new Date(now);
    then.setHours(24, 0, 0, 0);
    let msUntilMidnight = (then - now);
    let minUntilMidnight = Math.floor(msUntilMidnight / (1000 * 60));

    // Initialize local storage time and installation date variables if they don't already exist.
    let todaySec = chrome.storage.local.get('todaySec');
    let weekSec = chrome.storage.local.get('weekSec');
    let monthSec = chrome.storage.local.get('monthSec');
    let yearSec = chrome.storage.local.get('yearSec');
    let alltimeSec = chrome.storage.local.get('alltimeSec');
    if (todaySec == 'undefined' || weekSec == 'undefined' || monthSec == 'undefined' || yearSec == 'undefined' || alltimeSec == 'undefined') {
        chrome.storage.local.set({'todaySec': 0, 'weekSec': 0, 'monthSec': 0, 'yearSec': 0, 'alltimeSec': 0,
            'yearInstall': year, 'monthInstall': month, 'weekInstall': week, 'dayInstall': day}, () => {
            console.log('Time variables and installation variables have been created and stored.');
        });
    }
    
    // Create alarm to tell background script to refresh the appropriate time variables at midnight each day.
    chrome.alarms.create('resetTimeVars', {delayInMinutes: minUntilMidnight, periodInMinutes: 60 * 24});
});

// Event: alarm raised
chrome.alarms.onAlarm.addListener( (alarm) => {
    switch (alarm.name) {
        case 'resetTimeVars':
            // Reset the appropriate time variables at midnight of each day
            let d = new Date();
            let todaySec = chrome.storage.local.get('todaySec');
            chrome.storage.local.set({'prevDaySec': todaySec, 'todaySec': 0});        
            let weekResult = getWeekNumber(new Date());
            if (weekResult[1] != week) {
                let weekSec = chrome.storage.local.get('weekSec');
                chrome.storage.local.set({'prevWeekSec': weekSec});
                chrome.storage.local.set({'weekSec': 0});
                week = weekResult[1];
            }
            if (d.getMonth() != month) {
                let monthSec = chrome.storage.local.get('monthSec');
                chrome.storage.local.set({'prevMonthSec': monthSec});
                chrome.storage.local.set({'monthSec': 0});
                month = d.getMonth();
            }
            if (d.getFullYear() != year) {
                let yearSec = chrome.storage.local.get('yearSec');
                chrome.storagel.local.set({'prevYearSec': yearSec});
                chrome.storage.local.set({'yearSec': 0});
                year++;
            }            
            break;
        default:
            break;
    }
});

// Create a daily alarm to update time variables at midnight each day
// function _updateRepeatingAlarms() {
//     // Add daily alarm to reset time varaibles at midnight each day
//     chrome.alarms.get('resetTimeVars', (alarm) => {
//         if (!alarm) {
//             chrome.alarms.create('resetTimeVars', {
//                 delayInMinutes: minUntilMidnight,
//                 periodInMinutes: 60 * 24
//             });
//         }
//     });
// }

 // At midnight every day, reset day/week/month/year variables
 // as appropriate for updating various time variables.

//  setTimeout( () => {
//     setInterval( () => {
//         let d = new Date();
//         let todaySec = chrome.storage.local.get('todaySec');
//         chrome.storage.local.set({'prevDaySec': todaySec, 'todaySec': 0});        
//         let weekResult = getWeekNumber(new Date());
//         if (weekResult[1] != week) {
//             let weekSec = chrome.storage.local.get('weekSec');
//             chrome.storage.local.set({'prevWeekSec': weekSec});
//             chrome.storage.local.set({'weekSec': 0});
//             week = weekResult[1];
//         }
//         if (d.getMonth() != month) {
//             let monthSec = chrome.storage.local.get('monthSec');
//             chrome.storage.local.set({'prevMonthSec': monthSec});
//             chrome.storage.local.set({'monthSec': 0});
//             month = d.getMonth();
//         }
//         if (d.getFullYear() != year) {
//             let yearSec = chrome.storage.local.get('yearSec');
//             chrome.storagel.local.set({'prevYearSec': yearSec});
//             chrome.storage.local.set({'yearSec': 0});
//             year++;
//         }
//     }, 1000 * 60 * 60 * 24);
// }, msUntilMidnight);
// setTimeout( () => {
//     setInterval( () => {
//         let d = new Date();
//         let todaySec = chrome.storage.local.get('todaySec');
//         chrome.storage.local.set({'prevDaySec': todaySec, 'todaySec': 0});        
//         let weekResult = getWeekNumber(new Date());
//         if (weekResult[1] != week) {
//             let weekSec = chrome.storage.local.get('weekSec');
//             chrome.storage.local.set({'prevWeekSec': weekSec});
//             chrome.storage.local.set({'weekSec': 0});
//             week = weekResult[1];
//         }
//         if (d.getMonth() != month) {
//             let monthSec = chrome.storage.local.get('monthSec');
//             chrome.storage.local.set({'prevMonthSec': monthSec});
//             chrome.storage.local.set({'monthSec': 0});
//             month = d.getMonth();
//         }
//         if (d.getFullYear() != year) {
//             let yearSec = chrome.storage.local.get('yearSec');
//             chrome.storagel.local.set({'prevYearSec': yearSec});
//             chrome.storage.local.set({'yearSec': 0});
//             year++;
//         }
//     }, 1000 * 60 * 60 * 24);
// }, msUntilMidnight);

/**
 * Get week number.
 *
 * src: https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
 *
 * For a given date, get the ISO week number
 *
 * Based on information at:
 *
 *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 *
 * Algorithm is to find nearest thursday, it's year
 * is the year of the week number. Then get weeks
 * between that date and the first day of that year.
 *
 * Note that dates in one year can be weeks of previous
 * or next year, overlap is up to 3 days.
 *
 * e.g. 2014/12/29 is Monday in week  1 of 2015
 *      2012/1/1   is Sunday in week 52 of 2011
 */
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0,1));
    // Calculate full weeks to nearest Thursday
    let weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
}