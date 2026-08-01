document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Switcher Setup
  const themeSelect = document.getElementById('sel-cyber-theme');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      document.body.className = e.target.value;
      showToast(`Switched theme to ${e.target.options[e.target.selectedIndex].text}`, 'Theme Updated');
    });
  }

  // 2. Mobile Sidebar Navigation Toggle
  const toggleBtn = document.getElementById('btn-toggle-sidebar');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  function toggleSidebar() {
    sidebar.classList.toggle('active');
    backdrop.classList.toggle('active');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
  if (backdrop) backdrop.addEventListener('click', toggleSidebar);

  // Nav link switching
  const navLinks = document.querySelectorAll('.nav-link');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('data-tab');
      navLinks.forEach(l => l.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      const pane = document.getElementById(`tab-${target}`);
      if (pane) pane.classList.add('active');

      if (sidebar.classList.contains('active')) toggleSidebar();
    });
  });

  // 3. Initialize Particle Canvas Background
  initBgCanvas();

  // 4. Initialize Interactive Network Topology Canvas
  initTopologyCanvas();

  // 5. Initialize Chart.js Graphs
  initCharts();

  // 6. Initialize Terminal CLI
  initTerminal();

  // 7. Start Real-Time Telemetry Data Streamer
  startRealTimeStream();

  // Stream controls
  document.getElementById('btn-stream-toggle').addEventListener('click', toggleStream);
  document.getElementById('sel-stream-interval').addEventListener('change', changeStreamInterval);
  document.getElementById('btn-mitigate-all').addEventListener('click', mitigateAllThreats);
  document.getElementById('btn-pulse-topology').addEventListener('click', triggerTopologyPulse);
});

// Toast Shelf Helper
function showToast(msg, title = 'System Alert') {
  const shelf = document.getElementById('toast-shelf');
  if (!shelf) return;

  const box = document.createElement('div');
  box.className = 'toast-box';
  box.innerHTML = `
    <span style="font-size: 1.25rem;">⚡</span>
    <div>
      <div style="font-weight: 700; margin-bottom: 0.15rem;">${title}</div>
      <div style="color: #cbd5e1; font-size: 0.8rem;">${msg}</div>
    </div>
  `;

  shelf.appendChild(box);
  setTimeout(() => {
    box.style.opacity = '0';
    box.style.transform = 'translateX(50px)';
    box.style.transition = 'all 0.3s ease';
    setTimeout(() => box.remove(), 300);
  }, 4000);
}

/* --------------------------------------------------------------------
   1. Particle Mesh Background Engine
   -------------------------------------------------------------------- */
function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    requestAnimationFrame(loop);
  }
  loop();
}

/* --------------------------------------------------------------------
   2. Interactive Network Topology Engine
   -------------------------------------------------------------------- */
let topologyPackets = [];

