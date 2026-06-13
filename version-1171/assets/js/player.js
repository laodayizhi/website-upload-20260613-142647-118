import { H as Hls } from "./hls.js";

const setupPlayer = (box) => {
  const video = box.querySelector("video[data-stream]");
  const button = box.querySelector(".player-start");
  const status = box.querySelector(".player-status");

  if (!video) {
    return;
  }

  const stream = video.getAttribute("data-stream");

  const showStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  const markReady = () => {
    box.classList.add("is-ready");
    showStatus("");
  };

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = stream;
    markReady();
  } else if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(stream);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, markReady);
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        return;
      }

      showStatus("播放遇到问题，请刷新页面重试");
      hls.destroy();
    });
  } else {
    showStatus("播放遇到问题，请更换浏览器");
  }

  const togglePlay = async () => {
    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      showStatus("播放遇到问题，请刷新页面重试");
    }
  };

  if (button) {
    button.addEventListener("click", togglePlay);
  }

  video.addEventListener("click", togglePlay);
  video.addEventListener("play", () => box.classList.add("is-playing"));
  video.addEventListener("pause", () => box.classList.remove("is-playing"));
};

document.querySelectorAll("[data-player-box]").forEach(setupPlayer);
