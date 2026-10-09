import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth, PublicOnlyRoute } from './components/auth/RouteGuards';
import { AuthenticatedApp } from './components/auth/AuthenticatedApp';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
                <Route path="/*" element={<RequireAuth><AuthenticatedApp /></RequireAuth>} />
              </Routes>
            </BrowserRouter>
          </MotionConfig>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>);

}