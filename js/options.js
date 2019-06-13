// Save user options to Chrome storage.
function save_options(e) {
    let timeLimit = document.getElementById('duration').value;
    let savestatus = document.getElementById('save-status');
    // savestatus.style.animationPlayState = 'paused';

    chrome.storage.sync.set({'timeLimit': timeLimit});
    console.log('animation play state (before): ' + savestatus.style.animationPlayState);

    // Fade save status in and out.   
    // savestatus.classList.add('animate1');
    // setTimeout( () => {
    //     savestatus.classList.remove('animate1');
    // }, 5000);
    // if (savestatus.className = 'animate1') savestatus.className = 'animate2';
    // else savestatus.className = 'animate1';
    if (savestatus.style.animationPlayState === 'paused') savestatus.style.animationPlayState = 'running';
    else savestatus.style.animationPlayState = 'paused';    
    console.log('animation play state (after): ' + savestatus.style.animationPlayState);

    e.preventDefault();
}

// Disable save button if duration field is empty.
function toggle_save() {
    if (document.getElementById('duration').value === '') {
        document.getElementById('save-button').disabled = true;
    }
    else { 
        document.getElementById('save-button').disabled = false;
    }    
}

// Listen for user save action.
document.getElementById('save-button').addEventListener('click', save_options, false);
// document.getElementById('form-save').addEventListener('submit', save_options);

// Allow user to save options on hitting 'enter' in input field.
document.getElementById('duration').addEventListener('keyup', (e) => {
    // Number 13 is the 'Enter' key on the keyboard
    // if (e.keyCode === 13) document.getElementById('save-button').click();    
    if (e.keyCode === 13) alert('Time is up.');
});


document.addEventListener('DOMContentLoaded', () => {
    // To work around Chrome's Content Security Policiy, which forbids inline JS.
    document.getElementById('duration').addEventListener('input', toggle_save);

    // Prevent save status from animating on DOM load.
    let savestatus = document.getElementById('save-status');
    savestatus.style.animationPlayState = 'paused';
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