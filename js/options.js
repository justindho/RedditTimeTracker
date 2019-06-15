// Display current time limit in UI.
chrome.storage.sync.get('timeLimit', (result) => {
    if (result.timeLimit === null) document.getElementById('current-limit').innerHTML = 'no limit set';
    else document.getElementById('current-limit').innerHTML = displayTime(result.timeLimit);
});

// Save user options to Chrome storage.
document.getElementById('save-button').addEventListener('click', (e) => {
    let timeLimit = document.getElementById('duration').value * 60; // convert from min to sec
    let savestatus = document.getElementById('save-status');    

    chrome.storage.sync.set({'timeLimit': timeLimit}, () => {
        // Add Bootstrap class.
        savestatus.className = 'alert alert-success status-alerts';
        savestatus.innerHTML = 'Success! Your changes have been saved.';
        console.log('New timeLimit = ' + timeLimit + ' seconds');

        // Update current time limit in UI.
        document.getElementById('current-limit').innerHTML = displayTime(timeLimit);
    });

    // Flash status alert.    
    setTimeout( () => {
        savestatus.innerHTML = '';
        savestatus.className = '';
    }, 5000);

    // ****************************************************************
    // CSS ANIMATION STUFF
    // console.log('animation play state (before): ' + savestatus.style.animationPlayState);

    // Fade save status out.
    // if (savestatus.style.animationPlayState === 'paused') savestatus.style.animationPlayState = 'running';
    // else savestatus.style.animationPlayState = 'paused';
    // console.log('animation play state (after): ' + savestatus.style.animationPlayState);
    // ****************************************************************

    e.preventDefault();
});

// Disable save button if duration field is empty.
function toggle_save() {
    if (document.getElementById('duration').value === '') {
        document.getElementById('save-button').disabled = true;
    }
    else {
        document.getElementById('save-button').disabled = false;
    }
}

// Remove user's browsing time limit.
document.getElementById('remove-button').addEventListener('click', (e) => {
    let removestatus = document.getElementById('remove-status');    
    chrome.storage.sync.set({'timeLimit': null}, () => {
        // Add Bootstrap class.
        removestatus.className = 'alert alert-info status-alerts';
        removestatus.innerHTML = 'Removed browsing time limit.';
        console.log('Removed browsing time limit.');   
        
        // Update current time limit in UI.
        document.getElementById('current-limit').innerHTML = 'no limit set';
    });    
    // savestatus.style.animationPlayState = 'paused';

    // chrome.storage.sync.set({'timeLimit': null}, () => {
    //     document.getElementById('remove-status').innerHTML = 'Removed browsing time limit.';
    //     console.log('New timeLimit = ' + timeLimit + ' seconds');
    // });

    // Flash status alert.
    // removestatus.innerHTML = 'Removed browsing time limit.';
    setTimeout( () => {
        removestatus.innerHTML = '';
        removestatus.className = '';
    }, 5000);

    // ****************************************************************
    // CSS ANIMATION STUFF
    // console.log('animation play state (before): ' + savestatus.style.animationPlayState);

    // Fade save status out.
    // if (savestatus.style.animationPlayState === 'paused') savestatus.style.animationPlayState = 'running';
    // else savestatus.style.animationPlayState = 'paused';
    // console.log('animation play state (after): ' + savestatus.style.animationPlayState);
    // ****************************************************************

    e.preventDefault();
});

// Allow user to save options on hitting 'enter' in input field.
document.getElementById('duration').addEventListener('keyup', (e) => {
    // Number 13 is the 'Enter' key on the keyboard    
    if (e.keyCode === 13) {
        let timeLimit = document.getElementById('duration').value * 60; // convert from min to sec
        let savestatus = document.getElementById('save-status');        

        chrome.storage.sync.set({'timeLimit': timeLimit}, () => {
            // Add Bootstrap class.
            savestatus.className = 'alert alert-success status-alerts';
            savestatus.innerHTML = 'Success! Your changes have been saved.';
            console.log('New timeLimit = ' + timeLimit + ' seconds');
        });   
        
        // Flash status alert.    
        setTimeout( () => {
            savestatus.innerHTML = '';
            savestatus.className = '';
        }, 5000);
    }
});

// Setup on DOM load.
document.addEventListener('DOMContentLoaded', () => {
    // To work around Chrome's Content Security Policiy, which forbids inline JS.
    document.getElementById('duration').addEventListener('input', toggle_save);

    // Prevent statuses from animating on DOM load.
    // let savestatus = document.getElementById('save-status');
    // savestatus.style.animationPlayState = 'paused';
    // let removestatus = document.getElementById('remove-status');
    // removestatus.style.animationPlayState = 'paused';
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