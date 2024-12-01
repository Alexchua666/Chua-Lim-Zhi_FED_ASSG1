
var EventEmitter = function() {
    this.events = {};
};

EventEmitter.prototype.on = function(event, listener) {
    if (typeof this.events[event] !== 'object') {
        this.events[event] = [];
    }
    this.events[event].push(listener);
};

EventEmitter.prototype.removeListener = function(event, listener) {
    var idx;
    if (typeof this.events[event] === 'object') {
        idx = this.indexOf(this.events[event], listener);
        if (idx > -1) {
            this.events[event].splice(idx, 1);
        }
    }
};

EventEmitter.prototype.emit = function(event) {
    var i, listeners, length, args = [].slice.call(arguments, 1);
    if (typeof this.events[event] === 'object') {
        listeners = this.events[event].slice();
        length = listeners.length;
        for (i = 0; i < length; i++) {
            listeners[i].apply(this, args);
        }
    }
};

EventEmitter.prototype.once = function(event, listener) {
    this.on(event, function g() {
        this.removeListener(event, g);
        listener.apply(this, arguments);
    });
};

var loadScript = function(src, attrs, parent) {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.async = true;
        script.src = src;
        for (var [key, value] of Object.entries(attrs || {})) {
            script.setAttribute(key, value);
        }
        script.onload = () => {
            script.onerror = script.onload = null;
            resolve(script);
        };
        script.onerror = () => {
            script.onerror = script.onload = null;
            reject(new Error(`Failed to load ${src}`));
        };
        (parent || document.head || document.getElementsByTagName('head')[0]).appendChild(script);
    });
};



const YOUTUBE_IFRAME_API_SRC = "https://www.youtube.com/iframe_api";
const YOUTUBE_STATES = {
    "-1": "unstarted",
    0: "ended",
    1: "playing",
    2: "paused",
    3: "buffering",
    5: "cued"
};
const YOUTUBE_ERROR = {
    INVALID_PARAM: 2,
    HTML5_ERROR: 5,
    NOT_FOUND: 100,
    UNPLAYABLE_1: 101,
    UNPLAYABLE_2: 150
};
let loadIframeAPICallbacks = [];

