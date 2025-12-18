import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext'; // [NEW]
import { ToastContainer } from './components/common/ToastContainer'; // [NEW]

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ADMIN_CONFIG } from './config/admin';

// Initialize Kakao SDK
if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init(ADMIN_CONFIG.kakaoApiKey);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={ADMIN_CONFIG.googleClientId}>
      <ToastProvider>
        <App />
        <ToastContainer />
      </ToastProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
