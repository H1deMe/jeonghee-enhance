// 정희 강화하기 — '검 강화하기' 기반 강화 게임 (Apple 스타일 UI, 웹 버전)
// 서버 없이 브라우저에서만 동작하며, 진행 상황은 이 브라우저의 localStorage에 저장된다.
'use strict';

// ───────────────────────── 데이터 ─────────────────────────
const MAX = 20;
// 이름, 사진 번호, 성공 확률(%), 강화 비용, 판매 가격, 설명
const LV = [
  ['잠든 정희',               2, 95,     10,         0, '어디서든 잘 수 있다. 지하철 창문은 베개다.'],
  ['이어폰 낀 정희',            3, 90,     20,        30, '음악과 함께 세상과 잠시 단절 중.'],
  ['까까머리 정희',             4, 85,     40,        80, '머리를 밀었다. 각오가 남다르다.'],
  ['거울 셀카 정희',            5, 80,     80,       200, '모자 각도까지 완벽하게 계산했다.'],
  ['지하철 정희',              6, 75,    150,       450, '오늘도 이어폰 끼고 출근 완료.'],
  ['미술관 정희',              7, 70,    300,      1000, '작품보다 내가 더 작품.'],
  ['꽃밭 정희',               8, 65,    500,      2200, '꽃보다 정희.'],
  ['영화관 정희',              9, 60,    800,      4500, '팝콘 들고 함박웃음.'],
  ['명찰 단 정희',            10, 55,   1300,      9000, '셔츠에 명찰까지, 각이 살아 있다.'],
  ['고궁 산책 정희',           11, 50,   2000,     18000, '보호수 옆에서 같이 보호받는 중.'],
  ['힙스터 정희',             12, 45,   3000,     40000, '로우앵글도 소화하는 얼굴.'],
  ['우산 든 도시 정희',         13, 40,   5000,     80000, '비 오는 밤거리의 주인공.'],
  ['남산타워 정희',            14, 35,   8000,    160000, '서울을 발아래 두었다.'],
  ['자물쇠 장인 정희',           1, 30,  12000,    330000, '사랑의 자물쇠보다 단단한 매력.'],
  ['강철 멘탈 정희',            4, 25,  20000,    700000, '어떤 훈련도 그를 막을 수 없다.'],
  ['미소 천사 정희',            9, 20,  35000,   1500000, '웃음 한 번에 극장이 환해진다.'],
  ['꽃의 정령 정희',            8, 15,  60000,   3500000, '그가 걸으면 꽃이 핀다.'],
  ['꿈속의 지배자 정희',          2, 10, 100000,   8000000, '자면서도 강화된다.'],
  ['천년 보호수 정희',          11,  7, 170000,  20000000, '나무와 함께 천 년을 살았다.'],
  ['하늘에 닿은 정희',          14,  5, 300000,  50000000, '남산타워보다 높아졌다.'],
  ['진(眞) 정희',             1,  0,      0, 200000000, '강화의 끝. 전설이 되었다.'],
].map(a => ({ name: a[0], photo: a[1], rate: a[2], cost: a[3], sell: a[4], desc: a[5] }));

// 사진마다 인물이 화면 중앙에 오도록 하는 초점 (가로, 세로 비율)
const FOCUS = [null,
  [0.40, 0.35], [0.45, 0.40], [0.40, 0.50], [0.50, 0.40], [0.50, 0.35],
  [0.30, 0.45], [0.27, 0.60], [0.62, 0.40], [0.55, 0.45], [0.42, 0.45],
  [0.42, 0.45], [0.35, 0.45], [0.45, 0.40], [0.38, 0.45],
];

const fragsFor = lv => Math.floor(lv * lv / 2) + lv + 1;
const ticketsFor = lv => 1 + Math.floor(lv / 2);
const N = v => Math.round(v).toLocaleString('en-US');

