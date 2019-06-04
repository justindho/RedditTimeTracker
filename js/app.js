alert('app.js loaded');
console.log('app.js loaded');

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
let timerBlock = () => {
    // Get location in HTML to insert the stopwatch icon.    
    let redditHome = document.querySelector('[aria-label="Home"]');    

    // Insert icon into page.
    let newIcon = document.createElement('img');
    newIcon.style.height = 40;    
    let imgURL = chrome.runtime.getURL('img/stopwatch.svg');
    newIcon.src = imgURL;
    redditHome.parentNode.insertBefore(newIcon, redditHome.nextSibling);

    // if (!timer) {
    //     alert('No timer found.');
    //     // If no timer exists yet, create a div for a timer.
    //     timer = document.createElement('div');
    //     timer.innerHTML = '<div class="reddit-time-tracker__body">\n  <div class="reddit-time-tracker__stopwatch-icon">\n';
    //     timer.id = "reddit-time-tracker";
    //     timer.className = "reddit-time-tracker";

    //     icon.parentNode.insertBefore(timer, icon.nextSibling);
    // }
    // else {
    //     alert('TIMER FOUND');
    // }
};

timerBlock();