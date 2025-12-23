
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ChefHat, Settings, Monitor, Truck, LogOut, DollarSign, History, Users, Bike } from 'lucide-react';
import { MENU_ITEMS } from './constants';
// Added Customer to the imports from ./types
import { Product, ProductCategory, CartItem, PizzaSize, OrderAnalysisResult, Address, Order, RegisterSession, PrinterSettings, User, StoreConfig, OrderType, Motoboy, PaymentPart, Customer } from './types';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import SmartOrderModal from './components/SmartOrderModal';
import CheckoutModal from './components/CheckoutModal';
import PrintReceiptModal from './components/PrintReceiptModal';
import HalfAndHalfModal from './components/HalfAndHalfModal';
import AdminPanel from './components/AdminPanel';
import OrderHistory from './components/OrderHistory';
import Receipt from './components/Receipt';
import RegisterModal from './components/RegisterModal';
import LoginScreen from './components/LoginScreen';
import DeliveryFeesModal from './components/DeliveryFeesModal';
import CustomerList from './components/CustomerList';
import DeliveryDashboard from './components/DeliveryDashboard';

const generateId = () => Math.random().toString(36).substr(2, 9);
type ViewMode = 'POS' | 'ADMIN' | 'HISTORY' | 'CLIENTS' | 'DELIVERY_DASHBOARD';

const DEFAULT_USERS: User[] = [{ id: 'admin', name: 'Administrador', password: '123', role: 'ADMIN' }];
const DEFAULT_CATEGORIES = [ProductCategory.PIZZA, ProductCategory.SWEET_PIZZA, ProductCategory.DRINK, ProductCategory.DESSERT];

const DEFAULT_STORE_CONFIG: StoreConfig = {
  name: 'PizzaAI PDV',
  logo: '', cnpj: '', phone: '', address: '',
  deliveryFees: [
    { id: 'f1', neighborhood: 'Jardim das flores', price: 4.00 },
    { id: 'f2', neighborhood: 'Ribamar', price: 3.00 },
    { id: 'f3', neighborhood: 'Romar', price: 4.00 },
    { id: 'f4', neighborhood: 'Jangada', price: 3.00 },
    { id: 'f5', neighborhood: 'São João Batista', price: 4.00 },
    { id: 'f6', neighborhood: 'Park D\'Ávila', price: 4.00 },
    { id: 'f7', neighborhood: 'Estação', price: 5.00 },
    { id: 'f8', neighborhood: 'Florida', price: 5.00 },
    { id: 'f9', neighborhood: 'Itatins', price: 5.00 },
    { id: 'f10', neighborhood: 'Manacá dos itatins', price: 5.00 },
    { id: 'f11', neighborhood: 'Jardim Brasil', price: 5.00 },
    { id: 'f12', neighborhood: 'Estância dos eucaliptos', price: 6.00 },
    { id: 'f13', neighborhood: 'Santa Isabel', price: 6.00 },
    { id: 'f14', neighborhood: 'Arpoador', price: 5.00 },
    { id: 'f15', neighborhood: 'Samburá', price: 5.00 },
    { id: 'f16', neighborhood: 'Bougainville 4', price: 8.00 },
    { id: 'f17', neighborhood: 'Casa Blanca', price: 7.00 },
    { id: 'f18', neighborhood: 'Centro', price: 5.00 },
    { id: 'f19', neighborhood: 'Pérola negra', price: 8.00 },
    { id: 'f20', neighborhood: 'Caraguava antes da pista', price: 6.00 },
    { id: 'f21', neighborhood: 'Caraguava depois da pista', price: 8.00 },
    { id: 'f22', neighborhood: 'Jardim imperador', price: 5.00 },
    { id: 'f23', neighborhood: 'Nova Peruíbe', price: 5.00 },
    { id: 'f24', neighborhood: 'Jd Peruíbe', price: 4.00 },
    { id: 'f25', neighborhood: 'Oásis', price: 7.00 },
    { id: 'f26', neighborhood: 'Parque turístico', price: 7.00 },
    { id: 'f27', neighborhood: 'Jd Márcia', price: 7.00 },
    { id: 'f28', neighborhood: 'São José', price: 8.00 },
    { id: 'f29', neighborhood: 'Stella Maris', price: 4.00 },
    { id: 'f30', neighborhood: 'Veneza', price: 5.00 },
    { id: 'f31', neighborhood: 'Ruína', price: 10.00 },
  ],
  fiscalModule: 'NONE',
  nfce: { environment: 'HOMOLOGATION', csc: '', cscId: '000001' },
  sat: { activationCode: '00000000', signAC: '', isSimulation: true }
};

