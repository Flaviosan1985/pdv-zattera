
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { Bike, CheckCircle, Clock, MapPin, DollarSign, AlertCircle, Phone, User, X } from 'lucide-react';

interface DeliveryDashboardProps {
  orders: Order[];
  onCompleteDelivery: (orderId: string) => void;
}

const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ orders, onCompleteDelivery }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter only orders that are currently out for delivery
  const deliveringOrders = orders.filter(o => o.status === 'DELIVERING' && o.orderType === 'DELIVERY');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleConfirm = () => {
    if (selectedOrder) {
      onCompleteDelivery(selectedOrder.id);
      setSelectedOrder(null);
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'Cartão de Crédito';
      case 'DEBIT_CARD': return 'Cartão de Débito';
      case 'PIX': return 'PIX';
      case 'CASH': return 'Dinheiro';
      default: return method;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Bike className="text-primary" size={32} />
          Painel de Entregas
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Acompanhe os pedidos que estão com os motoboys e faça a baixa após o retorno.
        </p>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6">
        {deliveringOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-200 p-6 rounded-full mb-4">
               <Bike size={48} className="opacity-40" />
            </div>
            <p className="text-lg font-medium">Nenhuma entrega em andamento.</p>
            <p className="text-sm">Os pedidos de delivery aparecerão aqui quando forem finalizados no caixa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deliveringOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-all">
                {/* Card Header */}
                <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Bike size={18} />
                      <span>{order.motoboyName || 'Motoboy não definido'}</span>
                    </div>
                    <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      Saiu às {formatTime(order.date)}
                    </div>
                  </div>
                  <span className="bg-white text-orange-600 border border-orange-200 text-xs font-bold px-2 py-1 rounded">
                    #{order.id.slice(0, 4)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-800 font-bold mb-1">
                      <User size={16} className="text-gray-400" />
                      {order.customerName}
                    </div>
                    {order.customerPhone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 ml-6">
                        <Phone size={12} />
                        {order.customerPhone}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{order.address?.street}, {order.address?.number}</p>
                        <p className="text-xs">{order.address?.neighborhood}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Valor Total</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-gray-500 uppercase font-bold">Pagamento</p>
                       <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-700">
                         {getPaymentLabel(order.paymentMethod)}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Baixar Entrega
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="bg-green-600 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle size={24} />
                  Conferir Entrega
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-white/20 rounded-full">
                  <X size={24} />
                </button>
             </div>

             <div className="p-6 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 mt-1 shrink-0" size={20} />
                  <p className="text-sm text-yellow-800">
                    Confira com o motoboy <strong>{selectedOrder.motoboyName}</strong> se o pagamento foi realizado corretamente e se o comprovante confere.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                     <span className="text-gray-600">Cliente</span>
                     <span className="font-bold text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                     <span className="text-gray-600">Forma de Pagamento</span>
                     <span className="font-bold text-gray-900">{getPaymentLabel(selectedOrder.paymentMethod)}</span>
                  </div>
                  {selectedOrder.paymentMethod === 'CASH' && (
                     <div className="flex justify-between border-b border-gray-100 pb-2 bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Troco necessário</span>
                        <span className="font-bold text-red-600">{formatCurrency(selectedOrder.changeNeeded || 0)}</span>
                     </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                     <span className="text-lg text-gray-600 font-bold">Valor Recebido</span>
                     <span className="text-3xl font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                   <button 
                     onClick={() => setSelectedOrder(null)}
                     className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={handleConfirm}
                     className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors"
                   >
                     Confirmar Baixa
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
