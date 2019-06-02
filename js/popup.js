// Create port with background.js.
let port = chrome.runtime.connect({
    name: 'updatePopupHTML'
});

// Request background.js to retrieve time variables from storage.
chrome.extension.getBackgroundPage().console.log('Before requesting time variables...');
port.postMessage({msg: 'Request time variables.'});

// Update popup.html with time variables from storage.
port.onMessage.addListener( (msg) => {
    chrome.extension.getBackgroundPage().console.log('IN POPUP IN POPUP IN POPUP IN POPUP IN POPUP IN POPUP IN POPUP IN POPUP');    
    document.getElementById('todayMin').innerText = msg.todaySec / 60;
    document.getElementById('weekMin').innerText = msg.weekSec / 60;
    document.getElementById('monthMin').innerText = msg.monthSec / 60;
    document.getElementById('yearMin').innerText = msg.yearSec / 60;
    document.getElementById('alltimeMin').innerText = msg.alltimeSec / 60;
});

