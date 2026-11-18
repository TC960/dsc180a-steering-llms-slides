(() => {
  const deck = document.querySelector('.deck');
  const slides = Array.from(deck.querySelectorAll(':scope > section:not([data-skip])'));
  const fill = document.querySelector('.progress-fill');
  const params = new URLSearchParams(location.search);
  const embedded = params.has('embed');
  const still = params.has('still');
  const channel = !embedded && 'BroadcastChannel' in window ? new BroadcastChannel('q1-deck') : null;
  let current = -1;

  if (embedded) document.body.classList.add('embed');
  if (still) document.body.classList.add('still');

  slides.forEach((slide, i) => {
    slide.querySelectorAll('.pg').forEach(p => { p.textContent = i + 1; });
  });

  function fit() {
    const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    deck.style.setProperty('--scale', scale);
  }

  function replaySvg(slide) {
    slide.querySelectorAll('svg').forEach(svg => {
      if (!svg.setCurrentTime) return;
      if (still) {
        svg.setCurrentTime(30);
        svg.pauseAnimations();
      } else {
        svg.setCurrentTime(0);
      }
    });
  }

  // each animation plays once from the start, then holds its last frame
  function playVideos(slide) {
    slide.querySelectorAll('video').forEach(video => {
      if (still) {
        const toEnd = () => {
          video.pause();
          video.currentTime = Math.max(0, video.duration - 0.05);
        };
        if (video.readyState >= 1) toEnd();
        else video.addEventListener('loadedmetadata', toEnd, { once: true });
        return;
      }
      video.currentTime = 0;
      const playing = video.play();
      if (playing) playing.catch(() => {});
    });
  }

  function pauseVideos(slide) {
    slide.querySelectorAll('video').forEach(video => video.pause());
  }

  function describe(i) {
    const slide = slides[i];
    if (!slide) return null;
    const title = slide.querySelector('.title, .big');
    const notes = slide.querySelector('aside');
    const footer = slide.querySelector('.footer p');
    return {
      title: title ? title.textContent.trim() : slide.id,
      notes: notes ? notes.textContent.trim() : '',
      section: footer ? footer.textContent.trim() : '',
    };
  }

  function broadcast() {
    if (!channel) return;
    channel.postMessage({
      type: 'state',
      index: current,
      total: slides.length,
      now: describe(current),
      next: describe(current + 1),
    });
  }

  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === current) return;
    deck.dataset.dir = n < current ? 'back' : 'forward';

    const prev = slides[current];
    if (prev) {
      pauseVideos(prev);
      prev.classList.remove('active');
      prev.classList.add('leaving');
      setTimeout(() => prev.classList.remove('leaving'), 700);
    }

    const next = slides[n];
    next.classList.remove('active', 'leaving');
    void next.offsetWidth; // restart the entrance animations
    next.classList.add('active');
    replaySvg(next);
    playVideos(next);

    current = n;
    fill.style.width = `${((n + 1) / slides.length) * 100}%`;
    if (!embedded) history.replaceState(null, '', `#${n + 1}`);
    broadcast();
  }

  function fromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    return Number.isFinite(n) ? n - 1 : 0;
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }

  function openNotes() {
    window.open('notes.html', 'q1-notes', 'width=1280,height=800');
  }

  window.deck = { go, get index() { return current; }, count: slides.length };

  fit();
  addEventListener('resize', fit);
  go(fromHash());

  if (embedded) return;

  let typed = '';
  let typedTimer;

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (/^[0-9]$/.test(e.key)) {
      typed += e.key;
      clearTimeout(typedTimer);
      typedTimer = setTimeout(() => { typed = ''; }, 1500);
      return;
    }

    switch (e.key) {
      case 'Enter':
        if (typed) { go(parseInt(typed, 10) - 1); typed = ''; break; }
        go(current + 1);
        break;
      case 'ArrowRight': case 'ArrowDown': case 'PageDown':
        go(current + 1);
        break;
      case ' ':
        go(current + (e.shiftKey ? -1 : 1));
        break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
        go(current - 1);
        break;
      case 'Home': go(0); break;
      case 'End': go(slides.length - 1); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 's': case 'S': openNotes(); break;
      case 'r': case 'R': playVideos(slides[current]); break;
      default: return;
    }
    e.preventDefault();
  });

  addEventListener('click', e => {
    if (e.target.closest('a')) return;
    go(current + (e.clientX < innerWidth * 0.25 ? -1 : 1));
  });

  let touchX = null;
  addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  addEventListener('hashchange', () => go(fromHash()));

  let idleTimer;
  addEventListener('mousemove', () => {
    document.body.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => document.body.classList.add('idle'), 2000);
  });

  if (channel) {
    channel.onmessage = ({ data }) => {
      if (data.type === 'hello') broadcast();
      else if (data.type === 'go') go(data.index);
      else if (data.type === 'step') go(current + data.by);
    };
  }
})();
