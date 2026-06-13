(function () {
    function setupPlayer(playerId, streamUrl) {
        const shell = document.getElementById(playerId);
        if (!shell) {
            return;
        }

        const video = shell.querySelector("video");
        const veil = shell.querySelector(".player-veil");
        const button = shell.querySelector(".player-start");
        let attached = false;
        let hlsInstance = null;

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && Hls.isSupported()) {
                hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function start(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            attachStream();
            shell.classList.add("is-playing");
            if (veil) {
                veil.hidden = true;
            }
            const promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        if (veil) {
            veil.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupPlayer = setupPlayer;
})();
