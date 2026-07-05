import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Authors from './pages/Authors';
import Categories from './pages/Categories';
import Books from './pages/Books';
import Members from './pages/Members';
import Loans from './pages/Loans';
import About from './pages/About';

function RouteTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const titles = {
      '/login': 'Login',
      '/': 'Dashboard',
      '/authors': 'Authors',
      '/categories': 'Categories',
      '/books': 'Books',
      '/members': 'Members',
      '/loans': 'Loans',
      '/about': 'About',
    };

    const page = titles[pathname] || 'LibraryMS';
    document.title = `LibraryMS | ${page}`;
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <RouteTitle />
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/authors" element={<Authors />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/loans" element={<Loans />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;