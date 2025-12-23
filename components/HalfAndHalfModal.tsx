
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CircleDashed, PieChart, ArrowLeft } from 'lucide-react';
import { Product, ProductCategory, PizzaSize } from '../types';

interface HalfAndHalfModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onConfirm: (products: Product[], size: PizzaSize) => void;
  maxSlots?: number; // Default 2, can be 3
}

const HalfAndHalfModal: React.FC<HalfAndHalfModalProps> = ({ isOpen, onClose, products, onConfirm, maxSlots = 2 }) => {
  const [selectedFlavors, setSelectedFlavors] = useState<(Product | null)[]>([]);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(PizzaSize.LARGE);

  // Initialize slots when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedFlavors(Array(maxSlots).fill(null));
      setSelectedSize(PizzaSize.LARGE);
    }
  }, [isOpen, maxSlots]);

  if (!isOpen) return null;

  // Filter pizzas (both Savory and Sweet)
  const pizzas = products.filter(p => p.category === ProductCategory.PIZZA || p.category === ProductCategory.SWEET_PIZZA);

  const handleSelect = (product: Product) => {
    const newFlavors = [...selectedFlavors];
    
    // Find first empty slot
    const emptyIndex = newFlavors.findIndex(f => f === null);
    
    if (emptyIndex !== -1) {
      // Fill the first empty slot
      newFlavors[emptyIndex] = product;
    } else {
      // If full, replace the last one (or could cycle back to 0)
      newFlavors[maxSlots - 1] = product;
    }
    
    setSelectedFlavors(newFlavors);
  };

  const handleRemoveFlavor = (index: number) => {
    const newFlavors = [...selectedFlavors];
    newFlavors[index] = null;
    setSelectedFlavors(newFlavors);
  };

  const isReady = selectedFlavors.every(f => f !== null);

  const handleConfirm = () => {
    if (isReady) {
      const finalProducts = selectedFlavors.filter((p): p is Product => p !== null);
      onConfirm(finalProducts, selectedSize);
      onClose();
    }
  };

  const getSelectionNumber = (id: string) => {
    return selectedFlavors.map((f, idx) => f?.id === id ? idx + 1 : null).filter(n => n !== null);
  };

  // Define specific size options based on user request (Broto and Grande only)
  const SIZE_OPTIONS = [
    { label: 'BROTO', value: PizzaSize.SMALL },
    { label: 'GRANDE', value: PizzaSize.LARGE }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="text-primary" />
              {maxSlots === 3 ? 'Montar Pizza 3 Sabores' : 'Montar Pizza Meio a Meio'}
            </h2>
            <p className="text-xs text-gray-500">Escolha {maxSlots} sabores. O valor será calculado pelo sabor de maior valor.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Size Selector */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex gap-4 justify-center shrink-0">
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option.label}
              onClick={() => setSelectedSize(option.value)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors uppercase tracking-wide ${
                selectedSize === option.value 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Pizza Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {pizzas.map(pizza => {
               const selectionIndices = getSelectionNumber(pizza.id);
               const isSelected = selectionIndices.length > 0;
               
               // Display price based on selected size
               const displayPrice = selectedSize === PizzaSize.SMALL 
                  ? (pizza.priceSmall || (pizza.price * 0.7)) 
                  : pizza.price;

               return (
                <div 
                  key={pizza.id}
                  onClick={() => handleSelect(pizza)}
                  className={`relative cursor-pointer group bg-white rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
                    isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="h-20 bg-gray-200">
                    <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <h4 className="font-semibold text-gray-800 text-xs line-clamp-1" title={pizza.name}>{pizza.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">R$ {displayPrice.toFixed(2)}</p>
                    {pizza.category === ProductCategory.SWEET_PIZZA && (
                      <span className="text-[9px] text-pink-500 font-bold block">Doce</span>
                    )}
                  </div>
                  
                  {/* Selection Badge(s) */}
                  <div className="absolute top-1 right-1 flex flex-col gap-1">
                    {selectionIndices.map((num) => (
                      <div key={num} className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg animate-in zoom-in duration-200">
                        {num}
                      </div>
                    ))}
                  </div>

                  {!isSelected && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CircleDashed className="text-white drop-shadow-md" size={20} />
                    </div>
                  )}
                </div>
               );
            })}
          </div>
        </div>

        {/* Footer - Selections Display */}
        <div className="p-4 border-t border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
          <div className="flex-1 grid grid-cols-3 gap-2 w-full">
            {selectedFlavors.map((flavor, idx) => {
              const itemPrice = flavor 
                ? (selectedSize === PizzaSize.SMALL ? (flavor.priceSmall || flavor.price * 0.7) : flavor.price)
                : 0;

              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2 p-2 rounded-lg border ${flavor ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100 border-dashed'}`}
                >
                  <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  {flavor ? (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{flavor.name}</p>
                      <p className="text-[10px] text-gray-500">R$ {itemPrice.toFixed(2)}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Selecione...</span>
                  )}
                  {flavor && (
                    <button onClick={() => handleRemoveFlavor(idx)} className="text-red-400 hover:text-red-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isReady}
              className="flex-1 md:flex-none px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle size={18} />
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalfAndHalfModal;