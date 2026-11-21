import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import FeedbackHost from './components/FeedbackHost'
import { AuthProvider } from './context/AuthContext'
import { TenantProvider } from './context/TenantContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <TenantProvider>
        <App />
        <FeedbackHost />
      </TenantProvider>
    </AuthProvider>
  </React.StrictMode>
)