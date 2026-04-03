  import { useEffect } from 'react';
  import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
    ShoppingCart,
    Search,
    Home as HomeIcon,
  } from 'lucide-react';
  import { CartProvider } from './contexts/CartContext';
  import { NavigationProvider, useNavigate, useCurrentPage } from './components/Navigation';
  import { useCart } from './contexts/CartContext';
  import ProductList from './components/ProductList';
  import Cart from './components/Cart';
  import CheckoutPage from './pages/CheckoutPage';
  import TrackingForm from './components/TrackingForm';
  import logoImage from './assets/images/logo.png';
  import Users from './pages/Users';
  import CreateUserPage from './pages/CreateUser.jsx';
  import AdminLayout from "./layouts/AdminLayout";
  import Dashboard from "./pages/admin/Dashboard";
  import Products from "./pages/admin/Products";
  import Orders from './pages/admin/Orders';
  import Categories from './pages/admin/Categories';
  
  function Header() {
    const { getTotalItems } = useCart();
    const navigate = useNavigate();
    const currentPage = useCurrentPage();

    const menuItems = [
      { id: 'home' as const, name: 'Trang chủ', icon: HomeIcon },
      { id: 'cart' as const, name: 'Giỏ hàng', icon: ShoppingCart, badge: getTotalItems() },
      { id: 'tracking' as const, name: 'Tra cứu đơn', icon: Search },
    ];

    return (
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => navigate('home')}
              className="group flex items-center gap-3 text-left"
              type="button"
            >
              <img
                src={logoImage}
                alt="Office Smart logo"
                className="h-11 w-auto shrink-0 object-contain transition group-hover:scale-105"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Office Smart</p>
                <h1 className="text-lg font-bold text-slate-900 sm:text-xl">Nhóm 9</h1>
              </div>
            </button>

            <nav className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:flex">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`pill-tab relative ${
                    currentPage === item.id
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  type="button"
                >
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
    );
  }

  function MainContent() {
    const currentPage = useCurrentPage();

    return (
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {currentPage === 'home' && (
          <div className="animate-fade-in">
            <ProductList />
          </div>
        )}

        {currentPage === 'cart' && (
          <div className="animate-fade-in">
            <Cart />
          </div>
        )}

        {currentPage === 'checkout' && (
          <div className="animate-fade-in">
            <CheckoutPage />
          </div>
        )}

        {currentPage === 'tracking' && (
          <div className="animate-fade-in">
            <TrackingForm />
          </div>
        )}

        {currentPage === 'users' && (
          <div className="animate-fade-in">
            <Users />
          </div>
        )}
      </main>
    );
  }

  function Footer() {
    return (
      <footer className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl glass-panel px-6 py-8 sm:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Office Smart</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Cung cấp văn phòng phẩm chất lượng cao, tối ưu quy trình đặt hàng và giao nhanh toàn quốc.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Thông tin liên hệ</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
                <li>Hotline: 1900-xxxx</li>
                <li>Email: contact@officesmart.vn</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Dịch vụ</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Đổi trả trong 7 ngày</li>
                <li>Thanh toán linh hoạt</li>
                <li>Giao hàng nhanh GHN</li>
                <li>Hỗ trợ doanh nghiệp</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
            <p>©2026 Office Smart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  function UrlHandler() {
    const navigate = useNavigate();
    useEffect(() => {
      const path = window.location.pathname;
      if (path === '/users') navigate('users');
    }, []);
    return null;
  }

  function StorefrontApp() {
    return (
      <CartProvider>
        <NavigationProvider>
          <UrlHandler />
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="pointer-events-none fixed inset-0 -z-20 bg-grid-pattern opacity-45" />
            <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-white/65 to-transparent" />
            <Header />
            <MainContent />
            <Footer />
          </div>
        </NavigationProvider>
      </CartProvider>
    );
  }

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StorefrontApp />} />
          <Route path="/users" element={<StorefrontApp />} />
          <Route path="/create" element={<CreateUserPage />} />
          <Route path="/store" element={<StorefrontApp />} />
          <Route path="*" element={<StorefrontApp />} />
          <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders/>}/>
        </Route>
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;
