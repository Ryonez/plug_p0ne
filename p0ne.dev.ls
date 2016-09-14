/**
 * plug_p0ne dev
 * a set of plug_p0ne modules for usage in the console
 * They are not used by any other module
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */
/*####################################
#           LOG EVERYTHING           #
####################################*/
module \logEventsToConsole, do
    optional: <[ _$context  socketListeners ]>
    displayName: "[dev] Log Events to Console"
    settings: true
    setup: ({addListener, replace}) ->
        addListener API, \chat, (data) ->
            message = htmlUnescape(data.message) .replace(/\u202e/g, '\\u202e')
            if data.un
                name = data.un .replace(/\u202e/g, '\\u202e') + ":"
                name = " " * (24 - name.length) + name
                console.log "#{getTime!} [CHAT]", "#name #message"
            else
                name = "[system]"
                console.info "#{getTime!} [CHAT]", "#name #message"

        addListener API, \userJoin, (data) ->
            name = htmlUnescape(data.username) .replace(/\u202e/g, '\\u202e')
            console.log "#{getTime!} + [JOIN]", data.id, name, "(#{getRank data})", data
        addListener API, \userLeave, (data) ->
            name = htmlUnescape(data.username) .replace(/\u202e/g, '\\u202e')
            console.log "#{getTime!} - [LEAVE]", data.id, name, "(#{getRank data})", data

        return if not window._$context
        addListener _$context, \PlayMediaEvent:play, (data) ->
            #data looks like {type: "PlayMediaEvent:play", media: n.hasOwnProperty.i, startTime: "1415645873000,0000954135", playlistID: 5270414, historyID: "d38eeaec-2d26-4d76-8029-f64e3d080463"}

            console.log "#{getTime!} [SongInfo]", "playlist:",data.playlistID, "historyID:",data.historyID

        #= log (nearly) all _$context events
        replace _$context, \trigger, (trigger_) -> return (type) ->
            group = type.substr(0, type.indexOf ":")
            if group not in <[ socket tooltip djButton chat sio playback playlist notify drag audience anim HistorySyncEvent user ShowUserRolloverEvent ]> and type not in <[ ChatFacadeEvent:muteUpdate PlayMediaEvent:play userPlaying:update context:update ]> or window.LOGALL
                console.log "#{getTime!} [#type]", getArgs?! || arguments
            else if group == \socket and type not in <[ socket:chat socket:vote socket:grab socket:earn ]>
                console.log "#{getTime!} [#type]", [].slice.call(arguments, 1)
            /*else if type == "chat:receive"
                data = &1
                console.log "#{getTime!} [CHAT]", "#{data.from.id}:\t", data.text, {data}*/
            try
                return trigger_ ...
            catch e
                console.error "[_$context] Error when triggering '#type'", window.e=e

        #= try-catch API event listeners =
        replace API, \trigger, (trigger_) -> return (type) ->
            try
                return trigger_ ...
            catch e
                console.error "[API] Error when triggering '#type'", (export e).stack


