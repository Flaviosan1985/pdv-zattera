import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, DollarSign, Calculator, AlertTriangle, TrendingUp } from 'lucide-react';
import { RegisterSession, Order, PaymentMethod } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: RegisterSession | null;
  orders: Order[];
  onOpenRegister: (initialFloat: number) => void;
  onCloseRegister: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  session, 
  orders, 
  onOpenRegister, 
  onCloseRegister 
}) => {
  const [floatInput, setFloatInput] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFloatInput('');
      setConfirmClose(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Calculate totals based on current session orders
  const sessionOrders = session 
    ? orders.filter(o => o.date >= session.openedAt) 
    : [];

  const totals = {
    total: sessionOrders.reduce((acc, o) => acc + o.total, 0),
    cash: sessionOrders.filter(o => o.paymentMethod === 'CASH').reduce((acc, o) => acc + o.total, 0),
    pix: sessionOrders.filter(o => o.paymentMethod === 'PIX').reduce((acc, o) => acc + o.total, 0),
    card: sessionOrders.filter(o => o.paymentMethod === 'CREDIT_CARD' || o.paymentMethod === 'DEBIT_CARD').reduce((acc, o) => acc + o.total, 0),
    count: sessionOrders.length
  };

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(floatInput.replace(',', '.'));
    if (!isNaN(val)) {
      onOpenRegister(val);
      onClose();
    }
  };

  const handleClose = () => {
    onCloseRegister();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-center ${session ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center gap-3">
            {session ? <Unlock size={28} /> : <Lock size={28} />}
            <div>
              <h2 className="text-xl font-bold">{session ? 'Caixa Aberto' : 'Caixa Fechado'}</h2>
              <p className="text-sm opacity-90">
                {session ? `Aberto em: ${session.openedAt.toLocaleTimeString()}` : 'Abra o caixa para iniciar as vendas'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!session ? (
            // OPEN REGISTER FORM
            <form onSubmit={handleOpen} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fundo de Caixa (Troco Inicial)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={floatInput}
                    onChange={(e) => setFloatInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg text-gray-900 font-bold"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Informe o valor em dinheiro disponível na gaveta para iniciar o dia.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Unlock size={20} />
                ABRIR CAIXA
              </button>
            </form>
          ) : (
            // CLOSE REGISTER SUMMARY
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Fundo Inicial</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(session.initialFloat)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Total Vendas</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.total)}</p>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                 <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 font-bold text-gray-700 text-sm flex items-center gap-2">
                   <TrendingUp size={16} /> Resumo por Pagamento
                 </div>
                 <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Dinheiro (Vendas)</span>
                      <span className="font-medium">{formatCurrency(totals.cash)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">PIX</span>
                      <span className="font-medium">{formatCurrency(totals.pix)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Cartões</span>
                      <span className="font-medium">{formatCurrency(totals.card)}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span className="text-gray-900">Total em Dinheiro (Gaveta)</span>
                      <span className="text-green-600">{formatCurrency(session.initialFloat + totals.cash)}</span>
                    </div>
                 </div>
               </div>

               {!confirmClose ? (
                  <button
                    onClick={() => setConfirmClose(true)}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock size={20} />
                    FECHAR CAIXA
                  </button>
               ) : (
                 <div className="bg-red-50 border border-red-100 rounded-xl p-4 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
                      <AlertTriangle size={20} />
                      Confirmar Fechamento?
                    </div>
                    <p className="text-sm text-red-600 mb-4">
                      Isso irá encerrar o período de vendas atual e gerar o relatório final.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setConfirmClose(false)}
                        className="flex-1 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleClose}
                        className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Confirmar
                      </button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;