// Save user options to Chrome storage.
document.getElementById('save-button').addEventListener('click', (e) => {
    let timeLimit = document.getElementById('duration').value * 60; // convert from min to sec
    let savestatus = document.getElementById('save-status');
    // savestatus.style.animationPlayState = 'paused';

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
    // if (e.keyCode === 13) document.getElementById('save-button').click();
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

function play() {
    let savestatus = document.getElementById('save-status');
    savestatus.className = '';
    window.requestAnimationFrame( time => {
        window.requestAnimationFrame( time => {
            savestatus.className = 'animate';
        })
    })
}