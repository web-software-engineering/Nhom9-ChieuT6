import React from 'react';
import ReactDOM from 'react-dom/client'; // Chú ý: dùng react-dom/client
import App from './App.tsx';
 import './index.css'; 

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);