// ───────────────────────── Apple 스타일 디자인 토큰 ─────────────────────────
const C = {
  bg: [242, 242, 247], card: [255, 255, 255], label: [29, 29, 31], label2: [134, 134, 139],
  sep: [226, 226, 231], fill: [232, 232, 237], blue: [0, 122, 255], green: [52, 199, 89],
  greenDark: [36, 138, 61], red: [255, 59, 48], orange: [255, 149, 0], purple: [175, 82, 222],
  pink: [255, 45, 85], indigo: [88, 86, 214], teal: [48, 176, 199], yellow: [255, 204, 0],
  gray: [142, 142, 147], black: [0, 0, 0], white: [255, 255, 255],
};
const RAINBOW = [C.blue, C.purple, C.pink, C.orange];
const CONFETTI = [C.blue, C.green, C.pink, C.orange, C.purple, C.yellow, C.teal, C.indigo];
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a))})`;
const mix = (a, b, t) => { t = Math.max(0, Math.min(1, t)); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
function tier(lv, t) {
  if (lv >= 18) {
    const p = (t * 0.35) % 1 * RAINBOW.length, i = Math.floor(p);
    return mix(RAINBOW[i % 4], RAINBOW[(i + 1) % 4], p - i);
  }
  return [C.gray, C.green, C.blue, C.purple, C.orange, C.pink][Math.floor(lv / 3)];
}

const FAMILY = '"Pretendard","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",system-ui,sans-serif';
const font = (size, bold) => ({ css: `${bold ? 700 : 400} ${size}px ${FAMILY}`, size });
const F = {
  large: font(30, true), title: font(20, true), head: font(16, true), body: font(14, false),
  bodyB: font(14, true), cap: font(12, false), ring: font(28, true), name: font(24, true),
  btn: font(17, true), badge: font(15, true),
};

// 화면 배치: 가로(PC)와 세로(휴대폰) 두 가지
function makeLayout(portrait) {
  if (!portrait) return {
    W: 960, H: 640, portrait: false,
    titleY: 46, chipsY: 56, chipLabels: true,
    card: { x: 40, y: 112, w: 386, h: 488 }, panel: { x: 452, y: 112, w: 468, h: 488 },
    sheet: { x: 150, y: 64, w: 660, h: 552 }, bookCols: 7, alertY: 330, hint: true,
  };
  return {
    W: 430, H: 932, portrait: true,
    titleY: 52, chipsY: 112, chipLabels: false,
    card: { x: 55, y: 156, w: 320, h: 318 }, panel: { x: 16, y: 486, w: 398, h: 442 },
    sheet: { x: 10, y: 64, w: 410, h: 880 }, bookCols: 5, alertY: 466, hint: false,
  };
}

// ───────────────────────── 스프링 (iOS 애니메이션 느낌) ─────────────────────────
class Spring {
  constructor(v, k, d) { this.v = v; this.t = v; this.vel = 0; this.k = k; this.d = d; }
  step(dt) { const f = -this.k * (this.v - this.t) - this.d * this.vel; this.vel += f * dt; this.v += this.vel * dt; }
}

// ───────────────────────── 사운드 (WebAudio로 사인파 합성) ─────────────────────────
let audio = null;
function ensureAudio() {
  try {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch (e) { audio = null; }
}
const SFX = {
  tap: [[1800], 0.025, 0.12], start: [[880, 1175], 0.07, 0.18], success: [[1319, 1976], 0.12, 0.3],
  big: [[1047, 1319, 1568, 2093], 0.1, 0.3], fail: [[392, 262], 0.16, 0.35], coin: [[1568, 2093], 0.08, 0.25],
  save: [[784, 1175, 1568], 0.08, 0.25], craft: [[1175, 1760], 0.07, 0.22],
};
function play(key) {
  if (!S.sound || !audio) return;
  const [freqs, dur, vol] = SFX[key];
  const t0 = audio.currentTime + 0.01;
  freqs.forEach((f, i) => {
    const st = t0 + i * dur;
    [[1, 1], [2, 0.25]].forEach(([h, amp]) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = f * h;
      const a = vol * amp * 0.45;
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(a, st + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.6);
      o.connect(g); g.connect(audio.destination);
      o.start(st); o.stop(st + 0.65);
    });
  });
}

// ───────────────────────── 상태 / 저장 ─────────────────────────
const SAVE_KEY = 'jeonghee-enhance-save-v1';
const S = {
  gold: 1000, frags: 0, tickets: 0, tries: 0, succ: 0, fails: 0, sold: 0,
  level: 0, best: 0, seen: Array(MAX + 1).fill(false), ending: false, sound: true,
};
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
function loadGame() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (d) for (const k in S) if (k in d) S[k] = d[k];
  } catch (e) { }
  S.level = Math.max(0, Math.min(MAX, S.level | 0));
  if (!Array.isArray(S.seen) || S.seen.length !== MAX + 1) S.seen = Array(MAX + 1).fill(false);
  S.seen[0] = true;
}

// 화면 상태
let mode = 'main';          // main | enh | sheet | alert
let sheetKind = 'craft';    // craft | book | settings
let alertKind = 'fail';     // fail | ending | reset
let t = 0, enhanceT = 0, shakeT = 0, fadeV = 1, grayV = 0, islandTimer = 0;
let prevLevel = 0, failedLevel = 0, hoverBook = -1, broken = false, dispGold = 1000;
let islandText = '', islandColor = C.blue;
const cardS = new Spring(1, 320, 14), ringS = new Spring(0.95, 120, 20);
const sheetS = new Spring(0, 230, 28), alertS = new Spring(0, 420, 36), dimS = new Spring(0, 200, 30);
const islandS = new Spring(0, 260, 20), switchS = new Spring(1, 400, 30);
const press = new Map();
const parts = [];
let btns = [], layerActive = false;
let mouse = { x: -1, y: -1 }, pointerDown = false, pressedId = null, isTouch = false;

// ───────────────────────── 게임 동작 ─────────────────────────
function island(text, color) { islandText = text; islandColor = color; islandTimer = 2.6; islandS.vel += 4; }

function enhance() {
  if (mode !== 'main') return;
  const cur = LV[S.level];
  if (S.level >= MAX) { island('이미 진(眞) 정희입니다', C.purple); return; }
  if (S.gold < cur.cost) { island('골드가 부족해요 · 정희를 판매해 보세요', C.red); shakeT = 0.35; return; }
  S.gold -= cur.cost; S.tries++;
  mode = 'enh';
  enhanceT = S.level >= 10 ? 1.25 : 0.8;
  play('start');
}

function resolve() {
  if (Math.random() * 100 < LV[S.level].rate) {
    prevLevel = S.level; fadeV = 0;
    S.level++; S.succ++;
    if (S.level > S.best) S.best = S.level;
    const first = !S.seen[S.level];
    S.seen[S.level] = true;
    cardS.v = 1; cardS.vel = 1.6;
    confetti(L.card.x + L.card.w / 2, L.card.y + 88, S.level >= 10 ? 90 : 40);
    play(S.level >= 10 ? 'big' : 'success');
    island(`강화 성공 · +${S.level} ${LV[S.level].name}${first ? '  (도감 등록)' : ''}`, C.green);
    if (S.level === MAX && !S.ending) { S.ending = true; openAlert('ending'); } else mode = 'main';
  } else {
    S.fails++; shakeT = 0.6; play('fail');
    if (S.level === 0) { mode = 'main'; island('강화 실패 · +0은 더 망가질 것도 없어요', C.orange); }
    else { failedLevel = S.level; broken = true; openAlert('fail'); }
  }
  saveGame(); checkBroke();
}

function useTickets() {
  const need = ticketsFor(failedLevel);
  if (S.tickets < need) return;
  S.tickets -= need; broken = false; mode = 'main'; cardS.vel = 1.2;
  play('save');
  island(`방지권 ${need}장으로 +${failedLevel} 정희를 지켜냈어요`, C.blue);
  saveGame();
}

function pickUp() {
  const k = fragsFor(failedLevel);
  S.frags += k; prevLevel = failedLevel; fadeV = 0;
  S.level = 0; broken = false; grayV = 0; mode = 'main';
  play('craft');
  island(`정희 조각 ${k}개를 주웠어요`, C.purple);
  saveGame(); checkBroke();
}

function sell() {
  if (mode !== 'main' || S.level === 0) return;
  const p = LV[S.level].sell;
  S.gold += p; S.sold++; prevLevel = S.level; fadeV = 0; S.level = 0;
  play('coin');
  island(`+${N(p)}G에 판매했어요`, C.greenDark);
  saveGame();
}

function checkBroke() {
  if (S.level === 0 && S.gold < LV[0].cost) {
    S.gold += 500;
    island('빈털터리가 된 정희… 엄마가 용돈 500G를 주셨어요', C.orange);
    saveGame();
  }
}

function craft(fragCost, goldCost, addTickets, toLevel) {
  if (S.frags < fragCost || S.gold < goldCost) return;
  if (toLevel >= 0 && S.level >= toLevel) return;
  S.frags -= fragCost; S.gold -= goldCost;
  if (addTickets > 0) { S.tickets += addTickets; island(`방지권 ${addTickets}장을 만들었어요`, C.blue); }
  if (toLevel >= 0) {
    prevLevel = S.level; fadeV = 0; S.level = toLevel; S.seen[toLevel] = true;
    if (S.level > S.best) S.best = S.level;
    cardS.vel = 1.4;
    island(`+${toLevel} ${LV[toLevel].name}로 교환했어요`, C.purple);
  }
  play('craft');
  saveGame();
}

function resetGame() {
  const sound = S.sound;
  Object.assign(S, { gold: 1000, frags: 0, tickets: 0, tries: 0, succ: 0, fails: 0, sold: 0, level: 0, best: 0, ending: false, sound });
  S.seen = Array(MAX + 1).fill(false); S.seen[0] = true;
  broken = false; grayV = 0; prevLevel = 0; fadeV = 0;
  saveGame();
  island('기록을 초기화했어요', C.red);
}

const openSheet = k => { if (mode !== 'main') return; sheetKind = k; mode = 'sheet'; play('tap'); };
const closeSheet = () => { if (mode === 'sheet') mode = 'main'; };
const openAlert = k => { alertKind = k; mode = 'alert'; alertS.v = 0; alertS.vel = 0; };
const closeAlert = () => { mode = 'main'; };

function confetti(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, sp = 250 + Math.random() * 450;
    parts.push({
      x: x + (Math.random() - 0.5) * 160, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 1.6 + Math.random(), size: 5 + Math.random() * 5, rot: Math.random() * 360,
      spin: (Math.random() - 0.5) * 720, c: CONFETTI[(Math.random() * CONFETTI.length) | 0], kind: 0,
    });
  }
}

// ───────────────────────── 업데이트 ─────────────────────────
function update(dt) {
  t += dt;
  ringS.t = S.level >= MAX ? 1 : LV[S.level].rate / 100;
  dimS.t = (mode === 'sheet' || mode === 'alert') ? 1 : 0;
  sheetS.t = mode === 'sheet' ? 1 : 0;
  alertS.t = mode === 'alert' ? 1 : 0;
  islandTimer -= dt;
  islandS.t = islandTimer > 0 ? 1 : 0;
  switchS.t = S.sound ? 1 : 0;
  cardS.t = mode === 'enh' ? 0.97 : 1;
  for (let k = 0; k < 2; k++) {
    const h = dt / 2;
    for (const s of [cardS, ringS, sheetS, alertS, dimS, islandS, switchS]) s.step(h);
    for (const s of press.values()) s.step(h);
  }
  dispGold += (S.gold - dispGold) * Math.min(1, dt * 9);
  if (Math.abs(S.gold - dispGold) < 1) dispGold = S.gold;
  fadeV = Math.min(1, fadeV + dt * 4);
  grayV = broken ? Math.min(1, grayV + dt * 3) : Math.max(0, grayV - dt * 3);
  shakeT = Math.max(0, shakeT - dt);

  if (mode === 'enh') { enhanceT -= dt; if (enhanceT <= 0) resolve(); }

  if (mode === 'alert' && alertKind === 'ending' && Math.random() < 0.5) {
    parts.push({
      x: Math.random() * L.W, y: -10, vx: (Math.random() - 0.5) * 60, vy: 120 + Math.random() * 120,
      life: 5, size: 5 + Math.random() * 5, rot: Math.random() * 360, spin: (Math.random() - 0.5) * 540,
      c: CONFETTI[(Math.random() * CONFETTI.length) | 0], kind: 1,
    });
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.kind === 0) { p.vy += 700 * dt; p.vx *= Math.pow(0.2, dt); p.vy = Math.min(p.vy, 260); }
    p.rot += p.spin * dt; p.life -= dt;
    if (p.life <= 0 || p.y > L.H + 20) parts.splice(i, 1);
  }
}

// ───────────────────────── 그리기 도우미 ─────────────────────────
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let L = makeLayout(false), view = { s: 1, ox: 0, oy: 0, dpr: 1 };

function roundPath(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fillRound(r, rad, style) {
  if (r.w <= 0 || r.h <= 0) return;
  ctx.fillStyle = style; roundPath(r.x, r.y, r.w, r.h, rad); ctx.fill();
}
const R = (x, y, w, h) => ({ x, y, w, h });
const inflate = (r, a, b = a) => R(r.x - a, r.y - b, r.w + a * 2, r.h + b * 2);
const inside = (r, p) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

// 부드럽게 퍼지는 그림자 (여러 겹을 겹쳐 블러처럼)
function shadow(r, rad, blur, dy, c, alpha255) {
  if (alpha255 <= 0) return;
  const n = 8;
  for (let i = n; i >= 1; i--) {
    const k = i / n, rr = inflate(r, blur * k);
    rr.y += dy;
    fillRound(rr, rad + blur * k, rgba(c, alpha255 / n * (1.2 - k) / 255));
  }
}

function measure(s, f) { ctx.font = f.css; return ctx.measureText(s).width; }

function fit(s, f, w) {
  if (measure(s, f) <= w) return s;
  let lo = 0, hi = s.length;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (measure(s.slice(0, m) + '…', f) <= w) lo = m; else hi = m - 1; }
  return s.slice(0, lo) + '…';
}

function wrapLines(s, f, w) {
  ctx.font = f.css;
  const out = [];
  for (const para of s.split('\n')) {
    let line = '';
    for (const tok of para.split(/(\s+)/)) {
      if (!tok) continue;
      const test = line + tok;
      if (ctx.measureText(test).width <= w || !line.trim()) {
        if (ctx.measureText(test).width <= w) { line = test; continue; }
        // 한 단어가 너무 길면 글자 단위로 자른다
        for (const ch of tok) {
          if (ctx.measureText(line + ch).width > w && line) { out.push(line); line = ''; }
          line += ch;
        }
      } else { out.push(line.trimEnd()); line = tok.trimStart(); }
    }
    out.push(line.trimEnd());
  }
  return out;
}

// align: 'l' | 'c' | 'r'
function text(s, f, color, r, align = 'l', vcenter = true, wrap = false) {
  ctx.font = f.css; ctx.fillStyle = color;
  ctx.textAlign = align === 'l' ? 'left' : align === 'c' ? 'center' : 'right';
  const x = align === 'l' ? r.x : align === 'c' ? r.x + r.w / 2 : r.x + r.w;
  if (!wrap) {
    ctx.textBaseline = 'middle';
    ctx.fillText(fit(s, f, Math.max(1, r.w)), x, vcenter ? r.y + r.h / 2 + 0.5 : r.y + f.size * 0.6);
    return f.size * 1.2;
  }
  const lh = f.size * 1.5, lines = wrapLines(s, f, r.w);
  ctx.textBaseline = 'middle';
  lines.forEach((ln, i) => ctx.fillText(ln, x, r.y + lh * i + lh / 2));
  return lines.length * lh;
}
function textHeight(s, f, w) { return wrapLines(s, f, w).length * f.size * 1.5; }

function arcStroke(cx, cy, r, startDeg, sweepDeg, color, width) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, startDeg * Math.PI / 180, (startDeg + sweepDeg) * Math.PI / 180);
  ctx.stroke();
}

// ───────────────────────── 사진 ─────────────────────────
const photos = [];
let loaded = 0;
function prepPhoto(i, img) {
  // 흑백 버전과 썸네일은 미리 만들어 둔다 (매 프레임 계산하지 않도록)
  const gw = Math.min(img.naturalWidth, 800), gh = Math.round(img.naturalHeight * gw / img.naturalWidth);
  const gray = document.createElement('canvas'); gray.width = gw; gray.height = gh;
  const g = gray.getContext('2d');
  g.drawImage(img, 0, 0, gw, gh);
  try {
    const d = g.getImageData(0, 0, gw, gh), a = d.data;
    for (let k = 0; k < a.length; k += 4) {
      const l = (a[k] * 0.25 + a[k + 1] * 0.5 + a[k + 2] * 0.09) * 1.0 + 5;
      a[k] = a[k + 1] = a[k + 2] = l;
    }
    g.putImageData(d, 0, 0);
  } catch (e) { g.fillStyle = 'rgba(80,80,80,0.6)'; g.fillRect(0, 0, gw, gh); }
  const thumb = document.createElement('canvas'); thumb.width = 180; thumb.height = 228;
  drawCover(thumb.getContext('2d'), img, i, 0, 0, 180, 228);
  photos[i] = { img, gray, thumb };
}
function srcRect(iw, ih, i, aspect) {
  const [fx, fy] = FOCUS[i];
  let sw, sh, sx, sy;
  if (iw / ih > aspect) { sh = ih; sw = ih * aspect; sy = 0; sx = Math.max(0, Math.min(iw - sw, fx * iw - sw / 2)); }
  else { sw = iw; sh = iw / aspect; sx = 0; sy = Math.max(0, Math.min(ih - sh, fy * ih - sh / 2)); }
  return [sx, sy, sw, sh];
}
function drawCover(c, img, i, x, y, w, h, src) {
  const s = src || img, iw = s.naturalWidth || s.width, ih = s.naturalHeight || s.height;
  const [sx, sy, sw, sh] = srcRect(iw, ih, i, w / h);
  c.drawImage(s, sx, sy, sw, sh, x, y, w, h);
}
function drawPhoto(i, r, rad, alpha, gray) {
  const p = photos[i];
  if (!p || alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  roundPath(r.x, r.y, r.w, r.h, rad); ctx.clip();
  drawCover(ctx, p.img, i, r.x, r.y, r.w, r.h, gray ? p.gray : null);
  ctx.restore();
}
function drawThumb(i, r, rad) {
  const p = photos[i];
  ctx.save();
  roundPath(r.x, r.y, r.w, r.h, rad); ctx.clip();
  if (p) drawCover(ctx, p.thumb, i, r.x, r.y, r.w, r.h, p.thumb);
  else { ctx.fillStyle = rgba(C.fill); ctx.fillRect(r.x, r.y, r.w, r.h); }
  ctx.restore();
}

// ───────────────────────── 렌더링 ─────────────────────────
function render() {
  const { dpr, s, ox, oy } = view;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = rgba(C.bg);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);

  btns = [];
  if (loaded < 14) { drawLoading(); return; }
  drawBackground();
  layerActive = mode === 'main' || mode === 'enh';
  drawHeader();
  drawCard();
  drawPanel();
  if (dimS.v > 0.01) { ctx.fillStyle = rgba(C.black, Math.min(1, dimS.v) * 70 / 255); ctx.fillRect(-ox / s, -oy / s, canvas.width / dpr / s, canvas.height / dpr / s); }
  if (sheetS.v > 0.003) { layerActive = mode === 'sheet'; drawSheet(); }
  if (alertS.v > 0.01) { layerActive = mode === 'alert'; drawAlert(); }
  drawParticles();
  drawIsland();
}

function drawLoading() {
  const r = R(L.W / 2 - 120, L.H / 2 - 30, 240, 60);
  text('정희 강화하기', F.title, rgba(C.label), R(r.x, r.y - 20, r.w, 30), 'c');
  fillRound(R(r.x, r.y + 30, r.w, 6), 3, rgba(C.fill));
  fillRound(R(r.x, r.y + 30, r.w * loaded / 14, 6), 3, rgba(C.blue));
  text('사진 불러오는 중…', F.cap, rgba(C.label2), R(r.x, r.y + 44, r.w, 18), 'c');
}

function drawBackground() {
  const tc = tier(S.level, t);
  const cols = [tc, mix(tc, C.blue, 0.5), mix(tc, C.pink, 0.5)];
  const sx = L.W / 960, sy = L.H / 640;
  for (let i = 0; i < 3; i++) {
    const cx = (480 + Math.sin(t * 0.17 + i * 2.1) * 380) * sx;
    const cy = (320 + Math.cos(t * 0.13 + i * 1.7) * 260) * sy;
    const r = 330 * Math.max(sx, sy * 0.7);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, rgba(cols[i], 46 / 255));
    g.addColorStop(1, rgba(cols[i], 0));
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
}

function drawHeader() {
  const y = L.titleY;
  text('정희 강화하기', F.large, rgba(C.label), R(L.portrait ? 22 : 38, y, 400, 42), 'l');
  const found = S.seen.filter(Boolean).length;
  text(`최고 기록 +${S.best}  ·  도감 ${found}/${MAX + 1}`, F.cap, rgba(C.label2), R(L.portrait ? 24 : 40, y + 40, 400, 18), 'l');

  // 재화 칩 (세로 화면에서는 이름표 없이 색 점 + 숫자)
  const vals = [N(dispGold) + ' G', N(S.frags), N(S.tickets)];
  const labels = ['골드', '조각', '방지권'];
  const cols = [C.orange, C.purple, C.blue];
  let x = L.portrait ? L.W - 16 : 920;
  for (let i = 2; i >= 0; i--) {
    const tw = measure(vals[i], F.bodyB), lw = L.chipLabels ? measure(labels[i], F.cap) + 6 : 0;
    const w = 28 + lw + tw + 14;
    const r = R(x - w, L.chipsY, w, 34);
    shadow(r, 17, 6, 2, C.black, 30);
    fillRound(r, 17, rgba(C.card));
    ctx.fillStyle = rgba(cols[i]); ctx.beginPath(); ctx.arc(r.x + 17, r.y + 17, 5, 0, Math.PI * 2); ctx.fill();
    if (L.chipLabels) text(labels[i], F.cap, rgba(C.label2), R(r.x + 28, r.y, lw, r.h), 'l');
    text(vals[i], F.bodyB, rgba(C.label), R(r.x + 28 + lw, r.y, tw + 4, r.h), 'l');
    x -= w + 8;
  }
}

function drawCard() {
  const tc = tier(S.level, t), cr = L.card;
  const s = cardS.v;
  const sx = shakeT > 0 ? Math.sin(shakeT * 55) * 16 * (shakeT / 0.6) : 0;
  const cx = cr.x + cr.w / 2, cy = cr.y + cr.h / 2;
  const r = R(cx - cr.w * s / 2 + sx, cy - cr.h * s / 2, cr.w * s, cr.h * s);
  const rad = 28;

  shadow(r, rad, 26, 12, S.level >= 5 ? mix(C.black, tc, 0.6) : C.black, S.level >= 5 ? 90 : 55);

  // 높은 단계: Apple Intelligence 스타일의 빛나는 그라데이션 테두리
  if (S.level >= 9 && grayV < 0.5) {
    const src = S.level >= 15 ? [C.blue, C.purple, C.pink, C.orange, C.blue] : [tc, mix(tc, C.white, 0.5), tc];
    const k = (S.level >= 15 ? 1 : 0.7) * (1 - grayV);
    const ang = (t * 70 % 360) * Math.PI / 180, gr = inflate(r, 30);
    const gcx = gr.x + gr.w / 2, gcy = gr.y + gr.h / 2, dx = Math.cos(ang) * gr.w / 2, dy = Math.sin(ang) * gr.h / 2;
    [[16, 40], [10, 70], [6, 130], [3, 255]].forEach(([w, a]) => {
      const g = ctx.createLinearGradient(gcx - dx, gcy - dy, gcx + dx, gcy + dy);
      src.forEach((c, j) => g.addColorStop(j / (src.length - 1), rgba(c, a / 255 * k)));
      ctx.strokeStyle = g; ctx.lineWidth = w;
      const o = inflate(r, 1);
      roundPath(o.x, o.y, o.w, o.h, rad + 1); ctx.stroke();
    });
  }

  fillRound(r, rad, 'rgb(30,30,32)');
  if (fadeV < 1 && prevLevel !== S.level) drawPhoto(LV[prevLevel].photo, r, rad, 1, false);
  drawPhoto(LV[S.level].photo, r, rad, fadeV, false);
  if (grayV > 0) {
    drawPhoto(LV[S.level].photo, r, rad, grayV, true);
    fillRound(r, rad, rgba(C.black, grayV * 50 / 255));
  }

  ctx.save();
  roundPath(r.x, r.y, r.w, r.h, rad); ctx.clip();
  // 강화 중 / 최고 단계: 빛이 훑고 지나가는 시머 효과
  if (mode === 'enh' || S.level === MAX) {
    const speed = mode === 'enh' ? 1.6 : 0.35;
    const phase = (t * speed) % 1.4 - 0.2;
    const bx = r.x - 200 + phase * (r.w + 400);
    const g = ctx.createLinearGradient(bx - 120, 0, bx + 120, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, `rgba(255,255,255,${mode === 'enh' ? 0.43 : 0.24})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(bx - 120, r.y, 240, r.h);
  }
  // 하단 그라데이션
  const sg = ctx.createLinearGradient(0, r.y + r.h * 0.5, 0, r.y + r.h);
  sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.73)');
  ctx.fillStyle = sg; ctx.fillRect(r.x, r.y + r.h * 0.5, r.w, r.h * 0.5);
  ctx.restore();

  // 금이 간 효과
  if (grayV > 0) {
    const P = (fx, fy) => [r.x + r.w * fx, r.y + r.h * fy];
    const crack = [P(0.42, 0), P(0.5, 0.18), P(0.44, 0.32), P(0.58, 0.5), P(0.49, 0.68), P(0.56, 1)];
    const branch = [P(0.58, 0.5), P(0.76, 0.46), P(1, 0.55)];
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const [w, col] of [[5, rgba(C.black, grayV * 0.45)], [2.2, rgba(C.white, grayV * 0.9)]]) {
      ctx.strokeStyle = col; ctx.lineWidth = w;
      for (const line of [crack, branch]) {
        ctx.beginPath(); ctx.moveTo(line[0][0], line[0][1]);
        for (let j = 1; j < line.length; j++) ctx.lineTo(line[j][0], line[j][1]);
        ctx.stroke();
      }
    }
  }

  const pad = 22 * s, port = L.portrait;
  const badge = broken ? '파괴됨' : '+' + S.level;
  const bw = measure(badge, F.badge) + 22;
  const nameF = port ? font(21, true) : F.name;
  const br = R(r.x + pad, r.y + r.h - (port ? 118 : 132) * s, bw, 28);
  fillRound(br, 14, rgba(broken ? C.red : tc));
  text(badge, F.badge, '#fff', br, 'c');
  if (S.level === MAX && !broken) text('MAX', F.cap, 'rgba(255,255,255,0.86)', R(br.x + br.w + 8, br.y, 60, br.h), 'l');
  text(LV[S.level].name, nameF, '#fff', R(r.x + pad, r.y + r.h - (port ? 86 : 98) * s, r.w - pad * 2, 34), 'l');
  text(LV[S.level].desc, F.body, 'rgba(255,255,255,0.84)', R(r.x + pad, r.y + r.h - (port ? 52 : 60) * s, r.w - pad * 2, 42), 'l', false, true);
}

