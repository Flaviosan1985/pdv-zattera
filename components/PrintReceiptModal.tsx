import React from 'react';
import { Order, StoreConfig } from '../types';

interface PrintReceiptModalProps {
  order: Order | null;
  storeConfig: StoreConfig;
  isOpen: boolean;
  onClose: () => void;
}

const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  order,
  storeConfig,
  isOpen,
  onClose
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    // Importar dinamicamente para evitar problemas de build
    import('../services/printService').then(({ imprimirCupomExato }) => {
      imprimirCupomExato(order, storeConfig);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Imprimir Cupom</h2>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">Pedido: #{order.id.slice(-4).toUpperCase()}</p>
          <p className="text-gray-600 mb-2">Cliente: {order.customerName}</p>
          <p className="text-gray-600 mb-2">Total: R$ {order.total.toFixed(2)}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Imprimir Cupom Térmico
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintReceiptModal;