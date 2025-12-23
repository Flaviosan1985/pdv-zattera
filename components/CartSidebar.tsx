
import React from 'react';
import { Trash2, ShoppingCart, Plus, Minus, ChevronRight, Lock } from 'lucide-react';
import { CartItem, PizzaSize } from '../types';

interface CartSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemove: (cartId: string) => void;
  onCheckout: () => void;
  isRegisterOpen?: boolean;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ items, onUpdateQuantity, onRemove, onCheckout, isRegisterOpen = true }) => {
  const calculateItemPrice = (item: CartItem) => {
    let price = 0;
    const isSmall = item.selectedSize === PizzaSize.SMALL;

    if (item.isHalfAndHalf) {
      const products = [item.product, item.secondProduct, item.thirdProduct].filter((p): p is typeof item.product => !!p);
      const prices = products.map(p => isSmall ? (p.priceSmall || (p.price * 0.8)) : p.price);
      price = Math.max(...prices);
    } else {
      price = isSmall ? (item.product.priceSmall || (item.product.price * 0.8)) : item.product.price;
    }
    return price;
  };

  const subtotal = items.reduce((sum, item) => sum + (calculateItemPrice(item) * item.quantity), 0);
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="w-full h-full flex flex-col bg-dark-800 border-l border-dark-700 shadow-2xl">
      {/* Header */}
      <div className="p-6 bg-dark-900 border-b border-dark-700 flex items-center justify-between">
        <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
          <ShoppingCart className="text-primary" size={24} />
          Meu Pedido
        </h2>
        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-black">
          {items.length}
        </span>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 space-y-4">
            <div className="bg-dark-700 p-8 rounded-full">
              <ShoppingCart size={64} className="opacity-20" />
            </div>
            <p className="font-black text-lg uppercase tracking-widest opacity-30">Carrinho Vazio</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.cartId} className="bg-dark-700 p-4 rounded-2xl border border-gray-600/50 flex flex-col gap-3 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="text-white font-black leading-tight">
                    {item.isHalfAndHalf ? (
                       <div className="flex flex-col gap-1">
                         <span className="text-sm text-gray-300">1/{item.thirdProduct ? '3' : '2'} {item.product.name}</span>
                         <span className="text-sm text-gray-300">1/{item.thirdProduct ? '3' : '2'} {item.secondProduct?.name}</span>
                         {item.thirdProduct && <span className="text-sm text-gray-300">1/3 {item.thirdProduct.name}</span>}
                       </div>
                    ) : (
                      <span className="text-base uppercase tracking-tight">{item.product.name}</span>
                    )}
                    {item.selectedSize && (
                      <span className="text-primary text-xs font-black block mt-1">[{item.selectedSize.toUpperCase()}]</span>
                    )}
                </div>
                <button onClick={() => onRemove(item.cartId)} className="text-gray-500 hover:text-red-500 p-1"><Trash2 size={20} /></button>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600/30">
                <div className="text-white font-black text-base">
                   {formatCurrency(calculateItemPrice(item) * item.quantity)}
                </div>

                <div className="flex items-center gap-3 bg-dark-900 rounded-xl p-1 border border-gray-600">
                  <button 
                    onClick={() => onUpdateQuantity(item.cartId, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 text-white hover:bg-red-500 transition-colors"
                    disabled={item.quantity <= 1}
                  ><Minus size={14} /></button>
                  <span className="text-base font-black w-6 text-center text-white">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.cartId, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-green-500 transition-colors"
                  ><Plus size={14} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Totals */}
      <div className="p-6 bg-dark-900 border-t border-dark-700 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-400 text-sm font-bold">
            <span>SUBTOTAL</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-3xl font-black text-white pt-3 border-t-2 border-dashed border-gray-700">
            <span>TOTAL</span>
            <span className="text-primary">{formatCurrency(subtotal)}</span>
          </div>
        </div>
        
        {isRegisterOpen ? (
          <button 
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full py-5 bg-primary text-white text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primaryHover active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale uppercase tracking-tighter"
          >
            Finalizar Pedido
            <ChevronRight size={28} />
          </button>
        ) : (
          <div className="w-full py-5 bg-gray-800 text-gray-500 text-lg font-black rounded-2xl flex items-center justify-center gap-3 uppercase border-2 border-dashed border-gray-700">
            Caixa Fechado
            <Lock size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
