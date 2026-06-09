(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function startPlayer(wrap) {
    var video = wrap.querySelector("video");
    var trigger = wrap.querySelector(".player-trigger");
    var stream = wrap.getAttribute("data-stream");
    var loaded = false;
    var hls = null;

    function playVideo() {
      wrap.classList.add("is-playing");
      video.controls = true;
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {});
      }
    }

    function loadAndPlay() {
      if (!video || !stream) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          loaded = true;
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          loaded = true;
          return;
        }

        video.src = stream;
        loaded = true;
      }

      playVideo();
    }

    if (trigger) {
      trigger.addEventListener("click", loadAndPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener("play", function () {
        wrap.classList.add("is-playing");
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), startPlayer);
  });
})();
