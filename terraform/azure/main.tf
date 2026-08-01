# Azure Infrastructure Module for CloudOps Platform
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

variable "location" {
  type    = string
  default = "East US"
}

# 1. Resource Group
resource "azurerm_resource_group" "cloudops_rg" {
  name     = "rg-cloudops-enterprise-prod"
  location = var.location
}

# 2. Virtual Network
resource "azurerm_virtual_network" "cloudops_vnet" {
  name                = "vnet-cloudops-prod"
  address_space       = ["172.16.0.0/16"]
  location            = azurerm_resource_group.cloudops_rg.location
  resource_group_name = azurerm_resource_group.cloudops_rg.name
}

# 3. Subnet
resource "azurerm_subnet" "cloudops_subnet" {
  name                 = "snet-cloudops-aks"
  resource_group_name  = azurerm_resource_group.cloudops_rg.name
  virtual_network_name = azurerm_virtual_network.cloudops_vnet.name
  address_prefixes     = ["172.16.1.0/24"]
}

# 4. Storage Account
resource "azurerm_storage_account" "cloudops_storage" {
  name                     = "stcloudopsstate01"
  resource_group_name      = azurerm_resource_group.cloudops_rg.name
  location                 = azurerm_resource_group.cloudops_rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

output "azure_resource_group_name" {
  value = azurerm_resource_group.cloudops_rg.name
}
