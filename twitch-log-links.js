/*!
 * twitch-log-links v1.6
 * Only for new Twitch chat
 * https://github.com/CronosS/twitch-log-links/
 *
 * This is a companion script for twitch-chat-filter
 * (due to compatibility issue, chat-filter should be executed first)
 * https://github.com/jpgohlke/twitch-chat-filter/
 *
 * Date: 2014-03-05
 * Resizable UI
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
            '1246655',
            '1251114',
            '1251238'
        ],
        SAVE_URL_FROM = [
        {
            name: 'strawpoll',
            checked: true
        }, {
            name: 'imgur',
            checked: true
        }, {
            name: 'reddit',
            checked: true
        }
        ];

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

    function fixChatHeight() {
        chatPanel.style.bottom = mainPanel.clientHeight + 'px';
    }

    // Event Handlers

    function toggleButtonClicked() {
        mainPanel.style.display = (mainPanel.style.display !== 'none' ? 'none' : 'block');
        fixChatHeight();
    }

    function inputCheckboxesClicked(e) {
        var self = e.target;
        if (self && self.nodeName === 'INPUT') {
            containerLinks.classList.toggle('hide_' + self.dataset.source, !self.checked);
            fixChatHeight();
        }
    }

    function resizeHandleMoved(e){
        var newHeight = document.documentElement.clientHeight - e.clientY;
        e.preventDefault();
        if(newHeight >= optionCheckboxes.clientHeight && e.clientY >= 161){
            chatPanel.style.bottom = newHeight + 'px';
            containerLinks.style.height = newHeight - optionCheckboxes.clientHeight + 'px';
        }
    }

    function resizeHandleDown(){
        if (containerLinks.style.maxHeight !== 'none') {
            containerLinks.style.maxHeight = 'none';
        }
        
        document.addEventListener('mouseup', resizeHandleUp);
        document.addEventListener('mousemove', resizeHandleMoved);
    }

    function resizeHandleUp(){
        document.removeEventListener('mousemove', resizeHandleMoved);
        document.removeEventListener('mouseup', resizeHandleUp);
    }

    // --- UI ---

        // Get existing elements for further manipulation.
    var chatPanel = document.getElementById('chat'),
        optionButtons = document.querySelector('.chat-option-buttons'),
        chatButton = document.querySelector('.send-chat-button'),

        // Create our own elements to insert.
        toggleButton = document.createElement('button'),
        mainPanel = document.createElement('div'),
        optionCheckboxes = document.createElement('div'),
        containerLinks = document.createElement('ol'),
        resizeHandle = document.createElement('div'),

        inputCheckboxes = '',
        cssOption = [],
        cssLinks = [],
        extraCss =
            '#tll-container-links li{background-color: #e3e3e3; margin-left: 20px; border-left: 1px solid rgba(0, 0, 0, 0.25); list-style-position: outside;}' +
            '#tll-container-links a{text-indent: 5px; max-width: 200px; text-overflow: ellipsis; display: inline-block; overflow: hidden; vertical-align: middle; white-space: nowrap;}' +
            '#tll-container-links span{background: #ddd; display: inline-block; line-height: 15px; font-family: consolas, "Lucida Console", monospace; padding: 0 2px 0 5px;}' +
            '#tll-container-links:empty:after{content: "There\'s currently no saved link."; font-style: italic; color: #999}' +
            '#tll-resize-handle{position: absolute; width: 100%; height: 5px; cursor: ns-resize;}';

    SAVE_URL_FROM.forEach(function (savedUrl) {
        var checked = savedUrl.checked ? ' checked' : '';

        cssLinks.push('#tll-container-links.hide_' + savedUrl.name + ' .tll-link-' + savedUrl.name);
        inputCheckboxes += '<span style="margin-right: 10px;"><input data-source="' + savedUrl.name + '" type="checkbox" style="vertical-align: text-top;"' + checked + '> ' + savedUrl.name + '</span>';

        if (!savedUrl.checked) {
            cssOption.push('hide_' + savedUrl.name);
        }
    });

    extraCss += cssLinks.join(', ') + '{display: none !important;}';
    addStyle(extraCss);

    // Create the toggle panel button.
    toggleButton.className = 'button-simple light tooltip';
    toggleButton.setAttribute('original-title', 'Links / Plans');
    toggleButton.style.cssText = 'margin-left: 2px; background-image: url("http://i.imgur.com/SWB6nFF.png");';
    chatButton.style.left = '120px';
    optionButtons.insertBefore(toggleButton, optionButtons.lastChild.nextSibling);
    toggleButton.addEventListener('click', toggleButtonClicked);

    // Create the resize handle.
    resizeHandle.id = 'tll-resize-handle';
    resizeHandle.addEventListener('mousedown', resizeHandleDown);

    // Create the option panel.
    optionCheckboxes.id = 'tll-options-checkboxes';
    optionCheckboxes.style.cssText = 'color: #606161; background: #c9c9c9; padding: 10px; font-size: 10px; text-transform: uppercase; font-weight: bold;'
    optionCheckboxes.innerHTML = inputCheckboxes;

    // Create the links zone.
    containerLinks.id = 'tll-container-links';
    containerLinks.reversed = true;
    containerLinks.style.cssText = 'max-height: 150px; overflow: hidden; overflow-y: scroll; list-style-type : decimal-leading-zero; padding-left: 10px; background-color: #dadada; color: #797979; font-size: 11px;';
    containerLinks.className = cssOption.join(' ');

    // Create the main panel.
    mainPanel.id = 'tll-main-panel';
    mainPanel.style.cssText = 'position: absolute; bottom: 0px; width: 100%;';
    mainPanel.appendChild(resizeHandle);
    mainPanel.appendChild(optionCheckboxes);
    mainPanel.appendChild(containerLinks);
    chatPanel.parentNode.appendChild(mainPanel);
    mainPanel.addEventListener('click', inputCheckboxesClicked, false);

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
                link.className = 'tll-link-' + source;
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
