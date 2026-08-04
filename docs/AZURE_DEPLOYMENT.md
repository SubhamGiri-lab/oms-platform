# Azure Deployment Guide

This document describes how to prepare the OMS platform for Microsoft Azure, including Azure Active Directory, Azure Kubernetes Service, Azure Container Registry, and Application Insights.

## 1. Azure Active Directory

1. Create an Azure AD tenant or use an existing tenant.
2. Register a new application for the frontend.
   - Redirect URI: `https://yourapp.example.com` or `http://localhost:3000`
   - Expose API permissions if required.
3. Register a second application for the backend API.
   - Add an Application ID URI.
   - Accept tokens for the API audience.
4. Configure the frontend app to use:
   - `NEXT_PUBLIC_AZURE_AD_CLIENT_ID`
   - `NEXT_PUBLIC_AZURE_AD_TENANT_ID`
   - `NEXT_PUBLIC_AZURE_AD_AUTHORITY`
   - `NEXT_PUBLIC_AZURE_AD_REDIRECT_URI`
5. Configure the backend app to use:
   - `AZURE_AD_TENANT_ID`
   - `AZURE_AD_CLIENT_ID`
   - `AZURE_AD_AUTHORITY`

## 2. Application Insights

1. Create an Application Insights resource in Azure.
2. Copy the connection string from the resource overview.
3. Set the backend environment variable:

```env
APP_INSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=https://...;
```

## 3. Azure Container Registry (ACR)

1. Create an Azure Container Registry.
2. Build and push images with GitHub Actions or Azure CLI.
3. Use image names like `myregistry.azurecr.io/oms-backend:latest` and `myregistry.azurecr.io/oms-frontend:latest`.

## 4. Azure Kubernetes Service (AKS)

1. Create an AKS cluster in the desired resource group.
2. Configure `kubectl` context:

```bash
az aks get-credentials --resource-group my-rg --name my-aks-cluster
```

3. Deploy the manifest in `azure/aks/oms-aks-manifests.yaml`.

## 5. AKS manifest variables

Update the manifest placeholders with your ACR information and secret names.

## 6. GitHub Actions Azure Deploy

The repository includes a deploy workflow at `.github/workflows/azure-deploy.yml`.

Set the following repository secrets:
- `AZURE_CREDENTIALS`
- `AKS_CLUSTER_NAME`
- `AKS_RESOURCE_GROUP`
- `ACR_NAME`
- `AZURE_SUBSCRIPTION_ID`
- `KUBE_CONFIG_DATA` (optional)

## 7. Monitoring and logging

- Use Application Insights for request and dependency telemetry.
- Enable Azure Monitor metrics for CPU, memory, and container status.
- Configure alert rules on AKS node health and failed deployments.

## 8. Power BI and analytics

- Expose analytics endpoints in the backend.
- Use Power BI Desktop to connect to your production database or API.
- Create dashboards for sales, inventory, and order trend analysis.

## Validation
This Azure deployment guide reflects a production-ready build validated on the repository.
- Backend tests pass and backend `npm audit` reports no vulnerabilities
- Frontend production build passes on Next.js `16.3.0`
- Azure AD, AKS, and GitHub Actions deployment support are included in the repository