class YouTubePlayer extends EventEmitter {
    constructor(element, options) {
        super();
        var el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el.id) {
            this._id = el.id;
        } else {
            this._id = el.id = "ytplayer-" + Math.random().toString(16).slice(2, 8);
        }
        this._opts = Object.assign({
            width: 640,
            height: 360,
            autoplay: false,
            captions: undefined,
            controls: true,
            keyboard: true,
            fullscreen: true,
            annotations: true,
            modestBranding: false,
            related: true,
            timeupdateFrequency: 1000,
            playsInline: true,
            start: 0
        }, options);
        this.videoId = null;
        this.destroyed = false;
        this._api = null;
        this._autoplay = false;
        this._player = null;
        this._ready = false;
        this._queue = [];
        this.replayInterval = [];
        this._interval = null;
        this._startInterval = this._startInterval.bind(this);
        this._stopInterval = this._stopInterval.bind(this);
        this.on("playing", this._startInterval);
        this.on("unstarted", this._stopInterval);
        this.on("ended", this._stopInterval);
        this.on("paused", this._stopInterval);
        this.on("buffering", this._stopInterval);
        this._loadIframeAPI((err, api) => {
            if (err) return this._destroy(new Error("YouTube Iframe API failed to load"));
            this._api = api;
            if (this.videoId) {
                this.load(this.videoId, this._autoplay, this._start);
            }
        });
    }

    indexOf(array, item) {
        for (var i = 0, length = array.length, idx = -1, found = false; i < length && !found; i++) {
            if (array[i] === item) {
                idx = i;
                found = true;
            }
        }
        return idx;
    }

    load(videoId, autoplay = false, start = 0) {
        if (!this.destroyed) {
            this._startOptimizeDisplayEvent();
            this._optimizeDisplayHandler("center, center");
            this.videoId = videoId;
            this._autoplay = autoplay;
            this._start = start;
            if (this._api) {
                if (this._player) {
                    if (this._ready) {
                        autoplay ? this._player.loadVideoById(videoId, start) : this._player.cueVideoById(videoId, start);
                    }
                } else {
                    this._createPlayer(videoId);
                }
            }
        }
    }

    play() {
        this._ready ? this._player.playVideo() : this._queueCommand("play");
    }

    replayFrom(seconds) {
        if (!this.replayInterval.find((item) => item.iframeParent === this._player.i.parentNode) && seconds) {
            this.replayInterval.push({
                iframeParent: this._player.i.parentNode,
                interval: setInterval(() => {
                    if (this._player.getCurrentTime() >= this._player.getDuration() - Number(seconds)) {
                        this.seek(0);
                        for (const [index, item] of this.replayInterval.entries()) {
                            if (Object.hasOwnProperty.call(this.replayInterval, index)) {
                                clearInterval(this.replayInterval[index].interval);
                                this.replayInterval.splice(index, 1);
                            }
                        }
                    }
                }, 1000 * Number(seconds))
            });
        }
    }

    pause() {
        this._ready ? this._player.pauseVideo() : this._queueCommand("pause");
    }

    stop() {
        this._ready ? this._player.stopVideo() : this._queueCommand("stop");
    }

    seek(seconds) {
        this._ready ? this._player.seekTo(seconds, true) : this._queueCommand("seek", seconds);
    }

    _optimizeDisplayHandler(position) {
        if (!this._player) return;
        const playerElement = this._player.i;
        const positions = position.split(",");
        if (playerElement) {
            const dimensions = {};
            const parentElement = playerElement.parentElement;
            if (parentElement) {
                const computedStyle = window.getComputedStyle(parentElement);
                const parentHeight = parentElement.clientHeight + parseFloat(computedStyle.marginTop, 10) + parseFloat(computedStyle.marginBottom, 10) + parseFloat(computedStyle.borderTopWidth, 10) + parseFloat(computedStyle.borderBottomWidth, 10);
                const parentWidth = parentElement.clientWidth + parseFloat(computedStyle.marginLeft, 10) + parseFloat(computedStyle.marginRight, 10) + parseFloat(computedStyle.borderLeftWidth, 10) + parseFloat(computedStyle.borderRightWidth, 10);
                const aspectRatio = 1.7;
                const player = playerElement;
                dimensions.width = parentWidth;
                dimensions.height = parentHeight + 80;
                player.style.width = dimensions.width + "px";
                player.style.height = Math.ceil(parseFloat(player.style.width, 10) / aspectRatio) + "px";
                player.style.marginTop = Math.ceil(-(parseFloat(player.style.height, 10) - dimensions.height) / 2) + "px";
                player.style.marginLeft = 0;
                const isHeightLess = parseFloat(player.style.height, 10) < dimensions.height;
                if (isHeightLess) {
                    player.style.height = dimensions.height + "px";
                    player.style.width = Math.ceil(parseFloat(player.style.height, 10) * aspectRatio) + "px";
                    player.style.marginTop = 0;
                    player.style.marginLeft = Math.ceil(-(parseFloat(player.style.width, 10) - dimensions.width) / 2) + "px";
                }
                for (const pos of positions) {
                    switch (pos.replace(/ /g, "")) {
                        case "top":
                            player.style.marginTop = isHeightLess ? -(parseFloat(player.style.height, 10) - dimensions.height) / 2 + "px" : 0;
                            break;
                        case "bottom":
                            player.style.marginTop = isHeightLess ? 0 : -(parseFloat(player.style.height, 10) - dimensions.height) + "px";
                            break;
                        case "left":
                            player.style.marginLeft = 0;
                            break;
                        case "right":
                            player.style.marginLeft = isHeightLess ? -(parseFloat(player.style.width, 10) - dimensions.width) : "0px";
                            break;
                        default:
                            if (parseFloat(player.style.width, 10) > dimensions.width) {
                                player.style.marginLeft = -(parseFloat(player.style.width, 10) - dimensions.width) / 2 + "px";
                            }
                    }
                }
            }
        }
    }
    

stopResize() {
    window.removeEventListener("resize", this._resizeListener);
    this._resizeListener = null;
}

stopReplay(e) {
    for (const [t, i] of this.replayInterval.entries()) {
        if (Object.hasOwnProperty.call(this.replayInterval, t) && e === this.replayInterval[t].iframeParent) {
            clearInterval(this.replayInterval[t].interval);
            this.replayInterval.splice(t, 1);
        }
    }
}

setVolume(e) {
    this._ready ? this._player.setVolume(e) : this._queueCommand("setVolume", e);
}

loadPlaylist() {
    this._ready ? this._player.loadPlaylist(this.videoId) : this._queueCommand("loadPlaylist", this.videoId);
}

setLoop(e) {
    this._ready ? this._player.setLoop(e) : this._queueCommand("setLoop", e);
}

getVolume() {
    return this._ready && this._player.getVolume() || 0;
}

mute() {
    this._ready ? this._player.mute() : this._queueCommand("mute");
}

unMute() {
    this._ready ? this._player.unMute() : this._queueCommand("unMute");
}

isMuted() {
    return this._ready && this._player.isMuted() || false;
}

setSize(e, t) {
    this._ready ? this._player.setSize(e, t) : this._queueCommand("setSize", e, t);
}

setPlaybackRate(e) {
    this._ready ? this._player.setPlaybackRate(e) : this._queueCommand("setPlaybackRate", e);
}

setPlaybackQuality(e) {
    this._ready ? this._player.setPlaybackQuality(e) : this._queueCommand("setPlaybackQuality", e);
}

getPlaybackRate() {
    return this._ready && this._player.getPlaybackRate() || 1;
}

getAvailablePlaybackRates() {
    return this._ready && this._player.getAvailablePlaybackRates() || [1];
}

getDuration() {
    return this._ready && this._player.getDuration() || 0;
}

getProgress() {
    return this._ready && this._player.getVideoLoadedFraction() || 0;
}

getState() {
    return this._ready && YOUTUBE_STATES[this._player.getPlayerState()] || "unstarted";
}

