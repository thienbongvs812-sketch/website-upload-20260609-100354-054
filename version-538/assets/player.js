(function () {
  function bindPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-start");

    if (!video || !button) {
      return;
    }

    function loadVideo() {
      if (video.getAttribute("data-ready") === "yes") {
        return;
      }

      var url = video.getAttribute("data-video");
      var Hls = window.Hls;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        shell.hls = hls;
      } else {
        video.src = url;
      }

      video.setAttribute("data-ready", "yes");
    }

    function start() {
      loadVideo();
      button.classList.add("is-hidden");
      var playing = video.play();

      if (playing && typeof playing.catch === "function") {
        playing.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);

    shell.addEventListener("click", function (event) {
      if (video.getAttribute("data-ready") === "yes") {
        return;
      }

      if (event.target === video || event.target === shell) {
        start();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(bindPlayer);
})();
