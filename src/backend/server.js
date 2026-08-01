const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// In-Memory Cloud State
let terraformDeployments = [
  { id: 'dep-101', provider: 'AWS', module: 'vpc-and-ec2-cluster', status: 'SUCCESS', lastApplied: '2026-08-01 10:15:00', resources: 14 },
  { id: 'dep-102', provider: 'Azure', module: 'aks-and-storage-group', status: 'SUCCESS', lastApplied: '2026-08-01 09:30:00', resources: 9 },
  { id: 'dep-103', provider: 'GCP', module: 'gke-and-bigquery-dataset', status: 'SUCCESS', lastApplied: '2026-08-01 08:45:00', resources: 11 }
];

let k8sDeployments = {
  frontend: { name: 'cloudops-frontend-deployment', replicas: 3, readyReplicas: 3, targetCPU: '80%' },
  backend: { name: 'cloudops-backend-api-deployment', replicas: 4, readyReplicas: 4, targetCPU: '75%' },
  db: { name: 'cloudops-postgres-db-statefulset', replicas: 2, readyReplicas: 2, targetCPU: '60%' }
};

// Helper function to build dynamic pod list based on deployment replicas
function generateDynamicPods() {
  const nodes = ['ip-10-0-1-42', 'ip-10-0-1-43', 'azure-aks-node-pool-01', 'azure-aks-node-pool-02', 'gke-cluster-node-a1', 'gke-cluster-node-a2'];
  const pods = [];

  // Frontend pods
  for (let i = 0; i < k8sDeployments.frontend.replicas; i++) {
    const hash = Math.random().toString(36).substring(2, 7);
    pods.push({
      name: `cloudops-frontend-6f4d9c79-${hash}`,
      namespace: 'production',
      status: 'Running',
      restarts: 0,
      cpu: `${40 + Math.floor(Math.random() * 15)}m`,
      memory: `${120 + Math.floor(Math.random() * 20)}Mi`,
      node: nodes[i % nodes.length]
    });
  }

  // Backend pods
  for (let i = 0; i < k8sDeployments.backend.replicas; i++) {
    const hash = Math.random().toString(36).substring(2, 7);
    pods.push({
      name: `cloudops-backend-api-89b1c78-${hash}`,
      namespace: 'production',
      status: 'Running',
      restarts: 0,
      cpu: `${100 + Math.floor(Math.random() * 20)}m`,
      memory: `${240 + Math.floor(Math.random() * 30)}Mi`,
      node: nodes[(i + 1) % nodes.length]
    });
  }

  // Database statefulset pods
  for (let i = 0; i < k8sDeployments.db.replicas; i++) {
    pods.push({
      name: `cloudops-postgres-db-${i}`,
      namespace: 'database',
      status: 'Running',
      restarts: 0,
      cpu: `${200 + Math.floor(Math.random() * 30)}m`,
      memory: `${500 + Math.floor(Math.random() * 50)}Mi`,
      node: nodes[(i + 2) % nodes.length]
    });
  }

  // System Monitoring pod
  pods.push({
    name: 'prometheus-k8s-server-0',
    namespace: 'monitoring',
    status: 'Running',
    restarts: 0,
    cpu: '180m',
    memory: '410Mi',
    node: 'gke-cluster-node-a2'
  });

  return pods;
}

// Rolling telemetry history for real-time graphs
let telemetryHistory = [];
const maxHistoryLength = 12;

