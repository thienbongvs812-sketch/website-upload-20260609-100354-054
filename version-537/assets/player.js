(function () {
    function forEach(list, callback) {
        Array.prototype.forEach.call(list, callback);
    }

    function setText(node, text) {
        if (node) {
            node.textContent = text || '';
        }
    }

    function initPlayer(box) {
        var video = box.querySelector('video');
        var stream = box.getAttribute('data-stream');
        var loading = box.querySelector('[data-player-loading]');
        var error = box.querySelector('[data-player-error]');
        var playButtons = box.querySelectorAll('[data-play-toggle]');
        var muteButton = box.querySelector('[data-mute-toggle]');
        var fullscreenButton = box.querySelector('[data-fullscreen-toggle]');
        var hls = null;

        function ready() {
            box.classList.add('is-ready');
            setText(loading, '');
        }

        function fail(message) {
            box.classList.add('is-ready');
            setText(error, message || '播放失败，请稍后重试。');
        }

        function sync() {
            box.classList.toggle('is-playing', !video.paused);
            forEach(playButtons, function (button) {
                button.textContent = video.paused ? (button.classList.contains('player-center-button') ? '▶' : '播放') : (button.classList.contains('player-center-button') ? '▶' : '暂停');
            });
        }

        function togglePlay() {
            if (video.paused) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        fail('播放失败，请稍后重试。');
                    });
                }
            } else {
                video.pause();
            }
        }

        if (!video || !stream) {
            fail('播放失败，请稍后重试。');
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, ready);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    fail('播放失败，请稍后重试。');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.addEventListener('loadedmetadata', ready, { once: true });
        } else {
            fail('播放失败，请稍后重试。');
        }

        video.addEventListener('click', togglePlay);
        video.addEventListener('play', sync);
        video.addEventListener('pause', sync);
        video.addEventListener('ended', sync);

        forEach(playButtons, function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                togglePlay();
            });
        });

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '取消静音' : '静音';
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (box.requestFullscreen) {
                    box.requestFullscreen();
                }
            });
        }
    }

    forEach(document.querySelectorAll('[data-player]'), initPlayer);
})();