function initTopologyCanvas() {
  const canvas = document.getElementById('topology-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const nodes = [
    { name: 'AWS US-East', x: 0.2, y: 0.3, color: '#ff9900' },
    { name: 'Azure East-US', x: 0.4, y: 0.2, color: '#0078d4' },
    { name: 'GCP US-Central', x: 0.3, y: 0.7, color: '#ea4335' },
    { name: 'AWS EU-Central', x: 0.7, y: 0.25, color: '#ff9900' },
    { name: 'Azure West-EU', x: 0.8, y: 0.6, color: '#0078d4' },
    { name: 'GCP Asia-East', x: 0.6, y: 0.75, color: '#ea4335' }
  ];

  // Connections
  const links = [
    [0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [1, 4]
  ];

  // Generate continuous moving packets
  function addPacket() {
    const link = links[Math.floor(Math.random() * links.length)];
    topologyPackets.push({
      from: nodes[link[0]],
      to: nodes[link[1]],
      progress: 0,
      speed: 0.008 + Math.random() * 0.012,
      color: nodes[link[0]].color
    });
  }

  setInterval(addPacket, 400);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Links
    ctx.lineWidth = 1.5;
    links.forEach(([i, j]) => {
      const n1 = nodes[i];
      const n2 = nodes[j];
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.beginPath();
      ctx.moveTo(n1.x * canvas.width, n1.y * canvas.height);
      ctx.lineTo(n2.x * canvas.width, n2.y * canvas.height);
      ctx.stroke();
    });

    // Draw Moving Packets
    topologyPackets.forEach((p, index) => {
      p.progress += p.speed;
      if (p.progress >= 1) {
        topologyPackets.splice(index, 1);
        return;
      }
      const currentX = p.from.x * canvas.width + (p.to.x * canvas.width - p.from.x * canvas.width) * p.progress;
      const currentY = p.from.y * canvas.height + (p.to.y * canvas.height - p.from.y * canvas.height) * p.progress;

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Nodes
    nodes.forEach(n => {
      const nx = n.x * canvas.width;
      const ny = n.y * canvas.height;

      // Outer glow pulse
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fill();

      // Text label
      ctx.font = '700 11px Plus Jakarta Sans';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(n.name, nx + 12, ny + 4);
    });

    requestAnimationFrame(render);
  }
  render();
}

function triggerTopologyPulse() {
  for (let i = 0; i < 15; i++) {
    const link = [[0,1],[1,3],[3,4],[2,5]][i % 4];
    topologyPackets.push({
      from: { x: 0.2, y: 0.3, color: '#6366f1' },
      to: { x: 0.8, y: 0.6, color: '#38bdf8' },
      progress: 0,
      speed: 0.02 + Math.random() * 0.02,
      color: '#38bdf8'
    });
  }
  showToast('High-speed packet synthesis pulse dispatched across matrix mesh.', 'Topology Pulse Triggered');
}

/* --------------------------------------------------------------------
   3. Chart.js Telemetry Setup
   -------------------------------------------------------------------- */
let chartRealtimeThroughput = null;
let chartThreatVectors = null;
let chartNodeLoads = null;

function initCharts() {
  // Line Graph: Network Throughput & Latency
  const ctxLine = document.getElementById('chart-realtime-throughput');
  if (ctxLine) {
    chartRealtimeThroughput = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Throughput (Gbps)',
            data: [],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1'
          },
          {
            label: 'Ping Latency (ms)',
            data: [],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#06b6d4'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', weight: '700' } } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.04)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.04)' } }
        }
      }
    });
  }

  // Radar/Bar Chart: Cyber Threat Vectors
  const ctxThreats = document.getElementById('chart-threat-vectors');
  if (ctxThreats) {
    chartThreatVectors = new Chart(ctxThreats, {
      type: 'doughnut',
      data: {
        labels: ['DDoS SYN Flood', 'SQL Injection Probe', 'Credential Stuffing', 'Port Scanning'],
        datasets: [{
          data: [4, 2, 1, 3],
          backgroundColor: ['#ef4444', '#f59e0b', '#06b6d4', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } } }
        },
        cutout: '70%'
      }
    });
  }

  // Bar Chart: Node Utilization Load
  const ctxNodes = document.getElementById('chart-node-loads');
  if (ctxNodes) {
    chartNodeLoads = new Chart(ctxNodes, {
      type: 'bar',
      data: {
        labels: ['AWS US-East', 'AWS EU-Central', 'Azure East-US', 'Azure West-EU', 'GCP US-Central', 'GCP Asia-East'],
        datasets: [{
          label: 'CPU Load (%)',
          data: [45, 52, 38, 78, 34, 41],
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderColor: '#a855f7',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.04)' } }
        }
      }
    });
  }
}

/* --------------------------------------------------------------------
   4. Real-Time Data Streamer Engine
   -------------------------------------------------------------------- */
let streamIntervalId = null;
let isStreaming = true;
let currentIntervalMs = 2000;

function startRealTimeStream() {
  if (streamIntervalId) clearInterval(streamIntervalId);
  fetchRealTimeData();
  streamIntervalId = setInterval(fetchRealTimeData, currentIntervalMs);
}

function toggleStream() {
  const icon = document.getElementById('stream-icon');
  const text = document.getElementById('stream-text');
  const ticker = document.getElementById('ticker-status-text');

  if (isStreaming) {
    clearInterval(streamIntervalId);
    isStreaming = false;
    icon.innerText = '▶';
    text.innerText = 'Resume Stream';
    ticker.innerText = 'STREAM PAUSED';
    ticker.parentElement.style.color = 'var(--warning-color)';
    showToast('Real-time data stream paused.', 'Stream Paused');
  } else {
    isStreaming = true;
    icon.innerText = '⏸';
    text.innerText = 'Pause Stream';
    ticker.innerText = `LIVE STREAMING (${(currentIntervalMs / 1000).toFixed(1)}s)`;
    ticker.parentElement.style.color = 'var(--success-color)';
    startRealTimeStream();
    showToast('Real-time telemetry stream resumed.', 'Stream Live');
  }
}

function changeStreamInterval(e) {
  currentIntervalMs = parseInt(e.target.value);
  if (isStreaming) {
    startRealTimeStream();
    document.getElementById('ticker-status-text').innerText = `LIVE STREAMING (${(currentIntervalMs / 1000).toFixed(1)}s)`;
    showToast(`Streaming polling interval updated to ${(currentIntervalMs / 1000).toFixed(1)}s.`, 'Rate Updated');
  }
}

