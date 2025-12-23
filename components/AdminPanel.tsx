
import React, { useState } from 'react';
import { 
  Package, Users, Settings, Bike, Plus, Trash2, Edit, X, 
  Store, Printer, FileText, MapPin, List, Download, Loader, CheckCircle, Upload, Image as ImageIcon, Bot, DollarSign
} from 'lucide-react';
import { Product, User, Motoboy, StoreConfig, PrinterSettings, DeliveryFee } from '../types';
import { SatService } from '../services/satService';
import PrinterHelpModal from './PrinterHelpModal';

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (id: string, product: Product) => void;
  onDeleteProduct: (id: string) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  printerSettings: PrinterSettings;
  onUpdatePrinterSettings: (settings: PrinterSettings) => void;
  storeConfig: StoreConfig;
  onUpdateStoreConfig: (config: StoreConfig) => void;
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  motoboys: Motoboy[];
  onAddMotoboy: (motoboy: Motoboy) => void;
  onDeleteMotoboy: (id: string) => void;
  orders: any[]; 
  onTestPrint?: () => void; 
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  products, onAddProduct, onUpdateProduct, onDeleteProduct,
  categories, onAddCategory, onDeleteCategory,
  printerSettings, onUpdatePrinterSettings,
  storeConfig, onUpdateStoreConfig,
  users, onAddUser, onDeleteUser,
  motoboys, onAddMotoboy, onDeleteMotoboy,
  onTestPrint
}) => {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'USERS' | 'MOTOBOYS' | 'CONFIG'>('PRODUCTS');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({ id: '', name: '', description: '', price: 0, category: 'Pizza', image: '' });
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newUser, setNewUser] = useState({ name: '', password: '', role: 'CASHIER' as const });
  const [newMotoboy, setNewMotoboy] = useState({ name: '' });
  const [newFee, setNewFee] = useState({ neighborhood: '', price: 0 });
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installStep, setInstallStep] = useState<'IDLE' | 'SEARCHING' | 'SELECT' | 'SUCCESS'>('IDLE');
  const [availablePrinters, setAvailablePrinters] = useState<any[]>([]);
  const [showPrinterHelp, setShowPrinterHelp] = useState(false);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;
    const finalId = productForm.id || Math.random().toString(36).substr(2, 9);
    const finalImage = productForm.image || 'https://via.placeholder.com/400x300?text=Sem+Imagem';
    const productToSave = { ...productForm, id: finalId, image: finalImage } as Product;
    if (editingProduct) onUpdateProduct(editingProduct.id, productToSave);
    else onAddProduct(productToSave);
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => reader.result && setProductForm({ ...productForm, image: reader.result.toString() });
      reader.readAsDataURL(file);
    }
  };

  const handleAddDeliveryFee = () => {
    if (!newFee.neighborhood) return;
    const newFees = [...storeConfig.deliveryFees, { id: Math.random().toString(36).substr(2, 9), ...newFee }];
    onUpdateStoreConfig({ ...storeConfig, deliveryFees: newFees });
    setNewFee({ neighborhood: '', price: 0 });
  };

  const handleRemoveDeliveryFee = (id: string) => {
     const newFees = storeConfig.deliveryFees.filter(f => f.id !== id);
     onUpdateStoreConfig({ ...storeConfig, deliveryFees: newFees });
  };

  const startPrinterInstall = async () => {
    setShowInstallModal(true);
    setInstallStep('SEARCHING');
    setTimeout(() => {
       setAvailablePrinters([{ name: 'POS-80 Printer (Simulada)', isDefault: true }, { name: 'Microsoft Print to PDF', isDefault: false }]);
       setInstallStep('SELECT');
    }, 1500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Painel Administrativo</h1>
          <p className="text-gray-500 font-bold mt-1">Gerencie produtos, usuários e configurações da loja.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-b-2 border-gray-100 pb-2">
        {[
          { id: 'PRODUCTS', icon: Package, label: 'Meu Cardápio' },
          { id: 'USERS', icon: Users, label: 'Equipe' },
          { id: 'MOTOBOYS', icon: Bike, label: 'Entregadores' },
          { id: 'CONFIG', icon: Settings, label: 'Configurações' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-tight transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
            <tab.icon size={22} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'PRODUCTS' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-50">
             <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Gerenciar Itens</h2>
             <div className="flex gap-4">
                <button onClick={() => setIsCategoryManageOpen(!isCategoryManageOpen)} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-black uppercase text-sm border-2 border-gray-200">Categorias</button>
                <button onClick={() => { setEditingProduct(null); setProductForm({ id: '', name: '', description: '', price: 0, category: 'Pizza', image: '' }); setIsProductFormOpen(true); }} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-sm shadow-lg shadow-primary/20">Novo Produto</button>
             </div>
           </div>

           {isProductFormOpen && (
             <form onSubmit={handleSaveProduct} className="bg-white p-10 rounded-3xl shadow-2xl border-4 border-primary/10 space-y-8 animate-in fade-in slide-in-from-top-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-500 uppercase">Nome do Produto</label>
                    <input className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-primary outline-none font-bold text-lg" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-500 uppercase">Preço Venda (R$)</label>
                    <input type="number" step="0.01" className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-primary outline-none font-bold text-lg" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} required />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                     <div className="w-32 h-32 bg-white rounded-2xl border-2 overflow-hidden flex items-center justify-center shrink-0">
                        {productForm.image ? <img src={productForm.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={48} />}
                     </div>
                     <div className="flex-1 space-y-4">
                        <input type="file" id="up-img" onChange={handleImageUpload} className="hidden" />
                        <label htmlFor="up-img" className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl font-black uppercase text-sm cursor-pointer hover:border-primary transition-colors">Carregar Foto</label>
                        <p className="text-xs text-gray-400 font-bold uppercase">Ou cole um link abaixo:</p>
                        <input className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm" placeholder="https://..." value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} />
                     </div>
                  </div>
                </div>
                <div className="flex gap-4 justify-end pt-4">
                   <button type="button" onClick={() => setIsProductFormOpen(false)} className="px-8 py-4 text-gray-500 font-black uppercase tracking-widest hover:bg-gray-100 rounded-2xl">Cancelar</button>
                   <button type="submit" className="px-12 py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700">Salvar Item</button>
                </div>
             </form>
           )}

           <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-50 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b-2 border-gray-100">
                 <tr>
                   <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Produto</th>
                   <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                   <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Preço</th>
                   <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {products.map(p => (
                   <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                     <td className="p-6">
                        <div className="flex items-center gap-4">
                           <img src={p.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                           <div>
                              <p className="font-black text-gray-900 uppercase tracking-tight">{p.name}</p>
                              <p className="text-xs text-gray-400 font-bold">#{p.id}</p>
                           </div>
                        </div>
                     </td>
                     <td className="p-6"><span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-black uppercase">{p.category}</span></td>
                     <td className="p-6 font-black text-gray-900 text-lg">R$ {p.price.toFixed(2)}</td>
                     <td className="p-6 text-right space-x-2">
                       <button onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductFormOpen(true); }} className="text-blue-500 hover:bg-blue-50 p-3 rounded-2xl transition-colors"><Edit size={24}/></button>
                       <button onClick={() => onDeleteProduct(p.id)} className="text-red-500 hover:bg-red-50 p-3 rounded-2xl transition-colors"><Trash2 size={24}/></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'CONFIG' && (
        <div className="space-y-10">
           <section className="bg-white p-10 rounded-3xl shadow-sm border-2 border-gray-50 space-y-8">
             <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3"><Store className="text-primary" size={28}/> Dados da Loja</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="text-xs font-black text-gray-400 uppercase">Nome Comercial</label>
                 <input className="w-full border-2 border-gray-100 p-4 rounded-2xl font-bold text-lg outline-none focus:border-primary" value={storeConfig.name} onChange={e => onUpdateStoreConfig({...storeConfig, name: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black text-gray-400 uppercase">Endereço Completo</label>
                 <input className="w-full border-2 border-gray-100 p-4 rounded-2xl font-bold text-lg outline-none focus:border-primary" value={storeConfig.address} onChange={e => onUpdateStoreConfig({...storeConfig, address: e.target.value})} />
               </div>
             </div>
           </section>

           <section className="bg-white p-10 rounded-3xl shadow-sm border-2 border-gray-50 space-y-8">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
                  <MapPin className="text-primary" size={28}/> Taxas de Entrega
                </h3>
             </div>
             
             <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
               <div className="flex-1 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Bairro</label>
                 <input 
                   placeholder="Ex: Jardim das Flores" 
                   className="w-full border-2 border-gray-200 p-4 rounded-2xl font-bold outline-none focus:border-primary bg-white" 
                   value={newFee.neighborhood} 
                   onChange={e => setNewFee({...newFee, neighborhood: e.target.value})}
                 />
               </div>
               <div className="w-full md:w-48 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Valor (R$)</label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">R$</span>
                    <input 
                      placeholder="0,00" 
                      type="number"
                      className="w-full border-2 border-gray-200 pl-11 pr-4 py-4 rounded-2xl font-bold outline-none focus:border-primary bg-white" 
                      value={newFee.price || ''} 
                      onChange={e => setNewFee({...newFee, price: parseFloat(e.target.value)})}
                    />
                 </div>
               </div>
               <button 
                 onClick={handleAddDeliveryFee} 
                 className="mt-auto py-4 px-8 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"
               >
                 Adicionar Bairro
               </button>
             </div>

             <div className="border-2 border-gray-100 rounded-3xl overflow-hidden bg-white">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 border-b-2 border-gray-100">
                   <tr>
                     <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Bairro</th>
                     <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Valor da Entrega</th>
                     <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Remover</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {storeConfig.deliveryFees.length === 0 ? (
                     <tr>
                       <td colSpan={3} className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                         Nenhum bairro cadastrado.
                       </td>
                     </tr>
                   ) : (
                     storeConfig.deliveryFees.map(f => (
                       <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                         <td className="p-6 font-black text-gray-800 uppercase text-lg">{f.neighborhood}</td>
                         <td className="p-6 font-black text-green-600 text-xl">{formatCurrency(f.price)}</td>
                         <td className="p-6 text-right">
                           <button 
                             onClick={() => handleRemoveDeliveryFee(f.id)} 
                             className="text-red-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-2xl transition-all"
                           >
                             <Trash2 size={24}/>
                           </button>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           </section>

           <section className="bg-white p-10 rounded-3xl shadow-sm border-2 border-gray-50 space-y-8">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3"><Printer className="text-primary" size={28}/> Impressora Térmica</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowPrinterHelp(true)}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-sm shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    <Bot size={20} /> Ajuda com IA
                  </button>
                  <button 
                    onClick={startPrinterInstall} 
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-sm shadow-lg shadow-blue-100"
                  >
                    Configurar Dispositivo
                  </button>
                </div>
             </div>
             <div className="bg-gray-50 p-8 rounded-3xl border-2 border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hardware Vinculado</p>
                  <p className="text-2xl font-black text-gray-800">{printerSettings.printerName || 'Nenhuma impressora selecionada'}</p>
                </div>
                {printerSettings.isInstalled && (
                  <div className="bg-green-500 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 flex items-center gap-2">
                    <CheckCircle size={16} /> Impressora Ativa
                  </div>
                )}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Largura do Papel</label>
                 <select 
                   className="w-full border-2 border-gray-200 p-4 rounded-2xl font-bold text-lg bg-white outline-none focus:border-primary" 
                   value={printerSettings.paperWidth} 
                   onChange={e => onUpdatePrinterSettings({...printerSettings, paperWidth: e.target.value as any})}
                 >
                   <option value="80mm">80mm (Padrão POS-80)</option>
                   <option value="58mm">58mm (Portátil)</option>
                 </select>
               </div>
             </div>
           </section>
        </div>
      )}

      {/* Printer Install Wizard Modal */}
      {showInstallModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-0 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-3 uppercase tracking-tighter">
                   <Download className="text-blue-600" /> Instalação de Impressora
                </h3>
                <button onClick={() => setShowInstallModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={28} />
                </button>
              </div>
              
              <div className="p-10 text-center flex-1 flex flex-col justify-center items-center">
                 {installStep === 'SEARCHING' && (
                   <div className="space-y-6">
                     <Loader size={64} className="animate-spin text-blue-600 mx-auto" />
                     <p className="text-xl font-black text-gray-700 uppercase tracking-tight">Escaneando Portas USB...</p>
                   </div>
                 )}

                 {installStep === 'SELECT' && (
                    <div className="w-full space-y-6 animate-in fade-in zoom-in">
                       <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Dispositivos Encontrados</p>
                       <div className="max-h-72 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                          {availablePrinters.map((p, idx) => (
                             <button
                               key={idx}
                               onClick={() => {
                                 onUpdatePrinterSettings({
                                   printerName: p.name,
                                   paperWidth: '80mm',
                                   isInstalled: true
                                 });
                                 setInstallStep('SUCCESS');
                               }}
                               className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl flex items-center gap-4 hover:border-primary hover:bg-orange-50 transition-all text-left group"
                             >
                                <div className="bg-white p-3 rounded-xl text-gray-400 group-hover:text-primary transition-colors shadow-sm">
                                   <Printer size={24} />
                                </div>
                                <div className="flex-1">
                                   <p className="font-black text-gray-800 text-lg uppercase tracking-tight">{p.name}</p>
                                   {p.isDefault && <span className="text-[10px] text-primary font-black uppercase tracking-widest">Hardware Padrão</span>}
                                </div>
                             </button>
                          ))}
                       </div>
                    </div>
                 )}

                 {installStep === 'SUCCESS' && (
                    <div className="space-y-6 animate-in fade-in zoom-in">
                       <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle size={48} className="text-green-600" />
                       </div>
                       <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Vinculado com Sucesso!</h4>
                       <p className="text-gray-500 font-medium px-4">
                          O dispositivo está pronto para realizar impressões automáticas de pedidos e relatórios.
                       </p>
                       <button 
                         onClick={() => setShowInstallModal(false)}
                         className="px-12 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 mt-6 uppercase tracking-widest"
                       >
                         Concluir
                       </button>
                    </div>
                 )}
              </div>
           </div>
         </div>
      )}

      {/* AI Helper Modal */}
      <PrinterHelpModal 
        isOpen={showPrinterHelp} 
        onClose={() => setShowPrinterHelp(false)} 
      />
    </div>
  );
};

export default AdminPanel;
