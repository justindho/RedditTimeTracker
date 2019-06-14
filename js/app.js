"use strict";

// Global variables.
let refreshRate = 1000; // ms
let timer;  // timer to update time variables per refreshRate

/**
 * Update the stopwatch logo when night mode is toggled to maintain a good contrast for visibility.
 * If night mode is on, logo will turn white/gray. If night mode is off, logo will turn black.
 */
const target = document.getElementsByClassName('wb4c1a-0')[0];  // Reddit class dictating page background color

// Configure object.
const config = { attributes: true };

// Subscriber to observe for changes.
function subscriber(mutations) {
    // console.log(mutations);
    // console.log(mutations.constructor); // Array

    mutations.forEach( mutation => {
        // console.log(mutation);
        // console.log(mutation.constructor);  // MutationRecord
        if (mutation.attributeName == 'class') {
            updateStopwatchLogo();
        }
    });
}

// Create observer.
const backgroundColorObserver = new MutationObserver(subscriber);

// Observe target.
backgroundColorObserver.observe(target, config);

// Create stopwatch block and stopwatch logo on startup.
createStopwatchBlock();
updateStopwatchLogo();

// Callback function to update stopwatch logo based on Reddit's night mode on/off.
function updateStopwatchLogo() {
    // Get Reddit page background color. Make sure stopwatch logo has enough contrast with background.
    let classElements = document.getElementsByClassName('wb4c1a-0');  // Reddit class dictating page background color
    let color = window.getComputedStyle(classElements[0], null).getPropertyValue('background-color');
    // console.log('color = ' + color);

    // Get class's RGB values and the background's perceived brightness.
    // http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
    let rgb = color.split("(")[1].split(")")[0].split(",");
    // console.log('r = ' + rgb[0] + ', g = ' + rgb[1] + ', b = ' + rgb[2]);
    let perceivedBrightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    // console.log('perceivedBrightness = ' + perceivedBrightness);

    // Set stopwatch logo based on perceived brightness.
    let stopwatchLogoDiv = document.createElement('svg');
    let stopwatchURL = (perceivedBrightness > 125) ? chrome.runtime.getURL('img/stopwatch.svg') : chrome.runtime.getURL('img/stopwatch_white.svg');
    // console.log('stopwatchURL = ' + stopwatchURL);
    stopwatchLogoDiv.src = stopwatchURL;
    document.getElementById('reddit-time-tracker__logo').style.backgroundImage = 'url(' + stopwatchURL + ')';
}

// Start updating time variables when page is loaded.
document.onreadystatechange = () => {
    chrome.storage.sync.get('limitMet', (result) => {
        // If user has set time limit and limit has been met, block Reddit.
        if (!typeof result.timeLimit === 'undefined') {
            if (result.limitMet) {
                console.log('Time limit met!!');
                alert('Time limit met!!!');
            }
        }
        else if (document.readyState === 'complete') {
            if (document.hasFocus()) {
                console.log('has focus');
                updateTimes();
            }
            else {
                console.log('no focus');
                clearTimer();
            }
        }
    });
};

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

// Add stopwatch to webpage.
function createStopwatchBlock() {
    // Get location in HTML to insert the stopwatch icon.
    let redditHome = document.querySelector('[aria-label="Home"]');
    let stopwatchDiv = document.getElementById('reddit-time-tracker');

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
                                          <a href="https://github.com/justindho/RedditTimeTracker" target="_blank">Source Code</a> &nbsp;&nbsp;&nbsp;&nbsp;\
                                          <a href="https://docs.google.com/forms/d/e/1FAIpQLSc80074GQNbizyBq_l7mD_IS4a5JtLd7C0oqNekT3C3VOgSUQ/viewform" target="_blank">Provide Feedback</a>\
                                        </div> \
                                      </div>\
                                    </div> \
                                  </div>';

        // Insert stopwatch div after Reddit logo.
        redditHome.parentNode.insertBefore(stopwatchDiv, redditHome.nextSibling);
    }
    else {
        console.log('STOPWATCHBLOCK ALREADY EXISTS');
    }
};

