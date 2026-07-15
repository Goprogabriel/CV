const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('motion-ok', !reducedMotion);

const setupTabs = () => {
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-skill-tab]')];
  const panels = [...document.querySelectorAll<HTMLElement>('[data-skill-panel]')];
  const activate = (index: number, focus = false) => {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    if (focus) tabs[index]?.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
      activate(next, true);
    });
  });
};

const setupProjectRail = () => {
  const rail = document.querySelector<HTMLElement>('[data-project-rail]');
  if (!rail) return;
  let down = false; let startX = 0; let startScroll = 0;
  rail.addEventListener('pointerdown', (event) => { down = true; startX = event.clientX; startScroll = rail.scrollLeft; rail.setPointerCapture(event.pointerId); rail.classList.add('is-dragging'); });
  rail.addEventListener('pointermove', (event) => { if (down) rail.scrollLeft = startScroll - (event.clientX - startX); });
  const stop = () => { down = false; rail.classList.remove('is-dragging'); };
  rail.addEventListener('pointerup', stop); rail.addEventListener('pointercancel', stop);
};

const setupLightbox = () => {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const caption = dialog?.querySelector<HTMLElement>('[data-lightbox-caption]');
  const realImage = dialog?.querySelector<HTMLImageElement>('[data-lightbox-real]');
  const placeholder = dialog?.querySelector<HTMLElement>('[data-lightbox-placeholder]');
  document.querySelectorAll<HTMLButtonElement>('[data-gallery-item]').forEach((item) => item.addEventListener('click', () => {
    if (!dialog || !caption) return;
    caption.textContent = item.dataset.caption || '';
    const source = item.querySelector<HTMLImageElement>('.media-frame > img');
    if (realImage && placeholder) {
      realImage.hidden = !source;
      placeholder.hidden = Boolean(source);
      if (source) { realImage.src = source.currentSrc || source.src; realImage.alt = source.alt; }
    }
    dialog.showModal(); document.body.classList.add('dialog-open');
  }));
  const close = () => { dialog?.close(); document.body.classList.remove('dialog-open'); };
  dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click', close);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  dialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));
};

