import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import './index.css';

const DEV_ROLE = import.meta.env.VITE_DEV_ROLE || 'LMPC_OFFICER';
console.log("Running in offline mode with role:", DEV_ROLE);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