// Initialize history
for (let i = maxHistoryLength; i >= 1; i--) {
  const timeLabel = new Date(Date.now() - i * 4000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  telemetryHistory.push({
    time: timeLabel,
    cpu: +(42 + Math.random() * 12).toFixed(1),
    memory: +(60 + Math.random() * 8).toFixed(1),
    networkMbps: +(140 + Math.random() * 40).toFixed(1)
  });
}

// 1. Overall Cloud Health & Telemetry Endpoint
app.get('/api/cloud/overview', (req, res) => {
  const uptimeHours = 744;
  const totalCostEstimate = 428.50; // USD / month
  const totalCarbonKg = 142.8;

  // Append new live sample
  const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const latestSample = {
    time: nowLabel,
    cpu: +(42 + Math.random() * 12).toFixed(1),
    memory: +(60 + Math.random() * 8).toFixed(1),
    networkMbps: +(140 + Math.random() * 40).toFixed(1)
  };
  telemetryHistory.push(latestSample);
  if (telemetryHistory.length > maxHistoryLength) {
    telemetryHistory.shift();
  }

  // AWS (3) + Azure (2) + GCP (2) = 7 VMs
  const totalVMs = 7;
  const dynamicPods = generateDynamicPods();
  const activePods = dynamicPods.length;
  const totalResourcesManaged = terraformDeployments.reduce((sum, item) => sum + item.resources, 0);

  // Pod distribution per node
  const podDistributionByNode = {};
  dynamicPods.forEach(p => {
    podDistributionByNode[p.node] = (podDistributionByNode[p.node] || 0) + 1;
  });

  res.json({
    platform: 'CloudOps Multi-Cloud Infrastructure Management Platform',
    version: 'v1.0.0-BTech-Final-Release',
    healthStatus: 'HEALTHY',
    activeCloudProviders: ['AWS (us-east-1)', 'Azure (East US)', 'GCP (us-central1)'],
    metrics: {
      totalVMs: totalVMs,
      totalStorageTB: 14.5,
      activeK8sPods: activePods,
      totalResourcesManaged: totalResourcesManaged,
      cpuUtilizationAvg: `${latestSample.cpu}%`,
      memoryUtilizationAvg: `${latestSample.memory}%`,
      monthlyCostUSD: totalCostEstimate,
      carbonFootprintKgCO2: totalCarbonKg,
      systemUptime: `${uptimeHours} hrs (99.98% SLA)`
    },
    providerDistribution: {
      aws: 45,
      azure: 30,
      gcp: 25
    },
    podDistributionByNode: podDistributionByNode,
    telemetryHistory: telemetryHistory
  });
});

// 2. AWS Telemetry Endpoint
app.get('/api/cloud/aws', (req, res) => {
  res.json({
    provider: 'Amazon Web Services (AWS)',
    region: 'us-east-1 (N. Virginia)',
    vpc: { vpcId: 'vpc-0a89f419c8e1', cidr: '10.0.0.0/16', subnets: 4, internetGateway: 'igw-0891a' },
    ec2Instances: [
      { id: 'i-0192a8b71c', name: 'CloudOps-K8s-Worker-01', type: 't3.large', state: 'running', ip: '10.0.1.42', cpu: `${(35 + Math.random() * 15).toFixed(1)}%` },
      { id: 'i-0192a8b71d', name: 'CloudOps-K8s-Worker-02', type: 't3.large', state: 'running', ip: '10.0.1.43', cpu: `${(40 + Math.random() * 12).toFixed(1)}%` },
      { id: 'i-0994fcc82e', name: 'Jenkins-CI-CD-Master', type: 't3.medium', state: 'running', ip: '10.0.2.10', cpu: `${(25 + Math.random() * 10).toFixed(1)}%` }
    ],
    s3Buckets: [
      { name: 'cloudops-terraform-state-backend-store', objectCount: 142, sizeMB: 48.2, encrypted: true },
      { name: 'cloudops-static-assets-cdn-cloudfront', objectCount: 850, sizeMB: 312.8, encrypted: true }
    ],
    iamRolesCount: 8,
    cloudWatchAlarms: { ok: 12, warning: 1, critical: 0 }
  });
});

// 3. Azure Telemetry Endpoint
app.get('/api/cloud/azure', (req, res) => {
  res.json({
    provider: 'Microsoft Azure',
    region: 'East US',
    resourceGroup: 'rg-cloudops-enterprise-prod',
    virtualMachines: [
      { id: 'az-vm-01', name: 'azure-aks-node-pool-01', size: 'Standard_D2s_v3', status: 'Running', publicIp: '20.12.84.101', cpu: `${(38 + Math.random() * 10).toFixed(1)}%` },
      { id: 'az-vm-02', name: 'azure-aks-node-pool-02', size: 'Standard_D2s_v3', status: 'Running', publicIp: '20.12.84.102', cpu: `${(42 + Math.random() * 8).toFixed(1)}%` }
    ],
    storageAccounts: [
      { name: 'stcloudopsstate01', redundancy: 'LRS', blobContainers: 3, totalUsedGB: 18.4 }
    ],
    virtualNetworks: [
      { name: 'vnet-cloudops-prod', addressSpace: '172.16.0.0/16', subnets: 3 }
    ]
  });
});

// 4. GCP Telemetry Endpoint
app.get('/api/cloud/gcp', (req, res) => {
  res.json({
    provider: 'Google Cloud Platform (GCP)',
    project: 'cloudops-prod-final-year',
    region: 'us-central1 (Iowa)',
    computeInstances: [
      { id: 'gcp-comp-01', name: 'gke-cluster-node-a1', machineType: 'e2-standard-2', status: 'RUNNING', zone: 'us-central1-a', cpu: `${(30 + Math.random() * 12).toFixed(1)}%` },
      { id: 'gcp-comp-02', name: 'gke-cluster-node-a2', machineType: 'e2-standard-2', status: 'RUNNING', zone: 'us-central1-b', cpu: `${(33 + Math.random() * 15).toFixed(1)}%` }
    ],
    cloudStorage: [
      { name: 'gcp-cloudops-backup-bucket', storageClass: 'STANDARD', location: 'US', totalGB: 125.0 }
    ],
    pubSubTopics: ['cloudops-metrics-telemetry', 'cloudops-alert-notifications']
  });
});

// 5. Kubernetes Cluster Telemetry Endpoint
app.get('/api/k8s/pods', (req, res) => {
  const dynamicPods = generateDynamicPods();
  res.json({
    totalPods: dynamicPods.length,
    deployments: k8sDeployments,
    pods: dynamicPods
  });
});

// 6. Terraform State Endpoint
app.get('/api/terraform/state', (req, res) => {
  res.json({
    terraformVersion: '1.8.5',
    backendStore: 'S3 (cloudops-terraform-state-backend-store)',
    driftDetected: false,
    history: terraformDeployments
  });
});

// 7. Trigger Simulated Terraform Apply
app.post('/api/terraform/deploy', (req, res) => {
  const { provider, moduleName } = req.body;
  const newDep = {
    id: `dep-${Math.floor(100 + Math.random() * 900)}`,
    provider: provider || 'AWS',
    module: moduleName || 'cloud-vpc-module',
    status: 'SUCCESS',
    lastApplied: new Date().toISOString().replace('T', ' ').substring(0, 19),
    resources: Math.floor(5 + Math.random() * 10)
  };
  terraformDeployments.unshift(newDep);
  res.json({
    message: `Terraform apply executed successfully for module [${newDep.module}] on ${newDep.provider}!`,
    deployment: newDep
  });
});

// 8. Scale Kubernetes Deployments
app.post('/api/k8s/scale', (req, res) => {
  const { deploymentName, replicas } = req.body;
  if (k8sDeployments[deploymentName]) {
    k8sDeployments[deploymentName].replicas = parseInt(replicas);
    k8sDeployments[deploymentName].readyReplicas = parseInt(replicas);
  }
  res.json({
    message: `Scaled deployment '${deploymentName}' to ${replicas} replicas.`,
    updatedDeployments: k8sDeployments
  });
});

// 9. CI/CD DevOps Pipeline Runs Endpoint
app.get('/api/devops/pipeline', (req, res) => {
  res.json({
    jenkins: {
      serverUrl: 'https://jenkins.cloudops.internal:8080',
      lastBuild: { id: '#42', result: 'SUCCESS', duration: '2m 14s', timestamp: '2026-08-01 10:40:00' },
      stages: [
        { name: 'Git Checkout & Lint', status: 'SUCCESS', duration: '12s' },
        { name: 'Docker Build & Push', status: 'SUCCESS', duration: '45s' },
        { name: 'Trivy Security Scan', status: 'SUCCESS', duration: '20s' },
        { name: 'Terraform Plan & Apply', status: 'SUCCESS', duration: '35s' },
        { name: 'Kubernetes Deploy & Smoke Test', status: 'SUCCESS', duration: '22s' }
      ]
    },
    githubActions: {
      workflowName: 'CloudOps CI/CD Deployment Pipeline',
      status: 'completed',
      conclusion: 'success',
      runNumber: 128
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`   CloudOps Platform Backend Running on Port ${PORT}    `);
  console.log(`   http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