function drawPanel() {
  const p = L.panel;
  shadow(p, 24, 18, 6, C.black, 35);
  fillRound(p, 24, rgba(C.card));
  const x = p.x + 24, w = p.w - 48, max = S.level >= MAX, cur = LV[S.level];

  text(max ? '최고 단계' : `다음 단계  ·  +${S.level + 1}`, F.cap, rgba(C.label2), R(x, p.y + 20, w, 18), 'l');
  text(max ? '강화의 끝에 도달했어요' : LV[S.level + 1].name, F.title, rgba(C.label), R(x, p.y + 38, w, 30), 'l');

  // Apple Watch 스타일 성공 확률 링
  const rate = max ? 100 : cur.rate;
  const rc = rate >= 60 ? C.green : rate >= 30 ? C.orange : C.pink;
  const rcx = x + 64, rcy = p.y + 150, rr = 54;
  ctx.strokeStyle = rgba(rc, 45 / 255); ctx.lineWidth = 15;
  ctx.beginPath(); ctx.arc(rcx, rcy, rr, 0, Math.PI * 2); ctx.stroke();
  arcStroke(rcx, rcy, rr, -90, Math.max(0.5, Math.min(360, ringS.v * 360)), rgba(rc), 15);
  text(Math.round(ringS.v * 100) + '%', F.ring, rgba(C.label), R(rcx - 60, rcy - 22, 120, 34), 'c');
  text('성공 확률', F.cap, rgba(C.label2), R(rcx - 60, rcy + 10, 120, 18), 'c');

  // 정보 목록
  const lx = x + 150, lw = w - 150, ly = p.y + 86;
  const keys = ['강화 비용', '판매 가격', '파괴 시 조각', '복구 방지권'];
  const vals = [
    max ? '—' : N(cur.cost) + ' G',
    S.level === 0 ? '판매 불가' : N(cur.sell) + ' G',
    S.level === 0 ? '—' : `+${fragsFor(S.level)}개`,
    S.level === 0 ? '—' : `${ticketsFor(S.level)}장 (보유 ${S.tickets})`,
  ];
  for (let i = 0; i < 4; i++) {
    const r2 = R(lx, ly + i * 32, lw, 32);
    const vw = measure(vals[i], F.bodyB);
    text(keys[i], F.body, rgba(C.label2), R(r2.x, r2.y, r2.w - vw - 6, r2.h), 'l');
    text(vals[i], F.bodyB, rgba(i === 0 && !max && S.gold < cur.cost ? C.red : C.label), r2, 'r');
    if (i < 3) { ctx.fillStyle = rgba(C.sep); ctx.fillRect(lx, r2.y + r2.h - 0.5, lw, 1); }
  }

  // 버튼
  const canEnh = mode === 'main' && !max && S.gold >= cur.cost, enh = mode === 'enh';
  button('enh', R(x, p.y + 240, w, 56), 28, canEnh || enh ? C.blue : C.fill, canEnh || enh ? C.white : C.label2,
    enh ? '강화 중' : max ? '최고 단계 달성' : '강화하기', F.btn, canEnh, enhance, enh);
  button('sell', R(x, p.y + 306, w, 48), 24, S.level > 0 ? [...C.green, 40 / 255] : C.fill, S.level > 0 ? C.greenDark : C.label2,
    S.level > 0 ? `판매하기   +${N(cur.sell)} G` : '판매하기', F.head, S.level > 0 && mode === 'main', sell, false);
  const bw = (w - 20) / 3;
  button('craft', R(x, p.y + 364, bw, 46), 23, C.fill, C.label, '조합소', F.head, mode === 'main', () => openSheet('craft'), false);
  button('book', R(x + bw + 10, p.y + 364, bw, 46), 23, C.fill, C.label, '도감', F.head, mode === 'main', () => openSheet('book'), false);
  button('set', R(x + (bw + 10) * 2, p.y + 364, bw, 46), 23, C.fill, C.label, '설정', F.head, mode === 'main', () => openSheet('settings'), false);

  text(`시도 ${N(S.tries)}  ·  성공 ${N(S.succ)}  ·  실패 ${N(S.fails)}  ·  판매 ${N(S.sold)}`, F.cap, rgba(C.label2), R(x, p.y + 426 - (L.hint ? 0 : 4), w, 18), 'c');
  if (L.hint) text('Space 강화   S 판매   C 조합소   B 도감', F.cap, rgba(C.label2, 160 / 255), R(x, p.y + 448, w, 18), 'c');
}

