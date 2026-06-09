(function () {
  var shell = document.querySelector('[data-stream]');
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('.play-overlay');
  var message = shell.querySelector('.player-message');
  var stream = shell.getAttribute('data-stream');
  var ready = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function prepare() {
    if (ready || !video || !stream) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放遇到问题，请稍后重试');
        }
      });
      return Promise.resolve();
    }

    video.src = stream;
    return Promise.resolve();
  }

  function play() {
    prepare().then(function () {
      if (button) {
        button.classList.add('hide');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (button) {
            button.classList.remove('hide');
          }
          setMessage('点击播放按钮开始观看');
        });
      }
    });
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hide');
      }
      setMessage('');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        if (button) {
          button.classList.remove('hide');
        }
      }
    });
  }
})();
