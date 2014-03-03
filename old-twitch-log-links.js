/*!
 * twitch-log-links v1.4
 * https://github.com/CronosS/twitch-log-links/
 *
 * This is a companion script for twitch-chat-filter
 * (due to compatibility issue, chat-filter should be executed first)
 * https://github.com/jpgohlke/twitch-chat-filter/
 *
 * Date: 2014-03-01
 * For old Twitch chat
 */

(function (CurrentChat) {
    'use strict';

    // --- Configuration ---

    var NB_LINKS_MAX = 50,
        NB_MEDIUM_OCCURENCE = 25,
        NB_HIGH_OCCURENCE = 50,
        BLOCKED_WORDS = [
            'free helix'
        ],
        SAVE_URL_FROM = [{
            name: 'strawpoll',
            checked: true
        }, {
            name: 'imgur',
            checked: true
        }, {
            name: 'reddit',
            checked: true
        }];

    // --- Helper functions ---

    function addStyle(css) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));

        document.head.appendChild(style);
    }

    function isMessageSpam(message) {
        for (var i = 0; i < BLOCKED_WORDS.length; i++) {
            if (message.indexOf(BLOCKED_WORDS[i]) !== -1) {
                return true;
            }
        }

        return false;
    }

    function getUrlForRegex() {
        return SAVE_URL_FROM.map(function (savedUrl) {
            return savedUrl.name;
        }).join('|');
    }

    function getMessageUrl(message) {
        var matchUrl = getUrlForRegex(),
            re = new RegExp('((?:(?:www|i)\\.)?(' + matchUrl + ')\\.[\\w.\\/@?&%#(),\\-+=;]+)(?=http|$|\\s)', 'i'),
            matches = message.match(re);

        if (matches && isMessageSpam(message)) {
            return false;
        }

        return matches;
    }

    function getBaseUrl(url) {
        var matchUrl = getUrlForRegex(),
            re = new RegExp('((?:' + matchUrl + ')\\.[\\w.\\/@?&%#(),\\-+=;]+)(?=(?:\\.png|\\.jpg|\\.gif|\\/r|\\/)(?:\\?[\\d]+)?$)', 'i'),
            matches = url.match(re);

        if (matches) {
            return matches[1];
        }

        return url;
    }

    function aPlanClicked() {
        panelPlan.style.display = (panelPlan.style.display !== 'none' ? 'none' : 'block');
        fixChatHeight();
    }

    function inputSourceClicked(e) {
        var self = e.target;
        if (self && self.nodeName === 'INPUT') {
            containerLinks.classList.toggle('hide_' + self.dataset.source, !self.checked);
            fixChatHeight();
        }
    }

    function fixChatHeight() {
        var tppFilterButton = document.querySelector('#chat_filter_dropmenu');
        if (tppFilterButton) {
            tppFilterButton.style.bottom = controlPanel.offsetHeight - 65 + 'px';
        }

        document.querySelector('#twitch_chat > div.js-chat-scroll').style.bottom = controlPanel.offsetHeight + 'px';
    }

    // --- UI ---

        // Get existing elements for further manipulation.
    var controlPanel = document.getElementById('controls'),
        controlButtons = document.getElementById('control_buttons'),
        chatSpeak = document.getElementById('chat_speak'),

        // Create our own elements to insert.
        aPlan = document.createElement('a'),
        panelPlan = document.createElement('div'),
        containerLinks = document.createElement('ol'),

        inputPlan = '',
        cssPlan = [],
        cssLinks = [],
        extraCss =
            '#containerLinks a{max-width: 200px; text-overflow: ellipsis; display: inline-block; overflow: hidden; vertical-align: middle; white-space: nowrap;}' +
            '#containerLinks span{background: #DDDDDD; color: #797979; display: inline-block; line-height: 15px; font-size: 11px; font-family: consolas, "Lucida Console", monospace; padding: 0 2px 0 5px;}' +
            '#containerLinks:empty:after{content: "There\'s currently no saved link."; font-style: italic; color: #999}';

    SAVE_URL_FROM.forEach(function (savedUrl) {
        cssLinks.push('#containerLinks.hide_' + savedUrl.name + ' .tppLink' + savedUrl.name);
    });

    extraCss += cssLinks.join(', ') + '{display: none !important;}';
    addStyle(extraCss);

    // Create the toggle panel button.
    aPlan.className = 'dropdown_static';
    aPlan.innerHTML = '<span>Plan</span>';
    chatSpeak.style.width = '80px';
    controlButtons.insertBefore(aPlan, chatSpeak);
    aPlan.addEventListener('click', aPlanClicked);

    // Create the panel.
    SAVE_URL_FROM.forEach(function (savedUrl) {
        var checked = savedUrl.checked ? ' checked' : '';
        inputPlan += '<span style="margin-right: 10px;"><input data-source="' + savedUrl.name + '" type="checkbox"' + checked + '> ' + savedUrl.name + '</span>';
        if (!savedUrl.checked) {
            cssPlan.push('hide_' + savedUrl.name);
        }
    });

    panelPlan.innerHTML = '<div style="border-bottom: 1px solid rgba(0,0,0,0.25); text-transform: capitalize;">' + inputPlan + '</div>';
    controlPanel.appendChild(panelPlan);
    panelPlan.addEventListener('click', inputSourceClicked, false);

    // Create the links zone.
    containerLinks.id = 'containerLinks';
    containerLinks.reversed = true;
    containerLinks.style.cssText = 'max-height: 150px; overflow: hidden; overflow-y: scroll; list-style-type : decimal-leading-zero;';
    containerLinks.className = cssPlan.join(' ');
    panelPlan.appendChild(containerLinks);

    // Fix the height of the chat.
    fixChatHeight();

    // --- Main ---

    var links = {},
        original_insert_chat_line = CurrentChat.insert_chat_line;

    CurrentChat.insert_chat_line = function (info) {
        original_insert_chat_line.apply(this, arguments);

        // Check in each message if there's a link to keep.
        var messageUrl = getMessageUrl(info.message);

        if (messageUrl) {
            var url = messageUrl[1],
                source = messageUrl[2],
                baseUrl = getBaseUrl(url);

            // If the link is new, we add it to the list.
            if (typeof links[baseUrl] === 'undefined') {
                var link = document.createElement('li');
                link.className = 'tppLink' + source;
                link.innerHTML = '<a href="http://' + url + '" target="_blank">' + url + '</a><span></span>';

                links[baseUrl] = {
                    nbOcc: 1,
                    link: link
                };

                // We keep only a reasonnable number of links.
                if (containerLinks.childElementCount >= NB_LINKS_MAX) {
                    delete links[getBaseUrl(containerLinks.lastChild.querySelector('a').href)];
                    containerLinks.removeChild(containerLinks.lastChild);
                }
            }
            // Else, we just increment its number of occurences (and actualize the displayed url).
            else {
                var specialStyle = '';
                links[baseUrl].nbOcc++;

                if(links[baseUrl].nbOcc >= NB_MEDIUM_OCCURENCE) {
                    specialStyle = ' style="color: #2BA6EB;"';
                }
                if (links[baseUrl].nbOcc >= NB_HIGH_OCCURENCE) {
                    specialStyle = ' style="color: #FF386F;"';
                }

                links[baseUrl].link.innerHTML = '<a href="http://' + url + '" target="_blank">' + url + '</a> <span'+ specialStyle +'>' + links[baseUrl].nbOcc + '</span>';
            }

            // If the node already exists it is removed from current parent node, then added to new parent node.
            // This way, the link is pushed to the top of the list in either case.
            containerLinks.insertBefore(links[baseUrl].link, containerLinks.firstChild);

            // With less than 10 links, the control panel will expand and reduce the chat height.
            if (containerLinks.start < 10) {
                fixChatHeight();
            }
        }
    };
}(window.CurrentChat));
