import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { Header } from './components/layout/Header/Header';
import { Footer } from './components/layout/Footer/Footer';
import { CartSidebar } from './components/cart/CartSidebar/CartSidebar';
import { Home } from './pages/Home/Home';
import { Marketplace } from './pages/Marketplace/Marketplace';
import { ProductDetail } from './pages/Product/ProductDetail';
import { Cart } from './pages/Cart/Cart';
import { Wishlist } from './pages/Wishlist/Wishlist';
import { NotFound } from './pages/NotFound/NotFound';
import { FAQ } from './pages/FAQ/FAQ';
import { Exchange } from './pages/Exchange/Exchange';
import { AuthCallback } from './pages/AuthCallback/AuthCallback';
import { useAuthStore } from './store/useAuthStore';
import { useProductsInit } from './hooks/useProducts';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const init = useAuthStore(s => s.init);

  useEffect(() => {
    init();
  }, [init]);

  useProductsInit();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f0f1a] text-white font-['Inter'] overflow-x-hidden">
        <Header />
        <main>
          <AppRoutes />
        </main>
        <Footer />
        <CartSidebar />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid #3a3a5a',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
