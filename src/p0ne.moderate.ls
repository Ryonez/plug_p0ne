/**
 * plug_p0ne modules to help moderators do their job
 *
 * @author jtbrinkmann aka. Brinkie Pie
 * @license MIT License
 * @copyright (c) 2015 J.-T. Brinkmann
 */

/*####################################
#       BASE MODERATION MODULE       #
####################################*/
module \enableModeratorModules, do
    require: <[ user_ ]>
    setup: ({addListener}) ->
        prevRole = user_.attributes.role
        $body.addClass \user-is-staff if user.isStaff

        addListener user_, \change:role, (user, newRole) ->
            if newRole > 1 and prevRole < 2
                for m in p0ne.modules when m.modDisabled
                    m.enable!
                    m.modDisabled = false
                $body.addClass \user-is-staff
                user.isStaff = true
            else
                for m in p0ne.modules when m.moderator and not m.modDisabled
                    m.modDisabled = true
                    m.disable!
                $body.removeClass \user-is-staff
                user.isStaff = true
    disable: ->
        $body.removeClass \user-is-staff


/*####################################
#             YELLOW MOD             #
####################################*/
module \yellowMod, do
    displayName: 'Yellow Name as Staff'
    moderator: true
    settings: \moderation
    setup: ({css}) ->
        id = API.getUser! .id
        css \yellowMod, "
            \#chat .fromID-#id .un,
            .user[data-uid='#id'] .name > span {
                color: \#ffdd6f !important;
            }
        "
            # \#chat .from-#id .from,
            # \#chat .fromID-#id .from,


/*####################################
#       WARN ON HISTORY PLAYS        #
####################################*/
module \warnOnHistory, do
    displayName: 'Warn on History'
    moderator: true
    settings: \moderation
    setup: ({addListener}) ->
        addListener API, \advance, (d) ~> if d.media
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
    require: <[ _$context user_ ]>
    optional: <[ socketListeners ]>
    moderator: true
    displayName: 'Show deleted messages'
    settings: \moderation
    setup: ({replace_$Listener, addListener, $createPersistent, css}) ->
        css \disableChatDelete, '
            .deleted {
                border-left: 2px solid red;
                display: none;
            }
            .p0ne-showDeletedMessages .deleted {
                display: block;
            }
            .deleted-message {
                display: block;
                text-align: right;
                color: red;
                font-family: monospace;
            }
        '

        $body .addClass \p0ne-showDeletedMessages

        lastDeletedCid = null
        addListener _$context, \socket:chatDelete, ({{c,mi}:p}) ->
            markAsDeleted(c, users.get(mi)?.get(\username) || mi)
            lastDeletedCid := c
        #addListener \early, _$context, \chat:delete, -> return (cid) ->
        replace_$Listener \chat:delete, -> (cid) ->
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
                    .appendTo $msg
                d .text "deleted #{if moderator then 'by '+moderator else ''} #{d.text!}"
                cm = $cm!
                cm.scrollTop cm.scrollTop! + d.height!

                if isLast
                    chat.lastType = \p0ne-deleted

    disable: ->
        $body .removeClass \p0ne-showDeletedMessages


/*####################################
#         DELETE OWN MESSAGES        #
####################################*/
module \chatDeleteOwnMessages, do
    moderator: true
    #displayName: 'Delete Own Messages'
    #settings: \moderation
    setup: ({addListener}) ->
        $cm! .find "fromID-#{userID}"
            .addClass \deletable
            .append do
                $ '<div class="delete-button">Delete</div>'
                    .click delCb
        addListener API, \chat, ({cid, uid}:message) -> if uid == userID
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
    _settings:
        instantWarn: false
        maxMehs: 3
    setup: ({addListener},,, m_) ->
        if m_
            @users = m_.users
        users = @users

        current = {}
        addListener API, \voteUpdate, (d) ~>
            current[d.user.id] = d.vote
            if d.vote == -1 and d.user.uid != userID
                console.error "#{formatUser d.user, true} meh'd this song"
                if @_settings.instantWarn
                    appendChat $ "
                        <div class='cm system'>
                            <div class=box><i class='icon icon-chat-system'></i></div>
                            <div class='msg text'>
                                #{formatUserHTML troll, true} meh'd the past #{plural users[k], 'song'}!
                            </div>
                        </div>"

        lastAdvance = 0
        addListener API, \advance, (d) ~>
            d = Date.now!
            for k,v of current
                if v == -1
                    users[k] ||= 0
                    if ++users[k] > @_settings.maxMehs and troll = getUser(k)
                        # note: the user (`troll`) may have left during this song
                        appendChat $ "
                            <div class='cm system'>
                                <div class=box><i class='icon icon-chat-system'></i></div>
                                <div class='msg text'>
                                    #{formatUserHTML troll} meh'd the past #{plural users[k], 'song'}!
                                </div>
                            </div>"
                else if d > lastAdvance + 10_000ms and d.lastPlay?.dj.id != k
                    delete users[k]
            current := {}
            lastAdvance := d


