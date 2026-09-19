#!/usr/bin/env node
/**
 * End-to-end interaction tests.
 *
 * Screenshots prove a page renders; they prove nothing about whether clicking
 * the brain actually gets you anywhere, whether Escape climbs back out, or
 * whether a keyboard user can tab into things they cannot see. This drives a
 * real Chrome over the DevTools Protocol and checks the behaviour.
 *
 * No dependencies: Chrome is launched directly and spoken to over Node's
 * built-in WebSocket.
 *
 * Run:  node tools/e2e.js [baseUrl]
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.argv[2] || 'http://localhost:5173';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

/* ------------------------------------------------------------ CDP plumbing */
let nextId = 1;
const pending = new Map();
const consoleErrors = [];
let ws;

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => {
    if (pending.delete(id)) reject(new Error(`${method} timed out`));
  }, 15000);
});

/** Evaluate a statement body in the page and return its value.
 *  The wrapper is async so a body may `await`; `awaitPromise` unwraps the
 *  resulting promise, so synchronous bodies behave identically. */
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', {
    expression: `(async () => { ${expression} })()`,
    returnByValue: true, awaitPromise: true,
  });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description || 'evaluation threw');
  }
  return r.result.value;
};

/** Poll until an expression is truthy, or give up.
 *  Evaluation errors are swallowed and retried: immediately after a navigation
 *  the old execution context is gone and the new one may not exist yet, so a
 *  poll that treats that as fatal is merely flaky. */
const waitFor = async (expression, label, ms = 8000) => {
  const deadline = Date.now() + ms;
  let last = '';
  while (Date.now() < deadline) {
    try {
      if (await evaluate(`return !!(${expression});`)) return true;
    } catch (e) {
      last = e.message;
    }
    await sleep(120);
  }
  throw new Error(`timed out waiting for ${label}${last ? ` (last error: ${last})` : ''}`);
};

const goto = async (path) => {
  await send('Page.navigate', { url: BASE + path });
  await sleep(150);                       // let the new context come up
  await waitFor('document.readyState === "complete"', `${path} to load`);
  // Camera routes mount their destination part-way through a ~1.2s push-in, so
  // wait for actual content rather than guessing at a delay.
  const wantsStage = path !== '/' && !path.startsWith('/?');
  if (wantsStage) {
    await waitFor('document.getElementById("stage").children.length > 0',
                  `${path} to mount its view`, 9000);
  } else {
    await waitFor('document.querySelector(".hero__title")', 'the hero');
  }
  await sleep(250);                       // let the entrance settle
};

