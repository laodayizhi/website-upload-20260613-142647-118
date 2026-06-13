(function () {
    window.createMoviePlayer = function (options) {
        var shell = document.querySelector(options.selector || '[data-player]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-player-start]');
        var message = shell.querySelector('[data-player-message]');
        var source = options.source;
        var hls = null;
        var ready = false;

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add('is-visible');
            }
        }

        function prepare() {
            if (ready || !video || !source) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('播放暂时不可用，请稍后重试');
                    }
                });
            } else {
                video.src = source;
            }
            video.controls = true;
        }

        function play() {
            prepare();
            if (!video) {
                return;
            }
            shell.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                play();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
