"use strict";

/**
 * If time variables haven't been created in local storage yet, 
 * initialize (current and previous) time variables in local storage.
 */
// console.log(typeof chrome.storage.local.get('todaySec'));
// try {
//     chrome.storage.local.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec',
//                                       'prevDaySec', 'prevWeekSec', 'prevMonthSec', 'prevYearSec'], () => {
//                                           console.log('Time variables already exist in local storage.');
//                                       });
// }
// catch {
//     chrome.storage.local.set({'todaySec': 0, 'weekSec': 0, 'monthSec': 0, 'yearSec': 0, 'alltimeSec': 0,
//                             'prevDaySec': 0, 'prevWeekSec': 0, 'prevMonthSec': 0, 'prevYearSec': 0}, () => {
//         console.log('Local time variables have been created and stored.');
//     });
// }

// Get offset between current time and midnight.
let now = new Date();
let then = new Date(now);
then.setHours(24, 0, 0, 0);
let msUntilMidnight = (then - now);

// Set current date/time variables for comparison at midnight each day.
let day = now.getDay();
let result = getWeekNumber(new Date());
let week = result[1];
let month = now.getMonth();
let year = now.getFullYear();

// Set extension installation time data.
// chrome.storage.local.set({'yearInstall': year, 'monthInstall': month, 'weekInstall': week, 'dayInstall': day});

 // At midnight every day, reset day/week/month/year variables
 // as appropriate for updating various time variables.
setTimeout( () => {
    setInterval( () => {
        let d = new Date();
        let todaySec = chrome.storage.local.get('todaySec');
        chrome.storage.local.set({'prevDaySec': todaySec});
        chrome.storage.local.set({'todaySec': 0});
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
    }, 1000 * 60 * 60 * 24);
}, msUntilMidnight);

// Add stopwatch to webpage.
let stopwatchBlock = () => {
    // Get location in HTML to insert the stopwatch icon.
    let redditHome = document.querySelector('[aria-label="Home"]');
    let stopwatchDiv = document.getElementById('stopwatchDiv');

    // If the stopwatch div is undefined, create it.
    if (!stopwatchDiv) {
        stopwatchDiv = document.createElement('div');
        stopwatchDiv.id = 'reddit-time-tracker';
        stopwatchDiv.innerHTML = '<div id="reddit-time-tracker__body"> \
                                    <div id="reddit-time-tracker__logotime">\
                                      <div id="reddit-time-tracker__logo"></div> \
                                      <div id="reddit-time-tracker__time"></div> \
                                    </div><br> \
                                    <div id="reddit-time-tracker__popup"> \
                                      <div id="reddit-time-tracker__popup-body"> \
                                        <div id="reddit-time-tracker__name">Reddit Time Tracker</div> \
                                        <ul id="reddit-time-tracker__stats">\
                                          <li id="liDay" class="list-inline">Today: <span id="todayTime"></span></li> \
                                          <li id="liWeek" class="list-inline">This week: <span id="weekTime"></span></li> \
                                          <li id="liMonth" class="list-inline">This month: <span id="monthTime"></span></li> \
                                          <li id="liYear" class="list-inline">This year: <span id="yearTime"></span></li> \
                                          <li id="liAllTime" class="list-inline">All time: <span id="alltimeTime"></span></li> \
                                        </ul><br> \
                                        <div id="reddit-time-tracker__links"> \
                                          <a href="https://github.com/justindho/RedditTimeTracker">Source Code</a> &nbsp;&nbsp;&nbsp;&nbsp;\
                                          <a href="https://docs.google.com/forms/d/1LQsPc7fTO3wF6NUFioRmzLk-X9QysKo-W2WqF0D6ZE4/edit">Provide Feedback</a>\
                                        </div> \
                                      </div>\
                                    </div> \
                                  </div>';
        // Create stopwatch logo.
        let stopwatchLogo = document.createElement('img');
        let stopwatchURL = chrome.runtime.getURL('img/stopwatch.svg');
        stopwatchLogo.src = stopwatchURL;

        // Insert stopwatch div after Reddit logo.
        redditHome.parentNode.insertBefore(stopwatchDiv, redditHome.nextSibling);
    }
    else {
        console.log('STOPWATCHBLOCK ALREADY EXISTS');
    }
};

stopwatchBlock();

// Start updating time variables when page is loaded.
document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        updateTimes();
    }
};
// document.addEventListener('DOMContentLoaded', () => {
//     updateTimes();
// })

// Check for tab changes. If tab URL is Reddit, update time statistics.
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        updateTimes();
    }
    else {
        clearTimer();
    }
});

/**
 * If Reddit tab is about to lose focus, stop updating time variables.
 */
// window.addEventListener('onblur', () => {
//     console.log('LOST FOCUS!!');
//     clearTimer();
// });
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('body').addEventListener('blur', () => {
        console.log('LOST FOCUS!!');
        clearTimer();
    });
});

/**
 * If Reddit tab is about to get focus, start updating time variables.
 */
// window.addEventListener('onfocus', () => {
//     console.log('REGAINED FOCUS');
//     updateTimes();
// });
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('body').addEventListener('focus', () => {
        console.log('REGAINED FOCUS!!');
        updateTimes();
    });
});

