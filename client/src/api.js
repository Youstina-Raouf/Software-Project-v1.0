import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends cookies for login sessions
});

export default api;
