// Route user to options page upon clicking the 'update' button.
document.getElementById('update-button').addEventListener('click', () => {
    let optionsURL = chrome.runtime.getURL('../templates/options.html');
    chrome.runtime.sendMessage({redirect: optionsURL}, () => {
        console.log('Rerouting to options page ...');
    });
});