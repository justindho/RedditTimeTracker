// Create port with background.js.
let port = chrome.runtime.connect({
    name: 'updatePopupHTML'
});

// Request background.js to retrieve time variables from storage.
chrome.extension.getBackgroundPage().console.log('Before requesting time variables...');
port.postMessage({msg: 'Request time variables.'});

// Update popup.html with time variables from storage.
port.onMessage.addListener( (msg) => {    
    document.getElementById('todayMin').innerText = displayTime(msg.todaySec);
    document.getElementById('weekMin').innerText = displayTime(msg.weekSec);
    document.getElementById('monthMin').innerText = displayTime(msg.monthSec);
    document.getElementById('yearMin').innerText = displayTime(msg.yearSec);
    document.getElementById('alltimeMin').innerText = displayTime(msg.alltimeSec);
});

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
        let hours = Math.floor(((((seconds % secInYr) % secInMonth) % secInWeek) % secInDay) / secInHr);
        let mins = Math.floor((((((seconds % secInYr) % secInMonth) % secInWeek) % secInDay) % secInHr) / secInMin);
        return years + " yr " + months + " month " + weeks + " week " + days + " day " + hrs + " hr " + mins + " min";
    }
    else if (seconds / secInMonth >= 1) {
        let months = Math.floor(seconds / secInMonth);
        let weeks = Math.floor((seconds % secInMonth) / secInWeek);
        let days = Math.floor(((seconds % secInMonth) % secInWeek) / secInDay);
        let hours = Math.floor((((seconds % secInMonth) % secInWeek) % secInDay) / secInHr);
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
        let mins = Math.floor(seconds % secInHr);
        return hrs + " hr " + mins + " min";
    }
    else if (seconds / secInMin >= 1) {
        return Math.floor(seconds / secInMin) + " min";
    }
    else {
        return " 0 min";
    }
}