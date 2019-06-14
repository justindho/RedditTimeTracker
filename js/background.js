// Set up environment on extension installation.
chrome.runtime.onInstalled.addListener(
    function installationSetUp() {
        console.log('Starting initializations ...') ;
        // Set extension installation time data.
        let now = new Date();
        let currDay = now.getDay();
        let currResult = getWeekNumber(now);
        let currWeek = currResult[1];
        let currMonth = now.getMonth();
        let currYear = now.getFullYear();

        // Get offset between current time and the next midnight.
        let then = new Date(now);
        then.setHours(24, 0, 0, 0);
        let msUntilMidnight = (then - now);
        let minUntilMidnight = Math.floor(msUntilMidnight / (1000 * 60));

        // Initialize sync storage time and installation date variables. Prevent resetting of time variables
        // upon extension version updates.
        chrome.storage.sync.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec'], (result) => {
            // console.log('todaySec = ' + result.todaySec);
            // console.log('typeOf todaySec = ' + typeof result.todaySec);

            // Set time variables if they don't already exist in Chrome sync storage.
            if (typeof result.todaySec == 'undefined') chrome.storage.sync.set({'todaySec': 0});
            if (typeof result.weekSec == 'undefined') chrome.storage.sync.set({'weekSec': 0});
            if (typeof result.monthSec == 'undefined') chrome.storage.sync.set({'monthSec': 0});
            if (typeof result.yearSec == 'undefined') chrome.storage.sync.set({'yearSec': 0});
            if (typeof result.alltimeSec == 'undefined') chrome.storage.sync.set({'alltimeSec': 0});

            // Store current time period's details in Chrome sync storage. Also set time limit flag.
            chrome.storage.sync.set({'currDay': currDay, 'currWeek': currWeek, 'currMonth': currMonth, 'currYear': currYear, 'limitMet': false}, () => {
                console.log('Current time period time vars and time limit flag set');
            });
        });

        // Create alarm to tell background script to refresh the appropriate time variables at midnight each day.
        console.log('Creating alarm ...');
        chrome.alarms.create('resetTimeVars', {delayInMinutes: minUntilMidnight, periodInMinutes: 60 * 24});

        // For testing & debugging purposes.
        // chrome.alarms.create('resetTimeVars', {delayInMinutes: 1, periodInMinutes: 1});
        console.log('Alarm created');

        // Remove onInstalled listener to prevent resetting of time variables upon browser update.
        chrome.runtime.onInstalled.removeListener(installationSetUp);
    }
);

// When resetTimeVars alarm is triggered, reset time variables as appropriate.
chrome.alarms.onAlarm.addListener( (alarm) => {
    switch (alarm.name) {
        case 'resetTimeVars':
            // Reset the appropriate time variables at midnight of each day and reset time limit flag.
            console.log('RESETTING TIME VARS AND TIME LIMIT FLAG!!!');
            let today = new Date();
            chrome.storage.sync.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec',
                'currDay', 'currWeek', 'currMonth', 'currYear',
                'prevDaySec', 'prevWeekSec', 'prevMonthSec', 'prevYearSec'], (result) => {
                console.log('Resseting day time ...');
                chrome.storage.sync.set({'prevDaySec': result.todaySec, 'todaySec': 0});
                let weekResult = getWeekNumber(today);
                if (weekResult[1] != result.currWeek) {
                    console.log('Resetting week time ...');
                    chrome.storage.sync.set({'prevWeekSec': result.weekSec, 'currWeek': weekResult[1], 'weekSec': 0});
                }
                if (today.getMonth() != result.currMonth) {
                    console.log('Resetting month time ...');
                    chrome.storage.sync.set({'prevMonthSec': result.monthSec, 'currMonth': today.getMonth(), 'monthSec': 0});
                }
                if (today.getFullYear() != result.currYear) {
                    console.group('Resetting year time ...');
                    chrome.storage.sync.set({'prevYearSec': result.yearSec, 'currYear': today.getFullYear(), 'yearSec': 0});
                }
            });
            chrome.storage.sync.set({'limitMet': false});
            break;
        default:
            break;
    }
});

/**
 * When port to app.js is connected, reroute requests to Reddit to blocking page.
 */
// Reroute to blocking page.
// chrome.runtime.onConnect.addListener( (port) => {
//     console.log('Connected .....');
//     console.assert(port.name === 'rerouteToBlockingPage');
//     port.onMessage.addListener( (msg, sender) => {
//         if (msg.msg === 'Reroute to blocking page.') {            
//             let url = chrome.runtime.getURL('../templates/blocking_page.html');
//             console.log('new url = ' + url);
//             chrome.tabs.update(sender.tab.id, {url: url});
            
//         }
//     });
// });

// Reroute url upon request.
chrome.runtime.onMessage.addListener( (request, sender) => {
    chrome.tabs.update(sender.tab.id, {url: request.redirect});
});



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
function getWeekNumber(day) {
    // Copy date so don't modify original
    day = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
    // Get first day of year
    let yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    let weekNo = Math.ceil((( (day - yearStart) / 86400000) + 1) / 7);
    // Return array of year and week number
    return [day.getUTCFullYear(), weekNo];
}