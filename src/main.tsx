import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { DashboardDataProvider } from './lib/DashboardDataContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <DashboardDataProvider>
      <App />
    </DashboardDataProvider>
  </React.StrictMode>,
)