function pressSpring(id) {
  let s = press.get(id);
  if (!s) { s = new Spring(1, 500, 28); press.set(id, s); }
  return s;
}

// bg/fg: [r,g,b] 또는 [r,g,b,a]
function button(id, r, rad, bg, fg, label, f, enabled, act, spinner) {
  const hit = layerActive && enabled && inside(r, mouse);
  const ps = pressSpring(id);
  ps.t = hit && pointerDown && pressedId === id ? 0.95 : 1;
  const s = ps.v, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  const a = bg.length > 3 ? bg[3] : 1;
  let c = bg;
  if (hit && !isTouch) c = mix(bg, C.black, a === 1 && bg !== C.fill ? 0.08 : 0.04);
  fillRound(r, rad, rgba(c, a));
  if (spinner) {
    const tw = measure(label, f), sx = cx - (tw + 28) / 2;
    drawSpinner(sx + 10, cy, 10, fg);
    text(label, f, rgba(fg), R(sx + 26, r.y, tw + 6, r.h), 'l');
  } else text(label, f, rgba(fg), R(r.x + 6, r.y, r.w - 12, r.h), 'c');
  ctx.restore();
  if (layerActive) btns.push({ id, r, enabled, act });
}

// 텍스트만 있는 버튼 (iOS 내비게이션 바 / 알림창 버튼)
function textButton(id, r, label, f, fg, enabled, act, hoverBg) {
  const hit = layerActive && enabled && inside(r, mouse);
  if (hit && hoverBg) { ctx.fillStyle = hoverBg; ctx.fillRect(r.x, r.y, r.w, r.h); }
  text(label, f, enabled ? rgba(fg) : rgba(C.label2, 0.6), R(r.x + 8, r.y, r.w - 16, r.h), 'c');
  if (layerActive) btns.push({ id, r, enabled, act });
}

