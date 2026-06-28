/* ═══════════════════════════════════════════════
   maze_solver.js — Visual Maze Solver Web Demo
   ═══════════════════════════════════════════════
   Features:
   · Recursive-backtracking maze generator
   · BFS solver with step animation
   · A* solver with step animation
   · Draw / erase walls by clicking/dragging
   · Place start / end markers
   · Side-by-side algorithm comparison
   ═══════════════════════════════════════════════ */

'use strict';

// ── Canvas setup ──────────────────────────────────────────────────────────────
const canvas   = document.getElementById('mazeCanvas');
const ctx      = canvas.getContext('2d');

const COLS     = 35;
const ROWS     = 35;
const CELL_W   = Math.floor(canvas.width  / COLS);
const CELL_H   = Math.floor(canvas.height / ROWS);

// ── Colour palette ────────────────────────────────────────────────────────────
const COLOR = {
  bg:       '#060b14',
  wall:     '#1a2744',
  open:     '#0d1526',
  visited:  '#1e3a5f',
  frontier: '#0891b2',
  pathBFS:  '#eab308',
  pathAstar:'#06b6d4',
  start:    '#22c55e',
  end:      '#ef4444',
  gridLine: '#0f172a',
};

// ── State ─────────────────────────────────────────────────────────────────────
let grid       = [];      // 0 = open, 1 = wall
let startCell  = { r: 1,         c: 1       };
let endCell    = { r: ROWS - 2,  c: COLS - 2 };
let drawMode   = 'wall';   // 'wall' | 'erase' | 'start' | 'end'
let isDrawing  = false;
let animHandle = null;     // rAF handle
let running    = false;

// Stats for comparison panel
let stats = {
  bfs:   { explored: 0, pathLen: 0, ms: 0 },
  astar: { explored: 0, pathLen: 0, ms: 0 },
};

// ── Init ──────────────────────────────────────────────────────────────────────
function initGrid() {
  grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  drawAll();
}

function resetStats() {
  stats = { bfs: { explored: 0, pathLen: 0, ms: 0 }, astar: { explored: 0, pathLen: 0, ms: 0 } };
  updateStatsPanel();
}

// ── Drawing helpers ───────────────────────────────────────────────────────────
function drawCell(r, c, color) {
  const x = c * CELL_W;
  const y = r * CELL_H;
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, CELL_W - 2, CELL_H - 2);
}

