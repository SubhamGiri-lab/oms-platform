import { PublicClientApplication } from '@azure/msal-browser';

const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;
const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : '');

export const msalConfig = {
  auth: {
    clientId: clientId || '',
    authority: process.env.NEXT_PUBLIC_AZURE_AD_AUTHORITY || `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

export const isAzureConfigured = Boolean(clientId && tenantId);

export const msalInstance = new PublicClientApplication(msalConfig);
