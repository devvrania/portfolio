import { canvasTexture } from '../helpers.js';

/** What he types, one file after another. Each key he presses adds one character. */
const FILES = [
  {
    name: 'kairo.ts',
    code: [
      'const kairo = {',
      "  bornTo: 'conquer',",
      "  wiredTo: 'create',",
      "  fuel: ['coffee', 'lo-fi', 'midnight'],",
      '};',
      '',
      'while (night.isYoung()) {',
      '  coffee.sip();',
      '  const idea = rania.imagine();',
      '  kairo.build(idea);',
      "  git.commit('✨ ' + idea.name);",
      '}',
    ],
  },
  {
    name: 'rania.ts',
    code: [
      'export async function build(idea: Idea) {',
      '  const plan = await think(idea);',
      '  const code = write(plan, { clean: true });',
      '',
      '  await test(code);        // always',
      '  await review(code);      // twice',
      '  return ship(code);       // with care',
      '}',
      '',
      "build({ name: 'something beautiful' });",
    ],
  },
  {
    name: 'haiku.ts',
    code: [
      'export const haiku = [',
      "  'cherry petals fall',",
      "  'the cursor blinks in the dark',",
      "  'one more commit, then sleep',",
      '];',
      '',
      '// TODO: sleep',
      '// TODO(later): actually sleep',
    ],
  },
];

const KEYWORDS = /^(const|let|export|async|await|function|return|while|import|from|new)$/;
const COLORS = { text: '#e9e1e6', keyword: '#c9a4ff', string: '#ff8fa8', comment: '#7d6f78', call: '#8fc7ff', number: '#ffc58f' };

/** Split one line into colored pieces: comments, strings, keywords, function calls, plain text. */
function highlight(line) {
  const out = [];
  const re = /(\/\/.*$)|('[^']*'?)|([A-Za-z_$][\w$]*)|(\d+)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(line))) {
    const [tok, comment, str, word, num] = m;
    let color = COLORS.text;
    if (comment) color = COLORS.comment;
    else if (str) color = COLORS.string;
    else if (num) color = COLORS.number;
    else if (word) color = KEYWORDS.test(word) ? COLORS.keyword : line[m.index + tok.length] === '(' ? COLORS.call : COLORS.text;
    out.push([tok, color]);
  }
  return out;
}

const TREE = [
  ['▾ kairo', 0], ['▾ src', 1], ['▸ avatar', 2], ['▸ behavior', 2], ['▸ world', 2], ['main.js', 2],
  ['kairo.json', 1], ['README.md', 1], ['▾ late-night', 0],
];
const PAUSE = 40;   // keypresses spent admiring a finished file before the next one

/** The IDE on his monitor: file tree, tabs, and the file he's typing. */
export function createCodeScreen() {
  const { ctx, texture } = canvasTexture(1024, 576);
  const SIDE = 200, TOP = 64, LINE = 32;
  let fileIdx = 0, typed = 0;
  const lengthOf = f => f.code.join('\n').length;

  function draw() {
    const file = FILES[fileIdx];
    ctx.fillStyle = '#100c12'; ctx.fillRect(0, 0, 1024, 576);

    // title bar with window buttons
    ctx.fillStyle = '#18121a'; ctx.fillRect(0, 0, 1024, 30);
    ['#ff5a6e', '#f5c76a', '#6fcf97'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(18 + i * 20, 15, 6, 0, 7); ctx.fill(); });

    // file tree, with the open file highlighted
    ctx.fillStyle = '#140f16'; ctx.fillRect(0, 30, SIDE, 546);
    ctx.font = '15px Menlo, ui-monospace, monospace';
    ctx.fillStyle = '#7d6f78'; ctx.fillText('EXPLORER', 16, 56);
    const rows = [...TREE, ...FILES.map(f => [f.name, 1])];
    rows.forEach(([name, depth], i) => {
      const open = name === file.name, y = 86 + i * 24;
      if (open) { ctx.fillStyle = 'rgba(255,59,92,.16)'; ctx.fillRect(0, y - 17, SIDE, 24); }
      ctx.fillStyle = open ? '#ffb3c2' : /^[▾▸]/.test(name) ? '#a99aa4' : '#857680';
      ctx.fillText(name, 16 + depth * 16, y);
    });

    // tabs
    ctx.fillStyle = '#16111a'; ctx.fillRect(SIDE, 30, 824, 34);
    FILES.forEach((f, i) => {
      const x = SIDE + i * 150, open = i === fileIdx;
      if (open) { ctx.fillStyle = '#100c12'; ctx.fillRect(x, 30, 150, 34); ctx.fillStyle = '#ff3b5c'; ctx.fillRect(x, 30, 150, 2); }
      ctx.fillStyle = open ? '#e9e1e6' : '#7d6f78'; ctx.fillText(f.name, x + 18, 53);
    });

    // code, typed so far
    ctx.font = '24px Menlo, ui-monospace, monospace';
    let left = typed, y = TOP + 32, cursorX = SIDE + 62, cursorY = y, lines = 0;
    file.code.forEach((line, i) => {
      if (left < 0) return;
      ctx.fillStyle = '#4e4249'; ctx.fillText(String(i + 1).padStart(2, ' '), SIDE + 14, y);
      let x = SIDE + 62, budget = Math.max(0, left);
      for (const [tok, color] of highlight(line)) {
        if (budget <= 0) break;
        const shown = tok.slice(0, budget);
        ctx.fillStyle = color; ctx.fillText(shown, x, y);
        x += ctx.measureText(shown).width; budget -= shown.length;
      }
      cursorX = x; cursorY = y; lines = i + 1;
      left -= line.length + 1; y += LINE;
    });
    if (Math.floor(performance.now() / 500) % 2) { ctx.fillStyle = '#ff3b5c'; ctx.fillRect(cursorX + 2, cursorY - 17, 10, 22); }

    // status bar
    ctx.fillStyle = '#1c1219'; ctx.fillRect(0, 552, 1024, 24);
    ctx.font = '14px Menlo, ui-monospace, monospace';
    ctx.fillStyle = '#ff6b8a'; ctx.fillText('⎇ main', 14, 569);
    ctx.fillStyle = '#857680'; ctx.fillText(`TypeScript   UTF-8   Ln ${lines}`, 800, 569);
    texture.needsUpdate = true;
  }

  return {
    texture,
    typeChar() {
      typed++;
      if (typed > lengthOf(FILES[fileIdx]) + PAUSE) { fileIdx = (fileIdx + 1) % FILES.length; typed = 0; }
    },
    draw,
  };
}