/* ------------------------------------------------------------------- tests */
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : `\n      ${detail}`}`);
};

async function run() {
  /* --- 1. every route loads without a runtime error --------------------- */
  console.log('\nroutes load cleanly');
  const routes = ['/', '/worlds', '/worlds/healthcare', '/worlds/ai', '/worlds/product',
                  '/worlds/creative', '/work/lifeworx', '/work/ai-product',
                  '/about', '/archive', '/contact', '/worlds/bogus', '/nonsense'];
  for (const r of routes) {
    consoleErrors.length = 0;
    await goto(r + (r.startsWith('/work') || r.startsWith('/worlds/') ? '?p=1' : ''));
    // goto() already waited for content, so reaching here means it rendered.
    check(`${r} renders, no console errors`,
      consoleErrors.length === 0,
      consoleErrors.join('\n      '));
  }

  /* --- 2. unknown routes reach the 404, not a blank screen -------------- */
  console.log('\nunknown routes');
  await goto('/worlds/bogus');
  check('unknown world shows the 404 view',
    await evaluate(`return !!document.querySelector('.nf__inner');`));
  await goto('/work/bogus');
  check('unknown case study shows the 404 view',
    await evaluate(`return !!document.querySelector('.nf__inner');`));

  /* --- 3. the journey, by clicking ------------------------------------- */
  console.log('\nthe journey, driven by clicks');
  await goto('/');
  await evaluate(`document.getElementById('brain').click(); return 1;`);
  await waitFor(`location.pathname === '/worlds'`, 'the worlds route', 9000);
  await waitFor(`document.querySelector('.worlds')`, 'the worlds scene', 8000);
  check('brain → /worlds', true);

  await evaluate(`document.querySelector('.wlist__btn[data-world="healthcare"]').click(); return 1;`);
  await waitFor(`location.pathname === '/worlds/healthcare'`, 'the healthcare world');
  await waitFor(`document.querySelector('.world')`, 'the world view');
  check('district → /worlds/healthcare', true);

  await evaluate(`document.querySelector('.btn[data-case="lifeworx"]').click(); return 1;`);
  await waitFor(`location.pathname === '/work/lifeworx'`, 'the case study', 9000);
  await waitFor(`document.querySelector('.cs')`, 'the case study view');
  check('case study button → /work/lifeworx', true);

  // the artwork is the second entry point to the same place
  await goto('/worlds/healthcare?p=1');
  await evaluate(`document.querySelector('.scene__hit').click(); return 1;`);
  await waitFor(`location.pathname === '/work/lifeworx'`, 'the case study via the image', 9000);
  check('clicking the world artwork → the same case study', true);

  // and so is the card on the map
  await goto('/worlds?p=1');
  await evaluate(`document.querySelector('.dcard[data-world="ai"]').click(); return 1;`);
  await waitFor(`location.pathname === '/worlds/ai'`, 'the ai world via its card', 9000);
  check('clicking a world card → that world', true);

  /* --- 3b. scrolling arrives, without a click -------------------------- */
  console.log('\nscrolling arrives on its own');
  await goto('/');
  const wheel = (n) => send('Input.dispatchMouseEvent',
    { type: 'mouseWheel', x: 800, y: 450, deltaX: 0, deltaY: n });

  await wheel(240);
  await sleep(320);
  const started = await evaluate(`
    const v = getComputedStyle(document.getElementById('plate')).getPropertyValue('--cam-s');
    return parseFloat(v || '1');`);
  check('a single scroll starts the push-in', started > 1.005, `scale ${started}`);

  for (let i = 0; i < 26; i++) { await wheel(240); await sleep(70); }
  await waitFor(`location.pathname === '/worlds'`, 'the worlds route via scroll', 9000);
  await waitFor(`document.querySelector('.worlds')`, 'the worlds scene via scroll', 9000);
  check('scrolling alone reaches the worlds — no click needed', true);

  /* Reversibility belongs to the journey, not to the destination. Part way in
     — before the camera commits — scrolling back must unwind it. After it has
     committed the wheel belongs to the page, which is covered below. */
  await goto('/');
  for (let i = 0; i < 6; i++) { await wheel(240); await sleep(70); }
  const midway = await evaluate(`
    return parseFloat(getComputedStyle(document.getElementById('plate'))
             .getPropertyValue('--cam-s') || '1');`);
  for (let i = 0; i < 14; i++) { await wheel(-240); await sleep(70); }
  await sleep(500);
  const unwound = await evaluate(`
    return { scale: parseFloat(getComputedStyle(document.getElementById('plate'))
                      .getPropertyValue('--cam-s') || '1'),
             path: location.pathname };`);
  check('a journey not yet committed can be scrolled back out',
    midway > 1.05 && unwound.scale < 1.02 && unwound.path === '/',
    `went to ${midway.toFixed(2)}, returned to ${unwound.scale.toFixed(2)} on ${unwound.path}`);

  /* --- 3c. scrolling inside a page must never navigate ------------------ */
  console.log('\nscrolling inside a page never navigates');
  const spin = (n) => send('Input.dispatchMouseEvent',
    { type: 'mouseWheel', x: 760, y: 470, deltaX: 0, deltaY: n });

  await goto('/work/lifeworx?p=1');
  const startPath = await evaluate(`return location.pathname;`);

  for (let i = 0; i < 16; i++) { await spin(320); await sleep(45); }
  const down = await evaluate(`
    return { path: location.pathname,
             top: Math.round(document.getElementById('stage').scrollTop) };`);
  check('scrolling down stays on the case study and moves the page',
    down.path === startPath && down.top > 200,
    `path ${down.path}, scrollTop ${down.top}`);

  // Back up, well past the top — this is what a trackpad's momentum does at
  // the end of a flick, and it used to haul the camera home.
  for (let i = 0; i < 34; i++) { await spin(-320); await sleep(45); }
  const up = await evaluate(`
    return { path: location.pathname,
             top: Math.round(document.getElementById('stage').scrollTop),
             camera: parseFloat(getComputedStyle(document.getElementById('plate'))
                       .getPropertyValue('--cam-s') || '1') };`);
  check('scrolling back up stays on the case study',
    up.path === startPath, `ended on ${up.path}`);
  check('scrolling up does not pull the camera back out',
    up.camera > 3, `camera scale fell to ${up.camera}`);

  // The worlds view fits the viewport, so there is nothing to scroll — an
  // upward wheel there must still do nothing rather than exit.
  await goto('/worlds?p=1');
  for (let i = 0; i < 20; i++) { await spin(-320); await sleep(45); }
  check('scrolling up on the worlds does not return home',
    await evaluate(`return location.pathname === '/worlds';`),
    await evaluate(`return location.pathname;`));

  /* --- 4. Escape climbs back out one level at a time -------------------- */
  console.log('\nescape climbs the hierarchy');
  // Start from the deepest level explicitly: the journey test above now ends
  // on a world, not on a case study.
  await goto('/work/lifeworx?p=1');
  const esc = async () => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(400);
  };
  await esc();
  check('esc: case study → world',
    await evaluate(`return location.pathname === '/worlds/healthcare';`),
    await evaluate(`return location.pathname;`));
  await esc();
  check('esc: world → worlds',
    await evaluate(`return location.pathname === '/worlds';`),
    await evaluate(`return location.pathname;`));
  await esc();
  await sleep(700);
  check('esc: worlds → home',
    await evaluate(`return location.pathname === '/';`),
    await evaluate(`return location.pathname;`));

  /* --- 5. the hidden layer is not reachable by keyboard ----------------- */
  console.log('\nocclusion');
  await goto('/about');
  check('home layer is inert while a page is shown',
    await evaluate(`return document.getElementById('main').inert === true;`));
  check('stage is not inert while shown',
    await evaluate(`return document.getElementById('stage').inert === false;`));
  const reachable = await evaluate(`
    const els = [...document.querySelectorAll('#main a, #main button')];
    return els.filter(el => el.checkVisibility?.({ checkVisibilityCSS: true }) !== false
                            && !el.closest('[inert]')).length;
  `);
  check('no focusable controls left behind the page', reachable === 0, `${reachable} still reachable`);

  await goto('/');
  check('home layer is interactive again at home',
    await evaluate(`return document.getElementById('main').inert === false;`));

  /* --- 6. accessible names and heading order --------------------------- */
  console.log('\naccessibility');
  for (const r of ['/', '/worlds', '/worlds/healthcare', '/work/lifeworx', '/about', '/contact', '/archive']) {
    await goto(r + (r.startsWith('/work') || r.startsWith('/worlds/') ? '?p=1' : ''));
    const nameless = await evaluate(`
      const els = [...document.querySelectorAll('a, button')]
        .filter(el => !el.closest('[inert]') && !el.closest('[aria-hidden="true"]'));
      return els.filter(el => !(
        el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby') ||
        (el.textContent || '').trim()
      )).map(el => el.className || el.tagName);
    `);
    check(`${r}: every control has an accessible name`,
      nameless.length === 0, nameless.join(', '));

    const order = await evaluate(`
      const hs = [...document.querySelectorAll('h1,h2,h3,h4')]
        .filter(h => !h.closest('[inert]'))
        .map(h => +h.tagName[1]);
      let prev = 0, bad = [];
      for (const lv of hs) { if (prev && lv > prev + 1) bad.push(prev + '->' + lv); prev = lv; }
      return { hs, bad };
    `);
    check(`${r}: heading levels never skip`, order.bad.length === 0,
      `${order.bad.join(', ')} (levels: ${order.hs.join(',')})`);
  }

  /* --- 7. the cursor portrait never blocks a click ---------------------- */
  console.log('\ncursor portrait');
  await goto('/');
  check('cursor is pointer-events: none',
    await evaluate(`return getComputedStyle(document.getElementById('cursor')).pointerEvents === 'none';`));
  check('cursor is hidden from assistive technology',
    await evaluate(`return document.getElementById('cursor').getAttribute('aria-hidden') === 'true';`));

  /* --- 8. reduced motion skips the camera ------------------------------ */
  console.log('\nreduced motion');
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await goto('/');
  check('reduced-motion flag reaches the document',
    await evaluate(`return document.body.dataset.reducedMotion === 'true';`));
  await evaluate(`document.getElementById('brain').click(); return 1;`);
  await sleep(500);
  check('entering still arrives with motion reduced',
    await evaluate(`return !!document.querySelector('.worlds');`));
  check('static portrait badge replaces the follower',
    await evaluate(`return getComputedStyle(document.querySelector('.portrait-badge')).display !== 'none';`));
  await send('Emulation.setEmulatedMedia', { features: [] });

  /* --- 8b. buttons must never be letterspaced -------------------------- */
  console.log('\ntypography');
  for (const r of ['/', '/worlds', '/worlds/healthcare', '/work/lifeworx', '/about', '/contact']) {
    await goto(r + (r.startsWith('/work') || r.startsWith('/worlds/') ? '?p=1' : ''));
    const tracked = await evaluate(`
      // A control's own text must sit at normal spacing. Small uppercase
      // eyebrows and chips are labels, not buttons, and keep their tracking.
      const isLabel = (el) => el.classList.contains('u-label')
                           || el.classList.contains('ph__chip');
      return [...document.querySelectorAll('a, button')]
        .filter(el => !el.closest('[inert]') && !isLabel(el))
        .map(el => {
          const cs = getComputedStyle(el);
          const em = cs.letterSpacing === 'normal'
            ? 0 : parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize);
          return { cls: el.className || el.tagName, em };
        })
        // 0.085em is the line: below it uppercase micro-type stays legible,
        // above it a control starts to read as deliberately spread out.
        .filter(x => Math.abs(x.em) > 0.085)
        .map(x => x.cls + ' @ ' + x.em.toFixed(3) + 'em');
    `);
    check(`${r}: no control is letterspaced`, tracked.length === 0, tracked.join(', '));
  }

  /* --- 8c. srcset actually serves more pixels on a dense display -------- */
  console.log('\nretina');
  await send('Emulation.setDeviceMetricsOverride',
    { width: 1600, height: 900, deviceScaleFactor: 2, mobile: false });
  await goto('/');
  const heroDense = await evaluate(`
    const i = document.querySelector('.plate__img');
    return { picked: (i.currentSrc || '').split('/').pop(), css: Math.round(i.clientWidth) };`);
  check('hero picks a larger source at 2x',
    /-(1140|1195)\.webp$/.test(heroDense.picked),
    `${heroDense.picked} for a ${heroDense.css}px box`);

  await goto('/worlds/healthcare?p=1');
  const sceneDense = await evaluate(`
    const i = document.querySelector('.scene__img');
    return { picked: (i.currentSrc || '').split('/').pop(), css: Math.round(i.clientWidth) };`);
  check('world scene picks a larger source at 2x',
    /-(960|1280)\.webp$/.test(sceneDense.picked),
    `${sceneDense.picked} for a ${sceneDense.css}px box`);

  await send('Emulation.clearDeviceMetricsOverride');

  /* --- 8d. the cursor portrait lags, then settles ----------------------- */
  console.log('\ncursor inertia');
  await goto('/');
  const inertia = await evaluate(`
    const el = document.getElementById('cursor');
    const at = () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return { x: m.m41, y: m.m42 };
    };
    const move = (x, y) => window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
    const frame = () => new Promise(r => requestAnimationFrame(r));

    move(300, 300);
    for (let i = 0; i < 90; i++) await frame();      // let it arrive and settle
    const settledStart = at();

    move(1100, 700);                                  // a long, sudden jump
    await frame(); await frame();
    const justAfter = at();
    const lag = Math.hypot(1100 - justAfter.x, 700 - justAfter.y);
    const moved = Math.hypot(justAfter.x - settledStart.x, justAfter.y - settledStart.y);

    for (let i = 0; i < 150; i++) await frame();      // stop, and let it catch up
    const rest = at();
    const restErr = Math.hypot(1100 - rest.x, 700 - rest.y);
    return { lag: Math.round(lag), moved: Math.round(moved), restErr: Math.round(restErr) };
  `);
  console.log(`      two frames after an 894px jump it has moved ${inertia.moved}px, ` +
              `still ${inertia.lag}px behind; at rest it is ${inertia.restErr}px off`);
  check('it lags well behind the pointer rather than tracking it',
    inertia.lag > 400, `only ${inertia.lag}px behind — too attached`);
  check('it does move toward the pointer', inertia.moved > 5, `moved ${inertia.moved}px`);
  check('it settles onto the pointer once movement stops',
    inertia.restErr < 12, `${inertia.restErr}px off`);

  /* --- 9. the page is readable with scripting off ---------------------- */
  console.log('\nno scripting');
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await send('Page.navigate', { url: BASE + '/' });
  await sleep(1200);
  const noJs = await evaluate(`
    const t = document.querySelector('.hero__title');
    const ns = document.querySelector('.noscript');
    return {
      titleOpacity: t ? getComputedStyle(t).opacity : null,
      titleText: t ? t.textContent.trim().slice(0, 14) : null,
      noscriptShown: ns ? getComputedStyle(ns).display !== 'none' : false,
      jsClass: document.documentElement.classList.contains('js'),
    };
  `);
  check('headline is visible without scripting',
    noJs.titleOpacity === '1', `opacity ${noJs.titleOpacity}`);
  check('headline still carries its text', !!noJs.titleText, String(noJs.titleText));
  check('the .js flag is absent without scripting', noJs.jsClass === false);
  check('noscript explanation is shown', noJs.noscriptShown);
  await send('Emulation.setScriptExecutionDisabled', { value: false });

  /* --- 10. loading behaviour ------------------------------------------- */
  console.log('\nperformance');
  await goto('/');
  // LCP and layout-shift entries are only reliably reachable through a
  // PerformanceObserver with `buffered: true` — getEntriesByType returns an
  // empty list for them, which reads as a 0ms paint rather than as "unknown".
  const perf = await evaluate(`
    const collect = (type) => new Promise((resolve) => {
      const seen = [];
      try {
        const po = new PerformanceObserver((list) => seen.push(...list.getEntries()));
        po.observe({ type, buffered: true });
        setTimeout(() => { po.disconnect(); resolve(seen); }, 400);
      } catch { resolve([]); }
    });
    const [lcps, shifts] = await Promise.all([
      collect('largest-contentful-paint'),
      collect('layout-shift'),
    ]);
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    const cls = shifts.filter(s => !s.hadRecentInput).reduce((a, s) => a + s.value, 0);
    const bytes = performance.getEntriesByType('resource')
      .reduce((a, r) => a + (r.encodedBodySize || 0), 0) + (nav.encodedBodySize || 0);
    return {
      fcp: Math.round(fcp ? fcp.startTime : 0),
      lcp: lcps.length ? Math.round(lcps[lcps.length - 1].startTime) : null,
      cls: +cls.toFixed(4),
      requests: performance.getEntriesByType('resource').length,
      kb: Math.round(bytes / 1024),
    };
  `);
  console.log(`      first paint ${perf.fcp}ms · largest paint ` +
              `${perf.lcp === null ? 'unavailable' : perf.lcp + 'ms'} · ` +
              `CLS ${perf.cls} · ${perf.requests} requests · ${perf.kb} KB`);
  // Thresholds are deliberately loose: this runs on whatever machine is to
  // hand, so it is a regression tripwire, not a benchmark.
  if (perf.lcp === null) {
    console.log('      (no LCP entry — skipped rather than reported as 0)');
  } else {
    check('largest contentful paint under 2.5s', perf.lcp < 2500, `${perf.lcp}ms`);
  }
  check('cumulative layout shift under 0.1', perf.cls < 0.1, `${perf.cls}`);
  // The hero is a full-screen photographic cut-out and is most of this budget
  // by design. What the number guards against is a second heavy asset sneaking
  // onto the first screen — which is exactly what an eager prefetch of the
  // island did before it was removed.
  check('home stays under 450 KB over the wire', perf.kb < 450, `${perf.kb} KB`);

  /* --- report ---------------------------------------------------------- */
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log('\nfailures:');
    failed.forEach((f) => console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`));
  }
  console.log('');
  return failed.length;
}

/* ------------------------------------------------------------------- boot */
let server = null;
try {
  await fetch(BASE, { signal: AbortSignal.timeout(2000) });
} catch {
  console.log(`no server at ${BASE} — starting one`);
  server = spawn('python3', ['tools/serve.py', '5173'], { stdio: 'ignore' });
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    try { await fetch(BASE, { signal: AbortSignal.timeout(1000) }); break; } catch {}
  }
}

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/e2e-profile-${process.pid}`,
  '--window-size=1600,900', 'about:blank',
], { stdio: 'ignore' });

let code = 1;
try {
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(500);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      target = list.find((t) => t.type === 'page');
    } catch { /* not up yet */ }
  }
  if (!target) throw new Error('Chrome did not expose a debugging target');

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.exception?.description
        || msg.params.exceptionDetails.text);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  code = await run();
} catch (e) {
  console.error('\nharness error:', e.message, '\n');
  code = 1;
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
  server?.kill();
}
process.exit(code ? 1 : 0);
