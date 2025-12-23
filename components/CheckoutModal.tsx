
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, QrCode, MapPin, ChevronRight, CheckCircle, ArrowLeft, DollarSign, Truck, Store, User, Printer, Phone, Bike, Plus, Trash2, Users } from 'lucide-react';
import { PaymentMethod, Address, DeliveryFee, OrderType, Customer, Motoboy, PaymentPart } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number; // Subtotal only
  onConfirm: (
    orderType: OrderType,
    customerName: string,
    customerPhone: string,
    payments: PaymentPart[],
    address: Address | undefined, 
    deliveryFee: number,
    motoboyId?: string,
    customerId?: string,
    splitPeople?: number
  ) => void;
  deliveryFees: DeliveryFee[];
  customers: Customer[];
  motoboys: Motoboy[];
  initialCustomer?: Customer | null;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  total: subtotal, 
  onConfirm, 
  deliveryFees, 
  customers, 
  motoboys,
  initialCustomer
}) => {
  const [step, setStep] = useState<1 | 2>(1); // 1 = Config/Payment, 2 = Address (if delivery)
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [selectedMotoboyId, setSelectedMotoboyId] = useState('');
  
  // Split payment state
  const [splitPeople, setSplitPeople] = useState<number>(1);
  const [appliedPayments, setAppliedPayments] = useState<PaymentPart[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [cashGivenInput, setCashGivenInput] = useState<string>('');
  
  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    neighborhood: '',
    complement: '',
    city: ''
  });
  const [currentDeliveryFee, setCurrentDeliveryFee] = useState(0);

  // Derived values
  const finalTotal = subtotal + currentDeliveryFee;
  const totalPaid = appliedPayments.reduce((acc, p) => acc + p.amount, 0);
  const remainingTotal = Math.max(0, finalTotal - totalPaid);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Determine delivery fee when neighborhood changes
  useEffect(() => {
    if (orderType === 'DELIVERY' && address.neighborhood) {
      const normalizedInput = address.neighborhood.toLowerCase().trim();
      const fee = deliveryFees.find(f => f.neighborhood.toLowerCase().trim() === normalizedInput);
      setCurrentDeliveryFee(fee ? fee.price : 0);
    } else {
      setCurrentDeliveryFee(0);
    }
  }, [address.neighborhood, deliveryFees, orderType]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOrderType('DELIVERY');
      setAppliedPayments([]);
      setSelectedMethod('CREDIT_CARD');
      setPaymentAmountInput('');
      setCashGivenInput('');
      setSplitPeople(1);
      setSelectedMotoboyId('');
      setCurrentDeliveryFee(0);

      if (initialCustomer) {
        setCustomerName(initialCustomer.name);
        setCustomerPhone(initialCustomer.phone);
        setCustomerId(initialCustomer.id);
        if (initialCustomer.address) {
          setAddress(initialCustomer.address);
        } else {
           setAddress({ street: '', number: '', neighborhood: '', complement: '', city: '' });
        }
      } else {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerId(undefined);
        setAddress({ street: '', number: '', neighborhood: '', complement: '', city: '' });
      }
    }
  }, [isOpen, initialCustomer]);

  // Sync remaining balance to input when remainingTotal changes
  useEffect(() => {
    if (isOpen && remainingTotal > 0.01 && paymentAmountInput === '') {
        const perPerson = remainingTotal / (splitPeople > 0 ? splitPeople : 1);
        setPaymentAmountInput(perPerson.toFixed(2).replace('.', ','));
    }
  }, [isOpen, remainingTotal, paymentAmountInput, splitPeople]);

  // ALL HOOKS MUST BE ABOVE THIS LINE
  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerPhone(val);
    const found = customers.find(c => c.phone === val);
    if (found) {
      setCustomerName(found.name);
      setCustomerId(found.id);
      if (found.address) setAddress(found.address);
    } else {
      if (customerId && val !== customers.find(c => c.id === customerId)?.phone) {
         setCustomerId(undefined);
      }
    }
  };

  const addPayment = () => {
    const amount = parseFloat(paymentAmountInput.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const cashGivenVal = cashGivenInput.replace(',', '.');
    const cashGiven = selectedMethod === 'CASH' && cashGivenVal !== '' ? parseFloat(cashGivenVal) : undefined;

    // O valor a ser abatido da conta não pode ser maior que o que falta pagar
    const amountToApply = Math.min(amount, remainingTotal);

    const newPayment: PaymentPart = {
      method: selectedMethod,
      amount: amountToApply,
      cashGiven: cashGiven
    };

    setAppliedPayments([...appliedPayments, newPayment]);
    setPaymentAmountInput('');
    setCashGivenInput('');
  };

  const removePayment = (index: number) => {
    setAppliedPayments(appliedPayments.filter((_, i) => i !== index));
  };

  const handleSplitChange = (val: string) => {
    if (val === '') {
      setSplitPeople(0);
      return;
    }

    const num = parseInt(val);
    if (isNaN(num)) return;
    
    setSplitPeople(num);
    const effectiveNum = num > 0 ? num : 1;
    const perPerson = finalTotal / effectiveNum;
    setPaymentAmountInput(perPerson.toFixed(2).replace('.', ','));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (remainingTotal <= 0.01 && customerName) {
      const finalAddr = orderType === 'DELIVERY' ? address : undefined;
      const finalMotoboy = orderType === 'DELIVERY' && selectedMotoboyId ? selectedMotoboyId : undefined;

      onConfirm(
        orderType, 
        customerName, 
        customerPhone,
        appliedPayments, 
        finalAddr, 
        currentDeliveryFee,
        finalMotoboy,
        customerId,
        splitPeople > 1 ? splitPeople : undefined
      );
    }
  };

  const isAddressValid = () => {
    return address.street.trim() !== '' && 
           address.number.trim() !== '' && 
           address.neighborhood.trim() !== '' &&
           address.city.trim() !== '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {step === 1 ? <CreditCard className="text-primary" /> : <MapPin className="text-primary" />}
              {step === 1 ? 'Checkout do Pedido' : 'Endereço de Entrega'}
            </h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">TOTAL: <span className="text-gray-900">{formatCurrency(finalTotal)}</span></span>
               <span className={`text-sm font-bold px-3 py-0.5 rounded shadow-sm border ${remainingTotal > 0.01 ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-green-500 text-white border-green-600'}`}>
                  {remainingTotal > 0.01 ? `FALTA: ${formatCurrency(remainingTotal)}` : 'PAGO'}
               </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Top Section: Order Type and Customer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-2 rounded-xl border border-gray-200 flex shadow-sm">
                    <button
                      onClick={() => setOrderType('DELIVERY')}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${orderType === 'DELIVERY' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Truck size={18} /> Delivery
                    </button>
                    <button
                      onClick={() => { setOrderType('PICKUP'); setCurrentDeliveryFee(0); }}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${orderType === 'PICKUP' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Store size={18} /> Retirada
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" value={customerPhone} onChange={handlePhoneChange} placeholder="Telefone" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-gray-900 font-semibold" />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome do Cliente" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-gray-900 font-semibold" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-gray-700 font-bold mb-4">
                    <Users size={18} className="text-primary" /> <span>Dividir Pagamento</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase">Dividir em</label>
                       <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                         <input 
                           type="number" 
                           min="1"
                           value={splitPeople === 0 ? '' : splitPeople} 
                           onFocus={(e) => e.target.select()}
                           onChange={(e) => handleSplitChange(e.target.value)}
                           className="w-16 bg-transparent p-1.5 rounded text-center font-bold text-lg text-primary outline-none" 
                         />
                         <span className="text-sm font-bold text-gray-500 pr-2">pessoas</span>
                       </div>
                    </div>
                    
                    {splitPeople > 1 && (
                      <div className="flex-1 bg-orange-50 border border-orange-100 rounded-lg p-3 animate-in fade-in slide-in-from-left-2">
                        <p className="text-[10px] text-orange-600 font-bold uppercase mb-0.5">Valor p/ Pessoa</p>
                        <p className="text-lg font-black text-orange-700">{formatCurrency(finalTotal / splitPeople)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign size={16} className="text-green-500" /> Registrar Pagamento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'CREDIT_CARD', label: 'Crédito', icon: CreditCard },
                        { id: 'DEBIT_CARD', label: 'Débito', icon: CreditCard },
                        { id: 'PIX', label: 'PIX', icon: QrCode },
                        { id: 'CASH', label: 'Dinheiro', icon: Banknote },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedMethod(item.id as PaymentMethod)}
                          className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${selectedMethod === item.id ? 'border-primary bg-orange-50 text-primary' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'}`}
                        >
                          <item.icon size={18} />
                          <span className="text-xs font-bold">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4 pt-2">
                       <div>
                         <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">Valor a abater da conta</label>
                         <div className="relative group">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 group-focus-within:text-primary">R$</span>
                           <input 
                             type="text" 
                             value={paymentAmountInput} 
                             onFocus={(e) => e.target.select()}
                             onChange={(e) => setPaymentAmountInput(e.target.value)}
                             className="w-full border-2 border-gray-200 pl-9 pr-4 py-3 rounded-xl text-xl font-black text-gray-900 focus:border-primary outline-none shadow-inner"
                             placeholder="0,00"
                           />
                         </div>
                       </div>

                       {selectedMethod === 'CASH' && (
                         <div className="animate-in slide-in-from-top-2">
                           <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">Valor em mãos (Dinheiro entregue)</label>
                           <div className="relative group">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-green-400 group-focus-within:text-green-600">R$</span>
                             <input 
                               type="text" 
                               value={cashGivenInput} 
                               onFocus={(e) => e.target.select()}
                               onChange={(e) => setCashGivenInput(e.target.value)}
                               className="w-full border-2 border-green-100 pl-9 pr-4 py-3 rounded-xl text-xl font-black text-green-600 focus:border-green-500 outline-none shadow-inner bg-green-50/30"
                               placeholder="0,00"
                             />
                           </div>
                         </div>
                       )}

                       <button 
                         onClick={addPayment}
                         disabled={remainingTotal <= 0.01}
                         className="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-100 disabled:opacity-50 disabled:grayscale uppercase tracking-wider"
                       >
                         <Plus size={22} /> Adicionar Parte
                       </button>
                    </div>
                  </div>

                  <div className="bg-gray-100/50 p-5 rounded-xl border border-gray-200 flex flex-col">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
                       <span>Partes Registradas</span>
                       <span className="text-[10px] text-gray-400">{appliedPayments.length} item(s)</span>
                    </h4>
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
                       {appliedPayments.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-12 text-gray-400 italic text-sm text-center">
                           <DollarSign size={32} className="opacity-10 mb-2" />
                           Nenhum pagamento registrado ainda
                         </div>
                       ) : (
                         appliedPayments.map((p, i) => (
                           <div key={i} className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-right-4 transition-all hover:border-primary/30">
                             <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${p.method === 'CASH' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                 {p.method === 'CASH' ? <Banknote size={16} /> : p.method === 'PIX' ? <QrCode size={16} /> : <CreditCard size={16} />}
                               </div>
                               <div>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase block tracking-tighter">
                                      {p.method === 'CASH' ? 'DINHEIRO' : p.method === 'PIX' ? 'PIX' : p.method === 'CREDIT_CARD' ? 'CRÉDITO' : 'DÉBITO'}
                                    </span>
                                    {p.method === 'CASH' && p.cashGiven && p.cashGiven > p.amount && (
                                      <div className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                                         TROCO: {formatCurrency(p.cashGiven - p.amount)}
                                      </div>
                                    )}
                                 </div>
                                 <span className="font-black text-gray-900 text-lg">{formatCurrency(p.amount)}</span>
                                 {p.method === 'CASH' && p.cashGiven && (
                                   <div className="text-[10px] text-gray-500">
                                      Recebido: {formatCurrency(p.cashGiven)}
                                   </div>
                                 )}
                               </div>
                             </div>
                             <button onClick={() => removePayment(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors">
                               <Trash2 size={18} />
                             </button>
                           </div>
                         ))
                       )}
                    </div>
                    {appliedPayments.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center px-1">
                         <span className="text-xs font-bold text-gray-500 uppercase">Total Pago</span>
                         <span className="font-black text-gray-800">{formatCurrency(totalPaid)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && orderType === 'DELIVERY' && (
            <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mb-6">
                 <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                 <p className="text-sm text-blue-800">Insira o endereço para entrega.</p>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Entregador Responsável</label>
                  <select
                    value={selectedMotoboyId}
                    onChange={(e) => setSelectedMotoboyId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-gray-900 font-semibold bg-white"
                  >
                    <option value="">Selecione o Motoboy...</option>
                    {motoboys.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-2 space-y-2">
                   <label className="text-sm font-bold text-gray-800">Rua / Avenida</label>
                   <input required type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-800">Número</label>
                   <input required type="text" value={address.number} onChange={(e) => setAddress({...address, number: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2 relative">
                   <label className="text-sm font-bold text-gray-800">Bairro</label>
                   <input required type="text" value={address.neighborhood} onChange={(e) => setAddress({...address, neighborhood: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                   {currentDeliveryFee > 0 && <div className="absolute right-3 top-[38px] text-green-600 font-bold text-sm">+ {formatCurrency(currentDeliveryFee)}</div>}
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-800">Cidade</label>
                   <input required type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                 </div>
               </div>
            </form>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between gap-3 shadow-inner">
          <button
            onClick={step === 2 ? () => setStep(1) : onClose}
            className="px-8 py-3.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2 border border-gray-200"
          >
            {step === 2 && <ArrowLeft size={20} />} {step === 2 ? 'Voltar' : 'Cancelar Pedido'}
          </button>

          <button
            onClick={step === 1 && orderType === 'DELIVERY' ? () => setStep(2) : handleSubmit}
            disabled={(remainingTotal > 0.01 && step === 1) || !customerName.trim() || (step === 2 && !isAddressValid())}
            className="flex-1 max-w-[280px] px-8 py-3.5 bg-green-600 text-white font-black rounded-xl shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 ml-auto text-lg uppercase tracking-tight"
          >
            {step === 1 && orderType === 'DELIVERY' ? (
              <>Continuar Endereço <ChevronRight size={22} /></>
            ) : (
              <><Printer size={22} /> Finalizar Venda</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;