/**
 * Update time variables.
 */
let timer;
function updateTimes() {
    timer = setInterval( () => {
        try {
            // Update current time period's time variables.
            chrome.storage.local.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec',
                                      'prevDaySec', 'prevWeekSec', 'prevMonthSec', 'prevYearSec'], (result) => {
                document.getElementById('reddit-time-tracker__time').innerHTML = displayTime(result.todaySec);
                document.getElementById('todayTime').innerHTML = displayTime(result.todaySec++);
                document.getElementById('weekTime').innerHTML = displayTime(result.weekSec++);
                document.getElementById('monthTime').innerHTML = displayTime(result.monthSec++);
                document.getElementById('yearTime').innerHTML = displayTime(result.yearSec++);
                document.getElementById('alltimeTime').innerHTML = displayTime(result.alltimeSec++);
                console.log('todaySec: ' + result.todaySec);
                chrome.storage.local.set({'todaySec': result.todaySec, 'weekSec': result.weekSec, 'monthSec': result.monthSec, 'yearSec': result.yearSec, 'alltimeSec': result.alltimeSec});

                // Compare current time period's time variables to last time period's.
                // If user didn't browse Reddit in the previous time period, don't display any increase/decrease.
                renderTrends();
                // if (result.prevDaySec == 0) document.getElementById('dayDiff').innerHTML = "";
                // else document.getElementById('dayDiff').innerHTML = Math.floor(result.todaySec / result.prevDaySec) + "% &nbsp;";
                // if (result.prevWeekSec == 0) document.getElementById('weekDiff').innerHTML = "";
                // else document.getElementById('weekDiff').innerHTML = Math.floor(result.weekSec / result.prevWeekSec) + "% &nbsp;";
                // if (result.prevDaySec == 0) document.getElementById('monthDiff').innerHTML = "";
                // else document.getElementById('monthDiff').innerHTML = Math.floor(result.monthSec / result.prevMonthSec) + "% &nbsp;";
                // if (result.prevDaySec == 0) document.getElementById('yearDiff').innerHTML = "";
                // else document.getElementById('yearDiff').innerHTML = Math.floor(result.yearSec / result.prevYearSec) + "% &nbsp;";
            });
        }
        catch(err) {
            console.log(err.message);
        }
    }, 1000);
}

/**
 * Clear timer if it's been created already.
 */
function clearTimer() {
    if (typeof timer == 'undefined') {
        console.log('TIMER IS UNDEFINED');
    }
    else {
        clearInterval(timer);
    }
}

/**
 * Render time trends.
 */
function renderTrends() {
    let todaySec = chrome.storage.local.get('todaySec');
    let weekSec = chrome.storage.local.get('weekSec');
    let monthSec = chrome.storage.local.get('monthSec');
    let yearSec = chrome.storage.local.get('yearSec');
    let prevDaySec = chrome.storage.local.get('prevDaySec');
    let prevWeekSec = chrome.storage.local.get('prevWeekSec');
    let prevMonthSec = chrome.storage.local.get('prevMonthSec');
    let prevYearSec = chrome.storage.local.get('prevYearSec');
    document.getElementById('liDay').innerHTML += addDiffTrend(todaySec, prevDaySec, 'dayDiff');
    document.getElementById('liWeek').innerHTML += addDiffTrend(weekSec, prevWeekSec, 'weekDiff');
    document.getElementById('liMonth').innerHTML += addDiffTrend(monthSec, prevMonthSec, 'monthDiff');
    document.getElementById('liYear').innerHTML += addDiffTrend(yearSec, prevYearSec, 'yearDiff');
    // document.getElementById('reddit-time-tracker__stats').innerHTML = '\
    //     <li class="list-inline">Today: <span id="todayTime"></span>' + addDiffTrend(todaySec, prevDaySec, dayDiff) + '</li> \
    //     <li class="list-inline">This week: <span id="weekTime"></span>' + addDiffTrend(weekSec, prevWeekSec, weekDiff) + '</li> \
    //     <li class="list-inline">This month: <span id="monthTime"></span>' + addDiffTrend(monthSec, prevMonthSec, monthDiff) + '</li> \
    //     <li class="list-inline">This year: <span id="yearTime"></span>' + addDiffTrend(yearSec, prevYearSec, yearDiff) + '</li> \
    //     <li class="list-inline">All time: <span id="alltimeTime"></span></li>';
}

/**
 * Insert trend indicator (red for increase in time, green for decrease).
 * 
 * @param {number} currTime the current time value for the current time period 
 * @param {number} prevTime the previous time value for hte previous time period
 * @param {String} id the id to give to the newly created span element
 */
function addDiffTrend(currTime, prevTime, id) {
    if (prevTime == 0) return "";
    let percentChange = Math.round((currTime - prevTime) / prevTime * 100);  
    if (percentChange >= 0) {      
        return '<span class="trendGreen" id="' + id + '">' + percentChange + '%</span>';
    } else {
        return '<span class="trendRed" id="' + id + '">' + percentChange + '%</span>';
    }
}

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