const setupMagnetic = () => {
  if (reducedMotion || !matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px, ${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
};

const setupCursor = () => {
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  if (!cursor || reducedMotion || !matchMedia('(pointer: fine)').matches) return;
  let x = -20; let y = -20; let raf = 0;
  const paint = () => { cursor.style.left = `${x}px`; cursor.style.top = `${y}px`; raf = 0; };
  window.addEventListener('pointermove', (event) => { x = event.clientX; y = event.clientY; cursor.classList.add('is-visible'); if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  document.querySelectorAll('a, button, summary, [data-project-rail]').forEach((item) => {
    item.addEventListener('pointerenter', () => cursor.classList.add('is-active'));
    item.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  });
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
};

const setupMotion = async () => {
  if (reducedMotion) return;
  const gsapModule = await import('gsap');
  const scrollModule = await import('gsap/ScrollTrigger');
  const dragModule = await import('gsap/Draggable');
  const gsap = gsapModule.default;
  const ScrollTrigger = scrollModule.ScrollTrigger;
  const Draggable = dragModule.Draggable;
  gsap.registerPlugin(ScrollTrigger, Draggable);

  const heroElements = document.querySelectorAll<HTMLElement>('.hero .reveal');
  gsap.fromTo(heroElements, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, stagger: .1, delay: .15, ease: 'power3.out' });

  ScrollTrigger.batch('.reveal:not(.hero .reveal)', {
    start: 'top 90%',
    once: true,
    onEnter: (elements) => gsap.to(elements, { opacity: 1, y: 0, duration: .85, stagger: .09, ease: 'power3.out', overwrite: true })
  });
  gsap.utils.toArray<HTMLElement>('[data-title-reveal]').forEach((element) => {
    gsap.fromTo(element, { y: 45, clipPath: 'inset(0 0 100% 0)' }, { y: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
  });
  document.querySelectorAll<SVGGeometryElement>('.svg-line').forEach((line) => {
    const length = line.getTotalLength();
    gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(line, { strokeDashoffset: 0, duration: 1.65, ease: 'power2.inOut', scrollTrigger: { trigger: line.closest('section') ?? line, start: 'top 82%', once: true } });
  });
  gsap.utils.toArray<HTMLElement>('.case-visual').forEach((element) => {
    gsap.fromTo(element, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: element, start: 'top 85%', once: true } });
  });
  ScrollTrigger.batch('.project-card, .gallery-item', {
    start: 'top 88%',
    once: true,
    onEnter: (elements) => gsap.fromTo(elements, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: .8, stagger: .1, ease: 'power3.out' })
  });
  document.querySelectorAll<HTMLDetailsElement>('.experience-item').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      const body = detail.querySelector<HTMLElement>('.experience-body');
      if (body) gsap.fromTo(body, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: .45, ease: 'power2.out' });
    });
  });
  if (matchMedia('(min-width: 741px)').matches) {
    gsap.utils.toArray<HTMLElement>('.profile-identity .media-frame > img, .gallery-item .media-frame > img').forEach((element, index) => {
      gsap.fromTo(element, { yPercent: index % 2 ? -3 : 3 }, { yPercent: index % 2 ? 3 : -3, ease: 'none', scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: .6 } });
    });
  }

  const scrollWrap = document.querySelector<HTMLElement>('[data-orbit-scroll]');
  const pin = document.querySelector<HTMLElement>('[data-orbit-pin]');
  const stage = document.querySelector<HTMLElement>('[data-orbit-stage]');
  const ring = document.querySelector<HTMLElement>('[data-orbit-ring]');
  const nodes = [...document.querySelectorAll<HTMLButtonElement>('[data-orbit-node]')];
  const details = [...document.querySelectorAll<HTMLElement>('[data-orbit-detail]')];
  const progress = document.querySelector<SVGCircleElement>('[data-orbit-progress]');
  const count = document.querySelector<HTMLElement>('[data-orbit-count]');
  if (!scrollWrap || !pin || !stage || !ring || !nodes.length || matchMedia('(max-width: 740px)').matches) return;

  const step = 360 / nodes.length;
  let active = 0;
  let manualUntil = 0;
  const paintProgress = (value: number) => {
    if (progress) progress.style.strokeDashoffset = String(100 - value * 100);
  };
  const updateNodeCounterRotation = () => {
    const rotation = Number(gsap.getProperty(ring, 'rotation')) || 0;
    nodes.forEach((node) => node.style.setProperty('--counter-rotation', `${-rotation}deg`));
  };
  const activate = (index: number, animate = true) => {
    const next = (index + nodes.length) % nodes.length;
    if (next === active && details[next] && !details[next].hidden) return;
    active = next;
    nodes.forEach((node, i) => node.setAttribute('aria-pressed', String(i === active)));
    details.forEach((detail, i) => { detail.hidden = i !== active; });
    if (count) count.textContent = String(active + 1).padStart(2, '0');
    const current = details[active];
    if (animate && current) gsap.fromTo(current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' });
    if (animate) gsap.to(ring, { rotation: -active * step, duration: .7, ease: 'power3.out', overwrite: true, onUpdate: updateNodeCounterRotation });
  };
  gsap.set(ring, { rotation: 0 });
  paintProgress(0);
  updateNodeCounterRotation();
  nodes.forEach((node, index) => {
    node.addEventListener('click', () => { manualUntil = Date.now() + 1400; activate(index); paintProgress(index / Math.max(1, nodes.length - 1)); });
    node.addEventListener('keydown', (event) => {
      const key = event.key;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const next = key === 'Home' ? 0 : key === 'End' ? nodes.length - 1 : active + (key === 'ArrowRight' ? 1 : -1);
      const normalised = (next + nodes.length) % nodes.length;
      manualUntil = Date.now() + 1400; activate(normalised); paintProgress(normalised / Math.max(1, nodes.length - 1)); nodes[normalised]?.focus();
    });
  });

  Draggable.create(ring, {
    type: 'rotation',
    onPress() { manualUntil = Date.now() + 3000; },
    onDrag: updateNodeCounterRotation,
    onDragEnd() {
      const velocity = typeof this.getVelocity === 'function' ? this.getVelocity('rotation') : 0;
      const projected = this.rotation + velocity * .16;
      const snapped = Math.round(projected / step) * step;
      const index = Math.round(-snapped / step);
      active = (index % nodes.length + nodes.length) % nodes.length;
      nodes.forEach((node, i) => node.setAttribute('aria-pressed', String(i === active)));
      details.forEach((detail, i) => { detail.hidden = i !== active; });
      if (count) count.textContent = String(active + 1).padStart(2, '0');
      paintProgress(active / Math.max(1, nodes.length - 1));
      gsap.to(ring, { rotation: -active * step, duration: .65, ease: 'power3.out', onUpdate: updateNodeCounterRotation });
    }
  });

  const navHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) * 16 || 72;
  ScrollTrigger.create({
    trigger: scrollWrap,
    pin,
    start: `top top+=${navHeight}`,
    end: () => `+=${Math.max(window.innerHeight * 3.8, nodes.length * window.innerHeight * .52)}`,
    scrub: .35,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    snap: { snapTo: 1 / Math.max(1, nodes.length - 1), duration: { min: .12, max: .32 }, delay: .06, ease: 'power1.inOut' },
    onUpdate: (self) => {
      paintProgress(self.progress);
      if (Date.now() < manualUntil) return;
      const index = Math.round(self.progress * (nodes.length - 1));
      if (index !== active) activate(index, true);
    }
  });

  const skillsScroll = document.querySelector<HTMLElement>('[data-skills-scroll]');
  const skillTabs = [...document.querySelectorAll<HTMLButtonElement>('[data-skill-tab]')];
  if (skillsScroll && skillTabs.length && matchMedia('(min-width: 1051px)').matches) {
    let skillIndex = 0;
    ScrollTrigger.create({
      trigger: skillsScroll,
      start: 'top top+=88',
      end: 'bottom bottom',
      scrub: .25,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const next = Math.min(skillTabs.length - 1, Math.floor(self.progress * skillTabs.length));
        if (next === skillIndex) return;
        skillIndex = next;
        skillTabs[next]?.click();
      }
    });
  }

  ScrollTrigger.sort();
  ScrollTrigger.refresh();
};

setupTabs();
setupProjectRail();
setupLightbox();
setupMagnetic();
setupCursor();
setupMotion();
