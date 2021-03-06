/**
 * get fancy song notifications in the chat (with preview thumbnail, description, buttons, …)
 *
 * @author jtbrinkmann aka. Brinkie Pie
 * @license MIT License
 * @copyright (c) 2015 J.-T. Brinkmann
 */
console.log "~~~~~~~ p0ne.song-notif ~~~~~~~"

#ToDo add proper SoundCloud Support
#   $.ajax url: "https://api.soundcloud.com/tracks/#cid.json?client_id=#{p0ne.SOUNDCLOUD_KEY}"
#   => {permalink_url, artwork_url, description, downloadable}

/*####################################
#             SONG NOTIF             #
####################################*/
module \songNotif, do
    require: <[ chatDomEvents ]>
    optional: <[ _$context chat users database auxiliaries app popMenu ]>
    settings: \base
    settingsSimple: true
    displayName: 'Chat Song Notifications'
    help: '''
        Shows notifications for playing songs in the chat.
        Besides the songs' name, it also features a thumbnail and some extra buttons.

        By clicking on the song's or author's name, a search on plug.dj for that name will be started, to easily find similar tracks.

        By hovering the notification and clicking "description" the songs description will be loaded.
        You can click anywhere on it to close it again.
    '''
    persistent: <[ lastMedia $div ]>
    setup: ({addListener, $create, @$createPersistent, addCommand, css},, module_) !->
        @$lastNotif = $!
        @$div ||= get$cms! .find \.p0ne-song-notif:last

        #$create \<div>
        #    .addClass \playback-thumb
        #    .insertBefore $ '#playback .background'

        addListener API, \advance, @~callback
        if _$context
            addListener _$context, \room:joined, !~>
                @callback media: API.getMedia!, dj: API.getDJ!

        #== add skip listeners ==
        addListener API, \modSkip, (modUsername) !~>
            console.info "[API.modSkip]", modUsername
            if getUser(modUsername)
                modID = "data-uid='#{that.id}'"
            else
                modID = ""
            @$lastNotif .find \.timestamp
                .after do
                    $ "<div class='song-skipped un' #modID>"
                        .text modUsername

        #== apply stylesheets ==
        loadStyle "#{p0ne.host}/css/p0ne.notif.css?v=#{p0ne.version}"


        #== show current song ==
        if API.getMedia!
            that.image = httpsify that.image
            @callback media: that, dj: API.getDJ!

        # hide non-playable videos
        addListener _$context, \RestrictedSearchEvent:search, !->
            snooze!

        #== Grab Songs ==
        if popMenu?
            addListener chatDomEvents, \click, \.song-add, !->
                $el = $ this
                $notif = $el.closest \.p0ne-song-notif
                id = $notif.data \id
                cid = $notif.data \cid
                format = $notif.data \format
                console.log "[add from notif]", $notif, id, format, cid

                msgOffset = $notif .offset!
                $el.offset = !-> # to fix position
                    return { left: msgOffset.left + 17px, top: msgOffset.top + 18px }

                obj = { id: id, format: format, cid: cid }
                obj.get = (name) !->
                    return this[name]
                obj.media = obj

                popMenu.isShowing = false
                popMenu.show $el, [obj]
        else
            css \songNotificationsAdd, '.song-add {display:none}'

        #== search for author ==
        addListener chatDomEvents, \click, \.song-author, !->
            mediaSearch @textContent

        #== description ==
        # disable previous listeners (for debugging)
        #$ \#chat-messages .off \click, \.song-description-btn
        #$ \#chat-messages .off \click, \.song-description
        $description = $()
        addListener chatDomEvents, \click, \.song-description-btn, (e) !->
            try
                if $description
                    hideDescription! # close already open description

                #== Show Description ==
                $description := $ this
                $notif = $description .closest \.p0ne-song-notif
                cid    = $notif .data \cid
                format = $notif .data \format
                console.log "[song-notif] showing description", cid, $notif

                if $description .data \description
                    showDescription $notif, that
                else
                    # load description from Youtube
                    console.log "looking up", {cid, format}, do
                        mediaLookup {cid, format}, do
                            success: (data) !->
                                text = formatPlainText data.description # let's get fancy
                                $description .data \description, text
                                showDescription $notif, text
                            fail: !->
                                $description
                                    .text "Failed to load"
                                    .addClass \.song-description-failed

                        .timeout 200ms, !->
                            $description
                                .text "Description loading…"
                                .addClass \loading
            catch e
                console.error "[song-notif]", e


        addListener chatDomEvents, \click, \.song-description, (e) !->
            if not e.target.href
                hideDescription!

        function showDescription $notif, text
                # create description element
                $notif
                    .addClass \song-notif-with-description
                    .append do
                        $description
                            .removeClass 'song-description-btn loading'
                            .css opacity: 0, position: \absolute
                            .addClass \song-description
                            .html "#text <i class='icon icon-clear-input'></i>"

                # show description (animated)
                h = $description.height!
                $description
                    .css height: 0px, position: \static
                    .animate do
                        opacity: 1
                        height: h
                        !-> $description .css height: \auto

                # smooth scroll
                $cm = get$cm!
                ch = $cm .height!
                offsetTop = $notif.offset!?.top - 100px
                if offsetTop + h > ch
                    $cm.animate do
                        scrollTop: $cm .scrollTop! + Math.min(offsetTop + h - ch + 100px, offsetTop)
                        # 100px is height of .song-notif without .song-description

        function hideDescription
            #== Hide Description ==
            return if not $description
            console.log "[song-notif] closing description", $description
            $notif = $description .closest \.p0ne-song-notif
                .removeClass \song-notif-with-description
            $description.animate do
                opacity: 0
                height: 0px
                !->
                    $ this
                        .css opacity: '', height: \auto
                        .removeClass 'song-description text'
                        .addClass 'song-description-btn'
                        .text "Description"
                        .appendTo do
                            $notif .find \.song-notif-next
            $description := null

            # smooth scroll
            offsetTop = $notif.offset!?.top - 100px # 100 is # $(\.app-header).height! + $(\#chat-header).height
            if offsetTop < 0px
                $cm = get$cm!
                $cm.animate do
                    scrollTop: $cm .scrollTop! + offsetTop - 100px # -100px is so it doesn't stick to the very top

        @showDescription = showDescription
        @hideDescription = hideDescription


        addCommand \songinfo, do
            description: "forces a song notification to be shown, even if the module is disabled"
            callback: !->
                if window.songNotif?.callback and API.getMedia!
                    that.image = httpsify that.image
                    window.songNotif.callback media: that, dj: API.getDJ!


    callback: (d) !->
        media = d.media
        if media?.id != @lastMedia
            if @$div and score = d.lastPlay?.score
                /*@security HTML injection shouldn't be an issue, unless the score attributes are oddly manipulated */
                @$div
                    .removeClass \song-current
                    .find \.song-stats
                        .html "
                        <div class=score>
                            <div class='item positive'>
                                <i class='icon icon-history-positive'></i> #{score.positive}
                            </div>
                            <div class='item grabs'>
                                <i class='icon icon-history-grabs'></i> #{score.grabs}
                            </div>
                            <div class='item negative'>
                                <i class='icon icon-history-negative'></i> #{score.negative}
                            </div>
                            <div class='item listeners'>
                                <i class='icon icon-history-listeners'></i> #{users?.length || API.getUsers!.length}
                            </div>
                        </div>
                        "
                @lastMedia = null; @$lastNotif = @$div
        if not media
            return

        @lastMedia := media.id
        chat?.lastType = \p0ne-song-notif

        @$div := @$createPersistent "<div class='update p0ne-song-notif song-current' data-id='#{media.id}' data-cid='#{media.cid}' data-format='#{media.format}'>"
        html = ""
        author = htmlUnescape media.author
        title = htmlUnescape media.title
        if media.format == 1  # YouTube
            mediaURL = "http://youtube.com/watch?v=#{media.cid}"
        else # if media.format == 2 # SoundCloud
            # note: this gets replaced by a proper link as soon as data is available
            mediaURL = "https://soundcloud.com/search?q=#{encodeURIComponent author+' - '+title}"

        image = httpsify media.image
        duration = mediaTime media.duration
        (if media.format == 1
            console.logImg image, 120px, 90px
        else
            console.logImg image, 100px, 100px
        )
            .then !->
                console.log "#{getTime!} [DJ_ADVANCE] #{d.dj.username} plays '#{author} - #{title}' (#duration)", d
        html += "
            <div class='song-thumb-wrapper'>
                <img class='song-thumb' src='#image' />
                <span class='song-duration'>#duration</span>
                <div class='song-add btn'><i class='icon icon-add'></i></div>
                <a class='song-open btn' href='#mediaURL' target='_blank'><i class='icon icon-chat-popout'></i></a>
                <!-- <div class='song-download btn right'><i class='icon icon-###'></i></div> -->
            </div>
            #{getTimestamp!}
            <div class='song-stats'></div>
            <div class='song-dj'></div>
            <b class='song-title'></b>
            <span class='song-author'></span>
            <div class='song-description-btn'>Description</div>
        "
        @$div.html html
        @$div .find \.song-title .text title .prop \title, title
        @$div .find \.song-author .text author
        @$div .find \.song-dj
            .html formatUserHTML d.dj, true, {+flag}

        appendChat @$div
        if media.format == 2 # SoundCloud
            @$div .addClass \loading
            mediaLookup media
                .then (d) !~>
                    @$div
                        .removeClass \loading
                        .data \description, d.description
                        .find \.song-open .attr \href, d.url
                    if d.download
                        @$div
                            .addClass \downloadable
                            .find \.song-download
                                .attr \href, d.download
                                .attr \title, "#{formatMB(d.downloadSize / 1_000_000to_mb)} #{if d.downloadFormat then '(.'+that+')' else ''}"


    disable: !->
        @hideDescription?!




window.Notification ||= window.webkitNotification
module \songNotifPopup, do
    displayName: 'Desktop Song Notifications'
    settings: \base
    disabled: true
    help: '''
        Shows a small popup notifications on song changes.
    '''
    screenshot: 'https://i.imgur.com/wCrDhvb.png'

    require: <[ Notification ]>
    setup: ({addListener}) !->
        Notification.requestPermission!

        lastNotif = { close: $.noop }
        addListener API, \advance, (d) !->
            lastNotif.close!
            if d.media
                if not document.hasFocus()
                    lastNotif := new Notification do
                        "#{d.media.author} - #{d.media.title}"
                        icon: d.media.image
                        body: "played by: #{d.dj.username}"
                    lastNotif .onclick = closeNotif
                else
                    lastNotif.close!
        addListener $window, \focus, closeNotif
        # http://i.imgur.com/tGfZ4To.png mention_icon.png

        !function closeNotif
            lastNotif.close!

    #settingsExtra: ($el) ->

