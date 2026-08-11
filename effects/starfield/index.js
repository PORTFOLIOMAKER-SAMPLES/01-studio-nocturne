/**
 * starfield — 잔잔히 반짝이는 별하늘 배경
 * ───────────────────────────────────────────────────────────
 * 티어 T1 · 추가 용량 0KB · Canvas 2D
 *
 * 옛 포트폴리오들의 단골(port9의 3D 스타필드)을 배경 팩 규격으로 옮겼습니다.
 * 셰이더 없이 Canvas 2D로 충분합니다 — 별은 원 하나, 반짝임은 sin 하나.
 *
 * 동작 줄이기 사용자에게는 반짝임·표류를 멈추고 정지 화면 한 장만 그립니다.
 * 별이 "없어지는" 것보다 "멈추는" 쪽이 의도(하늘 배경)에 맞습니다.
 */

import { defineEffect, prefersReducedMotion } from '../_core/index.js';

export const mount = defineEffect({
  name: 'starfield',

  defaults: {
    /** 별 밀도(1 = 9000px²당 1개) */
    density: 1,
    /** 표류 속도(px/s 수준) */
    speed: 6,
    /** 반짝임 세기(0~1) */
    twinkle: 0.6,
    /** 별 크기 배율 */
    size: 1.2,
    /** 별 색. 비우면 흰색 */
    color: '',
  },

  guard: {
    motion: 'ignore', // 아래에서 직접 처리 — 멈춘 별하늘을 그립니다
    webgl: false,
  },

  setup({ el, opts, addCleanup }) {
    const doc = el.ownerDocument;
    const win = doc.defaultView ?? window;

    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
      addCleanup(() => { el.style.removeProperty('position'); });
    }

    const cv = doc.createElement('canvas');
    /*
     * fx-layer — "이건 배경 레이어지 콘텐츠가 아니다"는 팩 공용 표식입니다.
     * 배경 팩들은 저마다 `> *:not(자기 캔버스)`로 콘텐츠를 앞에 세우는데,
     * 표식이 없으면 그 규칙이 **다른 팩의 캔버스까지 콘텐츠로 착각해** 붙잡아
     * 흐름에 끼워 넣습니다(영역이 부풀고 배경이 내용을 밀어냅니다).
     */
    cv.className = 'fx-starfield__cv fx-layer';
    cv.setAttribute('aria-hidden', 'true');
    el.prepend(cv);
    addCleanup(() => cv.remove());

    const ctx = cv.getContext('2d');
    /*
     * 색 결정 — 도트 웨이브와 같은 규칙입니다.
     *   ① 사용자가 고른 색  ② 테마가 내려준 --fx-star-color  ③ 흰색
     *
     * 예전에는 ②가 없어 **밝은 테마에서 흰 별이 흰 배경에 묻혔습니다.**
     * 효과를 켜도 아무 일이 없어 보였고, 색을 직접 고르기 전에는 그대로였습니다.
     */
    const resolveColor = () => {
      const own = (opts.color || '').trim();
      if (own) return own;
      const v = getComputedStyle(el).getPropertyValue('--fx-star-color').trim();
      return v || '#ffffff';
    };
    const color = resolveColor();
    let stars = [];
    let w = 0;
    let h = 0;

    const seed = () => {
      const dpr = Math.min(win.devicePixelRatio || 1, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(((w * h) / 9000) * opts.density);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.4 + Math.random() * 1.1) * opts.size,
        a: 0.35 + Math.random() * 0.65,   // 기본 밝기
        p: Math.random() * Math.PI * 2,   // 반짝임 위상
        v: 0.5 + Math.random(),           // 표류 배율(깊이감)
      }));
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const s of stars) {
        const tw = 1 - opts.twinkle + opts.twinkle * (0.5 + 0.5 * Math.sin(s.p + t * 2));
        ctx.globalAlpha = s.a * tw;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const ro = new win.ResizeObserver(() => { seed(); draw(0); });
    ro.observe(el);
    addCleanup(() => ro.disconnect());
    seed();
    draw(0); // 첫 프레임을 rAF에 맡기지 않습니다 — 루프가 늦어도 빈 하늘은 없게

    if (prefersReducedMotion()) {
      return; // 정지 화면 한 장으로 끝 — 별이 사라지는 것보다 멈추는 쪽이 맞습니다
    }

    let raf = 0;
    let start = null;
    const loop = (now) => {
      if (start === null) start = now;
      const t = (now - start) / 1000;
      const dt = opts.speed / 60;
      for (const s of stars) {
        s.x -= dt * s.v;                 // 왼쪽으로 아주 천천히
        if (s.x < -2) { s.x = w + 2; s.y = Math.random() * h; }
      }
      draw(t);
      raf = win.requestAnimationFrame(loop);
    };
    raf = win.requestAnimationFrame(loop);
    addCleanup(() => win.cancelAnimationFrame(raf));
  },
});
