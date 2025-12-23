
import React, { useState } from 'react';
import { X, Search, MapPin, Truck } from 'lucide-react';
import { DeliveryFee } from '../types';

interface DeliveryFeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  fees: DeliveryFee[];
}

const DeliveryFeesModal: React.FC<DeliveryFeesModalProps> = ({ isOpen, onClose, fees }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredFees = fees.filter(fee => 
    fee.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-primary p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Truck size={24} className="text-white" />
              Taxas de Entrega
            </h2>
            <p className="text-orange-100 text-sm opacity-90">Consulte os valores por bairro</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-800"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {fees.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>Nenhuma taxa cadastrada no sistema.</p>
              <p className="text-xs mt-1">Vá em Admin &gt; Configurações para cadastrar.</p>
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>Nenhum bairro encontrado com "{searchTerm}".</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFees.map((fee) => (
                <div key={fee.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2 rounded-full text-primary">
                      <MapPin size={16} />
                    </div>
                    <span className="font-medium text-gray-800 uppercase text-sm">{fee.neighborhood}</span>
                  </div>
                  <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                    {formatCurrency(fee.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
           <button 
             onClick={onClose}
             className="w-full py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
           >
             Fechar
           </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryFeesModal;
