
import React, { useState } from 'react';
import { Send, X, Loader2, Sparkles, MapPin, CreditCard, User, Info, CheckCircle, Printer } from 'lucide-react';
import { parseSmartOrder } from '../services/geminiService';
import { OrderAnalysisResult, Product } from '../types';

interface SmartOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (result: OrderAnalysisResult, autoPrint: boolean) => void;
  products: Product[];
}

const SmartOrderModal: React.FC<SmartOrderModalProps> = ({ isOpen, onClose, onConfirmOrder, products }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OrderAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await parseSmartOrder(prompt, products);
      setResult(data);
    } catch (err) {
      setError("Falha ao analisar o texto. Verifique sua conexão ou tente um texto mais claro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = (autoPrint: boolean) => {
    if (result) {
      onConfirmOrder(result, autoPrint);
      setPrompt('');
      setResult(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-orange-600 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Copiloto IA Atendente</h2>
              <p className="text-xs text-orange-100 font-bold">Cole o pedido do WhatsApp aqui</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!result ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: João quer uma pizza de Calabresa G e uma Coca 2l. Entregar na Rua das Flores 123, Bairro Centro. Ele vai pagar no PIX."
                  className="w-full h-48 p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-gray-700 font-medium placeholder-gray-400 transition-all resize-none shadow-inner"
                  disabled={isLoading}
                />
              </div>

              {error && <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2 font-bold"><Info size={18}/> {error}</div>}

              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full py-4 bg-primary hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-lg uppercase tracking-wider"
              >
                {isLoading ? <><Loader2 className="w-6 h-6 animate-spin" /> Analisando Dados...</> : <><Send className="w-6 h-6" /> Processar Pedido</>}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              {/* Analysed Result View */}
              <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-5">
                <h3 className="text-green-800 font-black flex items-center gap-2 mb-3 uppercase text-sm tracking-widest">
                  <CheckCircle size={18} /> Pedido Identificado
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Itens */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Produtos</p>
                    <ul className="space-y-1">
                      {result.items.map((item, i) => {
                        const p = products.find(prod => prod.id === item.productId);
                        return (
                          <li key={i} className="text-sm font-bold text-gray-800">
                            {item.quantity}x {p?.name} <span className="text-primary">{item.size}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Cliente e Endereço */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Entrega / Cliente</p>
                    <div className="space-y-1">
                       <p className="text-sm font-bold flex items-center gap-2"><User size={14}/> {result.customerName || 'Não informado'}</p>
                       <p className="text-sm text-gray-600 flex items-start gap-2">
                         <MapPin size={14} className="mt-1 shrink-0" />
                         {result.address ? `${result.address.street}, ${result.address.number} - ${result.address.neighborhood}` : 'Retirada'}
                       </p>
                    </div>
                  </div>

                  {/* Pagamento */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Pagamento</p>
                    <p className="text-sm font-black flex items-center gap-2 text-green-700">
                      <CreditCard size={14}/> {result.paymentMethod || 'Pagar na hora'}
                    </p>
                  </div>

                  {/* Orientações IA */}
                  {result.missingInfo && result.missingInfo.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 md:col-span-2">
                      <p className="text-[10px] font-black text-orange-600 uppercase mb-2 flex items-center gap-1">
                        <Info size={12}/> Pergunte ao cliente:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.missingInfo.map((info, i) => (
                          <li key={i} className="text-xs font-bold text-orange-800">{info}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all uppercase text-sm"
                >
                  Corrigir Texto
                </button>
                <button
                  onClick={() => handleFinalize(false)}
                  className="flex-1 py-4 bg-gray-800 text-white font-bold rounded-2xl hover:bg-black transition-all uppercase text-sm flex items-center justify-center gap-2"
                >
                  Revisar no Carrinho
                </button>
                <button
                  onClick={() => handleFinalize(true)}
                  className="flex-1 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all uppercase text-sm flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Finalizar e Imprimir
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-primary"/> Agente Inteligente PizzaAI
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartOrderModal;