getCurrentTime() {
    return this._ready && this._player.getCurrentTime() || 0;
}

destroy() {
    this._destroy();
}

_destroy(e) {
    if (!this.destroyed) {
        this.destroyed = true;
        if (this._player) {
            if (this._player.stopVideo) this._player.stopVideo();
            this._player.destroy();
        }
        this.videoId = null;
        this._id = null;
        this._opts = null;
        this._api = null;
        this._player = null;
        this._ready = false;
        this._queue = null;
        this._stopInterval();
        this.removeListener("playing", this._startInterval);
        this.removeListener("paused", this._stopInterval);
        this.removeListener("buffering", this._stopInterval);
        this.removeListener("unstarted", this._stopInterval);
        this.removeListener("ended", this._stopInterval);
        if (e) this.emit("error", e);
    }
}

_queueCommand(e, ...t) {
    if (!this.destroyed) this._queue.push([e, t]);
}

_flushQueue() {
    while (this._queue.length) {
        var e = this._queue.shift();
        this[e[0]].apply(this, e[1]);
    }
}

_loadIframeAPI(e) {
    if (window.YT && typeof window.YT.Player === "function") return e(null, window.YT);
    loadIframeAPICallbacks.push(e);
    if (!Array.from(document.getElementsByTagName("script")).some((e) => e.src === YOUTUBE_IFRAME_API_SRC)) {
        loadScript(YOUTUBE_IFRAME_API_SRC).catch((e) => {
            while (loadIframeAPICallbacks.length) {
                loadIframeAPICallbacks.shift()(e);
            }
        });
    }
    var t = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
        if (typeof t === "function") t();
        while (loadIframeAPICallbacks.length) {
            loadIframeAPICallbacks.shift()(null, window.YT);
        }
    };
}

_createPlayer(e) {
    if (!this.destroyed) {
        var t = this._opts;
        this._player = new this._api.Player(this._id, {
            width: t.width,
            height: t.height,
            videoId: e,
            host: t.host,
            playerVars: {
                autoplay: t.autoplay ? 1 : 0,
                mute: t.mute ? 1 : 0,
                hl: t.captions !== undefined && t.captions !== false ? t.captions : undefined,
                cc_lang_pref: t.captions !== undefined && t.captions !== false ? t.captions : undefined,
                controls: t.controls ? 2 : 0,
                enablejsapi: 1,
                allowfullscreen: true,
                iv_load_policy: t.annotations ? 1 : 3,
                modestbranding: t.modestBranding ? 1 : 0,
                origin: "*",
                rel: t.related ? 1 : 0,
                mode: "transparent",
                showinfo: 0,
                html5: 1,
                version: 3,
                playerapiid: "iframe_YTP_1624972482514"
            },
            events: {
                onReady: () => this._onReady(e),
                onStateChange: (e) => this._onStateChange(e),
                onPlaybackQualityChange: (e) => this._onPlaybackQualityChange(e),
                onPlaybackRateChange: (e) => this._onPlaybackRateChange(e),
                onError: (e) => this._onError(e)
            }
        });
    }
}


_onReady(e) {
    if (!this.destroyed) {
        this._ready = true;
        this.load(this.videoId, this._autoplay, this._start);
        this._flushQueue();
    }
}

_onStateChange(e) {
    if (!this.destroyed) {
        var t = YOUTUBE_STATES[e.data];
        if (!t) throw new Error("Unrecognized state change: " + e);
        if (["paused", "buffering", "ended"].includes(t)) this._onTimeupdate();
        this.emit(t);
        if (["unstarted", "playing", "cued"].includes(t)) this._onTimeupdate();
    }
}

_onPlaybackQualityChange(e) {
    if (!this.destroyed) this.emit("playbackQualityChange", e.data);
}

_onPlaybackRateChange(e) {
    if (!this.destroyed) this.emit("playbackRateChange", e.data);
}

_onError(e) {
    if (!this.destroyed) {
        var t = e.data;
        if (t !== YOUTUBE_ERROR.HTML5_ERROR) {
            if ([YOUTUBE_ERROR.UNPLAYABLE_1, YOUTUBE_ERROR.UNPLAYABLE_2, YOUTUBE_ERROR.NOT_FOUND, YOUTUBE_ERROR.INVALID_PARAM].includes(t)) {
                this.emit("unplayable", this.videoId);
            } else {
                this._destroy(new Error("YouTube Player Error. Unknown error code: " + t));
            }
        }
    }
}

_startOptimizeDisplayEvent() {
    if (!this._resizeListener) {
        this._resizeListener = () => this._optimizeDisplayHandler("center, center");
        window.addEventListener("resize", this._resizeListener);
    }
}

_onTimeupdate() {
    this.emit("timeupdate", this.getCurrentTime());
}

_startInterval() {
    this._interval = setInterval(() => this._onTimeupdate(), this._opts.timeupdateFrequency);
}

_stopInterval() {
    clearInterval(this._interval);
    this._interval = null;
}
}
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    alert('Send successfully!');
    window.location.href = 'index.html'; // Redirect to the home page
});




