const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files (handles both root and src/ directory structures)
app.use(express.static(path.join(__dirname, 'src/frontend')));
app.use(express.static(path.join(__dirname, 'frontend')));

// Helper for Real Host Metrics
function getRealSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsedPercent = +(((totalMem - freeMem) / totalMem) * 100).toFixed(1);

  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  const cpuLoadPercent = +((1 - totalIdle / totalTick) * 100 + (Math.random() * 5)).toFixed(1);

  return {
    platform: os.platform(),
    arch: os.arch(),
    cpusCount: cpus.length,
    uptimeHours: +(os.uptime() / 3600).toFixed(2),
    cpuLoadPercent: Math.min(99, Math.max(10, cpuLoadPercent)),
    memUsedPercent
  };
}

// Global In-Memory Real-Time State
let activeNodes = [
  { id: 'node-aws-us-east', name: 'AWS US-East Mesh Node', region: 'us-east-1', status: 'HEALTHY', load: 45, latency: 18, packets: 1420 },
  { id: 'node-aws-eu-central', name: 'AWS EU-Central Cluster', region: 'eu-central-1', status: 'HEALTHY', load: 52, latency: 42, packets: 980 },
  { id: 'node-azure-eastus', name: 'Azure East-US Sovereign Gateway', region: 'eastus', status: 'HEALTHY', load: 38, latency: 24, packets: 1150 },
  { id: 'node-azure-westeurope', name: 'Azure West-Europe Core', region: 'westeurope', status: 'WARNING', load: 78, latency: 68, packets: 2100 },
  { id: 'node-gcp-uscentral', name: 'GCP US-Central GKE Mesh', region: 'us-central1', status: 'HEALTHY', load: 34, latency: 15, packets: 1310 },
  { id: 'node-gcp-asiaeast', name: 'GCP Asia-East Quantum Node', region: 'asia-east1', status: 'HEALTHY', load: 41, latency: 85, packets: 840 }
];

let liveThreats = [
  { id: 'threat-901', type: 'DDoS SYN Flood', sourceIP: '185.220.101.4', target: 'Azure West-Europe', severity: 'CRITICAL', status: 'ACTIVE', timestamp: 'JUST NOW' },
  { id: 'threat-902', type: 'SQL Injection Probe', sourceIP: '194.26.29.112', target: 'AWS US-East', severity: 'HIGH', status: 'MITIGATED', timestamp: '2 mins ago' },
  { id: 'threat-903', type: 'Credential Stuffing Bot', sourceIP: '45.154.255.88', target: 'GCP US-Central', severity: 'MEDIUM', status: 'MONITORING', timestamp: '5 mins ago' }
];

let streamHistory = [];
const MAX_STREAM_SAMPLES = 20;

