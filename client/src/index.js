// React imports
import React from 'react';
import ReactDOM from 'react-dom/client';

// App component
import App from './App';

// Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import $ from 'jquery'


// Custom styles
import "./styles.css";
import ApiKeysProvider from './context/ApiKeysContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApiKeysProvider>
    <App />
  </ApiKeysProvider>
);