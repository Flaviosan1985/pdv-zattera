
import React, { useState } from 'react';
import { Order, PaymentMethod, StoreConfig } from '../types';
import { Calendar, Filter, Search, DollarSign, CreditCard, Banknote, QrCode, FileText, Printer, Truck, Store, AlertCircle, CheckCircle } from 'lucide-react';

interface OrderHistoryProps {
  orders: Order[];
  onPrintOrder?: (order: Order) => void;
  onEmitFiscal?: (order: Order) => void;
  storeConfig?: StoreConfig;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onPrintOrder, onEmitFiscal, storeConfig }) => {
  // Default to today string YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  const [dateFilter, setDateFilter] = useState<string>(today);
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'CREDIT_CARD': return <CreditCard size={16} className="text-blue-400" />;
      case 'DEBIT_CARD': return <CreditCard size={16} className="text-orange-400" />;
      case 'PIX': return <QrCode size={16} className="text-green-400" />;
      case 'CASH': return <Banknote size={16} className="text-green-600" />;
    }
  };

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'CREDIT_CARD': return 'Crédito';
      case 'DEBIT_CARD': return 'Débito';
      case 'PIX': return 'Pix';
      case 'CASH': return 'Dinheiro';
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const orderDate = order.date.toISOString().split('T')[0];
    const matchesDate = !dateFilter || orderDate === dateFilter;
    const matchesPayment = paymentFilter === 'ALL' || order.paymentMethod === paymentFilter;
    
    // Safety check for address access since it might be undefined for PICKUP
    const addressMatch = order.address 
      ? (order.address.street.toLowerCase().includes(searchTerm.toLowerCase()) || 
         order.address.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
      : false;

    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addressMatch;

    return matchesDate && matchesPayment && matchesSearch;
  });

  // Totals for filtered view
  const totalRevenue = filteredOrders.reduce((acc, curr) => acc + curr.total, 0);
  const totalOrders = filteredOrders.length;

  const fiscalModule = storeConfig?.fiscalModule || 'NONE';

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="text-primary" />
            Histórico de Pedidos
          </h2>
          <div className="flex gap-4">
             {/* Summary Cards */}
             <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex flex-col items-end">
                <span className="text-xs text-blue-600 font-bold uppercase">Qtd. Pedidos</span>
                <span className="text-xl font-bold text-blue-900">{totalOrders}</span>
             </div>
             <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex flex-col items-end">
                <span className="text-xs text-green-600 font-bold uppercase">Total Vendido</span>
                <span className="text-xl font-bold text-green-900">{formatCurrency(totalRevenue)}</span>
             </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
            <Calendar size={18} className="text-gray-500" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
            <Filter size={18} className="text-gray-500" />
            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentMethod | 'ALL')}
              className="outline-none text-sm text-gray-700 bg-transparent min-w-[120px]"
            >
              <option value="ALL">Todos Pgto</option>
              <option value="CREDIT_CARD">Crédito</option>
              <option value="DEBIT_CARD">Débito</option>
              <option value="PIX">Pix</option>
              <option value="CASH">Dinheiro</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
            <Search size={18} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por ID, Nome ou Endereço..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
            />
          </div>

          {/* Clear Filters */}
          {(dateFilter !== today || paymentFilter !== 'ALL' || searchTerm !== '') && (
             <button 
                onClick={() => {
                  setDateFilter(today);
                  setPaymentFilter('ALL');
                  setSearchTerm('');
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium px-2"
             >
               Limpar
             </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID / Tipo</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Itens</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Fiscal</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={48} className="opacity-20" />
                      <p>Nenhum pedido encontrado com estes filtros.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4 align-top">
                      <div className="font-mono text-xs text-gray-400">#{order.id.slice(0,6).toUpperCase()}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs font-bold text-gray-600">
                        {order.orderType === 'DELIVERY' ? <Truck size={12}/> : <Store size={12}/>}
                        {order.orderType === 'DELIVERY' ? 'ENTREGA' : 'RETIRA'}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatTime(order.date)}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-sm font-bold text-gray-900 line-clamp-1">
                        {order.customerName || 'Cliente Balcão'}
                      </div>
                      {order.address && (
                        <div className="text-xs text-gray-500 mt-1">
                          {order.address.street}, {order.address.number} <br/>
                          {order.address.neighborhood}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-sm text-gray-700">
                        {order.items.length} itens
                      </div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                        {order.items.map(i => {
                          const size = i.selectedSize ? `(${i.selectedSize})` : '';
                          return `${i.quantity}x ${i.product.name} ${size}`;
                        }).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {getPaymentIcon(order.paymentMethod)}
                        <span>{getPaymentLabel(order.paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="font-bold text-primary">
                        {formatCurrency(order.total)}
                      </div>
                    </td>
                    <td className="p-4 align-top text-center">
                       {fiscalModule !== 'NONE' ? (
                          order.satCfeId ? (
                             <div className="flex flex-col items-center text-green-600" title="Fiscal Emitido">
                               <CheckCircle size={18} />
                               <span className="text-[10px] font-bold mt-1">EMITIDO</span>
                             </div>
                          ) : (
                             onEmitFiscal && (
                               <button 
                                 onClick={() => onEmitFiscal(order)}
                                 className="flex flex-col items-center text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 p-2 rounded-lg border border-red-200"
                                 title="Emitir Cupom Fiscal Agora"
                               >
                                  <AlertCircle size={16} />
                                  <span className="text-[10px] font-bold mt-1">PENDENTE</span>
                               </button>
                             )
                          )
                       ) : (
                         <span className="text-gray-300 text-xs">-</span>
                       )}
                    </td>
                    <td className="p-4 align-top text-center">
                       {onPrintOrder && (
                         <button 
                            onClick={() => onPrintOrder(order)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                            title="Imprimir Recibo"
                         >
                           <Printer size={18} />
                         </button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