// Populate initial stream history
for (let i = MAX_STREAM_SAMPLES; i >= 1; i--) {
  const label = new Date(Date.now() - i * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  streamHistory.push({
    time: label,
    throughputGbps: +(14.2 + Math.random() * 4.5).toFixed(2),
    avgLatencyMs: Math.floor(18 + Math.random() * 12),
    activeThreatsCount: Math.floor(3 + Math.random() * 4),
    cpuLoadAvg: +(45 + Math.random() * 15).toFixed(1),
    memoryLoadAvg: +(62 + Math.random() * 8).toFixed(1)
  });
}

// 1. Sub-second Real-Time Stream Endpoint
app.get('/api/realtime/stream', (req, res) => {
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const sysMetrics = getRealSystemMetrics();

  // Update node dynamic loads
  activeNodes.forEach(node => {
    node.load = Math.min(98, Math.max(15, Math.floor(node.load + (Math.random() * 8 - 4))));
    node.latency = Math.min(150, Math.max(10, Math.floor(node.latency + (Math.random() * 6 - 3))));
    node.packets += Math.floor(20 + Math.random() * 50);
  });

  const latestSample = {
    time: timeLabel,
    throughputGbps: +(14.5 + Math.random() * 5.2).toFixed(2),
    avgLatencyMs: Math.floor(18 + Math.random() * 15),
    activeThreatsCount: liveThreats.filter(t => t.status === 'ACTIVE').length,
    cpuLoadAvg: sysMetrics.cpuLoadPercent,
    memoryLoadAvg: sysMetrics.memUsedPercent
  };

  streamHistory.push(latestSample);
  if (streamHistory.length > MAX_STREAM_SAMPLES) streamHistory.shift();

  res.json({
    timestamp: new Date().toISOString(),
    systemStatus: 'OPTIMAL',
    activeNodesCount: activeNodes.length,
    totalPacketsProcessed: activeNodes.reduce((acc, n) => acc + n.packets, 0),
    hostHardware: sysMetrics,
    nodes: activeNodes,
    threats: liveThreats,
    history: streamHistory,
    metrics: latestSample
  });
});

// Backward-compatibility alias
app.get('/api/cloud/overview', (req, res) => {
  res.redirect('/api/realtime/stream');
});

// 2. Action: Threat Mitigation
app.post('/api/action/mitigate', (req, res) => {
  const { threatId } = req.body;

  if (threatId === 'ALL') {
    liveThreats.forEach(t => t.status = 'MITIGATED');
    return res.json({ message: '🛡 All active cyber threats successfully mitigated by AI Sentinel!', threats: liveThreats });
  }

  const threat = liveThreats.find(t => t.id === threatId);
  if (threat) {
    threat.status = 'MITIGATED';
    res.json({ message: `🛡 Threat [${threat.type}] from ${threat.sourceIP} mitigated!`, threat });
  } else {
    res.status(404).json({ error: 'Threat ID not found.' });
  }
});

// 3. Action: Live Attack Simulator Trigger (For Recruiter & Interview Demos)
app.post('/api/action/simulate-attack', (req, res) => {
  const attackTypes = ['DDoS SYN Flood Peak', 'Zero-Day Exploit Injection', 'Botnet Brute Force Probe', 'Cross-Site Scripting Exploit'];
  const targets = ['AWS US-East Mesh Node', 'Azure West-Europe Core', 'GCP US-Central GKE Mesh', 'Azure East-US Sovereign Gateway'];
  const severities = ['CRITICAL', 'HIGH', 'CRITICAL'];

  const randomIp = `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  const newThreat = {
    id: `threat-${Math.floor(Math.random() * 9000 + 1000)}`,
    type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
    sourceIP: randomIp,
    target: targets[Math.floor(Math.random() * targets.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    status: 'ACTIVE',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  liveThreats.unshift(newThreat);

  // Increase target node load to simulate attack pressure
  const targetNode = activeNodes.find(n => n.name === newThreat.target);
  if (targetNode) {
    targetNode.load = Math.min(99, targetNode.load + 35);
    targetNode.status = 'CRITICAL';
  }

  res.json({
    message: `🚨 Cyber Attack Simulated! [${newThreat.type}] targeting ${newThreat.target} from ${newThreat.sourceIP}`,
    threat: newThreat
  });
});

// 4. Action: Node Scaling
app.post('/api/action/scale', (req, res) => {
  const { nodeId, action } = req.body;
  const node = activeNodes.find(n => n.id === nodeId);

  if (node) {
    if (action === 'scale-up') {
      node.load = Math.max(15, node.load - 25);
      node.status = 'HEALTHY';
    }
    res.json({ message: `⚡ Node [${node.name}] rebalanced successfully. Current load: ${node.load}%`, node });
  } else {
    res.status(404).json({ error: 'Node not found.' });
  }
});

// 5. Action: Interactive CLI Terminal Command
app.post('/api/action/command', (req, res) => {
  const { cmd } = req.body;
  const command = (cmd || '').trim().toLowerCase();

  let output = '';
  if (command === 'help') {
    output = `Available CLI Commands:
  - status     : Print live cloud mesh operational status & host hardware
  - nodes      : List active multi-cloud topology nodes
  - threats    : Display active cyber threat vectors
  - simulate   : Trigger live cyber attack simulation
  - mitigate   : Trigger autonomous AI threat neutralization
  - scan       : Execute deep network vulnerability audit
  - ping       : Measure global mesh ping latency
  - clear      : Clear terminal screen`;
  } else if (command === 'status') {
    const sys = getRealSystemMetrics();
    output = `[AETHER-MESH STATUS]: OPTIMAL | SLA: 99.999% | Active Nodes: ${activeNodes.length} | Host CPU: ${sys.cpuLoadPercent}% | RAM: ${sys.memUsedPercent}%`;
  } else if (command === 'nodes') {
    output = activeNodes.map(n => `[${n.region}] ${n.name} | Status: ${n.status} | Load: ${n.load}% | Latency: ${n.latency}ms`).join('\n');
  } else if (command === 'threats') {
    output = liveThreats.map(t => `[${t.id}] ${t.type} -> ${t.target} (${t.sourceIP}) | Severity: ${t.severity} | Status: ${t.status}`).join('\n');
  } else if (command === 'simulate') {
    const attackTypes = ['DDoS SYN Flood Peak', 'Zero-Day Exploit Injection'];
    const newThreat = {
      id: `threat-${Math.floor(Math.random() * 9000 + 1000)}`,
      type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      sourceIP: `185.220.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
      target: 'AWS US-East Mesh Node',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    liveThreats.unshift(newThreat);
    output = `[ATTACK SIMULATION]: 🚨 ${newThreat.type} injected targeting ${newThreat.target} from ${newThreat.sourceIP}!`;
  } else if (command.startsWith('mitigate')) {
    liveThreats.forEach(t => t.status = 'MITIGATED');
    output = `[AI SENTINEL]: All threats successfully neutralized. Firewall rules updated across AWS, Azure, GCP.`;
  } else if (command === 'scan') {
    output = `[VULNERABILITY SCAN COMPLETE]: 0 Critical, 0 High vulnerabilities remaining. All 6 nodes synchronized.`;
  } else if (command === 'ping') {
    output = `PING us-east-1: 18ms | eu-central-1: 42ms | eastus: 24ms | us-central1: 15ms | Packet Loss: 0.0%`;
  } else {
    output = `Command not recognized. Type 'help' for available commands.`;
  }

  res.json({ command, output });
});

// Catch-all route to serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`   AetherCloud PulseMatrix Engine Running on Port ${PORT} `);
  console.log(`   http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
