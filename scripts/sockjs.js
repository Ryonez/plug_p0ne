SockJS = function() {
    var e = document,
        t = window,
        n = {},
        r = function() {};
    r.prototype.addEventListener = function(e, t) {
        this._listeners || (this._listeners = {}), e in this._listeners || (this._listeners[e] = []);
        var r = this._listeners[e];
        n.arrIndexOf(r, t) === -1 && r.push(t);
        return
    }, r.prototype.removeEventListener = function(e, t) {
        if (!(this._listeners && e in this._listeners)) return;
        var r = this._listeners[e],
            i = n.arrIndexOf(r, t);
        if (i !== -1) {
            r.length > 1 ? this._listeners[e] = r.slice(0, i).concat(r.slice(i + 1)) : delete this._listeners[e];
            return
        }
        return
    }, r.prototype.dispatchEvent = function(e) {
        var t = e.type,
            n = Array.prototype.slice.call(arguments, 0);
        this["on" + t] && this["on" + t].apply(this, n);
        if (this._listeners && t in this._listeners)
            for (var r = 0; r < this._listeners[t].length; r++) this._listeners[t][r].apply(this, n)
    };
    var i = function(e, t) {
        this.type = e;
        if (typeof t != "undefined")
            for (var n in t) {
                if (!t.hasOwnProperty(n)) continue;
                this[n] = t[n]
            }
    };
    i.prototype.toString = function() {
        var e = [];
        for (var t in this) {
            if (!this.hasOwnProperty(t)) continue;
            var n = this[t];
            typeof n == "function" && (n = "[function]"), e.push(t + "=" + n)
        }
        return "SimpleEvent(" + e.join(", ") + ")"
    };
    var s = function(e) {
        var t = this;
        t._events = e || [], t._listeners = {}
    };
    s.prototype.emit = function(e) {
        var t = this;
        t._verifyType(e);
        if (t._nuked) return;
        var n = Array.prototype.slice.call(arguments, 1);
        t["on" + e] && t["on" + e].apply(t, n);
        if (e in t._listeners)
            for (var r = 0; r < t._listeners[e].length; r++) t._listeners[e][r].apply(t, n)
    }, s.prototype.on = function(e, t) {
        var n = this;
        n._verifyType(e);
        if (n._nuked) return;
        e in n._listeners || (n._listeners[e] = []), n._listeners[e].push(t)
    }, s.prototype._verifyType = function(e) {
        var t = this;
        n.arrIndexOf(t._events, e) === -1 && n.log("Event " + JSON.stringify(e) + " not listed " + JSON.stringify(t._events) + " in " + t)
    }, s.prototype.nuke = function() {
        var e = this;
        e._nuked = !0;
        for (var t = 0; t < e._events.length; t++) delete e[e._events[t]];
        e._listeners = {}
    };
    var o = "abcdefghijklmnopqrstuvwxyz0123456789_";
    n.random_string = function(e, t) {
        t = t || o.length;
        var n, r = [];
        for (n = 0; n < e; n++) r.push(o.substr(Math.floor(Math.random() * t), 1));
        return r.join("")
    }, n.random_number = function(e) {
        return Math.floor(Math.random() * e)
    }, n.random_number_string = function(e) {
        var t = ("" + (e - 1)).length,
            r = Array(t + 1).join("0");
        return (r + n.random_number(e)).slice(-t)
    }, n.getOrigin = function(e) {
        e += "/";
        var t = e.split("/").slice(0, 3);
        return t.join("/")
    }, n.isSameOriginUrl = function(e, n) {
        return n || (n = t.location.href), e.split("/").slice(0, 3).join("/") === n.split("/").slice(0, 3).join("/")
    }, n.getParentDomain = function(e) {
        if (/^[0-9.]*$/.test(e)) return e;
        if (/^\[/.test(e)) return e;
        if (!/[.]/.test(e)) return e;
        var t = e.split(".").slice(1);
        return t.join(".")
    }, n.objectExtend = function(e, t) {
        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
        return e
    };
    var u = "_jp";
    n.polluteGlobalNamespace = function() {
        u in t || (t[u] = {})
    }, n.closeFrame = function(e, t) {
        return "c" + JSON.stringify([e, t])
    }, n.userSetCode = function(e) {
        return e === 1e3 || e >= 3e3 && e <= 4999
    }, n.countRTO = function(e) {
        var t;
        return e > 100 ? t = 3 * e : t = e + 200, t
    }, n.log = function() {
        t.console && console.log && console.log.apply && console.log.apply(console, arguments)
    }, n.bind = function(e, t) {
        return e.bind ? e.bind(t) : function() {
            return e.apply(t, arguments)
        }
    }, n.flatUrl = function(e) {
        return e.indexOf("?") === -1 && e.indexOf("#") === -1
    }, n.amendUrl = function(t) {
        var r = e.location;
        if (!t) throw new Error("Wrong url for SockJS");
        if (!n.flatUrl(t)) throw new Error("Only basic urls are supported in SockJS");
        return t.indexOf("//") === 0 && (t = r.protocol + t), t.indexOf("/") === 0 && (t = r.protocol + "//" + r.host + t), t = t.replace(/[/]+$/, ""), t
    }, n.arrIndexOf = function(e, t) {
        for (var n = 0; n < e.length; n++)
            if (e[n] === t) return n;
        return -1
    }, n.arrSkip = function(e, t) {
        var r = n.arrIndexOf(e, t);
        if (r === -1) return e.slice();
        var i = e.slice(0, r);
        return i.concat(e.slice(r + 1))
    }, n.isArray = Array.isArray || function(e) {
        return {}.toString.call(e).indexOf("Array") >= 0
    }, n.delay = function(e, t) {
        return typeof e == "function" && (t = e, e = 0), setTimeout(t, e)
    };
    var a = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        f = {
            "\0": "\\u0000",
            "": "\\u0001",
            "": "\\u0002",
            "": "\\u0003",
            "": "\\u0004",
            "": "\\u0005",
            "": "\\u0006",
            "": "\\u0007",
            "\b": "\\b",
            "	": "\\t",
            "\n": "\\n",
            "": "\\u000b",
            "\f": "\\f",
            "\r": "\\r",
            "": "\\u000e",
            "": "\\u000f",
            "": "\\u0010",
            "": "\\u0011",
            "": "\\u0012",
            "": "\\u0013",
            "": "\\u0014",
            "": "\\u0015",
            "": "\\u0016",
            "": "\\u0017",
            "": "\\u0018",
            "": "\\u0019",
            "": "\\u001a",
            "": "\\u001b",
            "": "\\u001c",
            "": "\\u001d",
            "": "\\u001e",
            "": "\\u001f",
            '"': '\\"',
            "\\": "\\\\",
            "": "\\u007f",
            "?": "\\u0080",
            "�": "\\u0081",
            "?": "\\u0082",
            "?": "\\u0083",
            "?": "\\u0084",
            "?": "\\u0085",
            "?": "\\u0086",
            "?": "\\u0087",
            "?": "\\u0088",
            "?": "\\u0089",
            "?": "\\u008a",
            "?": "\\u008b",
            "?": "\\u008c",
            "�": "\\u008d",
            "?": "\\u008e",
            "�": "\\u008f",
            "�": "\\u0090",
            "?": "\\u0091",
            "?": "\\u0092",
            "?": "\\u0093",
            "?": "\\u0094",
            "?": "\\u0095",
            "?": "\\u0096",
            "?": "\\u0097",
            "?": "\\u0098",
            "?": "\\u0099",
            "?": "\\u009a",
            "?": "\\u009b",
            "?": "\\u009c",
            "�": "\\u009d",
            "?": "\\u009e",
            "?": "\\u009f",
            "�": "\\u00ad",
            "?": "\\u0600",
            "?": "\\u0601",
            "?": "\\u0602",
            "?": "\\u0603",
            "?": "\\u0604",
            "?": "\\u070f",
            "?": "\\u17b4",
            "?": "\\u17b5",
            "?": "\\u200c",
            "?": "\\u200d",
            "?": "\\u200e",
            "?": "\\u200f",
            "\u2028": "\\u2028",
            "\u2029": "\\u2029",
            "?": "\\u202a",
            "?": "\\u202b",
            "?": "\\u202c",
            "?": "\\u202d",
            "?": "\\u202e",
            "?": "\\u202f",
            "?": "\\u2060",
            "?": "\\u2061",
            "?": "\\u2062",
            "?": "\\u2063",
            "?": "\\u2064",
            "?": "\\u2065",
            "?": "\\u2066",
            "?": "\\u2067",
            "?": "\\u2068",
            "?": "\\u2069",
            "?": "\\u206a",
            "?": "\\u206b",
            "?": "\\u206c",
            "?": "\\u206d",
            "?": "\\u206e",
            "?": "\\u206f",
            "?": "\\ufeff",
            "?": "\\ufff0",
            "?": "\\ufff1",
            "?": "\\ufff2",
            "?": "\\ufff3",
            "?": "\\ufff4",
            "?": "\\ufff5",
            "?": "\\ufff6",
            "?": "\\ufff7",
            "?": "\\ufff8",
            "?": "\\ufff9",
            "?": "\\ufffa",
            "?": "\\ufffb",
            "?": "\\ufffc",
            "?": "\\ufffd",
            "?": "\\ufffe",
            "?": "\\uffff"
        },
        l = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g,
        c, h = JSON && JSON.stringify || function(e) {
            return a.lastIndex = 0, a.test(e) && (e = e.replace(a, function(e) {
                return f[e]
            })), '"' + e + '"'
        },
        p = function(e) {
            var t, n = {},
                r = [];
            for (t = 0; t < 65536; t++) r.push(String.fromCharCode(t));
            return e.lastIndex = 0, r.join("").replace(e, function(e) {
                return n[e] = "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4), ""
            }), e.lastIndex = 0, n
        };
    n.quote = function(e) {
        var t = h(e);
        return l.lastIndex = 0, l.test(t) ? (c || (c = p(l)), t.replace(l, function(e) {
            return c[e]
        })) : t
    };
    var d = ["websocket", "xdr-streaming", "xhr-streaming", "iframe-eventsource", "iframe-htmlfile", "xdr-polling", "xhr-polling", "iframe-xhr-polling", "jsonp-polling"];
    n.probeProtocols = function() {
        var e = {};
        for (var t = 0; t < d.length; t++) {
            var n = d[t];
            e[n] = T[n] && T[n].enabled()
        }
        return e
    }, n.detectProtocols = function(e, t, n) {
        var r = {},
            i = [];
        t || (t = d);
        for (var s = 0; s < t.length; s++) {
            var o = t[s];
            r[o] = e[o]
        }
        var u = function(e) {
            var t = e.shift();
            r[t] ? i.push(t) : e.length > 0 && u(e)
        };
        return n.websocket !== !1 && u(["websocket"]), r["xhr-streaming"] && !n.null_origin ? i.push("xhr-streaming") : r["xdr-streaming"] && !n.cookie_needed && !n.null_origin ? i.push("xdr-streaming") : u(["iframe-eventsource", "iframe-htmlfile"]), r["xhr-polling"] && !n.null_origin ? i.push("xhr-polling") : r["xdr-polling"] && !n.cookie_needed && !n.null_origin ? i.push("xdr-polling") : u(["iframe-xhr-polling", "jsonp-polling"]), i
    };
    var v = "_sockjs_global";
    n.createHook = function() {
        var e = "a" + n.random_string(8);
        if (!(v in t)) {
            var r = {};
            t[v] = function(e) {
                return e in r || (r[e] = {
                    id: e,
                    del: function() {
                        delete r[e]
                    }
                }), r[e]
            }
        }
        return t[v](e)
    }, n.attachMessage = function(e) {
        n.attachEvent("message", e)
    }, n.attachEvent = function(n, r) {
        typeof t.addEventListener != "undefined" ? t.addEventListener(n, r, !1) : (e.attachEvent("on" + n, r), t.attachEvent("on" + n, r))
    }, n.detachMessage = function(e) {
        n.detachEvent("message", e)
    }, n.detachEvent = function(n, r) {
        typeof t.addEventListener != "undefined" ? t.removeEventListener(n, r, !1) : (e.detachEvent("on" + n, r), t.detachEvent("on" + n, r))
    };
    var m = {},
        g = !1,
        y = function() {
            for (var e in m) m[e](), delete m[e]
        },
        b = function() {
            if (g) return;
            g = !0, y()
        };
    n.attachEvent("unload", b), n.unload_add = function(e) {
        var t = n.random_string(8);
        return m[t] = e, g && n.delay(y), t
    }, n.unload_del = function(e) {
        e in m && delete m[e]
    }, n.createIframe = function(t, r) {
        var i = e.createElement("iframe"),
            s, o, u = function() {
                clearTimeout(s);
                try {
                    i.onload = null
                } catch (e) {}
                i.onerror = null
            },
            a = function() {
                i && (u(), setTimeout(function() {
                    i && i.parentNode.removeChild(i), i = null
                }, 0), n.unload_del(o))
            },
            f = function(e) {
                i && (a(), r(e))
            },
            l = function(e, t) {
                try {
                    i && i.contentWindow && i.contentWindow.postMessage(e, t)
                } catch (n) {}
            };
        return i.src = t, i.style.display = "none", i.style.position = "absolute", i.onerror = function() {
            f("onerror")
        }, i.onload = function() {
            clearTimeout(s), s = setTimeout(function() {
                f("onload timeout")
            }, 2e3)
        }, e.body.appendChild(i), s = setTimeout(function() {
            f("timeout")
        }, 15e3), o = n.unload_add(a), {
            post: l,
            cleanup: a,
            loaded: u
        }
    }, n.createHtmlfile = function(e, r) {
        var i = new ActiveXObject("htmlfile"),
            s, o, a, f = function() {
                clearTimeout(s)
            },
            l = function() {
                i && (f(), n.unload_del(o), a.parentNode.removeChild(a), a = i = null, CollectGarbage())
            },
            c = function(e) {
                i && (l(), r(e))
            },
            h = function(e, t) {
                try {
                    a && a.contentWindow && a.contentWindow.postMessage(e, t)
                } catch (n) {}
            };
        i.open(), i.write('<html><script>document.domain="' + document.domain + '";' + "</s" + "cript></html>"), i.close(), i.parentWindow[u] = t[u];
        var p = i.createElement("div");
        return i.body.appendChild(p), a = i.createElement("iframe"), p.appendChild(a), a.src = e, s = setTimeout(function() {
            c("timeout")
        }, 15e3), o = n.unload_add(l), {
            post: h,
            cleanup: l,
            loaded: f
        }
    };
    var w = function() {};
    w.prototype = new s(["chunk", "finish"]), w.prototype._start = function(e, r, i, s) {
        var o = this;
        try {
            o.xhr = new XMLHttpRequest
        } catch (u) {}
        if (!o.xhr) try {
            o.xhr = new t.ActiveXObject("Microsoft.XMLHTTP")
        } catch (u) {}
        if (t.ActiveXObject || t.XDomainRequest) r += (r.indexOf("?") === -1 ? "?" : "&") + "t=" + +(new Date);
        o.unload_ref = n.unload_add(function() {
            o._cleanup(!0)
        });
        try {
            o.xhr.open(e, r, !0)
        } catch (a) {
            o.emit("finish", 0, ""), o._cleanup();
            return
        }
        if (!s || !s.no_credentials) o.xhr.withCredentials = "true";
        if (s && s.headers)
            for (var f in s.headers) o.xhr.setRequestHeader(f, s.headers[f]);
        o.xhr.onreadystatechange = function() {
            if (o.xhr) {
                var e = o.xhr;
                switch (e.readyState) {
                    case 3:
                        try {
                            var t = e.status,
                                n = e.responseText
                        } catch (e) {}
                        t === 1223 && (t = 204), n && n.length > 0 && o.emit("chunk", t, n);
                        break;
                    case 4:
                        var t = e.status;
                        t === 1223 && (t = 204), o.emit("finish", t, e.responseText), o._cleanup(!1)
                }
            }
        }, o.xhr.send(i)
    }, w.prototype._cleanup = function(e) {
        var t = this;
        if (!t.xhr) return;
        n.unload_del(t.unload_ref), t.xhr.onreadystatechange = function() {};
        if (e) try {
            t.xhr.abort()
        } catch (r) {}
        t.unload_ref = t.xhr = null
    }, w.prototype.close = function() {
        var e = this;
        e.nuke(), e._cleanup(!0)
    };
    var E = n.XHRCorsObject = function() {
        var e = this,
            t = arguments;
        n.delay(function() {
            e._start.apply(e, t)
        })
    };
    E.prototype = new w;
    var S = n.XHRLocalObject = function(e, t, r) {
        var i = this;
        n.delay(function() {
            i._start(e, t, r, {
                no_credentials: !0
            })
        })
    };
    S.prototype = new w;
    var x = n.XDRObject = function(e, t, r) {
        var i = this;
        n.delay(function() {
            i._start(e, t, r)
        })
    };
    x.prototype = new s(["chunk", "finish"]), x.prototype._start = function(e, t, r) {
        var i = this,
            s = new XDomainRequest;
        t += (t.indexOf("?") === -1 ? "?" : "&") + "t=" + +(new Date);
        var o = s.ontimeout = s.onerror = function() {
            i.emit("finish", 0, ""), i._cleanup(!1)
        };
        s.onprogress = function() {
            i.emit("chunk", 200, s.responseText)
        }, s.onload = function() {
            i.emit("finish", 200, s.responseText), i._cleanup(!1)
        }, i.xdr = s, i.unload_ref = n.unload_add(function() {
            i._cleanup(!0)
        });
        try {
            i.xdr.open(e, t), i.xdr.send(r)
        } catch (u) {
            o()
        }
    }, x.prototype._cleanup = function(e) {
        var t = this;
        if (!t.xdr) return;
        n.unload_del(t.unload_ref), t.xdr.ontimeout = t.xdr.onerror = t.xdr.onprogress = t.xdr.onload = null;
        if (e) try {
            t.xdr.abort()
        } catch (r) {}
        t.unload_ref = t.xdr = null
    }, x.prototype.close = function() {
        var e = this;
        e.nuke(), e._cleanup(!0)
    }, n.isXHRCorsCapable = function() {
        return t.XMLHttpRequest && "withCredentials" in new XMLHttpRequest ? 1 : t.XDomainRequest && e.domain ? 2 : j.enabled() ? 3 : 4
    };
    var T = function(e, r, i) {
        if (this === t) return new T(e, r, i);
        var s = this,
            o;
        s._options = {
            devel: !1,
            debug: !1,
            protocols_whitelist: [],
            info: undefined,
            rtt: undefined
        }, i && n.objectExtend(s._options, i), s._base_url = n.amendUrl(e), s._server = s._options.server || n.random_number_string(1e3), s._options.protocols_whitelist && s._options.protocols_whitelist.length ? o = s._options.protocols_whitelist : (typeof r == "string" && r.length > 0 ? o = [r] : n.isArray(r) ? o = r : o = null, o && s._debug('Deprecated API: Use "protocols_whitelist" option instead of supplying protocol list as a second parameter to SockJS constructor.')), s._protocols = [], s.protocol = null, s.readyState = T.CONNECTING, s._ir = W(s._base_url), s._ir.onfinish = function(e, t) {
            s._ir = null, e ? (s._options.info && (e = n.objectExtend(e, s._options.info)), s._options.rtt && (t = s._options.rtt), s._applyInfo(e, t, o), s._didClose()) : s._didClose(1002, "Can't connect to server", !0)
        }
    };
    T.prototype = new r, T.version = "0.3.4", T.CONNECTING = 0, T.OPEN = 1, T.CLOSING = 2, T.CLOSED = 3, T.prototype._debug = function() {
        this._options.debug && n.log.apply(n, arguments)
    }, T.prototype._dispatchOpen = function() {
        var e = this;
        e.readyState === T.CONNECTING ? (e._transport_tref && (clearTimeout(e._transport_tref), e._transport_tref = null), e.readyState = T.OPEN, e.dispatchEvent(new i("open"))) : e._didClose(1006, "Server lost session")
    }, T.prototype._dispatchMessage = function(e) {
        var t = this;
        if (t.readyState !== T.OPEN) return;
        t.dispatchEvent(new i("message", {
            data: e
        }))
    }, T.prototype._dispatchHeartbeat = function(e) {
        var t = this;
        if (t.readyState !== T.OPEN) return;
        t.dispatchEvent(new i("heartbeat", {}))
    }, T.prototype._didClose = function(e, t, r) {
        var s = this;
        if (s.readyState !== T.CONNECTING && s.readyState !== T.OPEN && s.readyState !== T.CLOSING) throw new Error("INVALID_STATE_ERR");
        s._ir && (s._ir.nuke(), s._ir = null), s._transport && (s._transport.doCleanup(), s._transport = null);
        var o = new i("close", {
            code: e,
            reason: t,
            wasClean: n.userSetCode(e)
        });
        if (!n.userSetCode(e) && s.readyState === T.CONNECTING && !r) {
            if (s._try_next_protocol(o)) return;
            o = new i("close", {
                code: 2e3,
                reason: "All transports failed",
                wasClean: !1,
                last_event: o
            })
        }
        s.readyState = T.CLOSED, n.delay(function() {
            s.dispatchEvent(o)
        })
    }, T.prototype._didMessage = function(e) {
        var t = this,
            n = e.slice(0, 1);
        switch (n) {
            case "o":
                t._dispatchOpen();
                break;
            case "a":
                var r = JSON.parse(e.slice(1) || "[]");
                for (var i = 0; i < r.length; i++) t._dispatchMessage(r[i]);
                break;
            case "m":
                var r = JSON.parse(e.slice(1) || "null");
                t._dispatchMessage(r);
                break;
            case "c":
                var r = JSON.parse(e.slice(1) || "[]");
                t._didClose(r[0], r[1]);
                break;
            case "h":
                t._dispatchHeartbeat()
        }
    }, T.prototype._try_next_protocol = function(t) {
        var r = this;
        r.protocol && (r._debug("Closed transport:", r.protocol, "" + t), r.protocol = null), r._transport_tref && (clearTimeout(r._transport_tref), r._transport_tref = null);
        for (;;) {
            var i = r.protocol = r._protocols.shift();
            if (!i) return !1;
            if (T[i] && T[i].need_body === !0 && (!e.body || typeof e.readyState != "undefined" && e.readyState !== "complete")) return r._protocols.unshift(i), r.protocol = "waiting-for-load", n.attachEvent("load", function() {
                r._try_next_protocol()
            }), !0;
            if (!!T[i] && !!T[i].enabled(r._options)) {
                var s = T[i].roundTrips || 1,
                    o = (r._options.rto || 0) * s || 5e3;
                r._transport_tref = n.delay(o, function() {
                    r.readyState === T.CONNECTING && r._didClose(2007, "Transport timeouted")
                });
                var u = n.random_string(8),
                    a = r._base_url + "/" + r._server + "/" + u;
                return r._debug("Opening transport:", i, " url:" + a, " RTO:" + r._options.rto), r._transport = new T[i](r, a, r._base_url), !0
            }
            r._debug("Skipping transport:", i)
        }
    }, T.prototype.close = function(e, t) {
        var r = this;
        if (e && !n.userSetCode(e)) throw new Error("INVALID_ACCESS_ERR");
        return r.readyState !== T.CONNECTING && r.readyState !== T.OPEN ? !1 : (r.readyState = T.CLOSING, r._didClose(e || 1e3, t || "Normal closure"), !0)
    }, T.prototype.send = function(e) {
        var t = this;
        if (t.readyState === T.CONNECTING) throw new Error("INVALID_STATE_ERR");
        return t.readyState === T.OPEN && t._transport.doSend(n.quote("" + e)), !0
    }, T.prototype._applyInfo = function(t, r, i) {
        var s = this;
        s._options.info = t, s._options.rtt = r, s._options.rto = n.countRTO(r), s._options.info.null_origin = !e.domain;
        var o = n.probeProtocols();
        s._protocols = n.detectProtocols(o, i, t)
    };
    var N = T.websocket = function(e, r) {
        var i = this,
            s = r + "/websocket";
        s.slice(0, 5) === "https" ? s = "wss" + s.slice(5) : s = "ws" + s.slice(4), i.ri = e, i.url = s;
        var o = t.WebSocket || t.MozWebSocket;
        i.ws = new o(i.url), i.ws.onmessage = function(e) {
            i.ri._didMessage(e.data)
        }, i.unload_ref = n.unload_add(function() {
            i.ws.close()
        }), i.ws.onclose = function() {
            i.ri._didMessage(n.closeFrame(1006, "WebSocket connection broken"))
        }
    };
    N.prototype.doSend = function(e) {
        this.ws.send("[" + e + "]")
    }, N.prototype.doCleanup = function() {
        var e = this,
            t = e.ws;
        t && (t.onmessage = t.onclose = null, t.close(), n.unload_del(e.unload_ref), e.unload_ref = e.ri = e.ws = null)
    }, N.enabled = function() {
        return !!t.WebSocket || !!t.MozWebSocket
    }, N.roundTrips = 2;
    var C = function() {};
    C.prototype.send_constructor = function(e) {
        var t = this;
        t.send_buffer = [], t.sender = e
    }, C.prototype.doSend = function(e) {
        var t = this;
        t.send_buffer.push(e), t.send_stop || t.send_schedule()
    }, C.prototype.send_schedule_wait = function() {
        var e = this,
            t;
        e.send_stop = function() {
            e.send_stop = null, clearTimeout(t)
        }, t = n.delay(25, function() {
            e.send_stop = null, e.send_schedule()
        })
    }, C.prototype.send_schedule = function() {
        var e = this;
        if (e.send_buffer.length > 0) {
            var t = "[" + e.send_buffer.join(",") + "]";
            e.send_stop = e.sender(e.trans_url, t, function(t, n) {
                e.send_stop = null, t === !1 ? e.ri._didClose(1006, "Sending error " + n) : e.send_schedule_wait()
            }), e.send_buffer = []
        }
    }, C.prototype.send_destructor = function() {
        var e = this;
        e._send_stop && e._send_stop(), e._send_stop = null
    };
    var k = function(t, r, i) {
            var s = this;
            if (!("_send_form" in s)) {
                var o = s._send_form = e.createElement("form"),
                    u = s._send_area = e.createElement("textarea");
                u.name = "d", o.style.display = "none", o.style.position = "absolute", o.method = "POST", o.enctype = "application/x-www-form-urlencoded", o.acceptCharset = "UTF-8", o.appendChild(u), e.body.appendChild(o)
            }
            var o = s._send_form,
                u = s._send_area,
                a = "a" + n.random_string(8);
            o.target = a, o.action = t + "/jsonp_send?i=" + a;
            var f;
            try {
                f = e.createElement('<iframe name="' + a + '">')
            } catch (l) {
                f = e.createElement("iframe"), f.name = a
            }
            f.id = a, o.appendChild(f), f.style.display = "none";
            try {
                u.value = r
            } catch (c) {
                n.log("Your browser is seriously broken. Go home! " + c.message)
            }
            o.submit();
            var h = function(e) {
                if (!f.onerror) return;
                f.onreadystatechange = f.onerror = f.onload = null, n.delay(500, function() {
                    f.parentNode.removeChild(f), f = null
                }), u.value = "", i(!0)
            };
            return f.onerror = f.onload = h, f.onreadystatechange = function(e) {
                f.readyState == "complete" && h()
            }, h
        },
        L = function(e) {
            return function(t, n, r) {
                var i = new e("POST", t + "/xhr_send", n);
                return i.onfinish = function(e, t) {
                        r(e === 200 || e === 204, "http status " + e)
                    },
                    function(e) {
                        r(!1, e)
                    }
            }
        },
        A = function(t, r) {
            var i, s = e.createElement("script"),
                o, u = function(e) {
                    o && (o.parentNode.removeChild(o), o = null), s && (clearTimeout(i), s.parentNode.removeChild(s), s.onreadystatechange = s.onerror = s.onload = s.onclick = null, s = null, r(e), r = null)
                },
                a = !1,
                f = null;
            s.id = "a" + n.random_string(8), s.src = t, s.type = "text/javascript", s.charset = "UTF-8", s.onerror = function(e) {
                f || (f = setTimeout(function() {
                    a || u(n.closeFrame(1006, "JSONP script loaded abnormally (onerror)"))
                }, 1e3))
            }, s.onload = function(e) {
                u(n.closeFrame(1006, "JSONP script loaded abnormally (onload)"))
            }, s.onreadystatechange = function(e) {
                if (/loaded|closed/.test(s.readyState)) {
                    if (s && s.htmlFor && s.onclick) {
                        a = !0;
                        try {
                            s.onclick()
                        } catch (t) {}
                    }
                    s && u(n.closeFrame(1006, "JSONP script loaded abnormally (onreadystatechange)"))
                }
            };
            if (typeof s.async == "undefined" && e.attachEvent)
                if (!/opera/i.test(navigator.userAgent)) {
                    try {
                        s.htmlFor = s.id, s.event = "onclick"
                    } catch (l) {}
                    s.async = !0
                } else o = e.createElement("script"), o.text = "try{var a = document.getElementById('" + s.id + "'); if(a)a.onerror();}catch(x){};", s.async = o.async = !1;
            typeof s.async != "undefined" && (s.async = !0), i = setTimeout(function() {
                u(n.closeFrame(1006, "JSONP script loaded abnormally (timeout)"))
            }, 35e3);
            var c = e.getElementsByTagName("head")[0];
            return c.insertBefore(s, c.firstChild), o && c.insertBefore(o, c.firstChild), u
        },
        O = T["jsonp-polling"] = function(e, t) {
            n.polluteGlobalNamespace();
            var r = this;
            r.ri = e, r.trans_url = t, r.send_constructor(k), r._schedule_recv()
        };
    O.prototype = new C, O.prototype._schedule_recv = function() {
        var e = this,
            t = function(t) {
                e._recv_stop = null, t && (e._is_closing || e.ri._didMessage(t)), e._is_closing || e._schedule_recv()
            };
        e._recv_stop = M(e.trans_url + "/jsonp", A, t)
    }, O.enabled = function() {
        return !0
    }, O.need_body = !0, O.prototype.doCleanup = function() {
        var e = this;
        e._is_closing = !0, e._recv_stop && e._recv_stop(), e.ri = e._recv_stop = null, e.send_destructor()
    };
    var M = function(e, r, i) {
            var s = "a" + n.random_string(6),
                o = e + "?c=" + escape(u + "." + s),
                a = 0,
                f = function(e) {
                    switch (a) {
                        case 0:
                            delete t[u][s], i(e);
                            break;
                        case 1:
                            i(e), a = 2;
                            break;
                        case 2:
                            delete t[u][s]
                    }
                },
                l = r(o, f);
            t[u][s] = l;
            var c = function() {
                t[u][s] && (a = 1, t[u][s](n.closeFrame(1e3, "JSONP user aborted read")))
            };
            return c
        },
        _ = function() {};
    _.prototype = new C, _.prototype.run = function(e, t, n, r, i) {
        var s = this;
        s.ri = e, s.trans_url = t, s.send_constructor(L(i)), s.poll = new Y(e, r, t + n, i)
    }, _.prototype.doCleanup = function() {
        var e = this;
        e.poll && (e.poll.abort(), e.poll = null)
    };
    var D = T["xhr-streaming"] = function(e, t) {
        this.run(e, t, "/xhr_streaming", rt, n.XHRCorsObject)
    };
    D.prototype = new _, D.enabled = function() {
        return t.XMLHttpRequest && "withCredentials" in new XMLHttpRequest && !/opera/i.test(navigator.userAgent)
    }, D.roundTrips = 2, D.need_body = !0;
    var P = T["xdr-streaming"] = function(e, t) {
        this.run(e, t, "/xhr_streaming", rt, n.XDRObject)
    };
    P.prototype = new _, P.enabled = function() {
        return !!t.XDomainRequest
    }, P.roundTrips = 2;
    var H = T["xhr-polling"] = function(e, t) {
        this.run(e, t, "/xhr", rt, n.XHRCorsObject)
    };
    H.prototype = new _, H.enabled = D.enabled, H.roundTrips = 2;
    var B = T["xdr-polling"] = function(e, t) {
        this.run(e, t, "/xhr", rt, n.XDRObject)
    };
    B.prototype = new _, B.enabled = P.enabled, B.roundTrips = 2;
    var j = function() {};
    j.prototype.i_constructor = function(e, t, r) {
        var i = this;
        i.ri = e, i.origin = n.getOrigin(r), i.base_url = r, i.trans_url = t;
        var s = r + "/iframe.html";
        i.ri._options.devel && (s += "?t=" + +(new Date)), i.window_id = n.random_string(8), s += "#" + i.window_id, i.iframeObj = n.createIframe(s, function(e) {
            i.ri._didClose(1006, "Unable to load an iframe (" + e + ")")
        }), i.onmessage_cb = n.bind(i.onmessage, i), n.attachMessage(i.onmessage_cb)
    }, j.prototype.doCleanup = function() {
        var e = this;
        if (e.iframeObj) {
            n.detachMessage(e.onmessage_cb);
            try {
                e.iframeObj.iframe.contentWindow && e.postMessage("c")
            } catch (t) {}
            e.iframeObj.cleanup(), e.iframeObj = null, e.onmessage_cb = e.iframeObj = null
        }
    }, j.prototype.onmessage = function(e) {
        var t = this;
        if (e.origin !== t.origin) return;
        var n = e.data.slice(0, 8),
            r = e.data.slice(8, 9),
            i = e.data.slice(9);
        if (n !== t.window_id) return;
        switch (r) {
            case "s":
                t.iframeObj.loaded(), t.postMessage("s", JSON.stringify([T.version, t.protocol, t.trans_url, t.base_url]));
                break;
            case "t":
                t.ri._didMessage(i)
        }
    }, j.prototype.postMessage = function(e, t) {
        var n = this;
        n.iframeObj.post(n.window_id + e + (t || ""), n.origin)
    }, j.prototype.doSend = function(e) {
        this.postMessage("m", e)
    }, j.enabled = function() {
        var e = navigator && navigator.userAgent && navigator.userAgent.indexOf("Konqueror") !== -1;
        return (typeof t.postMessage == "function" || typeof t.postMessage == "object") && !e
    };
    var F, I = function(e, r) {
            parent !== t ? parent.postMessage(F + e + (r || ""), "*") : n.log("Can't postMessage, no parent window.", e, r)
        },
        q = function() {};
    q.prototype._didClose = function(e, t) {
        I("t", n.closeFrame(e, t))
    }, q.prototype._didMessage = function(e) {
        I("t", e)
    }, q.prototype._doSend = function(e) {
        this._transport.doSend(e)
    }, q.prototype._doCleanup = function() {
        this._transport.doCleanup()
    }, n.parent_origin = undefined, T.bootstrap_iframe = function() {
        var r;
        F = e.location.hash.slice(1);
        var i = function(e) {
            if (e.source !== parent) return;
            typeof n.parent_origin == "undefined" && (n.parent_origin = e.origin);
            if (e.origin !== n.parent_origin) return;
            var i = e.data.slice(0, 8),
                s = e.data.slice(8, 9),
                o = e.data.slice(9);
            if (i !== F) return;
            switch (s) {
                case "s":
                    var u = JSON.parse(o),
                        a = u[0],
                        f = u[1],
                        l = u[2],
                        c = u[3];
                    a !== T.version && n.log('Incompatibile SockJS! Main site uses: "' + a + '", the iframe:' + ' "' + T.version + '".');
                    if (!n.flatUrl(l) || !n.flatUrl(c)) {
                        n.log("Only basic urls are supported in SockJS");
                        return
                    }
                    if (!n.isSameOriginUrl(l) || !n.isSameOriginUrl(c)) {
                        n.log("Can't connect to different domain from within an iframe. (" + JSON.stringify([t.location.href, l, c]) + ")");
                        return
                    }
                    r = new q, r._transport = new q[f](r, l, c);
                    break;
                case "m":
                    r._doSend(o);
                    break;
                case "c":
                    r && r._doCleanup(), r = null
            }
        };
        n.attachMessage(i), I("s")
    };
    var R = function(e, t) {
        var r = this;
        n.delay(function() {
            r.doXhr(e, t)
        })
    };
    R.prototype = new s(["finish"]), R.prototype.doXhr = function(e, t) {
        var r = this,
            i = (new Date).getTime(),
            s = new t("GET", e + "/info"),
            o = n.delay(8e3, function() {
                s.ontimeout()
            });
        s.onfinish = function(e, t) {
            clearTimeout(o), o = null;
            if (e === 200) {
                var n = (new Date).getTime() - i,
                    s = JSON.parse(t);
                typeof s != "object" && (s = {}), r.emit("finish", s, n)
            } else r.emit("finish")
        }, s.ontimeout = function() {
            s.close(), r.emit("finish")
        }
    };
    var U = function(t) {
        var r = this,
            i = function() {
                var e = new j;
                e.protocol = "w-iframe-info-receiver";
                var n = function(t) {
                        if (typeof t == "string" && t.substr(0, 1) === "m") {
                            var n = JSON.parse(t.substr(1)),
                                i = n[0],
                                s = n[1];
                            r.emit("finish", i, s)
                        } else r.emit("finish");
                        e.doCleanup(), e = null
                    },
                    i = {
                        _options: {},
                        _didClose: n,
                        _didMessage: n
                    };
                e.i_constructor(i, t, t)
            };
        e.body ? i() : n.attachEvent("load", i)
    };
    U.prototype = new s(["finish"]);
    var z = function() {
        var e = this;
        n.delay(function() {
            e.emit("finish", {}, 2e3)
        })
    };
    z.prototype = new s(["finish"]);
    var W = function(e) {
            if (n.isSameOriginUrl(e)) return new R(e, n.XHRLocalObject);
            switch (n.isXHRCorsCapable()) {
                case 1:
                    return new R(e, n.XHRLocalObject);
                case 2:
                    return new R(e, n.XDRObject);
                case 3:
                    return new U(e);
                default:
                    return new z
            }
        },
        X = q["w-iframe-info-receiver"] = function(e, t, r) {
            var i = new R(r, n.XHRLocalObject);
            i.onfinish = function(t, n) {
                e._didMessage("m" + JSON.stringify([t, n])), e._didClose()
            }
        };
    X.prototype.doCleanup = function() {};
    var V = T["iframe-eventsource"] = function() {
        var e = this;
        e.protocol = "w-iframe-eventsource", e.i_constructor.apply(e, arguments)
    };
    V.prototype = new j, V.enabled = function() {
        return "EventSource" in t && j.enabled()
    }, V.need_body = !0, V.roundTrips = 3;
    var $ = q["w-iframe-eventsource"] = function(e, t) {
        this.run(e, t, "/eventsource", Z, n.XHRLocalObject)
    };
    $.prototype = new _;
    var J = T["iframe-xhr-polling"] = function() {
        var e = this;
        e.protocol = "w-iframe-xhr-polling", e.i_constructor.apply(e, arguments)
    };
    J.prototype = new j, J.enabled = function() {
        return t.XMLHttpRequest && j.enabled()
    }, J.need_body = !0, J.roundTrips = 3;
    var K = q["w-iframe-xhr-polling"] = function(e, t) {
        this.run(e, t, "/xhr", rt, n.XHRLocalObject)
    };
    K.prototype = new _;
    var Q = T["iframe-htmlfile"] = function() {
        var e = this;
        e.protocol = "w-iframe-htmlfile", e.i_constructor.apply(e, arguments)
    };
    Q.prototype = new j, Q.enabled = function() {
        return j.enabled()
    }, Q.need_body = !0, Q.roundTrips = 3;
    var G = q["w-iframe-htmlfile"] = function(e, t) {
        this.run(e, t, "/htmlfile", nt, n.XHRLocalObject)
    };
    G.prototype = new _;
    var Y = function(e, t, n, r) {
        var i = this;
        i.ri = e, i.Receiver = t, i.recv_url = n, i.AjaxObject = r, i._scheduleRecv()
    };
    Y.prototype._scheduleRecv = function() {
        var e = this,
            t = e.poll = new e.Receiver(e.recv_url, e.AjaxObject),
            n = 0;
        t.onmessage = function(t) {
            n += 1, e.ri._didMessage(t.data)
        }, t.onclose = function(n) {
            e.poll = t = t.onmessage = t.onclose = null, e.poll_is_closing || (n.reason === "permanent" ? e.ri._didClose(1006, "Polling error (" + n.reason + ")") : e._scheduleRecv())
        }
    }, Y.prototype.abort = function() {
        var e = this;
        e.poll_is_closing = !0, e.poll && e.poll.abort()
    };
    var Z = function(e) {
        var t = this,
            r = new EventSource(e);
        r.onmessage = function(e) {
            t.dispatchEvent(new i("message", {
                data: unescape(e.data)
            }))
        }, t.es_close = r.onerror = function(e, s) {
            var o = s ? "user" : r.readyState !== 2 ? "network" : "permanent";
            t.es_close = r.onmessage = r.onerror = null, r.close(), r = null, n.delay(200, function() {
                t.dispatchEvent(new i("close", {
                    reason: o
                }))
            })
        }
    };
    Z.prototype = new r, Z.prototype.abort = function() {
        var e = this;
        e.es_close && e.es_close({}, !0)
    };
    var et, tt = function() {
            if (et === undefined)
                if ("ActiveXObject" in t) try {
                    et = !!(new ActiveXObject("htmlfile"))
                } catch (e) {} else et = !1;
            return et
        },
        nt = function(e) {
            var r = this;
            n.polluteGlobalNamespace(), r.id = "a" + n.random_string(6, 26), e += (e.indexOf("?") === -1 ? "?" : "&") + "c=" + escape(u + "." + r.id);
            var s = tt() ? n.createHtmlfile : n.createIframe,
                o;
            t[u][r.id] = {
                start: function() {
                    o.loaded()
                },
                message: function(e) {
                    r.dispatchEvent(new i("message", {
                        data: e
                    }))
                },
                stop: function() {
                    r.iframe_close({}, "network")
                }
            }, r.iframe_close = function(e, n) {
                o.cleanup(), r.iframe_close = o = null, delete t[u][r.id], r.dispatchEvent(new i("close", {
                    reason: n
                }))
            }, o = s(e, function(e) {
                r.iframe_close({}, "permanent")
            })
        };
    nt.prototype = new r, nt.prototype.abort = function() {
        var e = this;
        e.iframe_close && e.iframe_close({}, "user")
    };
    var rt = function(e, t) {
        var n = this,
            r = 0;
        n.xo = new t("POST", e, null), n.xo.onchunk = function(e, t) {
            if (e !== 200) return;
            for (;;) {
                var s = t.slice(r),
                    o = s.indexOf("\n");
                if (o === -1) break;
                r += o + 1;
                var u = s.slice(0, o);
                n.dispatchEvent(new i("message", {
                    data: u
                }))
            }
        }, n.xo.onfinish = function(e, t) {
            n.xo.onchunk(e, t), n.xo = null;
            var r = e === 200 ? "network" : "permanent";
            n.dispatchEvent(new i("close", {
                reason: r
            }))
        }
    };
    return rt.prototype = new r, rt.prototype.abort = function() {
        var e = this;
        e.xo && (e.xo.close(), e.dispatchEvent(new i("close", {
            reason: "user"
        })), e.xo = null)
    }, T.getUtils = function() {
        return n
    }, T.getIframeTransport = function() {
        return j
    }, T
}(), "_sockjs_onload" in window && setTimeout(_sockjs_onload, 1), typeof define == "function" && define.amd && define("sockjs", [], function() {
    return SockJS
})