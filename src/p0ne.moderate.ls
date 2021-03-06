/**
 * plug_p0ne modules to help moderators do their job
 *
 * @author jtbrinkmann aka. Brinkie Pie
 * @license MIT License
 * @copyright (c) 2015 J.-T. Brinkmann
 */
console.log "~~~~~~~ p0ne.moderate ~~~~~~~"

/*####################################
#       BASE MODERATION MODULE       #
####################################*/
module \enableModeratorModules, do
    require: <[ user_ ]>
    setup: ({addListener}) !->
        prevRole = user_.get \role
        $body.addClass \user-is-staff if user.isStaff

        addListener user_, \change:role, (user_, newRole) !->
            console.log "[p0ne] change:role from #prevRole to #newRole"
            if newRole > 1 and prevRole < 2
                console.info "[p0ne] enabling moderator modules"
                for ,m of p0ne.modules when m.modDisabled
                    console.log "[p0ne moderator] enabling", m.moduleName
                    m.enable!
                    m.modDisabled = false
                $body.addClass \user-is-staff
                user_.isStaff = true
            else if newRole < 2 and prevRole > 1
                console.info "[p0ne] disabling moderator modules"
                for ,m of p0ne.modules when m.moderator    and not m.disabled
                    console.log "[p0ne moderator] disabling", m.moduleName
                    m.modDisabled = true
                    m.disable!
                $body.removeClass \user-is-staff
                user_.isStaff = false
            prevRole := newRole
    disable: !->
        $body.removeClass \user-is-staff



/*####################################
#       WARN ON HISTORY PLAYS        #
####################################*/
module \warnOnHistory, do
    displayName: 'Warn on History'
    moderator: true
    settings: \moderation
    settingsSimple: true
    setup: ({addListener}) !->
        addListener API, \advance, (d) !~> if d.media
            hist = API.getHistory!
            inHistory = 0; skipped = 0
            # note: the CIDs of YT and SC songs should not be able to cause conflicts
            for m, i in hist when m.media.cid == d.media.cid and i != 0
                lastPlayI ||= i
                lastPlay ||= m
                inHistory++
                skipped++ if m.skipped
            if inHistory
                msg = ""
                if inHistory > 1
                    msg += "#{inHistory}x "
                msg += "(#{lastPlayI + 1}/#{hist.length - 1}) "
                if skipped == inHistory
                    msg += "but was skipped last time "
                if skipped > 1
                    msg += "it was skipped #skipped/#inHistory times "
                chatWarn msg, 'Song is in History'
                API.trigger \p0ne:songInHistory


/*####################################
#      DISABLE MESSAGE DELETE        #
####################################*/
module \disableChatDelete, do
    require: <[ _$context user_ chat ]>
    optional: <[ socketListeners ]>
    moderator: true
    displayName: 'Show deleted messages'
    settings: \moderation
    settingsSimple: true
    setup: ({replace_$Listener, addListener, $createPersistent, css}) !->
        $body .addClass \p0ne-showDeletedMessages

        lastDeletedCid = null
        addListener _$context, \socket:chatDelete, ({{c,mi}:p}) !->
            markAsDeleted(c, users.get(mi)?.get(\username) || mi)
            lastDeletedCid := c
        #addListener \early, _$context, \chat:delete, !-> return (cid) !->
        replace_$Listener \chat:delete, chat, !-> return (cid) !->
            markAsDeleted(cid) if cid != lastDeletedCid

        function markAsDeleted cid, moderator
            if chat?.lastText?.hasClass "cid-#cid"
                $msg = chat.lastText .parent!.parent!
                isLast = true
            else
                $msg = getChat cid
            console.log "[Chat Delete]", cid, $msg.text!
            t  = getISOTime!
            try
                uid = cid.split(\-)?.0
                $msg .addClass \deleted if cid == uid or not getUser(uid)?.gRole
                d = $createPersistent getTimestamp!
                    .addClass \delete-timestamp
                    .removeClass \timestamp
                    .appendTo $msg
                d .text "deleted #{if moderator then 'by '+moderator else ''} #{d.text!}"
                $cm = get$cm!
                $cm.scrollTop $cm.scrollTop! + d.height!
                $msg .find \.delete-button .remove! # remove delete button

                # revert inline images
                $msg .find '.p0ne-img' .each !->
                    $a = $ this .parent!
                    $a .html $a.attr(\href)

                if isLast
                    chat.lastType = \p0ne-deleted

    disable: !->
        $body .removeClass \p0ne-showDeletedMessages


