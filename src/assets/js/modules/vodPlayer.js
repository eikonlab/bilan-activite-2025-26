"use strict";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function attachSource(video, hlsUrl) {
  if (hlsUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = hlsUrl;
    return null;
  }

  if (hlsUrl) {
    const { default: Hls } = await import("hls.js");
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        capLevelToPlayerSize: true,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      return hls;
    }
  }

  return null;
}

function initOne(root) {
  const video = root.querySelector("video");
  const playBtn = root.querySelector("[data-vod-play]");
  const toggleBtn = root.querySelector("[data-vod-toggle]");
  const muteBtn = root.querySelector("[data-vod-mute]");
  const fsBtn = root.querySelector("[data-vod-fs]");
  const seek = root.querySelector("[data-vod-seek]");
  const currentEl = root.querySelector("[data-vod-current]");
  const durationEl = root.querySelector("[data-vod-duration]");

  if (!video) return;

  const hlsUrl = root.dataset.hls || "";
  let sourceReady = attachSource(video, hlsUrl);

  const setPlaying = (playing) => {
    root.classList.toggle("is-playing", playing);
    root.classList.toggle("is-paused", !playing);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-label", playing ? "Pause" : "Lecture");
    }
  };

  const ensureSource = async () => {
    root._vodHls = await sourceReady;
    sourceReady = Promise.resolve(root._vodHls);
  };

  const play = async () => {
    await ensureSource();
    try {
      await video.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const pause = () => {
    video.pause();
    setPlaying(false);
  };

  playBtn?.addEventListener("click", () => play());
  toggleBtn?.addEventListener("click", () => {
    if (video.paused) play();
    else pause();
  });

  video.addEventListener("click", () => {
    if (video.paused) play();
    else pause();
  });

  video.addEventListener("play", () => setPlaying(true));
  video.addEventListener("pause", () => setPlaying(false));
  video.addEventListener("ended", () => setPlaying(false));

  const updateSeekProgress = () => {
    if (!seek) return;
    const max = Number(seek.max) || 0;
    const value = Number(seek.value) || 0;
    const progress = max > 0 ? (value / max) * 100 : 0;
    seek.style.setProperty("--seek-progress", `${progress}%`);
  };

  video.addEventListener("loadedmetadata", () => {
    if (durationEl) durationEl.textContent = formatTime(video.duration);
    if (seek) seek.max = String(video.duration || 0);
    updateSeekProgress();
  });

  video.addEventListener("timeupdate", () => {
    if (currentEl) currentEl.textContent = formatTime(video.currentTime);
    if (seek && !seek.matches(":active")) {
      seek.value = String(video.currentTime || 0);
      updateSeekProgress();
    }
  });

  seek?.addEventListener("input", () => {
    video.currentTime = Number(seek.value);
    updateSeekProgress();
  });

  muteBtn?.addEventListener("click", () => {
    video.muted = !video.muted;
    root.classList.toggle("is-muted", video.muted);
    muteBtn.setAttribute("aria-label", video.muted ? "Son" : "Muet");
  });

  fsBtn?.addEventListener("click", async () => {
    const active =
      document.fullscreenElement === root ||
      document.webkitFullscreenElement === root;

    try {
      if (active) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
      }
    } catch {
      // ignore
    }
  });

  const syncFullscreen = () => {
    const active =
      document.fullscreenElement === root ||
      document.webkitFullscreenElement === root;
    root.classList.toggle("is-fullscreen", active);
    fsBtn?.setAttribute(
      "aria-label",
      active ? "Quitter le plein écran" : "Plein écran",
    );
  };

  document.addEventListener("fullscreenchange", syncFullscreen);
  document.addEventListener("webkitfullscreenchange", syncFullscreen);

  root.addEventListener(
    "keydown",
    (event) => {
      if (event.key === " " || event.key === "k") {
        event.preventDefault();
        if (video.paused) play();
        else pause();
      }
    },
    true,
  );

  // Précharge le flux pour la vignette / durée, sans bloquer le reste du site
  ensureSource();
}

export function initVodPlayers() {
  document.querySelectorAll("[data-vod-player]").forEach(initOne);
}
