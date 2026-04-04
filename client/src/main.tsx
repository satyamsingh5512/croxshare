import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TransferProvider } from './context/TransferContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TransferProvider>
      <App />
    </TransferProvider>
  </React.StrictMode>,
);