/*####################################
#         DELETE OWN MESSAGES        #
####################################*/
module \chatDeleteOwnMessages, do
    moderator: true
    #displayName: 'Delete Own Messages'
    #settings: \moderation
    settingsSimple: true
    setup: ({addListener}) !->
        get$cm! .find "fromID-#{userID}"
            .addClass \deletable
            .append do
                $ '<div class="delete-button">Delete</div>'
                    .click delCb
        addListener API, \chat, ({cid, uid}:message) !-> if uid == userID
            getChat(cid)
                .addClass \deletable
                .append do
                    $ '<div class="delete-button">Delete</div>'
                        .click delCb
        function delCb
            $ this .closest \.cm .data \cid |> API.moderateDeleteChat


/*####################################
#            WARN ON MEHER           #
####################################*/
module \warnOnMehers, do
    users: {}
    moderator: true
    displayName: 'Warn on Mehers'
    settings: \moderation
    settingsSimple: true
    _settings:
        instantWarn: false
        maxMehs: 3
    setup: ({addListener},, m_) !->
        if m_
            @users = m_.users
        users = @users

        current = {}
        addListener API, \voteUpdate, (d) !~>
            current[d.user.id] = d.vote
            if d.vote == -1 and d.user.uid != userID
                console.log "%c#{formatUser d.user, true} meh'd this song", 'color: #ff5a5a'
                if @_settings.instantWarn
                    chatWarnSmall \p0ne-meh-warning, "#{formatUserHTML d.user, true} meh'd this song!", true

        lastAdvance = 0
        addListener API, \advance, (d) !~>
            d = Date.now!
            for cid,v of current
                if v == -1
                    users[cid] ||= 0
                    if ++users[cid] > @_settings.maxMehs and troll = getUser(cid)
                        # note: the user (`troll`) may have left during this song
                        chatWarnSmall \p0ne-meh-warning, "#{formatUserHTML troll} meh'd the past #{plural users[cid], 'song'}!", true
                else if d > lastAdvance + 10_000ms
                    delete users[cid]
            if d > lastAdvance + 10_000ms
                for {cid} in API.getUsers! when not current[cid] and d.lastPlay?.dj.id != cid
                    delete users[cid]
            current := {}
            lastAdvance := d

    settingsExtra: ($el) !->
        warnOnMehers = this
        var resetTimer
        $ "
            <form>
                <label>
                    <input type=radio name=max-mehs value=on #{if @_settings.instantWarn then \checked else ''}> alert instantly
                </label><br>
                <label>
                    <input type=radio name=max-mehs value=off #{if @_settings.instantWarn then '' else \checked}> alert after <input type=number value='#{@_settings.maxMehs}' class='p0ne-settings-input max-mehs'> consequitive mehs
                </label>
            </form>"
            .append do
                $warning = $ '<div class=warning>'
            .on \click, \input:radio, !->
                if @checked
                    warnOnMehers._settings.instantWarn = (@value == \on)
                    console.log "#{getTime!} [warnOnMehers] updated instantWarn to #{warnOnMehers._settings.instantWarn}"
            .on \input, \.max-mehs, !->
                val = ~~@value # note: invalid numbers (NaN) get floored to 0
                if val > 1
                    warnOnMehers._settings.maxMehs = val
                    if resetTimer
                        $warning .fadeOut!
                        clearTimeout resetTimer
                        resetTimer := 0
                    if warnOnMehers._settings.instantWarn
                        $ this .parent! .click!
                    console.log "#{getTime!} [warnOnMehers] updated maxMehs to #val"
                else
                    $warning
                        .fadeIn!
                        .text "please enter a valid number >1"
                    resetTimer := sleep 2.min, !~>
                        @value = warnOnMehers._settings.maxMehs
                        resetTimer := 0
                    console.warn "#{getTime!} [warnOnMehers] invalid input for maxMehs", @value
            .appendTo $el
        $el .css do
            paddingLeft: 15px