function App() {
  const [products, setProducts] = useState<Product[]>(MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('pizzaai_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [registerSession, setRegisterSession] = useState<RegisterSession | null>(() => {
    const saved = localStorage.getItem('pizzaai_register_session');
    if (!saved) return null;
    const sess = JSON.parse(saved);
    return { ...sess, openedAt: new Date(sess.openedAt) };
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pizzaai_orders');
    return saved ? JSON.parse(saved).map((o: any) => ({ ...o, date: new Date(o.date) })) : [];
  });
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pizzaai_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('pizzaai_store_config');
    return saved ? JSON.parse(saved) : DEFAULT_STORE_CONFIG;
  });

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(() => {
    const saved = localStorage.getItem('pizzaai_printer_settings');
    return saved ? JSON.parse(saved) : { printerName: '', paperWidth: '80mm', isInstalled: false };
  });

  // Fixed: Customer type is now available via import
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pizzaai_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [motoboys, setMotoboys] = useState<Motoboy[]>(() => {
    const saved = localStorage.getItem('pizzaai_motoboys');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewMode, setViewMode] = useState<ViewMode>('POS');
  const [isSmartOrderOpen, setIsSmartOrderOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isHalfAndHalfOpen, setIsHalfAndHalfOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDeliveryFeesModalOpen, setIsDeliveryFeesModalOpen] = useState(false);
  // Fixed: Customer type is now available via import
  const [pendingCustomer, setPendingCustomer] = useState<Customer | null>(null);
  const [halfAndHalfSlots, setHalfAndHalfSlots] = useState<number>(2);

  useEffect(() => { localStorage.setItem('pizzaai_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('pizzaai_register_session', JSON.stringify(registerSession)); }, [registerSession]);
  useEffect(() => { localStorage.setItem('pizzaai_store_config', JSON.stringify(storeConfig)); }, [storeConfig]);
  useEffect(() => { localStorage.setItem('pizzaai_customers', JSON.stringify(customers)); }, [customers]);

  const handleCheckoutConfirm = (
    orderType: OrderType,
    customerName: string,
    customerPhone: string,
    payments: PaymentPart[],
    address: Address | undefined, 
    deliveryFee: number,
    motoboyId?: string,
    customerId?: string,
    splitPeople?: number
  ) => {
    const subtotal = cart.reduce((sum, item) => {
      let p = item.selectedSize === PizzaSize.SMALL ? (item.product.priceSmall || item.product.price * 0.8) : item.product.price;
      return sum + (p * item.quantity);
    }, 0);

    const total = subtotal + deliveryFee;
    const motoboy = motoboys.find(m => m.id === motoboyId);
    
    const newOrder: Order = {
      id: generateId(), customerName, customerPhone, customerId, motoboyId, motoboyName: motoboy?.name,
      orderType, status: orderType === 'DELIVERY' ? 'DELIVERING' : 'COMPLETED',
      items: [...cart], total, subtotal, deliveryFee, paymentMethod: payments[0]?.method || 'CASH',
      payments, address, date: new Date(), splitPeople
    };

    setOrders([newOrder, ...orders]);
    setLastOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setPendingCustomer(null);

    if (customerPhone) {
      const existing = customers.find(c => c.phone === customerPhone);
      if (existing) {
        setCustomers(customers.map(c => c.phone === customerPhone ? { ...c, name: customerName, address: address || c.address } : c));
      } else {
        setCustomers([{ id: generateId(), name: customerName, phone: customerPhone, address, totalOrders: 1, totalSpent: total }, ...customers]);
      }
    }
    setIsPrintModalOpen(true);
  };

  const handleSmartOrderConfirm = (result: OrderAnalysisResult, autoPrint: boolean) => {
    const newItems: CartItem[] = result.items.map(aiItem => {
      const product = products.find(p => p.id === aiItem.productId);
      return {
        cartId: generateId(),
        product: product || products[0],
        quantity: aiItem.quantity,
        selectedSize: aiItem.size || PizzaSize.LARGE
      };
    });
    setCart(newItems);

    if (autoPrint && result.address && result.paymentMethod) {
       const fee = storeConfig.deliveryFees.find(f => f.neighborhood.toLowerCase() === result.address?.neighborhood.toLowerCase())?.price || 0;
       const payments: PaymentPart[] = [{
         method: result.paymentMethod,
         amount: newItems.reduce((acc, i) => acc + (i.selectedSize === PizzaSize.SMALL ? (i.product.priceSmall || i.product.price*0.8) : i.product.price) * i.quantity, 0) + fee
       }];
       handleCheckoutConfirm(result.orderType || 'DELIVERY', result.customerName || 'Cliente IA', result.customerPhone || '', payments, result.address, fee);
    } else {
       setPendingCustomer({ id: 'ai-pending', name: result.customerName || '', phone: result.customerPhone || '', address: result.address, totalOrders: 0, totalSpent: 0 });
       setIsCheckoutOpen(true);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!currentUser) return <LoginScreen users={users} onLogin={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-dark-900 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-[280px] bg-dark-800 border-r border-dark-700 flex flex-col shadow-2xl shrink-0">
        <div className="p-8 flex items-center gap-4 border-b border-dark-700 mb-6">
          <ChefHat size={36} className="text-primary" />
          <h1 className="hidden md:block font-black text-2xl tracking-tighter uppercase italic">PizzaAI</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {[
            { id: 'POS', icon: Monitor, label: 'PDV / Caixa' },
            { id: 'DELIVERY_DASHBOARD', icon: Bike, label: 'Entregas' },
            { id: 'HISTORY', icon: History, label: 'Relatórios' },
            { id: 'CLIENTS', icon: Users, label: 'Clientes' },
            { id: 'ADMIN', icon: Settings, label: 'Configurações', role: 'ADMIN' }
          ].map(item => {
            const Icon = item.icon;
            return (item.role === 'ADMIN' && currentUser.role !== 'ADMIN') ? null : (
              <button key={item.id} onClick={() => setViewMode(item.id as ViewMode)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all text-base uppercase tracking-tight ${viewMode === item.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
                <Icon size={24} /> <span className="hidden md:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-6 border-t border-dark-700 space-y-3">
          <button onClick={() => setIsRegisterModalOpen(true)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-base uppercase tracking-tight ${registerSession ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}><DollarSign size={24} /> <span className="hidden md:block">{registerSession ? 'Caixa Aberto' : 'Caixa Fechado'}</span></button>
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-gray-500 hover:text-red-500 hover:bg-red-500/10 uppercase tracking-tight"><LogOut size={24} /><span className="hidden md:block">Sair</span></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-gray-50 text-gray-900 overflow-hidden relative">
        {viewMode === 'POS' ? (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="bg-white border-b border-gray-200 p-6 shadow-sm shrink-0">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    <input type="text" placeholder="Buscar sabor, código ou descrição..." className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-lg font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setHalfAndHalfSlots(2); setIsHalfAndHalfOpen(true); }} className="px-6 py-4 bg-orange-100 text-primary rounded-2xl font-black text-lg uppercase tracking-widest shadow-sm hover:bg-orange-200 transition-colors">1/2</button>
                    <button onClick={() => setIsSmartOrderOpen(true)} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center gap-3 group uppercase tracking-widest transition-all hover:scale-105"><Sparkles size={24} className="group-hover:rotate-12 transition-transform"/> IA ATENDENTE</button>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 overflow-x-auto pb-2 no-scrollbar">
                  <button onClick={() => setActiveCategory('Todos')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all shrink-0 ${activeCategory === 'Todos' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>Todos</button>
                  {categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all shrink-0 ${activeCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>{cat}</button>)}
                </div>
              </header>
              {/* Product Grid - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={(p, s) => setCart([...cart, { cartId: generateId(), product: p, quantity: 1, selectedSize: s || PizzaSize.LARGE }])} />)}
                </div>
              </div>
            </div>
            <aside className="w-[400px] border-l border-gray-200 bg-white shrink-0 hidden xl:block shadow-2xl">
              <CartSidebar items={cart} onUpdateQuantity={(id, d) => setCart(cart.map(i => i.cartId === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} onRemove={id => setCart(cart.filter(i => i.cartId !== id))} onCheckout={() => setIsCheckoutOpen(true)} isRegisterOpen={!!registerSession} />
            </aside>
          </div>
        ) : (
          /* Scrollable wrapper for other views */
          <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
            {viewMode === 'ADMIN' && <AdminPanel products={products} onAddProduct={p => setProducts([...products, p])} onUpdateProduct={(id, p) => setProducts(products.map(old => old.id === id ? p : old))} onDeleteProduct={id => setProducts(products.filter(p => p.id !== id))} categories={categories} onAddCategory={c => setCategories([...categories, c])} onDeleteCategory={c => setCategories(categories.filter(old => old !== c))} printerSettings={printerSettings} onUpdatePrinterSettings={setPrinterSettings} storeConfig={storeConfig} onUpdateStoreConfig={setStoreConfig} users={users} onAddUser={u => setUsers([...users, u])} onDeleteUser={id => setUsers(users.filter(u => u.id !== id))} motoboys={motoboys} onAddMotoboy={m => setMotoboys([...motoboys, m])} onDeleteMotoboy={id => setMotoboys(motoboys.filter(m => m.id !== id))} orders={orders} onTestPrint={() => window.print()} />}
            {viewMode === 'HISTORY' && <OrderHistory orders={orders} storeConfig={storeConfig} onPrintOrder={o => { setLastOrder(o); setTimeout(() => window.print(), 100); }} />}
            {viewMode === 'CLIENTS' && <CustomerList customers={customers} onSelectCustomer={c => { setPendingCustomer(c); setViewMode('POS'); setIsCheckoutOpen(true); }} />}
            {viewMode === 'DELIVERY_DASHBOARD' && <DeliveryDashboard orders={orders} onCompleteDelivery={id => setOrders(orders.map(o => o.id === id ? { ...o, status: 'COMPLETED' } : o))} />}
          </div>
        )}
      </main>

      <SmartOrderModal isOpen={isSmartOrderOpen} onClose={() => setIsSmartOrderOpen(false)} onConfirmOrder={handleSmartOrderConfirm} products={products} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} total={cart.reduce((s, i) => s + (i.selectedSize === PizzaSize.SMALL ? (i.product.priceSmall || i.product.price*0.8) : i.product.price) * i.quantity, 0)} onConfirm={handleCheckoutConfirm} deliveryFees={storeConfig.deliveryFees} customers={customers} motoboys={motoboys} initialCustomer={pendingCustomer} />
      <PrintReceiptModal order={lastOrder} storeConfig={storeConfig} isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} />
      <HalfAndHalfModal isOpen={isHalfAndHalfOpen} onClose={() => setIsHalfAndHalfOpen(false)} products={products} onConfirm={(f, s) => setCart([...cart, { cartId: generateId(), product: f[0], secondProduct: f[1], isHalfAndHalf: true, quantity: 1, selectedSize: s }])} maxSlots={halfAndHalfSlots} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} session={registerSession} orders={orders} onOpenRegister={f => setRegisterSession({ isOpen: true, openedAt: new Date(), initialFloat: f })} onCloseRegister={() => setRegisterSession(null)} />
      <DeliveryFeesModal isOpen={isDeliveryFeesModalOpen} onClose={() => setIsDeliveryFeesModalOpen(false)} fees={storeConfig.deliveryFees} />
      <Receipt order={lastOrder} storeConfig={storeConfig} />
      <button id="print-trigger" style={{ display: 'none' }} onClick={() => window.print()}></button>
    </div>
  );
}

export default App;
