
import React from 'react';
import { Plus, Circle } from 'lucide-react';
import { Product, PizzaSize, ProductCategory } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, size?: PizzaSize) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const isPizza = product.category === ProductCategory.PIZZA || product.category === ProductCategory.SWEET_PIZZA;
  const hasSmallPrice = isPizza && product.priceSmall !== undefined && product.priceSmall > 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 relative group border border-gray-200">
      {/* Image Area - Aumentada para h-32 ou h-40 */}
      <div className="h-32 md:h-40 overflow-hidden bg-gray-100 relative shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Content Area */}
      <div className="p-3 md:p-4 flex flex-col flex-1 bg-white text-gray-800">
        <div className="mb-3 flex-1">
          <h3 className="text-sm md:text-base font-black text-gray-900 uppercase leading-tight mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-auto">
          {hasSmallPrice ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAdd(product, PizzaSize.SMALL)}
                className="flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-50 border-2 border-gray-100 hover:border-primary/40 rounded-xl py-2 px-1 transition-all group/btn"
              >
                <span className="text-[10px] font-black text-gray-400 group-hover/btn:text-primary uppercase tracking-tighter">BROTO</span>
                <span className="text-sm font-black text-gray-900 group-hover/btn:text-primary">
                  {formatCurrency(product.priceSmall!)}
                </span>
              </button>

              <button
                onClick={() => onAdd(product, PizzaSize.LARGE)}
                className="flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-50 border-2 border-gray-100 hover:border-primary/40 rounded-xl py-2 px-1 transition-all group/btn"
              >
                <span className="text-[10px] font-black text-gray-400 group-hover/btn:text-primary uppercase tracking-tighter">GRANDE</span>
                <span className="text-sm font-black text-gray-900 group-hover/btn:text-primary">
                  {formatCurrency(product.price)}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(product)}
              className="w-full py-3 bg-gray-900 hover:bg-primary text-white rounded-xl flex items-center justify-between px-4 transition-all group/btn shadow-md active:scale-95"
            >
              <span className="text-xs font-black uppercase tracking-widest">Adicionar</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">
                  {formatCurrency(product.price)}
                </span>
                <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
