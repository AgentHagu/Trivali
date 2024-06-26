// React imports
import React from 'react';
import ReactDOM from 'react-dom/client';

// App component
import App from './App';

// Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { BudgetsProvider } from "./context/BudgetsContext"

// Custom styles
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BudgetsProvider>
      <App />
    </BudgetsProvider>
  </React.StrictMode>
  // <App />
);