import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import ProjectsPage from './components/pages/ProjectsPage';
import ResearchPage from './components/pages/ResearchPage';
import NewsPage from './components/pages/NewsPage';
import GalleryPage from './components/pages/GalleryPage';
import ContactPage from './components/pages/ContactPage';
import AdminPanel from './components/pages/AdminPanel';
import GalleryUpload from './components/pages/GalleryUpload';
import ContentUpload from './components/pages/ContentUpload';
import AlbumsPage from './components/pages/AlbumsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/albums" element={<AlbumsPage />} />
              <Route path="/albums/:albumId" element={<AlbumsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <GalleryUpload />
                </ProtectedRoute>
              } />
              <Route path="/submit" element={
                <ProtectedRoute>
                  <ContentUpload />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin', 'super_admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