function drawSpinner(cx, cy, r, c) {
  const step = Math.floor(t * 12) % 8;
  ctx.lineCap = 'round'; ctx.lineWidth = r * 0.24;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, age = (step - i + 8) % 8;
    ctx.strokeStyle = rgba(c, (255 - age * 28) / 255);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
}

function drawSwitch(id, x, y, act) {
  const r = R(x, y, 51, 31), v = Math.max(0, Math.min(1, switchS.v));
  fillRound(r, 15.5, rgba(mix([233, 233, 234], C.green, v)));
  const kx = x + 2 + switchS.v * 20;
  ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.beginPath(); ctx.arc(kx + 13.5, y + 16.5, 13.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(kx + 13.5, y + 15.5, 13.5, 0, Math.PI * 2); ctx.fill();
  if (layerActive) btns.push({ id, r, enabled: true, act });
}

// ───────────────────────── 시트 (iPad 폼 시트 / iPhone 바텀 시트) ─────────────────────────
function drawSheet() {
  const v = sheetS.v, sr = L.sheet;
  const r = R(sr.x, sr.y + (1 - v) * (L.H - sr.y + 40), sr.w, sr.h);
  shadow(r, 16, 30, 10, C.black, 60);
  fillRound(r, 16, rgba(C.bg));

  let title = sheetKind === 'craft' ? '조합소' : sheetKind === 'book' ? '도감' : '설정';
  if (sheetKind === 'book') title = `도감  ${S.seen.filter(Boolean).length} / ${MAX + 1}`;
  const nav = R(r.x, r.y, r.w, 54);
  ctx.save(); ctx.beginPath(); ctx.rect(nav.x, nav.y, nav.w, nav.h); ctx.clip();
  fillRound(R(r.x, r.y, r.w, 70), 16, 'rgb(249,249,251)');
  ctx.restore();
  ctx.fillStyle = rgba(C.sep); ctx.fillRect(r.x, nav.y + nav.h - 0.5, r.w, 1);
  if (L.portrait) fillRound(R(r.x + r.w / 2 - 18, r.y + 6, 36, 5), 2.5, rgba(C.label2, 0.35));
  text(title, F.head, rgba(C.label), nav, 'c');
  textButton('done', R(r.x + r.w - 84, r.y + 8, 72, 38), '완료', F.head, C.blue, true, closeSheet, null);

  const x = r.x + 20, w = r.w - 40, y = nav.y + nav.h + 16;
  if (sheetKind === 'craft') drawCraft(x, y, w);
  else if (sheetKind === 'book') drawBook(x, y, w);
  else drawSettings(x, y, w);
}

const sectionHeader = (s, x, y, w) => text(s, F.cap, rgba(C.label2), R(x + 14, y, w - 14, 20), 'l');

function drawCraft(x, y, w) {
  const names = ['조각', '방지권', '골드'], vals = [N(S.frags), N(S.tickets), N(S.gold)], cols = [C.purple, C.blue, C.orange];
  const tw = (w - 20) / 3;
  for (let i = 0; i < 3; i++) {
    const tr = R(x + i * (tw + 10), y, tw, 62);
    fillRound(tr, 12, rgba(C.card));
    ctx.fillStyle = rgba(cols[i]); ctx.beginPath(); ctx.arc(tr.x + 18, tr.y + 19, 4, 0, Math.PI * 2); ctx.fill();
    text(names[i], F.cap, rgba(C.label2), R(tr.x + 28, tr.y + 9, tw - 30, 20), 'l');
    text(vals[i], L.portrait ? F.head : F.title, rgba(C.label), R(tr.x + 14, tr.y + 28, tw - 24, 28), 'l');
  }
  y += 76;
  sectionHeader('방지권 만들기', x, y, w); y += 22;
  y = craftRows(x, y, w, [
    ['방지권 1장', '조각 10개', 10, 0, 1, -1],
    ['방지권 10장', '조각 90개 · 10% 할인', 90, 0, 10, -1],
    ['방지권 1장', '30,000 G', 0, 30000, 1, -1],
  ]);
  y += 12;
  sectionHeader(L.portrait ? '정희 교환 · 지금보다 높은 단계만' : '정희 교환  ·  지금보다 높은 단계만 교환할 수 있어요', x, y, w); y += 22;
  craftRows(x, y, w, [
    [`+5 ${LV[5].name}`, '조각 60개', 60, 0, 0, 5],
    [`+8 ${LV[8].name}`, '조각 200개', 200, 0, 0, 8],
    [`+10 ${LV[10].name}`, '조각 500개', 500, 0, 0, 10],
    [`+12 ${LV[12].name}`, '조각 1,200개', 1200, 0, 0, 12],
  ]);
}

function craftRows(x, y, w, rows) {
  const rh = 46;
  fillRound(R(x, y, w, rh * rows.length), 12, rgba(C.card));
  rows.forEach(([name, sub, fc, gc, add, to], i) => {
    const rr = R(x, y + i * rh, w, rh);
    let tx;
    if (to >= 0) { drawThumb(LV[to].photo, R(rr.x + 12, rr.y + 6, 27, 34), 6); tx = rr.x + 51; }
    else {
      const ic = R(rr.x + 12, rr.y + 9, 28, 28);
      fillRound(ic, 7, rgba(C.blue));
      text('권', F.bodyB, '#fff', ic, 'c');
      tx = rr.x + 52;
    }
    const tw = rr.x + rr.w - 104 - tx;
    text(name, F.bodyB, rgba(C.label), R(tx, rr.y + 5, tw, 20), 'l');
    text(sub, F.cap, rgba(C.label2), R(tx, rr.y + 24, tw, 18), 'l');
    const can = S.frags >= fc && S.gold >= gc && (to < 0 || S.level < to);
    button('cr' + i + name + sub, R(rr.x + rr.w - 92, rr.y + 9, 80, 28), 14,
      can ? [...C.blue, 30 / 255] : C.fill, can ? C.blue : C.label2, to >= 0 ? '교환' : '만들기', F.bodyB, can,
      () => craft(fc, gc, add, to), false);
    if (i < rows.length - 1) { ctx.fillStyle = rgba(C.sep); ctx.fillRect(tx, rr.y + rr.h - 0.5, rr.x + rr.w - tx, 1); }
  });
  return y + rh * rows.length;
}

function drawBook(x, y, w) {
  const cols = L.bookCols, gap = 10;
  const cw = (w - gap * (cols - 1)) / cols, ch = cw / 0.79;
  hoverBook = -1;
  for (let i = 0; i <= MAX; i++) {
    const th = R(x + (i % cols) * (cw + gap), y + Math.floor(i / cols) * (ch + 30), cw, ch);
    const hov = layerActive && inside(th, mouse);
    if (hov) hoverBook = i;
    if (S.seen[i]) {
      if (hov || i === S.level) shadow(th, 10, 8, 3, tier(i, t), 90);
      drawThumb(LV[i].photo, th, 10);
      if (i === S.level) { ctx.strokeStyle = rgba(C.blue); ctx.lineWidth = 2.5; const o = inflate(th, 1.5); roundPath(o.x, o.y, o.w, o.h, 11); ctx.stroke(); }
    } else {
      fillRound(th, 10, rgba(C.fill));
      const lx = th.x + th.w / 2, ly = th.y + th.h / 2, lc = rgba(C.label2, 0.6);
      ctx.strokeStyle = lc; ctx.lineWidth = 2.4; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(lx - 7, ly - 2); ctx.lineTo(lx - 7, ly - 5); ctx.arc(lx, ly - 5, 7, Math.PI, 0); ctx.lineTo(lx + 7, ly - 2); ctx.stroke();
      fillRound(R(lx - 10, ly - 3, 20, 15), 3, lc);
    }
    text('+' + i, F.bodyB, rgba(S.seen[i] ? C.label : C.label2), R(th.x, th.y + th.h + 4, th.w, 20), 'c');
    if (layerActive) btns.push({ id: 'bk' + i, r: th, enabled: true, act: () => { bookPick = i; } });
  }
  const rows = Math.ceil((MAX + 1) / cols);
  const fr = R(x, y + rows * (ch + 30) + 6, w, L.portrait ? 76 : 58);
  fillRound(fr, 12, rgba(C.card));
  const show = hoverBook >= 0 ? hoverBook : (bookPick >= 0 ? bookPick : S.level);
  if (S.seen[show]) {
    text(`+${show}  ${LV[show].name}`, F.head, rgba(C.label), R(fr.x + 16, fr.y + 8, fr.w - 32, 22), 'l');
    const info = LV[show].desc + (show < MAX ? `   ·   성공 확률 ${LV[show].rate}%` : '');
    text(info, F.cap, rgba(C.label2), R(fr.x + 16, fr.y + 31, fr.w - 32, 18), 'l', false, L.portrait);
  } else {
    text(`+${show}  ???`, F.head, rgba(C.label2), R(fr.x + 16, fr.y + 8, fr.w - 32, 22), 'l');
    text('아직 만나지 못한 정희예요.', F.cap, rgba(C.label2), R(fr.x + 16, fr.y + 31, fr.w - 32, 18), 'l');
  }
}
let bookPick = -1;

function drawSettings(x, y, w) {
  sectionHeader('게임 방법', x, y, w); y += 22;
  const help =
    '• 골드를 내고 정희를 강화하세요. 단계가 오를수록 성공 확률은 낮아지고 몸값은 치솟습니다.\n' +
    '• 강화에 실패하면 정희가 산산조각 납니다. 방지권으로 복구하거나, 조각을 주워 +0부터 다시 시작하세요.\n' +
    '• 조각은 조합소에서 방지권이나 높은 단계의 정희로 교환할 수 있어요.\n' +
    '• 판매하면 골드를 얻고 +0 정희가 새로 나타납니다.\n' +
    '• 목표는 +20 진(眞) 정희! 모든 단계를 모아 도감을 완성해 보세요.\n' +
    (L.portrait ? '• 진행 상황은 이 브라우저에 자동 저장돼요.' : '• 단축키: Space 강화 · S 판매 · C 조합소 · B 도감 · Esc 닫기 · 1/2 실패 시 선택\n• 진행 상황은 이 브라우저에 자동 저장돼요.');
  const hh = textHeight(help, F.body, w - 32) + 28;
  fillRound(R(x, y, w, hh), 12, rgba(C.card));
  text(help, F.body, rgba(C.label), R(x + 16, y + 14, w - 32, hh - 20), 'l', false, true);
  y += hh + 14;

  sectionHeader('설정', x, y, w); y += 22;
  const sr = R(x, y, w, 96);
  fillRound(sr, 12, rgba(C.card));
  text('효과음', F.body, rgba(C.label), R(sr.x + 16, sr.y, 200, 48), 'l');
  drawSwitch('sound', sr.x + sr.w - 67, sr.y + 8.5, () => { S.sound = !S.sound; if (S.sound) ensureAudio(); saveGame(); });
  ctx.fillStyle = rgba(C.sep); ctx.fillRect(sr.x + 16, sr.y + 47.5, sr.w - 16, 1);
  const resetR = R(sr.x, sr.y + 48, sr.w, 48);
  if (layerActive && inside(resetR, mouse) && !isTouch) {
    ctx.save(); roundPath(sr.x, sr.y, sr.w, sr.h, 12); ctx.clip();
    ctx.fillStyle = rgba(C.fill, 0.78); ctx.fillRect(resetR.x, resetR.y, resetR.w, resetR.h);
    ctx.restore();
  }
  text('기록 초기화', F.body, rgba(C.red), R(sr.x + 16, sr.y + 48, 200, 48), 'l');
  if (layerActive) btns.push({ id: 'reset', r: resetR, enabled: true, act: () => openAlert('reset') });
}

// ───────────────────────── iOS 알림창 ─────────────────────────
function drawAlert() {
  const v = Math.max(0, Math.min(1, alertS.v)), closing = mode !== 'alert';
  const s = closing ? 1 : 1 + 0.18 * (1 - alertS.v);
  let title, msg;
  const bl = []; // [텍스트, 색, 굵게, 활성, 동작]
  if (alertKind === 'fail') {
    const need = ticketsFor(failedLevel);
    title = '강화 실패';
    msg = `+${failedLevel} ${LV[failedLevel].name}가\n산산조각 났습니다.` + (S.tickets < need ? `\n방지권이 부족해요. (필요 ${need}장)` : '');
    bl.push([`방지권 ${need}장으로 복구  (보유 ${S.tickets})`, C.blue, true, S.tickets >= need, useTickets]);
    bl.push([`조각 줍기  (+${fragsFor(failedLevel)}개)`, C.red, false, true, pickUp]);
  } else if (alertKind === 'ending') {
    title = '진(眞) 정희 탄생';
    msg = `총 ${N(S.tries)}번의 강화 끝에\n강화의 끝에 도달했습니다. 축하해요!`;
    bl.push(['계속하기', C.blue, true, true, closeAlert]);
  } else {
    title = '기록을 초기화할까요?';
    msg = '골드, 조각, 방지권, 도감 기록이\n모두 삭제됩니다.';
    bl.push(['초기화', C.red, false, true, () => { resetGame(); closeAlert(); }]);
    bl.push(['취소', C.blue, true, true, closeAlert]);
  }
  const aw = 300, msgH = textHeight(msg, F.body, aw - 40);
  const ah = 20 + 24 + 6 + msgH + 20 + bl.length * 46;
  const cx = L.W / 2, cy = L.alertY;
  const r = R(cx - aw / 2, cy - ah / 2, aw, ah);
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  ctx.globalAlpha = v;
  shadow(r, 14, 24, 8, C.black, 70);
  fillRound(r, 14, 'rgb(252,252,253)');
  text(title, F.head, rgba(C.label), R(r.x + 20, r.y + 20, aw - 40, 24), 'c');
  text(msg, F.body, rgba(C.label), R(r.x + 20, r.y + 50, aw - 40, msgH + 4), 'c', false, true);
  const by = r.y + 50 + msgH + 20;
  roundPath(r.x, r.y, r.w, r.h, 14); ctx.clip();
  bl.forEach(([label, c, bold, en, act], i) => {
    const brc = R(r.x, by + i * 46, aw, 46);
    ctx.fillStyle = rgba(C.sep); ctx.fillRect(r.x, brc.y - 0.5, aw, 1);
    textButton('al' + i, brc, label, bold ? F.head : F.body, c, en && !closing, act, isTouch ? null : rgba(C.fill, 0.63));
  });
  ctx.restore();
}

function drawParticles() {
  for (const p of parts) {
    const a = Math.min(1, p.life / 0.6), sx = Math.abs(Math.cos(p.rot * Math.PI / 90)) * 0.7 + 0.3;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
    ctx.fillStyle = rgba(p.c, a);
    ctx.fillRect(-p.size / 2 * sx, -p.size * 0.8, p.size * sx, p.size * 1.6);
    ctx.restore();
  }
}

// ───────────────────────── 다이내믹 아일랜드 알림 ─────────────────────────
function drawIsland() {
  const v = islandS.v;
  if (v < 0.02) return;
  const tw = measure(islandText, F.bodyB);
  const fullW = Math.min(L.W - 24, tw + 64);
  const w = Math.max(1, 120 + (fullW - 120) * v), h = 30 + 10 * Math.min(1.1, v);
  const r = R(L.W / 2 - w / 2, 8, w, h);
  shadow(r, h / 2, 10, 4, C.black, 40 * Math.min(1, v));
  fillRound(r, h / 2, rgba(C.black, Math.min(1, v * 2)));
  if (v > 0.55) {
    const ca = Math.min(1, (v - 0.55) / 0.35);
    ctx.save(); roundPath(r.x, r.y, r.w, r.h, h / 2); ctx.clip();
    ctx.fillStyle = rgba(islandColor, ca); ctx.beginPath(); ctx.arc(r.x + 20, r.y + h / 2, 6, 0, Math.PI * 2); ctx.fill();
    text(islandText, F.bodyB, rgba(C.white, ca), R(r.x + 34, r.y, Math.max(1, r.w - 46), h), 'l');
    ctx.restore();
  }
}

// ───────────────────────── 화면 크기 / 입력 ─────────────────────────
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
  L = makeLayout(vw / vh < 0.85);
  const s = Math.min(vw / L.W, vh / L.H);
  view = { dpr, s, ox: (vw - L.W * s) / 2, oy: (vh - L.H * s) / 2 };
}
window.addEventListener('resize', resize);

