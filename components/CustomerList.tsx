
import React, { useState } from 'react';
import { Customer } from '../types';
import { Search, User, Phone, MapPin, ShoppingBag, Clock, PlusCircle } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelectCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
          <User className="text-primary" />
          Meus Clientes
        </h2>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Nome ou Telefone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900 font-bold text-lg"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center p-10 text-gray-500">
               <User size={48} className="mx-auto mb-2 opacity-20" />
               <p>Nenhum cliente encontrado.</p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div key={customer.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{customer.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone size={14} />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onSelectCustomer(customer)}
                      className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                    >
                      <PlusCircle size={16} /> Novo Pedido
                    </button>
                 </div>

                 {customer.address && (
                   <div className="mb-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                     <div className="flex items-start gap-1">
                       <MapPin size={12} className="mt-0.5 shrink-0" />
                       <span className="line-clamp-2">
                         {customer.address.street}, {customer.address.number} - {customer.address.neighborhood}
                       </span>
                     </div>
                   </div>
                 )}

                 <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <div className="flex flex-col">
                       <span className="flex items-center gap-1 mb-0.5"><ShoppingBag size={12}/> {customer.totalOrders} Pedidos</span>
                       <span className="font-bold text-green-600">{formatCurrency(customer.totalSpent)}</span>
                    </div>
                    {customer.lastOrderDate && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </div>
                    )}
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
