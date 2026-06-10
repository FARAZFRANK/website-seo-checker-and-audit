import axios from 'axios';

// frankSeoData is passed via wp_localize_script in class-frank-seo-admin.php
const apiSettings = window.frankSeoData || {
  api_url: 'http://localhost/wp-json/frank-seo/v1/',
  nonce: '',
};

const apiClient = axios.create({
  baseURL: apiSettings.api_url,
  headers: {
    'X-WP-Nonce': apiSettings.nonce,
    'Content-Type': 'application/json'
  }
});

export const getSummary = async () => {
  const response = await apiClient.get('summary');
  return response.data;
};

export const getPages = async () => {
  const response = await apiClient.get('pages');
  return response.data;
};

export const getPageDetails = async (id) => {
  const response = await apiClient.get(`pages/${id}`);
  return response.data;
};

export const triggerScan = async (pageIds = null) => {
  const response = await apiClient.post('scan', { page_ids: pageIds });
  return response.data;
};

export const getPagesToScan = async () => {
  const response = await apiClient.get('pages-to-scan');
  return response.data;
};

export const triggerScanComplete = async () => {
  const response = await apiClient.post('scan/complete');
  return response.data;
};

export const startBackgroundScan = async () => {
  const response = await apiClient.post('scan/start-background');
  return response.data;
};

export const getScanProgress = async (cancel = false) => {
  const url = cancel ? 'scan/progress?action=cancel' : 'scan/progress';
  const response = await apiClient.get(url);
  return response.data;
};

export const updateIssueStatus = async (issueId, status) => {
  const response = await apiClient.post(`issues/${issueId}/status`, { status });
  return response.data;
};

export const getHistory = async () => {
  const response = await apiClient.get('history');
  return response.data;
};

export const deletePage = async (id) => {
  const response = await apiClient.delete(`pages/${id}`);
  return response.data;
};

export const bulkDeletePages = async (ids) => {
  const response = await apiClient.post('pages/bulk-delete', { ids });
  return response.data;
};

export const getSettings = async () => {
  const response = await apiClient.get('settings');
  return response.data;
};

export const updateSettings = async (settings) => {
  const response = await apiClient.post('settings', settings);
  return response.data;
};

export const resetPlugin = async () => {
  const response = await apiClient.post('reset');
  return response.data;
};

export const getRedirects = async () => {
  const response = await apiClient.get('redirects');
  return response.data;
};

export const saveRedirect = async (redirect) => {
  const response = await apiClient.post('redirects', redirect);
  return response.data;
};

export const deleteRedirect = async (id) => {
  const response = await apiClient.delete(`redirects/${id}`);
  return response.data;
};

export const get404Logs = async () => {
  const response = await apiClient.get('logs-404');
  return response.data;
};

export const delete404Log = async (id) => {
  const response = await apiClient.delete(`logs-404/${id}`);
  return response.data;
};

export const clear404Logs = async () => {
  const response = await apiClient.post('logs-404/clear');
  return response.data;
};

export const runCompetitorAudit = async (url) => {
  const response = await apiClient.post('competitor-audit', { url });
  return response.data;
};

export const generateSeoMetaAi = async (title, content, keyword) => {
  const response = await apiClient.post('seo-ai/generate', { title, content, keyword });
  return response.data;
};

export default apiClient;