function toGame(e) { return { x: (e.clientX - view.ox) / view.s, y: (e.clientY - view.oy) / view.s }; }
function hitTest(p) { for (let i = btns.length - 1; i >= 0; i--) if (inside(btns[i].r, p)) return btns[i]; return null; }

canvas.addEventListener('pointermove', e => {
  isTouch = e.pointerType !== 'mouse';
  mouse = toGame(e);
  const b = hitTest(mouse);
  canvas.style.cursor = b && b.enabled ? 'pointer' : 'default';
});
canvas.addEventListener('pointerleave', () => { if (!pointerDown) mouse = { x: -1, y: -1 }; });
canvas.addEventListener('pointerdown', e => {
  ensureAudio();
  isTouch = e.pointerType !== 'mouse';
  mouse = toGame(e);
  pointerDown = true;
  try { canvas.setPointerCapture(e.pointerId); } catch (_) { }
  const b = hitTest(mouse);
  pressedId = b && b.enabled ? b.id : null;
  // 시트 바깥(어두운 영역)을 누르면 닫기
  if (!b && mode === 'sheet' && !inside(L.sheet, mouse)) closeSheet();
});
canvas.addEventListener('pointerup', e => {
  mouse = toGame(e);
  pointerDown = false;
  const b = hitTest(mouse);
  if (b && b.enabled && b.id === pressedId && b.act) {
    if (b.id !== 'enh' && !b.id.startsWith('bk')) play('tap');
    b.act();
  }
  pressedId = null;
  if (isTouch) mouse = { x: -1, y: -1 }; // 터치는 손을 떼면 호버 상태도 해제
});
canvas.addEventListener('pointercancel', () => { pointerDown = false; pressedId = null; });