// Update time variables.
function updateTimes() {
    timer = setInterval( () => {
        try {
            chrome.storage.sync.get(['limitMet', 'timeLimit', 'todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec',
                                      'prevDaySec', 'prevWeekSec', 'prevMonthSec', 'prevYearSec'], (result) => {
                // If user has time limit set and time limit has been set, update override flag and block Reddit.
                if (result.timeLimit && result.todaySec >= result.timeLimit) {
                    console.log('Daily time limit has been met/exceeded.');
                    chrome.storage.sync.set({'limitMet': true});
                    clearTimer();

                    // Send request to background script to reroute url.
                    // chrome.runtime.sendMessage({redirect: 'https://www.google.com/'}, () => {
                    let newURL = chrome.runtime.getURL('../templates/blocking_page.html');
                    chrome.runtime.sendMessage({redirect: newURL}, () => {
                        console.log('Request to reroute sent.');
                    });

                    /**
                     * Send message to background script to reroute Reddit to blocking page.
                     */
                    // Create a port to talk to background script.
                    // let port = chrome.runtime.connect({name: 'rerouteToBlockingPage'});
                    // console.log('Port created to talk to background');

                    // // Request background script to reroute requests for Reddit to blocking page.
                    // port.sendMessage({msg: 'Reroute to blocking page.'});
                    // // port.postMessage({msg: 'Reroute to blocking page.'});
                    // console.log('Message sent from app to background');


                    // throw "Browsing limit has been met for the day.";
                }

                // Update current time period's time variables.
                document.getElementById('reddit-time-tracker__time').innerHTML = displayTime(result.todaySec);
                document.getElementById('todayTime').innerHTML = 'Today: ' + displayTime(result.todaySec++);
                document.getElementById('weekTime').innerHTML = 'This week: ' + displayTime(result.weekSec++);
                document.getElementById('monthTime').innerHTML = 'This month: ' + displayTime(result.monthSec++);
                document.getElementById('yearTime').innerHTML = 'This year: ' + displayTime(result.yearSec++);
                document.getElementById('alltimeTime').innerHTML = 'All time: ' + displayTime(result.alltimeSec++);

                // Compare current time period's time variables to last time period's.
                // If user didn't browse Reddit in the previous time period, don't display any increase/decrease.
                // console.log('prevDaySec: ' + result.prevDaySec);
                // console.log('prevWeekSec: ' + result.prevWeekSec);
                addDiffTrend(result.todaySec, result.prevDaySec, 'dayTrend');
                addDiffTrend(result.weekSec, result.prevWeekSec, 'weekTrend');
                addDiffTrend(result.monthSec, result.prevMonthSec, 'monthTrend');
                addDiffTrend(result.yearSec, result.prevYearSec, 'yearTrend');
                console.log('todaySec: ' + result.todaySec);
                chrome.storage.sync.set({'todaySec': result.todaySec, 'weekSec': result.weekSec, 'monthSec': result.monthSec, 'yearSec': result.yearSec, 'alltimeSec': result.alltimeSec});
            });
        }
        catch(err) {
            console.log(err.message);
        }
    }, refreshRate);
}

// Clear timer if it's been created already.
function clearTimer() {
    if (typeof timer == undefined) {
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
    if (prevTime == 0 || prevTime == undefined) span.innerHTML = '';
    else {
        // console.log('typeof prevTime = ' + typeof prevTime);
        let percentChange = Math.round((currTime - prevTime) / prevTime * 100);
        if (percentChange >= 0) {
            span.classList.add('trendRed');
            let imgURL = chrome.runtime.getURL('img/redArrow.svg');
            span.innerHTML = '+' + percentChange + '% &nbsp;&nbsp; <img src="' + imgURL + '" alt="Red Arrow">';
        }
        else {
            span.classList.add('trendGreen');
            let imgURL = chrome.runtime.getURL('img/greenArrow.svg');
            span.innerHTML = percentChange + '% &nbsp;&nbsp; <img src="' + imgURL + '" alt="Green Arrow">';
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

// Block Reddit
function blockReddit() {
    alert('Time is up!');
    // document.getElementsByTagName('body').innerHTML = '<div>Daily browsing limit has been reached.</div><button class="btn btn-danger">Override</button>'
}