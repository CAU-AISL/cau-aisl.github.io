/* Perspective-projected 3D geometry, rendered as blue pen strokes on paper.
 * No flattened galaxy texture: each orbit, sphere and dust mote has XYZ coordinates.
 * Shared by the browser and the local renderer checks. */
(function (root, factory) {
  const scene = factory();
  if (typeof module === 'object' && module.exports) module.exports = scene;
  else root.AislGalaxy = scene;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const TAU = Math.PI * 2;
  const INK = '49,66,209';
  const PERIOD = 72000;
  const ink = opacity => `rgba(${INK},${opacity})`;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function randomSource(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  const random = randomSource(1907);
  const rings = Array.from({ length: 13 }, (_, i) => ({
    radius: .55 + i * .0405,
    height: (i % 3 - 1) * .026,
    inclination: (i % 4 - 1.5) * .026,
    phase: i * 1.23,
    dashed: i === 0 || i === 12
  }));
  const planets = Array.from({ length: 38 }, (_, i) => ({
    ring: rings[(i * 7 + 3) % rings.length],
    phase: i * 2.39996 + random() * .3,
    radius: i % 9 === 0 ? .047 : i % 4 === 0 ? .031 : .009 + random() * .014,
    lift: (random() - .5) * .08,
    spin: random() * TAU
  }));
  const dust = Array.from({ length: 210 }, () => ({
    radius: .52 + random() * .57,
    phase: random() * TAU,
    height: (random() - .5) * .10,
    size: .35 + random() * .6
  }));
  const stars = [
    { x: -.77, y: .16, z: -.57, size: .024 },
    { x: .83, y: .13, z: -.45, size: .019 },
    { x: .48, y: .025, z: .91, size: .022 }
  ];
  const vehicleSpecs = [
    { kind: 'rocket', phase: 2.22, radius: .77, lift: .015, aspect: 300 / 1020,
      crop: [570 / 1440, 30 / 1092, 300 / 1440, 1020 / 1092],
      silhouette: [[.5,.025],[.67,.12],[.72,.59],[.92,.73],[.94,.98],[.64,.92],[.38,.92],[.06,.98],[.09,.73],[.28,.59],[.3,.12]] },
    { kind: 'uam', phase: 4.4, radius: .70, lift: .07, aspect: 1340 / 890,
      crop: [50 / 1448, 130 / 1086, 1340 / 1448, 890 / 1086],
      silhouette: [[.01,.15],[.24,.25],[.25,.06],[.42,.02],[.52,.1],[.55,.25],[.7,.29],[.8,.03],[.84,.03],[.82,.28],[.92,.37],[.85,.4],[.74,.35],[.68,.46],[.9,.44],[.98,.52],[.99,.65],[.92,.72],[.85,.71],[.98,.93],[.94,.97],[.74,.84],[.76,.94],[.67,.99],[.54,.98],[.5,.91],[.49,.81],[.46,.7],[.23,.87],[.2,.83],[.24,.69],[.35,.52],[.22,.47],[.1,.56],[.02,.51],[.01,.4],[.08,.3],[.23,.29]] },
    { kind: 'robot', phase: .28, radius: .80, lift: .015, aspect: 570 / 1480, sizeScale: 1.3,
      crop: [185 / 1024, 40 / 1536, 570 / 1024, 1480 / 1536],
      silhouette: [[.38,.03],[.48,.01],[.62,.04],[.69,.11],[.62,.17],[.72,.21],[.88,.23],[.97,.44],[.89,.54],[.77,.37],[.72,.54],[.7,.65],[.81,.93],[.71,.99],[.59,.69],[.49,.67],[.37,.99],[.26,.94],[.37,.63],[.36,.48],[.23,.52],[.12,.45],[.19,.26],[.29,.22],[.4,.17],[.32,.11]] }
  ];

  function camera(width, height) {
    const unit = width * .42;
    const elevation = Math.asin(clamp(height * .205 / unit, .10, .46));
    return { width, height, unit, distance: 5.4, cx: width / 2, cy: height * .60,
      sin: Math.sin(elevation), cos: Math.cos(elevation), roll: -.065 };
  }

  function rotateY(point, angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return { x: point.x * c - point.z * s, y: point.y, z: point.x * s + point.z * c };
  }

  function project(point, view) {
    const vertical = point.y * view.cos - point.z * view.sin;
    const depth = point.z * view.cos + point.y * view.sin;
    const scale = view.distance / (view.distance - depth);
    const x = point.x * scale * view.unit;
    const y = -vertical * scale * view.unit;
    return { x: view.cx + x * Math.cos(view.roll) - y * Math.sin(view.roll),
      y: view.cy + x * Math.sin(view.roll) + y * Math.cos(view.roll), depth, scale };
  }

  function orbitPoint(ring, phase, rotation) {
    // Small independent inclinations and vertical variation give the galaxy thickness.
    const r = ring.radius * (1 + .012 * Math.cos(phase * 3 + ring.phase));
    return rotateY({ x: r * Math.cos(phase), z: r * Math.sin(phase),
      y: ring.height + ring.inclination * Math.sin(phase + ring.phase)
        + .006 * Math.sin(phase * 3 + ring.phase) }, rotation);
  }

  function vehicleLayout(spec, rotation, view) {
    const world = rotateY({ x: Math.cos(spec.phase) * spec.radius,
      y: spec.lift, z: Math.sin(spec.phase) * spec.radius }, rotation);
    const point = project(world, view);
    const heightLimit = view.height * (spec.kind === 'uam' ? .48 : .58);
    const widthLimit = view.width * (spec.kind === 'uam' ? .34 : spec.kind === 'robot' ? .19 : .11);
    const height = Math.min(heightLimit, widthLimit / spec.aspect) * point.scale * (spec.sizeScale || 1);
    // Reserve clear space above every object, including its far-side passage.
    const h = Math.min(height, Math.max(12, (point.y - 10) / .88));
    const w = h * spec.aspect;
    return { spec, world, point, width: w, height: h,
      x: clamp(point.x - w / 2, 6, view.width - w - 6),
      y: clamp(point.y - h * .88, 6, view.height - h - 6), depth: point.depth };
  }

  function sceneAt(width, height, elapsed) {
    const view = camera(width, height);
    const rotation = ((elapsed % PERIOD) / PERIOD) * TAU;
    return { view, rotation, vehicles: vehicleSpecs.map(spec => vehicleLayout(spec, rotation, view)) };
  }

  function path(context, points) {
    context.beginPath();
    points.forEach((p, i) => i ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
  }

  // Surface lines and stipples belong to the sphere in model space, so they turn
  // around its volume rather than being squashed with the orbital plane.
  const globeLines = [];
  for (let latitude = -2; latitude <= 2; latitude++) {
    const phi = latitude * Math.PI / 7;
    globeLines.push(Array.from({ length: 49 }, (_, n) => ({
      x: Math.cos(phi) * Math.cos(n / 48 * TAU), y: Math.sin(phi),
      z: Math.cos(phi) * Math.sin(n / 48 * TAU) })));
  }
  for (let longitude = 0; longitude < 7; longitude++) {
    const theta = longitude / 7 * Math.PI;
    globeLines.push(Array.from({ length: 49 }, (_, n) => ({
      x: Math.cos(n / 48 * TAU) * Math.cos(theta), y: Math.sin(n / 48 * TAU),
      z: Math.cos(n / 48 * TAU) * Math.sin(theta) })));
  }
  const stipples = Array.from({ length: 340 }, () => {
    const y = random() * 2 - 1, theta = random() * TAU;
    const r = Math.sqrt(1 - y * y);
    return { x: r * Math.cos(theta), y, z: r * Math.sin(theta), weight: random() };
  });

  function drawPlanet(context, planet, world, rotation, view) {
    const p = project(world, view);
    const radius = planet.radius * view.unit * p.scale;
    const opacity = clamp(.80 + p.depth * .13, .55, .95);
    context.fillStyle = '#fff';
    context.strokeStyle = ink(opacity);
    context.lineWidth = Math.max(.65, radius * .035);
    context.beginPath();
    context.arc(p.x, p.y, radius, 0, TAU);
    context.fill();
    context.stroke();
    if (radius < 4) return;
    context.save();
    context.clip();
    context.strokeStyle = ink(opacity * .39);
    context.lineWidth = .45;
    const spin = planet.spin + rotation * .8;
    globeLines.forEach(line => {
      context.beginPath();
      let connected = false;
      line.forEach(local => {
        const normal = rotateY(local, spin);
        const facing = normal.z * view.cos + normal.y * view.sin;
        if (facing < .02) { connected = false; return; }
        const q = project({ x: world.x + normal.x * planet.radius,
          y: world.y + normal.y * planet.radius, z: world.z + normal.z * planet.radius }, view);
        if (connected) context.lineTo(q.x, q.y); else context.moveTo(q.x, q.y);
        connected = true;
      });
      context.stroke();
    });
    context.fillStyle = ink(opacity * .76);
    stipples.forEach(local => {
      const normal = rotateY(local, spin);
      const facing = normal.z * view.cos + normal.y * view.sin;
      const light = -.5 * normal.x + .7 * normal.y + .3 * normal.z;
      if (facing < .05 || local.weight < light + .20) return;
      const q = project({ x: world.x + normal.x * planet.radius,
        y: world.y + normal.y * planet.radius, z: world.z + normal.z * planet.radius }, view);
      const dot = Math.max(.4, radius * .022);
      context.fillRect(q.x, q.y, dot, dot);
    });
    // Dense pen hatching describes the shaded hemisphere; not a wireframe or gloss.
    context.save();
    context.beginPath();
    context.moveTo(p.x - radius, p.y + radius * .05);
    context.bezierCurveTo(p.x - radius * .2, p.y + radius * .8,
      p.x + radius * .6, p.y + radius * .25, p.x + radius * .48, p.y - radius);
    context.lineTo(p.x + radius, p.y - radius);
    context.lineTo(p.x + radius, p.y + radius);
    context.lineTo(p.x - radius, p.y + radius);
    context.closePath();
    context.clip();
    context.strokeStyle = ink(opacity * .63);
    context.lineWidth = .55;
    const spacing = Math.max(1.8, radius * .11);
    for (let offset = -radius * 2; offset < radius * 2; offset += spacing) {
      context.beginPath();
      context.moveTo(p.x - radius, p.y + offset + radius * .5);
      context.lineTo(p.x + radius, p.y + offset - radius * .5);
      context.stroke();
    }
    context.strokeStyle = ink(opacity * .36);
    for (let offset = -radius * 2; offset < radius * 2; offset += spacing * 1.5) {
      context.beginPath();
      context.moveTo(p.x + offset, p.y - radius);
      context.lineTo(p.x + offset + radius * .6, p.y + radius);
      context.stroke();
    }
    context.restore();
    context.restore();
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(p.x - radius * .31, p.y - radius * .36, radius * .13, 0, TAU);
    context.fill();
  }

  function drawVehicle(context, vehicle, image) {
    if (!image || !(image.naturalWidth || image.width)) return;
    const { spec, x, y, width, height } = vehicle;
    context.save();
    // The rocket still has paper around its ink drawing. The other images
    // already have alpha cutouts, so a white silhouette would show through
    // their transparent gaps and undo the background removal.
    if (spec.kind === 'rocket') {
      path(context, spec.silhouette.map(p => ({ x: x + p[0] * width, y: y + p[1] * height })));
      context.closePath();
      context.fillStyle = '#fff';
      context.fill();
      context.globalCompositeOperation = 'multiply';
    }
    const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
    const c = spec.crop;
    context.drawImage(image, c[0] * iw, c[1] * ih, c[2] * iw, c[3] * ih, x, y, width, height);
    context.restore();
  }

  function render(context, width, height, elapsed, images = {}, pixelRatio = 1) {
    if (width <= 0 || height <= 0) return;
    const scene = sceneAt(width, height, elapsed);
    const { view, rotation } = scene;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    const queue = [];
    rings.forEach((ring, index) => {
      for (let segment = 0; segment < 32; segment++) {
        const points = Array.from({ length: 7 }, (_, j) =>
          project(orbitPoint(ring, (segment + j / 6) / 32 * TAU, rotation), view));
        queue.push({ kind: 'line', points, dashed: ring.dashed, index,
          depth: points[3].depth });
      }
    });
    dust.forEach(mote => {
      const p = project(rotateY({ x: Math.cos(mote.phase) * mote.radius,
        y: mote.height, z: Math.sin(mote.phase) * mote.radius }, rotation), view);
      queue.push({ kind: 'dust', p, size: mote.size, depth: p.depth });
    });
    planets.forEach(planet => {
      const world = orbitPoint(planet.ring, planet.phase, rotation);
      world.y += planet.lift;
      queue.push({ kind: 'planet', planet, world,
        depth: project(world, view).depth + planet.radius * .75 });
    });
    scene.vehicles.forEach(vehicle => queue.push({ kind: 'vehicle', vehicle, depth: vehicle.depth }));
    stars.forEach(star => {
      const p = project(rotateY(star, rotation), view);
      queue.push({ kind: 'star', p, size: Math.min(19, star.size * view.unit * p.scale), depth: p.depth });
    });
    // Painter's order is shared by paths, spherical planets and vehicle drawings.
    queue.sort((a, b) => a.depth - b.depth);
    queue.forEach(item => {
      if (item.kind === 'line') {
        path(context, item.points);
        context.strokeStyle = ink(clamp(.47 + item.depth * .19, .20, .70));
        context.lineWidth = item.index % 3 === 0 ? .9 : .6;
        context.setLineDash(item.dashed ? [3, 6] : []);
        context.stroke();
        context.setLineDash([]);
      } else if (item.kind === 'dust') {
        context.fillStyle = ink(clamp(.36 + item.depth * .13, .16, .60));
        const r = item.size * item.p.scale;
        context.fillRect(item.p.x, item.p.y, r, r);
      } else if (item.kind === 'planet') {
        drawPlanet(context, item.planet, item.world, rotation, view);
      } else if (item.kind === 'vehicle') {
        drawVehicle(context, item.vehicle, images[item.vehicle.spec.kind]);
      } else if (item.kind === 'star') {
        const { p, size: s } = item;
        path(context, [{ x:p.x, y:p.y-s }, { x:p.x+s*.13, y:p.y-s*.13 },
          { x:p.x+s*.58, y:p.y }, { x:p.x+s*.13, y:p.y+s*.13 },
          { x:p.x, y:p.y+s }, { x:p.x-s*.13, y:p.y+s*.13 },
          { x:p.x-s*.58, y:p.y }, { x:p.x-s*.13, y:p.y-s*.13 }]);
        context.closePath();
        context.fillStyle = '#fff';
        context.fill();
        context.strokeStyle = ink(.65);
        context.lineWidth = .8;
        context.stroke();
      }
    });
    return scene;
  }

  return { render, sceneAt, project, rotateY, camera, orbitPoint, rings, planets, PERIOD };
});