/*####################################
#              AFK TIMER             #
####################################*/
module \afkTimer, do
    require: <[ RoomUserRow WaitlistRow ]>
    optional: <[ socketListeners app userList _$context ]>
    moderator: true
    settings: \moderation
    settingsSimple: true
    displayName: "Show Idle Time"
    help: '''
        This module shows how long since users have last been by adding a timer to the User- and Waitlist-Panel.
        It also adds the number of inactive users in the waitlist to the waitlist button. (updated every minute)
        "Being active" means sending chat, changing your name, gifting someone, grabbing or doing moderator things.
    '''
    _settings:
        lastActivity: {} # this is for caching, not meant to be an actual setting
        highlightOver: 43.min

    setup: ({addListener, $create, replace},, m_) !->
        # initialize users
        settings = @_settings
        start = Date.now!
        if m_
            @start = m_.start
            lastActivity = m_._settings.lastActivity ||{}
        else
            @start = start
            if @_settings.lastActivity?.0 + 60_000ms > Date.now!
                lastActivity = @_settings.lastActivity
            else
                lastActivity = {}
        @lastActivity = lastActivity

        for user in API.getUsers!
            lastActivity[user.id] ||= start
        start = @start


        $waitlistBtn = $ \#waitlist-button
            .append $afkCount = $create '<div class=p0ne-toolbar-count>'

        # set up event listeners to update the lastActivity time
        addListener API, 'socket:skip socket:grab', (id) !-> updateUser id
        addListener API, 'userJoin socket:nameChanged', (u) !-> updateUser u.id
        addListener API, 'chat', (u) !->
            if not /\[afk\]/i.test(u.message)
                updateUser u.uid
        addListener API, 'socket:gifted', (e) !-> updateUser e.s/*ender*/
        addListener API, 'socket:modAddDJ socket:modBan socket:modMoveDJ socket:modRemoveDJ socket:modSkip socket:modStaff', (u) !-> updateUser u.mi
        addListener API, 'userLeave', (u) !-> delete lastActivity[u.id]

        chatHidden = get$cm!.parent!.css(\display) == \none
        if _$context? and (app? or userList?)
            addListener _$context, 'show:users show:waitlist', !->
                chatHidden := true
            addListener _$context, \show:chat, !->
                chatHidden := false

        # regularly update the AFK list / count
        lastAfkCount = 0
        @timer = repeat 60_000ms, updateAfkCount=!->
            if chatHidden
                forceRerender!
            else
                # update AFK user count
                afkCount = 0
                d = Date.now!
                usersToCheck = API.getWaitList!
                usersToCheck[*] = that if API.getDJ!
                for u in usersToCheck when d - lastActivity[u.id] > settings.highlightOver
                    afkCount++
                #console.log "[afkTimer] afkCount", afkCount
                if afkCount != lastAfkCount
                    if afkCount
                        #$waitlistBtn .addClass \p0ne-toolbar-highlight if lastAfkCount == 0
                        $afkCount .text afkCount
                    else
                        #$waitlistBtn .removeClass \p0ne-toolbar-highlight
                        $afkCount .clear!
                    lastAfkCount := afkCount
        addListener API, \waitListUpdate, updateAfkCount
        updateAfkCount!

        # UI
        d = 0
        var noActivityYet
        for Constr, fn in [RoomUserRow, WaitlistRow]
            replace Constr::, \render, (r_) !-> return (isUpdate) !->
                r_ ...
                if not d
                    d := Date.now!
                    <-! requestAnimationFrame
                    d := 0; noActivityYet := null
                ago = d - lastActivity[@model.id]
                if lastActivity[@model.id] <= start
                    if ago < 120_000ms
                        time = noActivityYet ||= "? "
                    else
                        time = noActivityYet ||= ">#{humanTime(ago, true)}"
                else if ago < 60_000ms
                    time = "<1m"
                else if ago < 120_000ms
                    time = "<2m"
                else
                    time = humanTime(ago, true)

                if @$afk
                    @$afk .removeClass 'p0ne-last-activity-warn'
                else
                    @$afk = $ '<span class=p0ne-last-activity>'
                        .appendTo @$el
                @$afk .text time
                @$afk .addClass \p0ne-last-activity-warn if ago > settings.highlightOver
                @$afk .p0neFx \blink if isUpdate



        function updateUser uid
            if Date.now! - lastActivity[uid] > settings.highlightOver
                updateAfkCount!
            lastActivity.0 = lastActivity[uid] = Date.now!
            # waitlist.rows defaults to [], so no need to ||[]
            for r in userList?.listView?.rows || app?.room.waitlist.rows when r.model.id == uid
                r.render true

        # update current rows (it should not be possible, that the waitlist and userlist are populated at the same time)
        function forceRerender
            for r in app?.room.waitlist.rows || userList?.listView?.rows ||[]
                r.render false

        forceRerender!

    disable: !->
        clearInterval @timer
        $ \#waitlist-button
            .removeClass \p0ne-toolbar-highlight
        #$ '.app-right .p0ne-last-activity' .remove!
    disableLate: !->
        for r in app?.room.waitlist.rows || userList?.listView?.rows ||[]
            r.render!


/*####################################
#           FORCE SKIP BTN           #
####################################*/
module \forceSkipButton, do
    moderator: true
    setup: ({$create}, m) !->
        @$btn = $create '<div class=p0ne-skip-btn><i class="icon icon-skip"></i></div>'
            .insertAfter \#playlist-panel
            .click @~onClick
    onClick: API.moderateForceSkip