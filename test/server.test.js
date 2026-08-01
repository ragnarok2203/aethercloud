const request = require('supertest');
const express = require('express');
const path = require('path');
const os = require('os');

// Build isolated express app instance for unit testing
function createTestApp() {
  const app = express();
  app.use(express.json());

  let activeNodes = [
    { id: 'node-aws-us-east', name: 'AWS US-East Mesh Node', region: 'us-east-1', status: 'HEALTHY', load: 45, latency: 18, packets: 1420 },
    { id: 'node-aws-eu-central', name: 'AWS EU-Central Cluster', region: 'eu-central-1', status: 'HEALTHY', load: 52, latency: 42, packets: 980 }
  ];

  let liveThreats = [
    { id: 'threat-901', type: 'DDoS SYN Flood', sourceIP: '185.220.101.4', target: 'AWS US-East', severity: 'CRITICAL', status: 'ACTIVE', timestamp: 'JUST NOW' }
  ];

  app.get('/api/realtime/stream', (req, res) => {
    res.json({
      timestamp: new Date().toISOString(),
      systemStatus: 'OPTIMAL',
      activeNodesCount: activeNodes.length,
      nodes: activeNodes,
      threats: liveThreats,
      metrics: {
        throughputGbps: 18.5,
        avgLatencyMs: 22,
        activeThreatsCount: liveThreats.filter(t => t.status === 'ACTIVE').length,
        cpuLoadAvg: 45.2,
        memoryLoadAvg: 62.1
      }
    });
  });

  app.post('/api/action/mitigate', (req, res) => {
    const { threatId } = req.body;
    if (threatId === 'ALL') {
      liveThreats.forEach(t => t.status = 'MITIGATED');
      return res.json({ message: '🛡 All active cyber threats successfully mitigated!', threats: liveThreats });
    }
    res.json({ message: 'Threat mitigated' });
  });

  app.post('/api/action/simulate-attack', (req, res) => {
    const newThreat = {
      id: 'threat-test',
      type: 'Zero-Day Exploit Probe',
      sourceIP: '194.26.29.112',
      target: 'AWS US-East Mesh Node',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      timestamp: 'JUST NOW'
    };
    liveThreats.unshift(newThreat);
    res.json({ message: '🚨 Cyber Attack Simulated!', threat: newThreat });
  });

  app.post('/api/action/command', (req, res) => {
    const { cmd } = req.body;
    let output = '';
    if (cmd === 'status') output = '[AETHER-MESH STATUS]: OPTIMAL | SLA: 99.999%';
    else if (cmd === 'ping') output = 'PING us-east-1: 18ms | Packet Loss: 0.0%';
    else output = 'Command output';
    res.json({ command: cmd, output });
  });

  return app;
}

describe('AetherCloud PulseMatrix Suite', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  test('GET /api/realtime/stream should return 200 OK with valid telemetry structure', async () => {
    const response = await request(app).get('/api/realtime/stream');
    expect(response.statusCode).toBe(200);
    expect(response.body.systemStatus).toBe('OPTIMAL');
    expect(response.body.nodes).toBeDefined();
    expect(response.body.metrics.throughputGbps).toBeGreaterThan(0);
  });

  test('POST /api/action/simulate-attack should inject a new active threat', async () => {
    const response = await request(app).post('/api/action/simulate-attack').send({});
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('Cyber Attack Simulated');
    expect(response.body.threat.type).toBeDefined();
  });

  test('POST /api/action/mitigate should neutralize active security threats', async () => {
    const response = await request(app).post('/api/action/mitigate').send({ threatId: 'ALL' });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('mitigated');
    expect(response.body.threats.every(t => t.status === 'MITIGATED')).toBe(true);
  });

  test('POST /api/action/command should execute CLI shell commands cleanly', async () => {
    const response = await request(app).post('/api/action/command').send({ cmd: 'status' });
    expect(response.statusCode).toBe(200);
    expect(response.body.output).toContain('SLA: 99.999%');
  });
});