function drawMarker(r, c, color, symbol) {
  const cx = c * CELL_W + CELL_W / 2;
  const cy = r * CELL_H + CELL_H / 2;
  const radius = Math.min(CELL_W, CELL_H) / 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(8, radius)}px Inter`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, cx, cy);
}

function drawAll(extra) {
  // Background
  ctx.fillStyle = COLOR.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === 1) {
        drawCell(r, c, COLOR.wall);
      } else {
        drawCell(r, c, COLOR.open);
      }
    }
  }

  // Extra overlay (visited / path cells)
  if (extra) {
    extra.visited && extra.visited.forEach(([r, c]) => drawCell(r, c, COLOR.visited));
    extra.frontier && extra.frontier.forEach(([r, c]) => drawCell(r, c, COLOR.frontier));
    extra.path && extra.path.forEach(([r, c]) => drawCell(r, c,
      extra.pathColor || COLOR.pathAstar));
  }

  // Markers always on top
  drawMarker(startCell.r, startCell.c, COLOR.start, 'S');
  drawMarker(endCell.r,   endCell.c,   COLOR.end,   'E');
}

// ── Mouse / touch interaction ─────────────────────────────────────────────────
function cellFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top)  * scaleY;
  return { r: Math.floor(y / CELL_H), c: Math.floor(x / CELL_W) };
}

function applyTool(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  if (drawMode === 'wall') {
    if ((r === startCell.r && c === startCell.c) ||
        (r === endCell.r   && c === endCell.c))  return;
    grid[r][c] = 1;
    drawCell(r, c, COLOR.wall);
  } else if (drawMode === 'erase') {
    grid[r][c] = 0;
    drawCell(r, c, COLOR.open);
    drawMarker(startCell.r, startCell.c, COLOR.start, 'S');
    drawMarker(endCell.r,   endCell.c,   COLOR.end,   'E');
  } else if (drawMode === 'start') {
    grid[startCell.r][startCell.c] = 0;
    startCell = { r, c };
    grid[r][c] = 0;
    drawAll();
  } else if (drawMode === 'end') {
    grid[endCell.r][endCell.c] = 0;
    endCell = { r, c };
    grid[r][c] = 0;
    drawAll();
  }
}

canvas.addEventListener('mousedown', e => {
  if (running) return;
  isDrawing = true;
  applyTool(...Object.values(cellFromEvent(e)));
});
canvas.addEventListener('mousemove', e => {
  if (!isDrawing || running) return;
  const { r, c } = cellFromEvent(e);
  if (drawMode === 'wall' || drawMode === 'erase') applyTool(r, c);
});
canvas.addEventListener('mouseup',   () => isDrawing = false);
canvas.addEventListener('mouseleave',() => isDrawing = false);

// ── Tool buttons ──────────────────────────────────────────────────────────────
document.querySelectorAll('.btn-tool[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => {
    drawMode = btn.dataset.tool;
    document.querySelectorAll('.btn-tool[data-tool]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Maze generator (recursive backtracking) ───────────────────────────────────
function generateMaze() {
  stopAnimation();
  
  // Initialize grid if not already done
  if (grid.length === 0) {
    grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  }

  // Fill all with walls
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      grid[r][c] = 1;

  // Carve passages via DFS
  function carve(r, c) {
    const dirs = shuffle([[-2,0],[2,0],[0,-2],[0,2]]);
    grid[r][c] = 0;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < ROWS-1 && nc > 0 && nc < COLS-1 && grid[nr][nc] === 1) {
        grid[r + dr/2][c + dc/2] = 0; // knock down wall
        carve(nr, nc);
      }
    }
  }

  const startR = (ROWS % 2 === 0) ? 1 : 1;
  const startC = 1;
  carve(startR, startC);

  // Ensure border is all wall
  for (let r = 0; r < ROWS; r++) { grid[r][0] = 1; grid[r][COLS-1] = 1; }
  for (let c = 0; c < COLS; c++) { grid[0][c] = 1; grid[ROWS-1][c]  = 1; }

  // Place markers in open cells near corners
  startCell = findOpenNear(1, 1);
  endCell   = findOpenNear(ROWS-2, COLS-2);

  resetStats();
  drawAll();
  log('🎲 Generated new maze via recursive backtracking', 'accent');
}

function findOpenNear(r, c) {
  for (let dr = 0; dr <= 3; dr++)
    for (let dc = 0; dc <= 3; dc++)
      if (r+dr < ROWS && c+dc < COLS && grid[r+dr][c+dc] === 0)
        return { r: r+dr, c: c+dc };
  return { r, c };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── BFS ───────────────────────────────────────────────────────────────────────
function bfs(gridSnap, start, end) {
  const rows = ROWS, cols = COLS;
  const parent = new Map();
  const key    = (r, c) => r * cols + c;
  const sk     = key(start.r, start.c);
  parent.set(sk, -1);
  const queue  = [{ r: start.r, c: start.c }];
  const visitedOrder = [];
  const dirs   = [[-1,0],[1,0],[0,-1],[0,1]];

  while (queue.length) {
    const { r, c } = queue.shift();
    visitedOrder.push([r, c]);
    if (r === end.r && c === end.c) {
      return { path: reconstructPath(parent, end, cols), visited: visitedOrder };
    }
    for (const [dr, dc] of dirs) {
      const nr = r+dr, nc = c+dc;
      const nk = key(nr, nc);
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          gridSnap[nr][nc] === 0 && !parent.has(nk)) {
        parent.set(nk, key(r, c));
        queue.push({ r: nr, c: nc });
      }
    }
  }
  return { path: [], visited: visitedOrder };
}

// ── A* ────────────────────────────────────────────────────────────────────────
function astar(gridSnap, start, end) {
  const rows = ROWS, cols = COLS;
  const h    = (r, c) => Math.abs(r - end.r) + Math.abs(c - end.c);
  const key  = (r, c) => r * cols + c;
  const sk   = key(start.r, start.c);

  const gScore  = new Map([[sk, 0]]);
  const parent  = new Map([[sk, -1]]);
  const closed  = new Set();
  const visitedOrder = [];

  // Simple min-heap via sorted array (fine for this grid size)
  let open = [{ r: start.r, c: start.c, f: h(start.r, start.c) }];
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const { r, c } = open.shift();
    const ck = key(r, c);
    if (closed.has(ck)) continue;
    closed.add(ck);
    visitedOrder.push([r, c]);

    if (r === end.r && c === end.c) {
      return { path: reconstructPath(parent, end, cols), visited: visitedOrder };
    }
    for (const [dr, dc] of dirs) {
      const nr = r+dr, nc = c+dc;
      const nk = key(nr, nc);
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (gridSnap[nr][nc] === 1 || closed.has(nk)) continue;
      const tentG = (gScore.get(ck) || 0) + 1;
      if (tentG < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, tentG);
        parent.set(nk, ck);
        open.push({ r: nr, c: nc, f: tentG + h(nr, nc) });
      }
    }
  }
  return { path: [], visited: visitedOrder };
}

function reconstructPath(parent, end, cols) {
  const path = [];
  let k = end.r * cols + end.c;
  while (k !== -1 && parent.has(k)) {
    path.unshift([Math.floor(k / cols), k % cols]);
    const pk = parent.get(k);
    if (pk === -1) break;
    k = pk;
  }
  return path;
}

// ── Animation engine ──────────────────────────────────────────────────────────
function stopAnimation() {
  if (animHandle) { cancelAnimationFrame(animHandle); animHandle = null; }
  running = false;
  document.getElementById('btnRun').disabled  = false;
  document.getElementById('btnStop').disabled = true;
}

function getSpeed() {
  return parseInt(document.getElementById('speedSlider').value, 10) || 10;
}

function animateSolver(mode) {
  stopAnimation();
  resetStats();
  clearLog();
  running = true;
  document.getElementById('btnRun').disabled  = true;
  document.getElementById('btnStop').disabled = false;

  const gridSnap = grid.map(row => [...row]);   // snapshot before animation
  const algo     = mode || document.getElementById('algoSelect').value;

  if (algo === 'both') {
    animateBoth(gridSnap);
    return;
  }

  const t0    = performance.now();
  const { path, visited } = (algo === 'bfs')
    ? bfs(gridSnap, startCell, endCell)
    : astar(gridSnap, startCell, endCell);
  const ms    = performance.now() - t0;

  const pathColor = (algo === 'bfs') ? COLOR.pathBFS : COLOR.pathAstar;
  const algoLabel = (algo === 'bfs') ? 'BFS' : 'A*';

  log(`▶ Running ${algoLabel}…`, 'accent');
  log(`  Computed ${visited.length} nodes to explore`, '');

  let vi = 0;  // visited index
  let pi = 0;  // path index
  let phase = 'explore';
  let skip  = 0;

  const visitedSet = new Set();

  function step() {
    const speed   = getSpeed();
    const batch   = Math.max(1, Math.ceil(speed / 2));

    if (phase === 'explore') {
      for (let b = 0; b < batch && vi < visited.length; b++, vi++) {
        const [r, c] = visited[vi];
        visitedSet.add(`${r},${c}`);
        drawCell(r, c, vi < visited.length - 1 ? COLOR.visited : COLOR.frontier);
      }
      drawMarker(startCell.r, startCell.c, COLOR.start, 'S');
      drawMarker(endCell.r,   endCell.c,   COLOR.end,   'E');
      updateProgress(vi / visited.length * (path.length ? 0.7 : 1));

      if (vi >= visited.length) {
        phase = 'path';
        if (!path.length) {
          log(`✗ No path found! ${visited.length} cells explored.`, 'danger');
          stopAnimation();
          return;
        }
        log(`✓ Path found! Now drawing solution…`, 'success');
      }
    } else {
      for (let b = 0; b < Math.max(1, batch/2) && pi < path.length; b++, pi++) {
        const [r, c] = path[pi];
        drawCell(r, c, pathColor);
      }
      drawMarker(startCell.r, startCell.c, COLOR.start, 'S');
      drawMarker(endCell.r,   endCell.c,   COLOR.end,   'E');
      updateProgress(0.7 + (pi / path.length * 0.3));

      if (pi >= path.length) {
        // Done
        stats[algo] = { explored: visited.length, pathLen: path.length, ms: ms.toFixed(2) };
        updateStatsPanel();
        log(`✔ Done! Explored: ${visited.length} | Path: ${path.length} steps | Time: ${ms.toFixed(2)}ms`, 'success');
        stopAnimation();
        updateProgress(1);
        return;
      }
    }
    animHandle = requestAnimationFrame(step);
  }

  animHandle = requestAnimationFrame(step);
}

function animateBoth(gridSnap) {
  const t0b = performance.now();
  const bfsResult   = bfs(gridSnap, startCell, endCell);
  const bfsMs       = performance.now() - t0b;

  const t0a = performance.now();
  const astarResult = astar(gridSnap, startCell, endCell);
  const astarMs     = performance.now() - t0a;

  stats.bfs   = { explored: bfsResult.visited.length, pathLen: bfsResult.path.length, ms: bfsMs.toFixed(2) };
  stats.astar = { explored: astarResult.visited.length, pathLen: astarResult.path.length, ms: astarMs.toFixed(2) };

  log('▶ BFS vs A* comparison', 'accent');
  log(`  BFS  — explored ${bfsResult.visited.length} cells in ${bfsMs.toFixed(2)}ms`, 'warn');
  log(`  A*   — explored ${astarResult.visited.length} cells in ${astarMs.toFixed(2)}ms`, 'accent');

  // Animate BFS visited in yellow, A* path in cyan
  let vi = 0;
  const maxV = Math.max(bfsResult.visited.length, astarResult.visited.length);

  function step() {
    const speed = getSpeed();
    const batch = Math.max(1, Math.ceil(speed / 2));

    for (let b = 0; b < batch && vi < maxV; b++, vi++) {
      if (vi < bfsResult.visited.length) {
        const [r, c] = bfsResult.visited[vi];
        drawCell(r, c, '#1e3a5f');
      }
      if (vi < astarResult.visited.length) {
        const [r, c] = astarResult.visited[vi];
        drawCell(r, c, '#0c2a3a');
      }
    }
    updateProgress(vi / maxV * 0.6);
    drawMarker(startCell.r, startCell.c, COLOR.start, 'S');
    drawMarker(endCell.r,   endCell.c,   COLOR.end,   'E');

    if (vi >= maxV) {
      // Draw both paths
      bfsResult.path.forEach(([r, c]) => drawCell(r, c, COLOR.pathBFS));
      astarResult.path.forEach(([r, c]) => drawCell(r, c, COLOR.pathAstar));
      drawMarker(startCell.r, startCell.c, COLOR.start, 'S');
      drawMarker(endCell.r,   endCell.c,   COLOR.end,   'E');
      updateStatsPanel();
      updateProgress(1);
      log(`✔ BFS path: ${bfsResult.path.length} steps | A* path: ${astarResult.path.length} steps`, 'success');
      stopAnimation();
      return;
    }
    animHandle = requestAnimationFrame(step);
  }
  animHandle = requestAnimationFrame(step);
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function updateProgress(ratio) {
  document.getElementById('progressFill').style.width = (ratio * 100).toFixed(1) + '%';
}

function updateStatsPanel() {
  document.getElementById('statExplored').textContent = stats.astar.explored || stats.bfs.explored || '—';
  document.getElementById('statPath').textContent     = stats.astar.pathLen  || stats.bfs.pathLen  || '—';
  document.getElementById('statTime').textContent     = stats.astar.ms       || stats.bfs.ms       || '—';
  document.getElementById('statNodes').textContent    = `${ROWS}×${COLS}`;

  // Compare panel
  document.getElementById('bfsExplored').textContent = stats.bfs.explored || '—';
  document.getElementById('bfsPath').textContent     = stats.bfs.pathLen  || '—';
  document.getElementById('bfsTime').textContent     = (stats.bfs.ms     ? stats.bfs.ms     + 'ms' : '—');
  document.getElementById('astarExplored').textContent = stats.astar.explored || '—';
  document.getElementById('astarPath').textContent     = stats.astar.pathLen  || '—';
  document.getElementById('astarTime').textContent     = (stats.astar.ms ? stats.astar.ms + 'ms' : '—');
}

function log(msg, cls = '') {
  const el  = document.getElementById('logPanel');
  const line = document.createElement('div');
  line.className = cls ? `log-line-${cls}` : '';
  line.textContent = msg;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

function clearLog() {
  document.getElementById('logPanel').innerHTML = '';
}

// ── Event wiring ──────────────────────────────────────────────────────────────
document.getElementById('btnRun').addEventListener('click',  () => animateSolver());
document.getElementById('btnStop').addEventListener('click', stopAnimation);
document.getElementById('btnClear').addEventListener('click', () => {
  stopAnimation(); initGrid(); resetStats(); clearLog();
  log('Canvas cleared.', '');
  updateProgress(0);
});
document.getElementById('btnGenerate').addEventListener('click', () => {
  stopAnimation(); generateMaze();
  updateProgress(0);
});

document.getElementById('speedSlider').addEventListener('input', function () {
  document.getElementById('speedVal').textContent = this.value + 'x';
});

// ── Boot ──────────────────────────────────────────────────────────────────────
generateMaze();
log('🚀 Maze Solver ready! Generate a maze or draw your own, then click Run.', 'accent');
updateStatsPanel();
