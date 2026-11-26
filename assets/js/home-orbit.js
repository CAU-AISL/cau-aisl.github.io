(() => {
  'use strict';
  const stage = document.querySelector('.aisl-universe');
  if (!stage) return;
  const canvas = stage.querySelector('canvas');
  const context = canvas.getContext('2d');
  const toggle = document.querySelector('.aisl-motion');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = window.AislGalaxy;
  if (!context || !renderer) return;
  const images = {};
  stage.querySelectorAll('[data-orbiter]').forEach(element => {
    images[element.dataset.orbiter] = element.querySelector('img');
  });
  stage.classList.add('is-3d-ready');
  let width = 0, height = 0, pixelRatio = 1, elapsed = 0, lastTime = null;
  let frame = null, lastDraw = -Infinity, visible = true, paused = reducedMotion.matches;

  function updateButton() {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play galaxy animation' : 'Pause galaxy animation');
    toggle.querySelector('.aisl-motion-label').textContent = paused ? 'Play orbit' : 'Pause orbit';
    toggle.querySelector('.aisl-motion-symbol').textContent = paused ? '▷' : 'Ⅱ';
  }

  function draw() {
    renderer.render(context, width, height, elapsed, images, pixelRatio);
  }

  function tick(now) {
    frame = null;
    if (paused || !visible || document.hidden) { lastTime = null; return; }
    if (lastTime !== null) elapsed = (elapsed + Math.min(now - lastTime, 80)) % renderer.PERIOD;
    lastTime = now;
    // Slow ink animation stays smooth at 30 fps without redrawing thousands of
    // projected pen strokes on every high-refresh-rate display frame.
    if (now - lastDraw >= 1000 / 30) {
      draw();
      lastDraw = now;
    }
    frame = requestAnimationFrame(tick);
  }

  function syncAnimation() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    lastDraw = -Infinity;
    draw();
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function resize() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    draw();
  }

  toggle.addEventListener('click', () => { paused = !paused; updateButton(); syncAnimation(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; updateButton(); syncAnimation(); });
  document.addEventListener('visibilitychange', syncAnimation);
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncAnimation(); }, { threshold: 0 }).observe(stage);
  Object.values(images).forEach(image => image.addEventListener('load', draw));
  updateButton();
  resize();
  syncAnimation();

})();
