import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext'; // [NEW]
import { ToastContainer } from './components/common/ToastContainer'; // [NEW]

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ADMIN_CONFIG } from './config/admin';

// Initialize Kakao SDK
if (window.Kakao && !window.Kakao.isInitialized() && ADMIN_CONFIG.kakaoApiKey) {
  try {
    window.Kakao.init(ADMIN_CONFIG.kakaoApiKey);
  } catch (err) {
    console.warn('Kakao initialization failed:', err);
  }
}

const root = createRoot(document.getElementById('root'));

const content = (
  <ToastProvider>
    <App />
    <ToastContainer />
  </ToastProvider>
);

root.render(
  <StrictMode>
    {ADMIN_CONFIG.googleClientId ? (
      <GoogleOAuthProvider clientId={ADMIN_CONFIG.googleClientId}>
        {content}
      </GoogleOAuthProvider>
    ) : (
      content
    )}
  </StrictMode>
);
