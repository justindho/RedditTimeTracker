# RedditTimeTracker [![Add to Chrome](https://i.postimg.cc/YSfs4KPF/add-To-Chrome.png)](https://chrome.google.com/webstore/detail/reddit-time-tracker-monit/kjihonoaammpoioflmhjghkeibmkmmlh?hl=en)

Reddit Time Tracker is a Google Chrome extension that keeps track of how much time you've spent on [reddit.com](www.reddit.com) or [old.reddit.com](old.reddit.com). The extension shows the user how much time he/she has spent on Reddit today, this week, this month, and this year and also shows how this time period's usage compares to the last time period (previous day/week/month/year). 

Note about data usage/storage: If the user has Chrome sync turned on for their Google account, their Reddit usage data will be available in every Chrome browser that they are logged in to. For example, if a user starts using Reddit at their home computer and continues to browse Reddit at work, their Reddit usage statistics at work will continue off of where they left off at the user's home computer. If the user chooses to disable Chrome sync, the extension stores the user's Reddit usage data locally (see the [chrome.storage API](https://developer.chrome.com/apps/storage) for more info). [See how to turn on/off sync in Chrome](https://support.google.com/chrome/answer/185277?hl=en&ref_topic=7439637).

## Visuals
![](/chrome_store_pics/nightmode-on.png?raw=true)
![](/chrome_store_pics/nightmode-off.png?raw=true)
![](/chrome_store_pics/nightmode-on-ex1.png?raw=true)
![](/chrome_store_pics/nightmode-off-ex1.png?raw=true)

## Installation
Install the extension at the [Chrome Extension Store](https://chrome.google.com/webstore/detail/reddit-time-tracker-monit/kjihonoaammpoioflmhjghkeibmkmmlh/related?hl=en&authuser=1)!

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Project Status
Features to add in the future:
1) History: Show each day's Reddit usage.
2) Accountability: Set up groups so that other members in the group are notified when the user has exceeded their alloted Reddit time usage.
3) Subreddit rankings: Show user's top 10 subreddits in terms of time spent. 
4) Comparisons: Compare user's average daily/weekly/monthly/yearly time spent on Reddit vs all other Reddit Time Tracker users.
5) Data Visualization: Show user his/her Reddit usage in a graphical form.

## FAQ
**Q: How does Reddit Time Tracker use my data?**<br/>
A: If a user has sync enabled in their Google account, their Reddit usage data will be synced with their Google account and will be available to them any time they login to their Google account, no matter which computer they use. If a user has Chrome sync disabled, all usage data will be stored locally on a user's computer.

**Q: Will I need to pay for Reddit Time Tracker at any point in the future?**<br/>
A: No. Reddit Time Tracker will be free throughout its lifespan. This tool is meant to help users better understand their Reddit usage.

**Q: The time trends aren't showing up in the popup window for me. How do I get them to show up?**<br/>
A: The time trends aren't showing up yet because there is no previous data to compare your current usage metrics against at the moment. For example, if you didn't use Reddit Time Tracker yesterday, then your metrics for today won't be able to show a percent increase. The same goes for weekly, monthly, and yearly metrics and usage trends.