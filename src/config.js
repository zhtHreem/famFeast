// Base URL of the backend API, configured via REACT_APP_API_URL (see .env.example).
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export { API_URL };