/*####################################
#             DEV TOOLS              #
####################################*/
module \downloadLink, do
    setup: ({css}) ->
        css \downloadLink, '
            .p0ne_downloadlink::before {
                content: " ";
                position: absolute;
                margin-top: -6px;
                margin-left: -27px;
                width: 30px;
                height: 30px;
                background-position: -140px -280px;
                background-image: url(/_/static/images/icons.26d92b9.png);
            }
        '
    module: (name, filename, data) ->
        if not data
            data = filename; filename = name
        data = JSON.stringify data if typeof data != \string
        url = URL.createObjectURL new Blob([data], {type: \text/plain})
        (window.$cm || $ \#chat-messages) .append "
            <div class='message p0ne_downloadlink'>
                <i class='icon'></i>
                <span class='text'>
                    <a href='#url' download='#filename'>#name</a>
                </span>
            </div>
        "


# DEBUGGING
window <<<<
    searchEvents: (regx) ->
        regx = new RegExp(regx, \i) if regx not instanceof RegExp
        return [k for k of _$context?._events when regx.test k]


    listUsers: ->
        res = ""
        for u in API.getUsers!
            res += "#{u.id}\t#{u.username}\n"
        console.log res
    listUsersByAge: ->
        a = API.getUsers! .sort (a,b) ->
            a = +a.dateJoined.replace(/\D/g,'')
            b = +b.dateJoined.replace(/\D/g,'')
            return (a > b && 1) || (a == b && 0) || -1

        for u in a
            console.log u.dateJoined.replace(/T|\..+/g, ' '), u.username
    joinRoom: (slug) ->
        ajax \POST, \rooms/join, {slug}

    getUserData: (user) !->
        if typeof user == \number
            return $.get "/_/users/#user"
                .then ({[user]:data}) ->
                    console.log "[userdata]", user
                    console.log "[userdata] https://plug.dj/@/#{encodeURI user.slug}" if user.level >= 5
                .fail ->
                    console.warn "couldn't get slug for user with id '#{id}'"
        else if typeof user == \string
            user .= toLowerCase!
            for u in API.getUsers! when u.username.toLowerCase! == user
                return getUserData u.id
            console.warn "[userdata] user '#user' not found"
            return null

    findModule: (test) ->
        if typeof test == \string and window.l
            test = l(test)
        res = []
        for id, module of require.s.contexts._.defined when module
            if test module, id
                module.id ||= id
                console.log "[findModule]", id, module
                res[*] = module
        return res

    validateUsername: (username, ignoreWarnings, cb) !->
        if typeof ignoreWarnings == \function
            cb = ignoreWarnings; ignoreWarnings = false
        else if not cb
            cb = (slug, err) -> console[err && \error || \log] "username '#username': ", err || slug

        if not ignoreWarnings
            if length < 2
                cb(false, "too short")
            else if length >= 25
                cb(false, "too long")
            else if username.has("/")
                cb(false, "forward slashes are not allowed")
            else if username.has("\n")
                cb(false, "line breaks are not allowed")
            else
                ignoreWarnings = true
        if ignoreWarnings
            return $.getJSON "https://plug.dj/_/users/validate/#{encodeURIComponent username}", (d) ->
                cb(d && d.data.0?.slug)

    getRequireArg: (haystack, needle) ->
        # this is a helper function to be used in the console to quickly find a module ID corresponding to a parameter and vice versa in the head of a javascript requirejs.define call
        # e.g. getRequireArg('define( "da676/a5d9e/a7e5a/a3e8f/fa06c", [ "jquery", "underscore", "backbone", "da676/df0c1/fe7d6", "da676/ae6e4/a99ef", "da676/d8c3f/ed854", "da676/cba08/ba3a9", "da676/cba08/ee33b", "da676/cba08/f7bde", "da676/cba08/d0509", "da676/eb13a/b058e/c6c93", "da676/eb13a/b058e/c5cd2", "da676/eb13a/f86ef/bff93", "da676/b0e2b/f053f", "da676/b0e2b/e9c55", "da676/a5d9e/d6ba6/f3211", "hbs!templates/room/header/RoomInfo", "lang/Lang" ], function( e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g ) {', 'u') ==> "da676/cba08/ee33b"
        [b, a] = haystack.split "], function("
        a .= substr(b.0.indexOf('"')).split('", "')
        b .= substr(0, b.1.indexOf(')')).split(', ')
        if b[a.indexOf(needle)]
            try window[that] = require needle
            return that
        else if a[b.indexOf(needle)]
            try window[needle] = require that
            return that



    logOnce: (base, event) ->
        if not event
            event = base
            if -1 != event.indexOf \:
                base = _$context
            else
                base = API
        base.once \event, (...args) ->
            console.log "[#{event .toUpperCase!}]", args

    usernameToSlug: (un) ->
        htmlEscape(un).replace /[&;\s]+/g, '-'
        # some more characters get collapsed
        # some characters get converted to \u####

    ghost: ->
        $.get '/'

module \renameUser, do
    require: <[ users ]>
    module: (idOrName, newName) ->
        u = users.get(idOrName)
        if not u
            idOrName .= toLowerCase!
            for user in users.models when user.attributes.username.toLowerCase! == idOrName
                u = user; break
        if not u
            return console.error "[rename user] can't find user with ID or name '#idOrName'"
        u.set \username, newName
        id = u.id

        if not rup = window.p0ne.renameUserPlugin
            rup = window.p0ne.renameUserPlugin = (d) !->
                d.un = rup[d.fid] || d.un
            window.p0ne.chatPlugins?[*] = rup
        rup[id] = newName


do ->
    window._$events = {}
    for k,v of _$context?._events
        window._$events[k.replace(/:/g,'_')] = v


module \export_, do
    require: <[ downloadLink ]>
    exportRCS: ->
        # $ '.p0ne_downloadlink' .remove!
        for k,v of localStorage
            downloadLink "plugDjChat '#k'", k.replace(/plugDjChat-(.*?)T(\d+):(\d+):(\d+)\.\d+Z/, "$1 $2.$3.$4.html"), v

    exportPlaylists: ->
        # $ '.p0ne_downloadlink' .remove!
        for let pl in playlists
            $.get "/_/playlists/#{pl.id}/media" .then (data) ->
                downloadLink "playlist '#{pl.name}'",  "#{pl.name}.txt", data



window.copyChat = (copy) ->
    $ '#chat-messages img' .fixSize!
    host = p0ne.host
    res = """
        <head>
        <title>plug.dj Chatlog #{getTime!} - #{getRoomSlug!} (#{API.getUser!.username})</title>
        <!-- basic chat styling -->
        #{ $ "head link[href^='https://cdn.plug.dj/_/static/css/app']" .0 .outerHTML }
        <link href='https://dl.dropboxusercontent.com/u/4217628/css/fimplugChatlog.css' rel='stylesheet' type='text/css'>
    """

    res += getCustomCSS true
    /*
    res += """\n
        <!-- p0ne song notifications -->
        <link rel='stylesheet' href='#host/css/p0ne.notif.css' type='text/css'>
    """ if window.songNotifications

    res += """\n
        <!-- better ponymotes -->
        <link rel='stylesheet' href='#host/css/bpmotes.css' type='text/css'>
        <link rel='stylesheet' href='#host/css/emote-classes.css' type='text/css'>
        <link rel='stylesheet' href='#host/css/combiners-nsfw.css' type='text/css'>
        <link rel='stylesheet' href='#host/css/gif-animotes.css' type='text/css'>
        <link rel='stylesheet' href='#host/css/extracss-pure.css' type='text/css'>
    """ if window.bpm or $cm! .find \.bpm-emote .length

    res += """\n
        <style>
        #{css \yellowMod}
        </style>
    """ if window.yellowMod
    */

    res += """\n
        </head>
        <body id="chatlog">
        #{$ \.app-right .html!
            .replace(/https:\/\/api\.plugCubed\.net\/proxy\//g, '')
            .replace(/src="\/\//g, 'src="https://')
        }
        </body>
    """
    copy res