# AWS Infrastructure Module for CloudOps Platform
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "environment" {
  type    = string
  default = "production"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

# 1. VPC Configuration
resource "aws_vpc" "cloudops_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "cloudops-vpc-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# 2. Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.cloudops_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"

  tags = {
    Name = "cloudops-public-subnet"
  }
}

# 3. Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.cloudops_vpc.id

  tags = {
    Name = "cloudops-igw"
  }
}

# 4. Security Group
resource "aws_security_group" "web_sg" {
  name        = "cloudops-web-sg"
  description = "Allow inbound HTTP/HTTPS and SSH traffic"
  vpc_id      = aws_vpc.cloudops_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 5. EC2 Instances (Kubernetes Node Workers)
resource "aws_instance" "k8s_worker" {
  count         = 2
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS AMI
  instance_type = "t3.large"
  subnet_id     = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "CloudOps-K8s-Worker-0${count.index + 1}"
    Role = "Kubernetes Worker Node"
  }
}

# 6. S3 Storage Bucket
resource "aws_s3_bucket" "cloudops_state" {
  bucket = "cloudops-terraform-state-backend-store"

  tags = {
    Name        = "CloudOps Terraform Remote State Store"
    Environment = var.environment
  }
}

output "aws_vpc_id" {
  value = aws_vpc.cloudops_vpc.id
}

output "aws_worker_ips" {
  value = aws_instance.k8s_worker[*].public_ip
}
