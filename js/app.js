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
chrome.storage.local.set({'todaySec': 0, 'weekSec': 0, 'monthSec': 0, 'yearSec': 0, 'alltimeSec': 0}, () => {
    todaySec = 0;
    weekSec = 0;
    monthSec = 0;
    yearSec = 0;
    alltimeSec = 0;
    console.log('Local time variables have been created and stored.');
});

/**
 * Add stopwatch to webpage.
 */
let stopwatchBlock = () => {
    console.log('STOPWATCHBLOCK STARTED');
    // Get location in HTML to insert the stopwatch icon.
    let redditHome = document.querySelector('[aria-label="Home"]');
    let stopwatchDiv = document.getElementById('stopwatchDiv');

    // If the stopwatch div is undefined, create it.
    if (!stopwatchDiv) {
        console.log('STOPWATCHBLOCK DOESNT EXIST YET');
        stopwatchDiv = document.createElement('div');
        stopwatchDiv.id = 'reddit-time-tracker';
        stopwatchDiv.innerHTML = '<div id="reddit-time-tracker__body"> \
                                    <div id="reddit-time-tracker__logo"></div> \
                                    <div id="reddit-time-tracker__time">\n</div>\n\n\n \
                                      <div id="reddit-time-tracker__popup"> \
                                        <div id="reddit-time-tracker__popup-body"> \
                                        <div id="reddit-time-tracker__name">Reddit Time Tracker</div> \
                                        <ul id="reddit-time-tracker__stats">\
                                        <li>Today: <span id="todayTime"></span></li> \
                                        <li>This week: <span id="weekTime"></span></li> \
                                        <li>This month: <span id="monthTime"></span></li> \
                                        <li>This year: <span id="yearTime"></span></li> \
                                        <li>All time: <span id="alltimeTime"></span></li> \
                                        </ul> \
                                        <div id="reddit-time-tracker__links"> \
                                          <a href="https://github.com/justindho/RedditTimeTracker">Source Code</a>\
                                        </div> \
                                      </div> \
                                    </div> \
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

// Update stopwatchDiv with time statistics every second.
setInterval( () => {    
    console.log('IN SETINTERVAL()');
    chrome.storage.local.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec'], (result) => {        
        document.getElementById('todayTime').innerHTML = displayTime(result.todaySec++);
        document.getElementById('weekTime').innerHTML = displayTime(result.weekSec++);
        document.getElementById('monthTime').innerHTML = displayTime(result.monthSec++);
        document.getElementById('yearTime').innerHTML = displayTime(result.yearSec++);
        document.getElementById('alltimeTime').innerHTML = displayTime(result.alltimeSec++);
        chrome.storage.local.set({'todaySec': result.todaySec, 'weekSec': result.weekSec, 'monthSec': result.monthSec, 'yearSec': result.yearSec, 'alltimeSec': result.alltimeSec})
    });
    console.log('IN SETINTERVAL() COMPLETE');
        
}, 1000);

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
        return years + " yr " + months + " month " + weeks + " week " + days + " day " + hrs + " hr " + mins + " min";
    }
    else if (seconds / secInMonth >= 1) {
        let months = Math.floor(seconds / secInMonth);
        let weeks = Math.floor((seconds % secInMonth) / secInWeek);
        let days = Math.floor(((seconds % secInMonth) % secInWeek) / secInDay);
        let hrs = Math.floor((((seconds % secInMonth) % secInWeek) % secInDay) / secInHr);
        let mins = Math.floor(((((seconds % secInMonth) % secInWeek) % secInDay) % secInHr) / secInMin);
        return months + " month " + weeks + " week " + days + " day " + hrs + " hr " + mins + " min";
    }
    else if (seconds / secInWeek >= 1) {
        let weeks = Math.floor(seconds / secInWeek)
        let days = Math.floor((seconds % secInWeek) / secInDay);
        let hrs = Math.floor(((seconds % secInWeek) % secInDay) / secInHr);
        let mins = Math.floor((((seconds % secInWeek) % secInDay) % secInHr) / secInMin);
        return weeks + " wk " + days + " day " + hrs + " hr " + mins + " min";
    }
    else if (seconds / secInDay >= 1) {
        let days = Math.floor(seconds / secInDay);
        let hrs = Math.floor((seconds % secInDay) / secInHr);
        let mins = Math.floor(((seconds % secInDay) % secInHr) / secInMin);
        return days + " day " + hrs + " hr " + mins + " min";
    }
    else if (seconds / secInHr >= 1) {
        let hrs = Math.floor(seconds / secInHr);
        let mins = Math.floor((seconds % secInHr) / secInMin);
        return hrs + " hr " + mins + " min";
    }
    else if (seconds / secInMin >= 1) {
        return Math.floor(seconds / secInMin) + " min";
    }
    else {
        return " 0 min";
    }
}