import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import store from './redux/store.js'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'

// Inject global styles
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --info-color: #3b82f6;
    --dark-color: #1f2937;
    --light-color: #f9fafb;
    --gray-color: #6b7280;
    --border-color: #e5e7eb;
    --sidebar-width: 260px;
    --header-height: 70px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  body {
    font-family: 'Poppins', sans-serif;
    background-color: #f8f9fa;
    color: var(--dark-color);
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: var(--transition);
  }

  .card-hover {
    transition: var(--transition);
    cursor: pointer;
  }

  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
  }

  .btn {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    padding: 0.625rem 1.5rem;
    border-radius: 8px;
    transition: var(--transition);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    border: none;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
  }

  .form-control, .form-select {
    font-family: 'Poppins', sans-serif;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.625rem 1rem;
    transition: var(--transition);
  }

  .form-control:focus, .form-select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.1);
  }

  .table {
    font-size: 0.875rem;
  }

  .table thead th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--border-color);
    padding: 1rem;
    background-color: var(--light-color);
  }

  .table tbody td {
    padding: 1rem;
    vertical-align: middle;
  }

  .table tbody tr:hover {
    background-color: rgba(99, 102, 241, 0.03);
  }

  .badge {
    font-weight: 500;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
  }

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .skeleton-text { height: 16px; margin-bottom: 10px; }
  .skeleton-title { height: 24px; margin-bottom: 15px; width: 60%; }
  .skeleton-card { height: 120px; }
  .skeleton-avatar { width: 40px; height: 40px; border-radius: 50%; }
  .skeleton-image { width: 100%; height: 200px; }

  .text-gradient {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    :root {
      --sidebar-width: 0;
      --header-height: 60px;
    }
  }
`

const styleSheet = document.createElement("style")
styleSheet.innerText = globalStyles
document.head.appendChild(styleSheet)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)