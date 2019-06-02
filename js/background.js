/**
 * Initialize global time variables.
 */
let todaySec = 0;
let weekSec = 0;
let monthSec = 0;
let yearSec = 0;
let alltimeSec = 0;

// Get offset between current time and midnight.
let now = new Date();
let then = new Date(now);
then.setHours(24, 0, 0, 0);
let msUntilMidnight = (then - now);
console.log('ms until midnight = ' + msUntilMidnight);

// Set current date/time variables for comparison at midnight each day.
day = now.getDay();
let result = getWeekNumber(new Date());
week = result[1];
console.log('Week #: ' + week);
month = now.getMonth();
year = now.getFullYear();

/**
 * At midnight every day, reset day/week/month/year variables 
 * as appropriate for updating various time variables.
 */
setTimeout( () => {
    setInterval( () => {
        let d = new Date();
        todaySec = 0;
        let weekResult = getWeekNumber(new Date());
        if (weekResult[1] != week) {
            weekSec = 0;            
            week = weekResult[1];
        }
        if (d.getMonth() != month) {
            monthSec = 0;
            month = d.getMonth();
        }
        if (d.getFullYear() != year) {
            yearSec = 0;
            year++;
        }
    }, 1000 * 60 * 60 * 24);
}, msUntilMidnight);

/**
 * Reset time variables as needed.
 */
setInterval( () => {
    let date = new Date();
    if (date.getSeconds() % 7 == 0) console.log('Resetting todaySec');
    // if (date.getFullYear())
}, 1000);

/**
 * Initialize time variables in storage.
 */
chrome.runtime.onInstalled.addListener( () => {
    // Create time variables in storage.
    chrome.storage.sync.set({'todaySec': 0, 'weekSec': 0, 'monthSec': 0, 'yearSec': 0, 'alltimeSec': 0}, () => {
        todaySec = 0;
        weekSec = 0;
        monthSec = 0;
        yearSec = 0;
        alltimeSec = 0;
        console.log('Time variables have been created and stored.');
    });
});

/**
 * Listen for active tab changes. If active tab's URL is Reddit, continually
 * update time variables. Otherwise, if there was a previous timer running,
 * stop the timer.
 */
chrome.tabs.onActivated.addListener( () => {
    console.log('Checking for Reddit tab...');
    // Get URL of current tab.
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        let url = tabs[0].url;

        console.log('URL = ' + url);

        // If tab URL is Reddit, start logging times.
        if (url.indexOf('.reddit') != -1) {
            console.log('WERE AT REDDIT!!!');
            updateTimes();            
        }
        else {
            if (typeof timer !== 'undefined') {
                clearInterval(timer);
            }
            else {
                console.log('Timer is not defined');
            }
            console.log('TIMER STOPPED.');
            console.log('TAB IS NO LONGER REDDIT!!!');
        }
    });

});

/**
 * When port to popup.js is connected, send time variables 
 * via message.
 */
chrome.runtime.onConnect.addListener( (port) => {
    console.log('Connected .....');
    console.assert(port.name == 'updatePopupHTML');
    port.onMessage.addListener( (msg) => {
        if (msg.msg == 'Request time variables.') {
            console.log('POSTING MESSAGE FROM BACKGROUND.JS!!!!');
            port.postMessage({
                todaySec: todaySec,
                weekSec: weekSec,
                monthSec: monthSec,
                yearSec: yearSec,
                alltimeSec: alltimeSec,
            });

            console.log('Posted message to popup.js');
        }
    });
});

/**
 * Listen for current tab's URL changes. If the tab's new URL 
 * is Reddit, continually update time variables in storage.
 */
chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    // Once new page is done loading, check if URL is Reddit.
    if (changeInfo.status === 'complete') {
        if (tab.url.indexOf('.reddit') != -1) {
            console.log('Tab is REDDIT!!!');
            updateTimes();
        }
    }
});

/**
 * Update time variables in storage.
 */
function updateTimes() {    
    // Get time variables from storage.
    chrome.storage.sync.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec'], (result) => {
        todaySec = result.todaySec;
        weekSec = result.weekSec;
        monthSec = result.monthSec;
        yearSec = result.yearSec;
        alltimeSec = result.alltimeSec;
        console.log('UPDATED TODAYSEC = ' + todaySec);

        // Continuously update time variables while the active tab's URL is Reddit.
        timer = setInterval( () => {
            console.log("Logging Reddit time...");

            todaySec++;
            weekSec++;
            monthSec++;
            yearSec++;
            alltimeSec++;

            // Update time variables in storage every second.
            chrome.storage.sync.set({'todaySec': todaySec, 'weekSec': weekSec, 'monthSec': monthSec, 'yearSec': yearSec, 'alltimeSec': alltimeSec}, () => {
                console.log('TIME VARIABLES HAVE BEEN UPDATED.');
                console.log('todaySec = ' + todaySec);
                console.log('weekSec = ' + weekSec);
                console.log('monthSec = ' + monthSec);
                console.log('yearSec = ' + yearSec);
                console.log('alltimeSec = ' + alltimeSec);
            });
        }, 1000);
    });
};

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
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
}