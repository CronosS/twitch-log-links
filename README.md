twitch-log-links
================

Created for [Twitch Plays Pokemon](http://www.twitch.tv/twitchplayspokemon).  
What image is trending? Want to cast your vote for a poll? Lost and need a plan / route?  
This script logs links to imgur, strawpoll and reddit.

![Log-links Preview](http://i.imgur.com/wW4NWNw.png)

This is a companion script for [Twitch chat-filter](https://github.com/jpgohlke/twitch-chat-filter/).  
(due to compatibility issue, chat-filter should be executed first).

_Following instructions are directly copied from **chat-filter** insctructions._

## Using the script as a JavaScript bookmark

Fast and lightweight way to run the script.

1. Go to the bookmark menu of your browser and add a new bookmark with the title of your choice.

2. Copy the following snippet and paste it into the URL-Field: `javascript:(function(){document.body.appendChild(document.createElement('script')).src='http://cronoss.github.io/twitch-log-links/twitch-log-links.js';})();`

3. Save the Bookmark.

4. From now on, you can just click on that bookmark when you have the TPP-Tab open to enable the script.

## Run the script via the console (no extensions needed)

You can also run the script via the developer console. However, you will need to rerun the script every time you refresh the stream.

1. On the TPP stream page, open your broser's developer console.
    * On Firefox, press `Ctrl` + `Shift` + `K`
    * On Chrome, press `Ctrl` + `Shift` + `J`
    * On Safari, press `Ctrl` + `Alt` + `I`
    * On IE9+, press `F12`
    * On Opera, press `Ctrl` + `Shift` + `I`
    * If you are having trouble opening your console, try reading the in depth explanation [here](http://webmasters.stackexchange.com/questions/8525/how-to-open-the-javascript-console-in-different-browsers)

2. Copy the following snippet and paste it into the developer console on the TPP page: `javascript:(function(){document.body.appendChild(document.createElement('script')).src='http://cronoss.github.io/twitch-log-links/twitch-log-links.js';})();`

3. Press `Enter` to run the code.
