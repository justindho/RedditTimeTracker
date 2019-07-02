// // Initialize Firebase config.
// let config = {
//     apiKey = '[insert api key]',
//     authDomain: '[insert auth domain]',
//     databaseURL: '[insert database url]',
//     projectId: '[insert project id]',
//     storageBucket: '[insert storage bucket]',
//     messagingSenderId: '[insert message sender id]'
// }
// const app = firebase.initializeApp(config);
// const appDb = app.database().ref();

// // Instantiate global application state object for Chrome Storage and feed in Firebase data.
// // Chrome Storage will store global state as a JSON stringified value.
// const applicationState = { values: [] };

// appDb.on('child_added', snapshot => {
//     applicationState.values.push({
//         id: snapshot.key,
//         value: snapshot.val()
//     });
//     updateState(applicationState);
// });

// appDb.on('child_removed', snapshot => {
//     const childPosition = getChildIndex(applicationState, snapshot.key);
//     if (chilPosition === -1) return;
//     applicationState.values.splice(childPosition, 1);
//     updateState(applicationState);    
// });

// appDb.on('child_changed', snapshot => {
//     const childPosition = getChildIndex(applicationState, snapshot.key);
//     if (childPosition === -1) return;
//     applicationState.values[childPostion] = snapshot.val();
//     updateState(applicationState);
// });

// // Write changes to Chrome Storage
// function updateState(applicationState) {
//     chrome.storage.sync.set({ state: JSON.stringify(applicationState) });
// }

// // Return the matching element in the object
// function getChildIndex(appState, id) {
//     return appState.values.findIndex(element => element.id == id);
// }

// // Allow content script to manipulate data via message listener to access appDb.
// chrome.runtime.onMessage.addListener((msg, sender, response) => {
//     switch (msg.type) {
//         case 'updateValue':
//             appDb.child(msg.opts.id).set({ value: msg.opts.value });
//             response('success');
//             break;
//         default:
//             response('unknown request');
//             break;
//     }
// });

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
        let minUntilMidnight = Math.floor(msUntilMidnight / (1000 * 60)) + 1;
        console.log('Time til midnight: ' + minUntilMidnight + ' min');

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
    console.log('GOT AN ALARM');
    switch (alarm.name) {
        case 'resetTimeVars':
            // Reset the appropriate time variables at midnight of each day and reset time limit flag.
            console.log('RESETTING TIME VARS AND TIME LIMIT FLAG!!!');
            let today = new Date();
            console.log('Today is ' + today);
            let weekResult = getWeekNumber(today);
            chrome.storage.sync.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 
                'currDay', 'currWeek', 'currMonth', 'currYear',
                'prevDaySec', 'prevWeekSec', 'prevMonthSec', 'prevYearSec'], (result) => {
                console.log('Resetting day time ...');
                chrome.storage.sync.set({'prevDaySec': result.todaySec, 'todaySec': 0, 'currDay': today.getDay()});  
                console.log('storage currWeek = ' + result.currWeek);
                console.log('actual currWeek = ' + weekResult[1]);              
                if (weekResult[1] != result.currWeek) {
                    console.log('Resetting week time ...');
                    chrome.storage.sync.set({'prevWeekSec': result.weekSec, 'currWeek': weekResult[1], 'weekSec': 0});
                }
                console.log('storage currMonth = ' + result.currMonth);
                console.log('actual currMonth = ' + today.getMonth());
                if (today.getMonth() != result.currMonth) {
                    console.log('Resetting month time ...');
                    chrome.storage.sync.set({'prevMonthSec': result.monthSec, 'currMonth': today.getMonth(), 'monthSec': 0});
                }
                console.log('storage currYear = ' + result.currYear);
                console.log('actual currYear = ' + today.getFullYear());
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

/**
 * Convert time (in seconds) to minutes if over 60 seconds,
 *                              hours if over 60 minutes,
 *                              days if over 24 hours,
 *                              years if over 365 days.
 *
 * @param {number} seconds
 */
function displayTime(seconds) {
    let secInMin = 60;
    let secInHr = 3600;
    let secInDay = 86400;
    let secInWeek = 604800;
    let secInMonth = 2678400;
    let secInYr = 31536000;
    if (seconds / secInYr >= 1) {
        let years = Math.floor(seconds / secInYr);
        let months = Math.floor((seconds % secInYr) / secInMonth);
        let weeks = Math.floor(((seconds % secInYr) % secInMonth) / secInWeek);
        let days = Math.floor((((seconds % secInYr) % secInMonth) % secInWeek) / secInDay);
        let hrs = Math.floor(((((seconds % secInYr) % secInMonth) % secInWeek) % secInDay) / secInHr);
        let mins = Math.floor((((((seconds % secInYr) % secInMonth) % secInWeek) % secInDay) % secInHr) / secInMin);
        return years + " y " + months + " m " + weeks + " w " + days + " d " + hrs + " h " + mins + " min";
    }
    else if (seconds / secInMonth >= 1) {
        let months = Math.floor(seconds / secInMonth);
        let weeks = Math.floor((seconds % secInMonth) / secInWeek);
        let days = Math.floor(((seconds % secInMonth) % secInWeek) / secInDay);
        let hrs = Math.floor((((seconds % secInMonth) % secInWeek) % secInDay) / secInHr);
        let mins = Math.floor(((((seconds % secInMonth) % secInWeek) % secInDay) % secInHr) / secInMin);
        return months + " m " + weeks + " w " + days + " d " + hrs + " h " + mins + " min";
    }
    else if (seconds / secInWeek >= 1) {
        let weeks = Math.floor(seconds / secInWeek)
        let days = Math.floor((seconds % secInWeek) / secInDay);
        let hrs = Math.floor(((seconds % secInWeek) % secInDay) / secInHr);
        let mins = Math.floor((((seconds % secInWeek) % secInDay) % secInHr) / secInMin);
        return weeks + " w " + days + " d " + hrs + " h " + mins + " min";
    }
    else if (seconds / secInDay >= 1) {
        let days = Math.floor(seconds / secInDay);
        let hrs = Math.floor((seconds % secInDay) / secInHr);
        let mins = Math.floor(((seconds % secInDay) % secInHr) / secInMin);
        return days + " d " + hrs + " h " + mins + " min";
    }
    else if (seconds / secInHr >= 1) {
        let hrs = Math.floor(seconds / secInHr);
        let mins = Math.floor((seconds % secInHr) / secInMin);
        return hrs + " h " + mins + " min";
    }
    else if (seconds / secInMin >= 1) {
        return Math.floor(seconds / secInMin) + " min";
    }
    else {
        return " 0 min";
    }
}