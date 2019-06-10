"use strict";

// Refresh rate (ms).
let refreshRate = 1000;

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
                                          <li class="statline"><span id="todayTime"></span><span id="dayTrend"></span></li> \
                                          <li class="statline"><span id="weekTime"></span><span id="weekTrend"></span></li> \
                                          <li class="statline"><span id="monthTime"></span><span id="monthTrend"></span></li> \
                                          <li class="statline"><span id="yearTime"></span><span id="yearTrend"></span></li> \
                                          <li class="statline"><span id="alltimeTime"></span></li> \
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
        if (document.hasFocus()) {
            console.log('has focus');
            updateTimes();
        }
        else {
            console.log('no focus');
            clearTimer();
        }
    }
};

// Check for tab changes. If tab URL is Reddit, update time statistics.
// document.addEventListener('visibilitychange', () => {
//     if (document.visibilityState === 'visible') {
//         updateTimes();
//     }
//     else {
//         clearTimer();
//     }
// });

/**
 * If Reddit tab is about to lose focus, stop updating time variables.
 * If Reddit tab regains focus, start updating time variables again.
 */
window.onblur = () => {
    console.log('LOST FOCUS!!');
    clearTimer();
}
window.onfocus = () => {
    console.log('REGAINED FOCUS!!');
    updateTimes();
}

// Update time variables.
let timer;
function updateTimes() {
    timer = setInterval( () => {
        try {
            // Update current time period's time variables.
            chrome.storage.local.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec',
                                      'prevDaySec', 'prevWeekSec', 'prevMonthSec', 'prevYearSec'], (result) => {
                document.getElementById('reddit-time-tracker__time').innerHTML = displayTime(result.todaySec);
                document.getElementById('todayTime').innerHTML = 'Today: ' + displayTime(result.todaySec++);
                document.getElementById('weekTime').innerHTML = 'This week: ' + displayTime(result.weekSec++);
                document.getElementById('monthTime').innerHTML = 'This month: ' + displayTime(result.monthSec++);
                document.getElementById('yearTime').innerHTML = 'This year: ' + displayTime(result.yearSec++);
                document.getElementById('alltimeTime').innerHTML = 'All time: ' + displayTime(result.alltimeSec++);

                // Compare current time period's time variables to last time period's.
                // If user didn't browse Reddit in the previous time period, don't display any increase/decrease.
                console.log('prevDaySec: ' + result.prevDaySec);
                addDiffTrend(result.todaySec, result.prevDaySec, 'dayTrend');
                addDiffTrend(result.weekSec, result.prevWeekSec, 'weekTrend');
                addDiffTrend(result.monthSec, result.prevMonthSec, 'monthTrend');
                addDiffTrend(result.yearSec, result.prevYearSec, 'yearTrend');
                console.log('todaySec: ' + result.todaySec);
                chrome.storage.local.set({'todaySec': result.todaySec, 'weekSec': result.weekSec, 'monthSec': result.monthSec, 'yearSec': result.yearSec, 'alltimeSec': result.alltimeSec});
            });
        }
        catch(err) {
            console.log(err.message);
        }
    }, refreshRate);
}

// Clear timer if it's been created already.
function clearTimer() {
    if (typeof timer == 'undefined') {
        console.log('TIMER IS UNDEFINED');
    }
    else {
        clearInterval(timer);
    }
}

/**
 * Insert trend indicator (red for increase in time, green for decrease).
 *
 * @param {number} currTime the current time value for the current time period
 * @param {number} prevTime the previous time value for hte previous time period
 * @param {String} id the id to give to the newly created span element
 */
function addDiffTrend(currTime, prevTime, id) {
    let span = document.getElementById(id);    
    if (prevTime == 0 || prevTime == 'undefined') span.innerHTML = '';    
    else {
        let percentChange = Math.round((currTime - prevTime) / prevTime * 100);        
        if (percentChange >= 0) {
            span.classList.add('trendRed');            
            span.innerHTML = percentChange + '% &nbsp;&nbsp; <img src="chrome-extension://bbibllckhhjeebilllcglnmlaplcklld/img/redArrow.svg" alt="Red Arrow">'
        }
        else {
            span.classList.add('trendGreen');            
            span.innerHTML = percentChange + '% &nbsp;&nbsp; <img src="chrome-extension://bbibllckhhjeebilllcglnmlaplcklld/img/greenArrow.svg" alt="Green Arrow">'
        }        
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