window.addEventListener('keydown', e => {
  ensureAudio();
  const k = e.key;
  if (k === ' ' || k === 'Spacebar') {
    e.preventDefault();
    if (e.repeat) return;
    if (mode === 'main') enhance();
    else if (mode === 'alert' && alertKind === 'ending') closeAlert();
  } else if (k === 's' || k === 'S' || k === 'ㄴ') sell();
  else if (k === 'c' || k === 'C' || k === 'ㅊ') { if (mode === 'sheet' && sheetKind === 'craft') closeSheet(); else openSheet('craft'); }
  else if (k === 'b' || k === 'B' || k === 'ㅠ') { if (mode === 'sheet' && sheetKind === 'book') closeSheet(); else openSheet('book'); }
  else if (k === 'Escape') { if (mode === 'sheet') closeSheet(); else if (mode === 'alert' && alertKind !== 'fail') closeAlert(); }
  else if (k === '1') { if (mode === 'alert' && alertKind === 'fail') useTickets(); }
  else if (k === '2') { if (mode === 'alert' && alertKind === 'fail') pickUp(); }
  else if (k === 'm' || k === 'M' || k === 'ㅡ') { S.sound = !S.sound; island(S.sound ? '효과음 켜짐' : '효과음 꺼짐', C.gray); saveGame(); }
});

// ───────────────────────── 시작 ─────────────────────────
loadGame();
dispGold = S.gold; prevLevel = S.level;
switchS.v = switchS.t = S.sound ? 1 : 0;
resize();

for (let i = 1; i <= 14; i++) {
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => { prepPhoto(i, img); loaded++; if (loaded === 14) island(S.tries === 0 ? '강화하기 버튼을 눌러 정희를 강화해 보세요' : '다시 오셨군요. 강화를 계속해 볼까요?', C.blue); };
  img.onerror = () => { loaded++; };
  img.src = `photos/p${i}.jpg`;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (loaded >= 14) update(dt);
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
