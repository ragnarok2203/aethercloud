# GCP Infrastructure Module for CloudOps Platform
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  type    = string
  default = "cloudops-prod-final-year"
}

variable "region" {
  type    = string
  default = "us-central1"
}

# 1. Google VPC Network
resource "google_compute_network" "vpc_network" {
  name                    = "gcp-cloudops-vpc"
  auto_create_subnetworks = false
}

# 2. VPC Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "gcp-cloudops-subnet-us"
  ip_cidr_range = "192.168.10.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id
}

# 3. Google Compute Engine VM
resource "google_compute_instance" "gke_node" {
  name         = "gke-cluster-node-a1"
  machine_type = "e2-standard-2"
  zone         = "${var.region}-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network    = google_compute_network.vpc_network.name
    subnetwork = google_compute_subnetwork.subnet.name
    access_config {}
  }
}

output "gcp_vpc_name" {
  value = google_compute_network.vpc_network.name
}