async function fetchRealTimeData() {
  try {
    const res = await fetch('/api/realtime/stream');
    const data = await res.json();

    // Update Header Metric Cards
    document.getElementById('val-throughput').innerText = `${data.metrics.throughputGbps} Gbps`;
    document.getElementById('val-latency').innerText = `${data.metrics.avgLatencyMs} ms`;
    document.getElementById('val-threats').innerText = data.metrics.activeThreatsCount;
    document.getElementById('val-cpu-ram').innerText = `${data.metrics.cpuLoadAvg}% / ${data.metrics.memoryLoadAvg}%`;

    // Update Line Chart (Throughput & Latency)
    if (chartRealtimeThroughput && data.history) {
      chartRealtimeThroughput.data.labels = data.history.map(h => h.time);
      chartRealtimeThroughput.data.datasets[0].data = data.history.map(h => h.throughputGbps);
      chartRealtimeThroughput.data.datasets[1].data = data.history.map(h => h.avgLatencyMs);
      chartRealtimeThroughput.update('quiet');
    }

    // Update Node Loads Bar Chart
    if (chartNodeLoads && data.nodes) {
      chartNodeLoads.data.labels = data.nodes.map(n => n.name);
      chartNodeLoads.data.datasets[0].data = data.nodes.map(n => n.load);
      chartNodeLoads.update('quiet');
    }

    // Update Security Stream
    renderThreatStream(data.threats);

    // Update Node Inventory Table
    renderNodeTable(data.nodes);

  } catch (err) {
    console.error('Error fetching stream data:', err);
  }
}

function renderThreatStream(threats) {
  const container = document.getElementById('incident-stream-list');
  if (!container) return;

  container.innerHTML = threats.map(t => `
    <div class="incident-item">
      <div>
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
          <span class="badge-cyber badge-${t.severity.toLowerCase()}">${t.severity}</span>
          <strong style="color: #fff;">${t.type}</strong>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          Source: <code>${t.sourceIP}</code> &rarr; Target: <code>${t.target}</code> (${t.timestamp})
        </div>
      </div>
      <div>
        ${t.status === 'ACTIVE'
          ? `<button class="action-btn" onclick="mitigateSingleThreat('${t.id}')">🛡 Mitigate</button>`
          : `<span class="badge-cyber badge-healthy">✓ NEUTRALIZED</span>`
        }
      </div>
    </div>
  `).join('');
}

function renderNodeTable(nodes) {
  const tbody = document.getElementById('tbl-nodes-body');
  if (!tbody) return;

  tbody.innerHTML = nodes.map(n => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
      <td style="padding: 0.8rem;"><code>${n.id}</code></td>
      <td style="padding: 0.8rem; font-weight: 700; color: #fff;">${n.name}</td>
      <td style="padding: 0.8rem;">${n.region}</td>
      <td style="padding: 0.8rem;"><span class="badge-cyber badge-${n.status === 'HEALTHY' ? 'healthy' : 'high'}">${n.status}</span></td>
      <td style="padding: 0.8rem; font-weight: 700; color: var(--accent-primary);">${n.load}%</td>
      <td style="padding: 0.8rem;">${n.latency} ms</td>
      <td style="padding: 0.8rem;">
        <button class="ctrl-btn" onclick="rebalanceNode('${n.id}')">⚡ Scale</button>
      </td>
    </tr>
  `).join('');
}

window.mitigateSingleThreat = async function(threatId) {
  try {
    const res = await fetch('/api/action/mitigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threatId })
    });
    const data = await res.json();
    showToast(data.message, 'Threat Neutralized');
    fetchRealTimeData();
  } catch (err) {
    showToast('Failed to mitigate threat.', 'Error');
  }
};

window.rebalanceNode = async function(nodeId) {
  try {
    const res = await fetch('/api/action/scale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, action: 'scale-up' })
    });
    const data = await res.json();
    showToast(data.message, 'Node Rebalanced');
    fetchRealTimeData();
  } catch (err) {
    showToast('Failed to scale node.', 'Error');
  }
};

async function mitigateAllThreats() {
  try {
    const res = await fetch('/api/action/mitigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threatId: 'ALL' })
    });
    const data = await res.json();
    showToast(data.message, 'Shield Sentinel Triggered');
    fetchRealTimeData();
  } catch (err) {
    showToast('Failed to mitigate threats.', 'Error');
  }
}

/* --------------------------------------------------------------------
   5. Interactive Cyber Terminal CLI Engine
   -------------------------------------------------------------------- */
function initTerminal() {
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');

  if (!form || !input || !output) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cmd = input.value.trim();
    if (!cmd) return;

    output.innerText += `\naether@pulsematrix:~$ ${cmd}`;
    input.value = '';

    if (cmd.toLowerCase() === 'clear') {
      output.innerText = 'Welcome to AetherCloud Real-Time Terminal.\nType \'help\' to view available system commands.\n';
      return;
    }

    try {
      const res = await fetch('/api/action/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd })
      });
      const data = await res.json();
      output.innerText += `\n${data.output}\n`;
      output.scrollTop = output.scrollHeight;
    } catch (err) {
      output.innerText += `\n[ERROR]: Failed to connect to terminal backend engine.\n`;
    }
  });
}
