# Root Infrastructure Orchestration - CloudOps Multi-Cloud Platform

terraform {
  required_version = ">= 1.5.0"
  
  backend "s3" {
    bucket         = "cloudops-terraform-state-backend-store"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}

# 1. AWS Module Call
module "aws_cloud" {
  source      = "./aws"
  environment = "production"
  region      = "us-east-1"
}

# 2. Azure Module Call
module "azure_cloud" {
  source   = "./azure"
  location = "East US"
}

# 3. GCP Module Call
module "gcp_cloud" {
  source     = "./gcp"
  project_id = "cloudops-prod-final-year"
  region     = "us-central1"
}

output "multi_cloud_summary" {
  value = {
    aws_vpc_id           = module.aws_cloud.aws_vpc_id
    azure_resource_group = module.azure_cloud.azure_resource_group_name
    gcp_vpc_network      = module.gcp_cloud.gcp_vpc_name
    status               = "ALL_CLOUDS_PROVISIONED_SUCCESSFULLY"
  }
}
