import { useState } from 'react';
import { Calculator, Package, Search, Menu, X } from 'lucide-react';
import ShippingFeeForm from '../components/ShippingFeeForm';
import CreateOrderForm from '../components/CreateOrderForm';
import TrackingForm from '../components/TrackingForm';

type TabType = 'fee' | 'order' | 'tracking';

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('fee');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'fee' as TabType, name: 'Tính phí vận chuyển', icon: Calculator, color: 'orange' },
    { id: 'order' as TabType, name: 'Tạo đơn hàng', icon: Package, color: 'blue' },
    { id: 'tracking' as TabType, name: 'Theo dõi đơn hàng', icon: Search, color: 'purple' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      orange: isActive
        ? 'bg-orange-600 text-white'
        : 'text-orange-600 hover:bg-orange-50',
      blue: isActive
        ? 'bg-blue-600 text-white'
        : 'text-blue-600 hover:bg-blue-50',
      purple: isActive
        ? 'bg-purple-600 text-white'
        : 'text-purple-600 hover:bg-purple-50',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">GHN Shipping</h1>
                <p className="text-xs text-gray-500">Giao Hàng Nhanh</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${getColorClasses(
                    tab.color,
                    activeTab === tab.id
                  )}`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="hidden xl:inline">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pb-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${getColorClasses(
                    tab.color,
                    activeTab === tab.id
                  )}`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {tabs.find((t) => t.id === activeTab)?.name}
          </h2>
          <p className="text-gray-600">
            {activeTab === 'fee' && 'Tính toán chi phí vận chuyển dự kiến cho đơn hàng của bạn'}
            {activeTab === 'order' && 'Tạo đơn hàng giao hàng nhanh chỉ với vài bước đơn giản'}
            {activeTab === 'tracking' && 'Tra cứu và theo dõi trạng thái đơn hàng của bạn'}
          </p>
        </div>

        {activeTab === 'fee' && <ShippingFeeForm />}
        {activeTab === 'order' && <CreateOrderForm />}
        {activeTab === 'tracking' && <TrackingForm />}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            © 2026 GHN Shipping Demo - Giao Hàng Nhanh
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Demo website for frontend integration
          </p>
        </div>
      </footer>
    </div>
  );
}
