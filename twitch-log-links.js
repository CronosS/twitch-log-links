/*!
 * twitch-log-links v1.5.2
 * https://gist.github.com/CronosS/9208495/
 *
 * This is a companion script for twitch-chat-filter
 * (due to compatibility issue, chat_filter should be executed first)
 * https://github.com/jpgohlke/twitch-chat-filter/
 *
 * Date: 2014-03-03
 * Updated for new Twitch chat
 */

(function (Chat) {
    'use strict';

    // --- Configuration ---

    var NB_LINKS_MAX = 50,
        NB_MEDIUM_OCCURENCE = 25,
        NB_HIGH_OCCURENCE = 50,
        NB_VERRY_HIGH_OCCURENCE = 100,
        BLOCKED_WORDS = [
            'free helix',
            'strawpoll.me/1246655'
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

    function buttonPlanClicked() {
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
        panelChat.style.bottom = panelPlan.clientHeight + 'px';
    }

    // --- UI ---

        // Get existing elements for further manipulation.
    var panelChat = document.getElementById('chat'),
        controlButtons = document.querySelector('.chat-option-buttons'),
        chatSpeak = document.querySelector('.send-chat-button'),

        // Create our own elements to insert.
        buttonPlan = document.createElement('button'),
        panelPlan = document.createElement('div'),
        containerLinks = document.createElement('ol'),

        inputPlan = '',
        cssPlan = [],
        cssLinks = [],
        extraCss =
            '#containerLinks li{background-color: #e3e3e3; margin-left: 20px; border-left: 1px solid rgba(0, 0, 0, 0.25); list-style-position: outside;}' +
            '#containerLinks a{text-indent: 5px; max-width: 200px; text-overflow: ellipsis; display: inline-block; overflow: hidden; vertical-align: middle; white-space: nowrap;}' +
            '#containerLinks span{background: #ddd; display: inline-block; line-height: 15px; font-family: consolas, "Lucida Console", monospace; padding: 0 2px 0 5px;}' +
            '#containerLinks:empty:after{content: "There\'s currently no saved link."; font-style: italic; color: #999}';

    SAVE_URL_FROM.forEach(function (savedUrl) {
        cssLinks.push('#containerLinks.hide_' + savedUrl.name + ' .tppLink_' + savedUrl.name);
    });

    extraCss += cssLinks.join(', ') + '{display: none !important;}';
    addStyle(extraCss);

    // Create the toggle panel button.
    buttonPlan.className = 'button-simple light tooltip';
    buttonPlan.setAttribute('original-title', 'Links / Plans');
    buttonPlan.style.cssText = 'margin-left: 2px; background-image: url("http://i.imgur.com/SWB6nFF.png");';
    chatSpeak.style.left = '120px';
    controlButtons.insertBefore(buttonPlan, controlButtons.lastChild.nextSibling);
    buttonPlan.addEventListener('click', buttonPlanClicked);

    // Create the panel.
    SAVE_URL_FROM.forEach(function (savedUrl) {
        var checked = savedUrl.checked ? ' checked' : '';
        inputPlan += '<span style="margin-right: 10px;"><input data-source="' + savedUrl.name + '" type="checkbox" style="vertical-align: text-top;"' + checked + '> ' + savedUrl.name + '</span>';
        if (!savedUrl.checked) {
            cssPlan.push('hide_' + savedUrl.name);
        }
    });

    panelPlan.style.cssText = 'position: absolute; bottom: 0px; width: 100%;';
    panelPlan.innerHTML = '<div style="color: #606161; background: #c9c9c9; padding: 10px; font-size: 10px; text-transform: uppercase; font-weight: bold;">' + inputPlan + '</div>';
    panelChat.parentNode.appendChild(panelPlan);
    panelPlan.addEventListener('click', inputSourceClicked, false);

    // Create the links zone.
    containerLinks.id = 'containerLinks';
    containerLinks.reversed = true;
    containerLinks.style.cssText = 'max-height: 150px; overflow: hidden; overflow-y: scroll; list-style-type : decimal-leading-zero; padding-left: 10px; background-color: #dadada; color: #797979; font-size: 11px;';
    containerLinks.className = cssPlan.join(' ');
    panelPlan.appendChild(containerLinks);

    // Fix the height of the chat.
    fixChatHeight();

    // --- Main ---

    var links = {},
        originalAddMessage = Chat.addMessage;

     Chat.addMessage = function (info) {
        originalAddMessage.apply(this, arguments);

        // Check in each message if there's a link to keep.
        var messageUrl = getMessageUrl(info.message);

        if (messageUrl) {
            var url = messageUrl[1],
                source = messageUrl[2],
                baseUrl = getBaseUrl(url);

            // If the link is new, we add it to the list.
            if (typeof links[baseUrl] === 'undefined') {
                var link = document.createElement('li');
                link.className = 'tppLink_' + source;
                link.innerHTML = '<a href="http://' + url + '" data-base-url="' + baseUrl + '" target="_blank">' + url + '</a><span></span>';

                links[baseUrl] = {
                    nbOcc: 1,
                    style: '#797979',
                    link: link
                };

                // We keep only a reasonnable number of links.
                if (containerLinks.childElementCount === NB_LINKS_MAX) {
                    delete links[containerLinks.lastChild.querySelector('a').dataset.baseUrl];
                    containerLinks.removeChild(containerLinks.lastChild);
                }
            }
            // Else, we just increment its number of occurences (and actualize the displayed url).
            else {
                links[baseUrl].nbOcc++;

                switch (links[baseUrl].nbOcc){
                    case NB_MEDIUM_OCCURENCE: links[baseUrl].style = '#2BA6EB'; break;
                    case NB_HIGH_OCCURENCE: links[baseUrl].style = '#FF386F'; break;
                    case NB_VERRY_HIGH_OCCURENCE: links[baseUrl].style = '#FFF; background-color: #50C700'; break;
                }

                links[baseUrl].link.innerHTML = '<a href="http://' + url + '" data-base-url="' + baseUrl + '" target="_blank">' + url + '</a> <span style="color: ' + links[baseUrl].style + '">' + links[baseUrl].nbOcc + '</span>';
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
}(window.App.Room.prototype));
