/**
 * get fancy song notifications in the chat (with preview thumbnail, description, buttons, …)
 * @author jtbrinkmann aka. Brinkie Pie
 * @version 1.0
 * @license MIT License
 * @copyright (c) 2014 J.-T. Brinkmann
 */

#ToDo add proper SoundCloud Support
#   $.ajax url: "https://api.soundcloud.com/tracks/#cid.json?client_id=#{p0ne.SOUNDCLOUD_KEY}"
#   => {permalink_url, artwork_url, description, downloadable}

module \songNotifications, do
    optional: <[ database auxiliaries app ]>

    callback:
        target: API
        event: API.ADVANCE
        callback: (d) ->
            try
                skipped = false #ToDo
                skipper = reason = "" #ToDo

                $div = $ \<div> .addClass \update .addClass \song-notif
                html = ""
                /*
                if d.lastPlay
                    # auxiliaries
                    #function icon name
                    #    return "<i class='icon icon-#name'></i>"
                    html += "
                        <div class='song-notif-last'>
                            <div class='song-stats'>
                                <span class='song-woots'>#{icon \history-positive}#{d.lastPlay.score.positive} </span>
                                <span class='song-mehs'>#{icon \history-negative}#{d.lastPlay.score.negative} </span>
                                <span class='song-grabs'>#{icon \history-grabs}#{d.lastPlay.score.grabs}</span>
                            </div>
                        </div>
                    " #note: the spaces in .song-stats are obligatory! otherwise justify won't work
                    if skipped
                        html += "<div class='song-skipped'>"
                        html +=     "<span class='song-skipped-by'>#skipper</span>"
                        html +=     "<span class='song-skipped-reason'>#reason</span>" if reason
                        html += "</div>"
                */
                if media = d.media
                    ytCID = ""; timestamp = ""
                    if media.format == 1  # YouTube
                        ytCID = "data-yt-cid='#{media.cid}'"
                        mediaURL = "http://youtube.com/watch?v=#{media.cid}"
                        image = "https://i.ytimg.com/vi/#{media.cid}/0.jpg"
                    else # if media.format == 2 # SoundCloud
                        #ToDo improve this
                        mediaURL = "https://soundcloud.com/search?q=#{encodeURIComponent media.author+' - '+media.title}"
                        #mediaURL = "https://soundcloud.com/#{media.author}/#{media.title.replace(/[^\s\w]+/g, '').replace(/\s+/g, '-')}"
                        image = media.image
                    songNotifications.$playbackImg
                        .css backgroundImage: "url(#image)"
                        .show!

                    image = media.image # change image back to smaller thumbnail
                    image = "https:#image" if image.0 == "/" and image.1 == "/" # fixing soundcloud thumbnails
                    duration = mediaTime media.duration

                    time = getTime!
                    console.logImg image .then ->
                        console.log "#time [DV_ADVANCE] #{d.dj.username} is playing '#{media.author} - #{media.title}' (#{mediaTime media.duration*1000})", d

                    if window.auxiliaries and window.database
                        timestamp = "<div class='timestamp'>#{auxiliaries.getChatTimestamp(database.settings.chatTS == 24)}</div>"
                    html += "
                        <div class='song-notif-next' data-media-id='#{media.id}' data-media-format='#{media.format}'>
                            <div class='song-thumb-wrapper'>
                                <img class='song-thumb' #ytCID src='#{image}' />
                                <span class='song-duration'>#duration</span>
                                <div class='song-add'><i class='icon icon-add'></i></div>
                                <a class='song-open' href='#mediaURL' target='_blank'><i class='icon icon-chat-popout'></i></a>
                            </div>
                            #timestamp
                            <div class='song-dj'></div>
                            <b class='song-title'></b>
                            <span class='song-author'></span>
                            <div class='song-description-btn'>Description</div>
                        </div>
                    "
                else
                    songNotifications.$playbackImg .hide!
                $div.html html
                $div .find \.song-dj .text d.dj.username
                $div .find \.song-title .text d.media.title .prop \title, d.media.title
                $div .find \.song-author .text d.media.author

                if media.format == 2 and p0ne.SOUNDCLOUD_KEY # SoundCloud
                    $.ajax url: "https://api.soundcloud.com/tracks/#{media.id}.json?client_id=#{p0ne.SOUNDCLOUD_KEY}"
                        .then (d) ->
                            $div .find \.song-open .attr \href, d.permalink_url
                            $div .data \description, d.description
                            if d.downloadable
                                $div .find \.song-download
                                    .attr \href, "#{d.download_url}?client_id=#{p0ne.SOUNDCLOUD_KEY}"
                                    .attr \title, "#{formatMB(d.original_content_size / 1_000_000)} (.#{d.original_format})"
                                $div .addClass \downloadable

                appendChat $div
            catch e
                console.error "[p0ne.notif]" e
    setup: ({addListener},,,module_) ->
        #== apply stylesheets ==
        loadStyle "#{p0ne.host}/css/p0ne.notif.css"

        #== add video thumbnail to #playback ==
        @$playbackImg = $ \<div>
            .addClass \playback-thumb
            .insertBefore $ '#playback .background'

        #== show current song ==
        if not module_ and API.getMedia!
            @callback.callback media: that, dj: API.getDJ!

        # hide non-playable videos
        addListener _$context, \RestrictedSearchEvent:search, ->
            if window.app?.room?.playback?
                that .onSnoozeClick!
            else
                $ '#playback-controls .snooze' .click!

        #== Grab Songs ==
        window.popMenu = requireHelper do
            name: \popMenu
            test: (.className == \pop-menu)
            fail: ->
                css \songNotificationsAdd, '.song-add {display:none}'
        if popMenu
            #$ \#chat-messages .off \click, \.song-add
            songNotifications.addSong = ->
                $el = $(this)
                $notif = $el.closest \.song-notif-next
                $msg = $notif.closest \.song-notif
                id = $notif.data \media-id
                format = $notif.data \media-format
                console.log "[add from notif]", $notif, id, format

                msgOffset = $msg.offset!
                $el.offset = -> # to fix position
                    return { left: msgOffset.left + 17, top: msgOffset.top + 18 }

                obj = [p0ne.wrap {id: id, format: 1}]
                #obj = [wrap {format: 1, cid: 'Wt4mJV3oZB4', author: 'weegygreen2', title: 'Daring Doughnut', image: '//http://fc06.deviantart.net/fs70/f/2012/112/2/0/rainbow_dash_lip_bite_by_daviez20-d4x5vf4.gif', duration: 39}]

                popMenu.isShowing = false
                popMenu.show $el, obj
            addListener $ \#chat-messages, \click, <[ .song-add ]>, songNotifications.addSong

        #== search for author ==
        songNotifications.search = ->
            mediaSearch @innerText
        addListener $ \#chat-messages, \click, <[ .song-author ]>, songNotifications.search

        #== description ==
        # disable previous listeners (for debugging)
        #$ \#chat-messages .off \click, \.song-description-btn
        #$ \#chat-messages .off \click, \.song-description

        songNotifications.showDescription = (e) ->
            try
                $description = $ e.target .closest \.song-description-btn
                $notif = $description .closest \.song-notif
                return showDescription $description, that if $description .data \description
                return if 2 == $notif .data \media-format # abort when trying to load SoundCloud description
                cid = $notif .find \.song-thumb .data \yt-cid
                songNotifications.hideDescription(target: songNotifications.openDescription, true) if songNotifications.openDescription
                songNotifications.openDescription = $description
                console.log "[notif]", cid, $notif

                # load description from Youtube
                res = $.ajax do
                    url: "https://gdata.youtube.com/feeds/api/videos/#cid?v=2&alt=json"
                    success: (data) ->
                        text = htmlEscape data.entry.media$group.media$description.$t
                        showDescription $description, text
                    fail: ->
                        $description
                            .text "Failed to load"
                            .addClass \.song-description-failed

                res .timeout 200ms, ->
                        $description
                            .text "Description loading…"
                            .addClass \loading
                return res
            catch e
                console.error "[notif]", e

            function showDescription $description, text, formatted
                    # let's get fancy
                    if not formatted
                        text = formatPlainText text
                        $description .data \description, text

                    # create description element
                    $description.removeClass 'song-description-btn loading'
                        .css opacity: 0, position: \absolute
                        .addClass 'song-description text'
                        .html "<i class='icon icon-clear-input'></i>" + text
                        .appendTo $notif

                    # show description (animated)
                    h = $description.height!
                    $description
                        .css height: 0, position: \static
                        .animate do
                            opacity: 1
                            height: h
                            -> $description .css height: \auto

                    # smooth scroll
                    $cm = $ \#chat-messages
                    offsetTop = $notif.offset!?.top - 100px
                    ch = $cm .height!
                    if offsetTop + h > ch
                        $cm.animate do
                            scrollTop: $cm .scrollTop! + Math.min(offsetTop + h - ch + 100px, offsetTop)
                            # 100px is height of .song-notif without .song-description
        songNotifications.hideDescription = (e, noScroll) ->
            songNotifications.openDescription = null
            return if e.target.href
            console.log "[notif] closing description"
            $description = $ e.target .closest \.song-description
            $notif = $description .closest \.song-notif
            # hide description (animated)
            $description.animate do
                opacity: 0
                height: 0
                ->
                    $description
                        .css opacity: 1, height: \auto
                        .removeClass 'song-description text'
                        .addClass 'song-description-btn'
                        .text "Description"
                        .appendTo do
                            $notif .find \.song-notif-next

            # smooth scroll
            return if noScroll
            offsetTop = $notif.offset!?.top - 100px # 100 is # $(\.app-header).height! + $(\#chat-header).height
            if offsetTop < 0
                $cm = $ \#chat-messages
                $cm.animate do
                    scrollTop: $cm .scrollTop! + offsetTop - 100px # -100px is so it doesn't stick to the very top


        # $ ".song-description-btn, .song-description" .remove!
        # $ "<div class='song-description-btn'>Description</div>" .insertAfter \.song-author
        addListener $ \#chat-messages, \click, <[ .song-description-btn]>, songNotifications.showDescription
        addListener $ \#chat-messages, \click, <[ .song-description ]>, songNotifications.hideDescription


