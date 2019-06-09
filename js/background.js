// Declare global time variables.
let now, day, week, month, year;

// Set up environment on extension installation.
chrome.runtime.onInstalled.addListener( () => {
    console.log('Starting initializations ...') ;
    // Set extension installation time data.
    now = new Date();
    day = now.getDay();
    let result = getWeekNumber(now);
    week = result[1];
    month = now.getMonth() + 1;
    year = now.getFullYear();

    // Get offset between current time and the next midnight.
    let then = new Date(now);
    then.setHours(24, 0, 0, 0);
    let msUntilMidnight = (then - now);
    let minUntilMidnight = Math.floor(msUntilMidnight / (1000 * 60));

    // Initialize local storage time and installation date variables if they don't already exist.
    // This is needed to prevent resetting of local storage variables upon chrome browser update.
    let todaySec, weekSec, monthSec, yearSec, alltimeSec;
    chrome.storage.local.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec',
                                'prevDaySec', 'prevWeekSec', 'prevMonthSec', 'prevYearSec'], (result) => {
        if (todaySec == 'undefined' || weekSec == 'undefined' || monthSec == 'undefined' || yearSec == 'undefined' || alltimeSec == 'undefined') {
            chrome.storage.local.set({'todaySec': 0, 'weekSec': 0, 'monthSec': 0, 'yearSec': 0, 'alltimeSec': 0,
                'yearInstall': year, 'monthInstall': month, 'weekInstall': week, 'dayInstall': day}, () => {
                console.log('Time variables and installation variables have been created and stored.');
            });
        } else {
            console.log('Time variables already exist');
        }
    });    

    // Create alarm to tell background script to refresh the appropriate time variables at midnight each day.
    console.log('Creating alarm ...');
    chrome.alarms.create('resetTimeVars', {delayInMinutes: minUntilMidnight, periodInMinutes: 60 * 24});

    // For testing & debugging purposes.
    // chrome.alarms.create('resetTimeVars', {delayInMinutes: 1, periodInMinutes: 1});
    console.log('Alarm created');
});

// When resetTimeVars alarm is triggered, reset time variables as appropriate.
chrome.alarms.onAlarm.addListener( (alarm) => {
    switch (alarm.name) {
        case 'resetTimeVars':
            // Reset the appropriate time variables at midnight of each day
            console.log('RESETTING TIME VARS!!!');
            let d = new Date();
            chrome.storage.local.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec',
                'prevDaySec', 'prevWeekSec', 'prevMonthSec', 'prevYearSec'], (result) => {
                chrome.storage.local.set({'prevDaySec': result.todaySec, 'todaySec': 0});
                let weekResult = getWeekNumber(new Date());
                if (weekResult[1] != week) {
                    chrome.storage.local.set({'prevWeekSec': result.weekSec, 'weekSec': 0});
                    week = weekResult[1];
                }
                if (d.getMonth() != month) {
                    chrome.storage.local.set({'prevMonthSec': result.monthSec, 'monthSec': 0});
                    month = d.getMonth();
                }
                if (d.getFullYear() != year) {
                    chrome.storagel.local.set({'prevYearSec': result.yearSec, 'yearSec': 0});
                    year++;
                }
            });
            break;
        default:
            break;
    }
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