(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

  players.forEach(function (box) {
    var video = box.querySelector(".movie-player");
    var button = box.querySelector(".player-start");
    var error = box.querySelector(".player-error");
    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var hls = null;
    var ready = false;
    var loading = false;

    var showError = function () {
      if (error) {
        error.textContent = "视频暂时无法播放";
        error.classList.add("is-visible");
      }
    };

    var startVideo = function () {
      button.classList.add("is-hidden");
      var played = video.play();
      if (played && typeof played.catch === "function") {
        played.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    };

    var prepare = function () {
      if (ready || loading) {
        startVideo();
        return;
      }

      loading = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        ready = true;
        startVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          startVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showError();
          }
        });
        return;
      }

      video.src = stream;
      ready = true;
      startVideo();
    };

    button.addEventListener("click", prepare);
    video.addEventListener("click", function () {
      if (video.paused) {
        prepare();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("error", showError);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
