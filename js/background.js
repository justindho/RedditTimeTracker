console.log('Background.js started.');

chrome.runtime.onInstalled.addListener( () => {    
    // Create time variables in storage.
    chrome.storage.sync.set({'todaySec': 0, 'weekSec': 0, 'monthSec': 0, 'yearSec': 0, 'alltimeSec': 0}, () => {
        console.log('Time variables have been created and stored.');
    });

    // THIS IS HERE FOR TESTING & DEBUGGING PURPOSES ONLY.
    chrome.storage.sync.get(['todaySec', 'weekSec'], (result) => {
        console.log('todaySec = ' + result.todaySec);
        console.log('weekSec = ' + result.weekSec);
    });
});


// Listen for active tab changes.
chrome.tabs.onActivated.addListener( () => {
    console.log('Checking for Reddit tab...');
    // Get URL of current tab.
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        let url = tabs[0].url;
        
        console.log('URL = ' + url);

        ////////////////////////////////////////////////////////////////////////////////
        ////// BUG HERE; ACTIVE TAB LISTENER DOESN'T WORK ONCE WE REACH THIS POINT /////
        ////// HAS SOMETHING TO DO WITH SETINTERVAL() IN THIS FUNCTION /////////////////
        ////////////////////////////////////////////////////////////////////////////////
        // If tab URL is Reddit, start logging times.
        if (url.indexOf('.reddit') != -1) {
            console.log('WERE AT REDDIT!!!');

            // Get time variables from storage.
            chrome.storage.sync.get(['todaySec', 'weekSec', 'monthSec', 'yearSec', 'alltimeSec'], (result) => {
                let todaySec = result.todaySec;
                let weekSec = result.weekSec;
                let monthSec = result.monthSec;
                let yearSec = result.yearSec;
                let alltimeSec = result.alltimeSec;
                console.log('UPDATED TODAYSEC = ' + todaySec);

                // Continuously update time variables while the active tab's URL is Reddit.
                timer = setInterval( () => {
                    console.log("Logging Reddit time...");
                    
                    todaySec++;
                    weekSec++;
                    monthSec++;
                    yearSec++;
                    alltimeSec++;

                    // Update time variables in storage every second.
                    chrome.storage.sync.set({'todaySec': todaySec, 'weekSec': weekSec, 'monthSec': monthSec, 'yearSec': yearSec, 'alltimeSec': alltimeSec}, () => {
                        // clearInterval(timer);
                        console.log('TIME VARIABLES HAVE BEEN UPDATED.');
                        console.log('NEW TODAYSEC = ' + todaySec);
                        console.log('NEW WEEKSEC = ' + weekSec);
                        console.log('NEW MONTHSEC = ' + monthSec);
                        console.log('NEW YEARSEC = ' + yearSec);
                        console.log('NEW ALLTIMESEC = ' + alltimeSec);
                    });
                    

                    // If active tab's URL is no longer Reddit, stop updating time variables.                    
                    // chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
                    //     // Once new page is done loading, check if URL is Reddit.
                    //     if (changeInfo.status === 'complete') {    
                    //         if (tab.url.indexOf('.reddit') == -1) {            
                    //             // console.log('TAB IS NO LONGER REDDIT!!!');

                    //             // // Update time variables in storage and stop tracking time.
                    //             // chrome.storage.sync.set({'todaySec': todaySec, 'weekSec': weekSec, 'monthSec': monthSec, 'yearSec': yearSec, 'alltimeSec': alltimeSec}, () => {
                    //             //     clearInterval(timer);
                    //             //     console.log('TIME VARIABLES HAVE BEEN UPDATED. STOP TIME TRACKING.');
                    //             //     console.log('NEW TODAYSEC = ' + todaySec);
                    //             //     console.log('NEW WEEKSEC = ' + weekSec);
                    //             //     console.log('NEW MONTHSEC = ' + monthSec);
                    //             //     console.log('NEW YEARSEC = ' + yearSec);
                    //             //     console.log('NEW ALLTIMESEC = ' + alltimeSec);
                    //             // });

                    //         }
                    //     }
                    // });


                }, 1000);
            });            
            
            

            
            // while (url.indexOf('reddit.com' != -1)) {
                
            // }

        }
        else {
            clearInterval(timer);
            // console.log('TIMER STOPPED.');
            // console.log('TAB IS NO LONGER REDDIT!!!');

            // // USE LOCAL STORAGE??????
            // localStorage['todaySec'] = todaySec;
            // localStorage.setItem({'todaySec': todaySec, 'weekSec': weekSec, 'monthSec': monthSec, 'yearSec': yearSec, 'alltimeSec': alltimeSec}, () => {
            //     clearInterval(timer);
            //     console.log('TIME VARIABLES HAVE BEEN UPDATED. STOP TIME TRACKING.');
            //     console.log('NEW TODAYSEC = ' + todaySec);
            //     console.log('NEW WEEKSEC = ' + weekSec);
            //     console.log('NEW MONTHSEC = ' + monthSec);
            //     console.log('NEW YEARSEC = ' + yearSec);
            //     console.log('NEW ALLTIMESEC = ' + alltimeSec);
            // });

            // // Update time variables in storage and stop tracking time.
            // chrome.storage.sync.set({'todaySec': todaySec, 'weekSec': weekSec, 'monthSec': monthSec, 'yearSec': yearSec, 'alltimeSec': alltimeSec}, () => {
            //     clearInterval(timer);
            //     console.log('TIME VARIABLES HAVE BEEN UPDATED. STOP TIME TRACKING.');
            //     console.log('NEW TODAYSEC = ' + todaySec);
            //     console.log('NEW WEEKSEC = ' + weekSec);
            //     console.log('NEW MONTHSEC = ' + monthSec);
            //     console.log('NEW YEARSEC = ' + yearSec);
            //     console.log('NEW ALLTIMESEC = ' + alltimeSec);
            // });
        }
    });            

});

function updateTimes() {

};

// Listen for current tab's URL changes.
// chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
//     // Once new page is done loading, check if URL is Reddit.
//     if (changeInfo.status === 'complete') {    
//         if (tab.url.indexOf('.reddit') != -1) {            
//             console.log('Tab changed to REDDIT!!!');

//             // Tell content script to start logging time.

//         }
//     }
// });


chrome.runtime.onMessage.addListener( (response, sender, sendResponse) => {
    // 'response' is whatever response is sent by the contentscript.js
    alert(response);
    // 'sender' holds information about the tab (tab.id, tab info)

    // 'sendReponse' is any response we want to send back to the content scripts 
});






// When there is a tab change
// https://developers.chrome.com/extensions/events
// https://developers.chrome.com/extensions/runtime
// https://developers.chrome.com/extensions/tabs
// https://developers.chrome.com/extensions/webRequest
// https://developers.chrome.com/extensions/webNavigation

    // While the active tab is reddit.com:

        // Get the relevant time variables from storage (todayMin, weekMin, monthMin, yearMin, alltimeMin)
        // https://developers.chrome.com/extensions/storage

        // After each minute, add 1 to each of these variables

    // Store updated time variables in storage
    // https://developers.chrome.com/extensions/storage



// Listen for browser action click
// https://developers.chrome.com/extensions/events

    // Get time variables from local storage
    // https://developers.chrome.com/extensions/storage

    // Pass time variables to popup.js
    // https://developers.chrome.com/extensions/extension