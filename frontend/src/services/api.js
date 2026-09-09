import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

export const auditApi = {
  scanPackage: async (formData) => {
    const response = await client.post('/audit/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  scrapeUrl: async (payload) => {
    const response = await client.post('/audit/scrape', payload);
    return response.data;
  },

  getHistory: async (limit = 20) => {
    const response = await client.get(`/audit/history?limit=${limit}`);
    return response.data;
  },
};

export const physicalTestApi = {
  checkMpe: async (payload) => {
    const response = await client.post('/test/mpe-check', payload);
    return response.data;
  },
};

export const reportApi = {
  exportReport: async (payload) => {
    const response = await client.post('/report/export', payload, {
      responseType: 'blob',
    });
    return response;
  },
};

export default {
  audit: auditApi,
  physicalTest: physicalTestApi,
  report: reportApi,
};