/*####################################
#              AFK TIMER             #
####################################*/
module \afkTimer, do
    require: <[ RoomUserRow WaitlistRow ]>
    optional: <[ socketListeners app userList _$context ]>
    moderator: true
    settings: \moderation
    displayName: "Show Idle Time"
    help: '''
        This module shows how long users have been inactive in the User- and Waitlist-Panel.
        "Being active"
    '''
    lastActivity: {}
    _settings:
        highlightOver: 43.min
    setup: ({addListener, $create},,,m_) ->
        # initialize users
        settings = @_settings
        @start = start = Date.now!
        if m_
            @lastActivity = m_.lastActivity ||{}
        for user in API.getUsers!
            @lastActivity[user.id] ||= start
        lastActivity = @lastActivity

        $waitlistBtn = $ \#waitlist-button
            .append $afkCount = $create '<div class=p0ne-toolbar-count>'

        # set up event listeners to update the lastActivity time
        addListener API, 'socket:skip socket:grab', (id) -> updateUser id
        addListener API, 'userJoin socket:nameChanged', (u) -> updateUser u.id
        addListener API, 'chat', (u) -> updateUser u.uid
        addListener API, 'socket:gifted', (e) -> updateUser e.s/*ender*/
        addListener API, 'socket:modAddDJ socket:modBan socket:modMoveDJ socket:modRemoveDJ socket:modSkip socket:modStaff', (u) -> updateUser u.mi
        addListener API, 'userLeave', (u) -> delete lastActivity[u.id]

        chatHidden = $cm!.parent!.css(\display) == \none
        if _$context? and (app? or userList?)
            addListener _$context, 'show:users show:waitlist', ->
                chatHidden := true
            addListener _$context, \show:chat, ->
                chatHidden := false

        # regularly update the AFK list / count
        lastAfkCount = 0
        @timer = repeat 60_000ms, ->
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

        # UI
        d = 0
        var noActivityYet
        for Constr, fn in [RoomUserRow, WaitlistRow]
            replace Constr::, \render, (r_) -> return (isUpdate) ->
                r_ ...
                if not d
                    d := Date.now!
                    requestAnimationFrame -> d := 0; noActivityYet := null
                ago = d - lastActivity[@model.id]
                if lastActivity[@model.id] <= start
                    time = noActivityYet ||= ">#{humanTime(ago, true)}"
                else if ago < 60_000ms
                    time = "<1m"
                else if ago < 120_000ms
                    time = "<2m"
                else
                    time = humanTime(ago, true)
                $span = $ '<span class=p0ne-last-activity>' .text time
                $span .addClass \p0ne-last-activity-warn if ago > settings.highlightOver
                $span .addClass \p0ne-last-activity-update if isUpdate
                @$el .append $span
                if isUpdate
                    requestAnimationFrame -> $span .removeClass \p0ne-last-activity-update



        function updateUser uid
            lastActivity[uid] = Date.now!
            # waitlist.rows defaults to [], so no need to ||[]
            for r in userList?.listView?.rows || app?.room.waitlist.rows when r.model.id == uid
                r.render true

        # update current rows (it should not be possible, that the waitlist and userlist are populated at the same time)
        function forceRerender
            for r in app?.room.waitlist.rows || userList?.listView?.rows ||[]
                r.render false

        forceRerender!

    disable: ->
        clearInterval @timer
        $ \#waitlist-button
            .removeClass \p0ne-toolbar-highlight
    disableLate: ->
        for r in app?.room.waitlist.rows || userList?.listView?.rows ||[]
            r.render!

