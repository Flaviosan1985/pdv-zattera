import React from 'react';
import { Order, PizzaSize, StoreConfig, PaymentPart } from '../types';
import { imprimirCupomTermico } from '../services/printService';

interface PrintReceiptModalProps {
  order: Order | null;
  storeConfig: StoreConfig;
  isOpen: boolean;
  onClose: () => void;
}

const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({ order, storeConfig, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(val);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPaid = order.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
  const change = order.changeNeeded || 0;

  // Processar itens para o formato do cupom
  const processedItems = order.items.map(item => {
    let basePrice = 0;
    const isSmall = item.selectedSize === PizzaSize.SMALL;

    if (item.isHalfAndHalf) {
      const products = [item.product, item.secondProduct, item.thirdProduct].filter((p): p is typeof item.product => !!p);
      const prices = products.map(p => isSmall ? (p.priceSmall || (p.price * 0.8)) : p.price);
      basePrice = Math.max(...prices);
    } else {
      basePrice = isSmall ? (item.product.priceSmall || (item.product.price * 0.8)) : item.product.price;
    }

    let description = item.product.name;
    if (item.isHalfAndHalf) {
      description = `1/${item.thirdProduct ? '3' : '2'} ${item.product.name}`;
      if (item.secondProduct) description += ` + 1/${item.thirdProduct ? '3' : '2'} ${item.secondProduct.name}`;
      if (item.thirdProduct) description += ` + 1/3 ${item.thirdProduct.name}`;
    }

    if (item.selectedSize) {
      description += ` [${item.selectedSize === PizzaSize.SMALL ? 'BROTO' : 'GRANDE'}]`;
    }

    return {
      qtd: item.quantity,
      descricao: description.toUpperCase(),
      total: formatCurrency(basePrice * item.quantity)
    };
  });

  const enderecoFormatado = order.address
    ? `${order.address.street}, ${order.address.number}${order.address.complement ? ' - ' + order.address.complement : ''} - ${order.address.neighborhood}, ${order.address.city}`
    : null;

  const handlePrint = () => {
    if (order && storeConfig) {
      imprimirCupomTermico(order, storeConfig);
    }
  };

  return (
    <>
      <style>
        {`
          .print-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .print-modal-content {
            background: white;
            border-radius: 8px;
            padding: 20px;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
          }

          .cupom-content {
            width: 80mm;
            min-height: 100mm;
            background: white;
            padding: 2mm;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            border: 1px dashed #ccc;
            margin: 0 auto 20px;
            box-sizing: border-box;
          }

          .print-controls {
            display: flex;
            gap: 10px;
            justify-content: center;
          }

          .print-controls button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }

          .print-controls button:first-child {
            background: #007bff;
            color: white;
          }

          .print-controls button:last-child {
            background: #6c757d;
            color: white;
          }
        `}
      </style>

      <div className="print-modal-overlay">
        <div className="print-modal-content">
          <div style={{ textAlign: 'center', marginBottom: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '4px', border: '1px solid #2196f3' }}>
            <strong>🖨️ Preview do Cupom</strong><br />
            <small style={{ color: '#666' }}>Esta é apenas uma visualização. A impressão será feita em HTML puro otimizado para impressora térmica.</small>
          </div>
          <div className="cupom-content">
            {/* CABEÇALHO GRANDE E EM DESTAQUE */}
            <div style={{
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "5px",
              paddingBottom: "5px",
              borderBottom: "2px solid #000"
            }}>
              {storeConfig.name || "PIZZARIA ZATTERA"}
            </div>

            <div style={{
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
              lineHeight: "1.4"
            }}>
              {storeConfig.address || "Rua Tiradentes, 403 - JANGADA"}<br />
              CNPJ: {storeConfig.cnpj || "46.339.369/0001-24"}
            </div>

            {/* LINHA SEPARADORA GROSSA */}
            <div style={{
              height: "3px",
              backgroundColor: "#000",
              margin: "8px 0 10px 0"
            }}></div>

            {/* INFO PEDIDO */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              fontWeight: "900",
              marginBottom: "8px",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "15px" }}><strong>PEDIDO N°:</strong> {order.id.slice(-4).toUpperCase()}</span>
              <span style={{ fontSize: "13px" }}>{formatDate(order.date)}</span>
            </div>

            {/* CLIENTE */}
            <div style={{
              marginBottom: "10px",
              fontSize: "14px",
              lineHeight: "1.5",
              padding: "6px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "3px"
            }}>
              <div><strong>CLIENTE:</strong> {order.customerName || "Visitante"}</div>
              {order.customerPhone && <div style={{ marginTop: "3px" }}><strong>TEL:</strong> {order.customerPhone}</div>}
            </div>

            {/* TIPO DE PEDIDO */}
            <div style={{
              marginBottom: "12px",
              fontSize: "15px",
              fontWeight: "900",
              textAlign: "center",
              padding: "8px 4px",
              border: "2px dashed #000",
              backgroundColor: "#f0f0f0",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>
              {order.orderType === 'DELIVERY' ? 'ENTREGA' : 'RETIRADA'}
            </div>

            {/* ENDEREÇO SE FOR ENTREGA */}
            {order.orderType === 'DELIVERY' && enderecoFormatado && (
              <div style={{
                marginBottom: "12px",
                fontSize: "13px",
                lineHeight: "1.4",
                padding: "6px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "3px"
              }}>
                <div style={{ fontWeight: "bold", marginBottom: "3px" }}>ENDEREÇO:</div>
                <div>{enderecoFormatado.toUpperCase()}</div>
              </div>
            )}

            {/* LINHA SEPARADORA */}
            <div style={{
              height: "2px",
              backgroundColor: "#000",
              margin: "10px 0"
            }}></div>

            {/* ITENS DO PEDIDO */}
            <div style={{ marginBottom: "12px" }}>
              {processedItems.map((item, index) => (
                <div key={index} style={{
                  display: "grid",
                  gridTemplateColumns: "15mm 1fr 20mm",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                  alignItems: "start"
                }}>
                  <span style={{ textAlign: "center" }}>{item.qtd}x</span>
                  <span style={{ marginLeft: "3px", lineHeight: "1.2" }}>{item.descricao}</span>
                  <span style={{ textAlign: "right", fontWeight: "900" }}>{item.total}</span>
                </div>
              ))}
            </div>

            {/* LINHA SEPARADORA */}
            <div style={{
              height: "2px",
              backgroundColor: "#000",
              margin: "8px 0"
            }}></div>

            {/* TOTAIS */}
            <div style={{ marginBottom: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span>SUBTOTAL:</span>
                <span style={{ fontWeight: "bold" }}>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span>ENTREGA:</span>
                  <span style={{ fontWeight: "bold" }}>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "900", marginTop: "5px", paddingTop: "5px", borderTop: "1px solid #000" }}>
                <span>TOTAL:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* PAGAMENTO */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>FORMA DE PAGAMENTO:</div>
              {order.payments?.map((payment, index) => (
                <div key={index} style={{ fontSize: "12px", marginBottom: "2px" }}>
                  {payment.method === 'CASH' ? 'DINHEIRO' :
                   payment.method === 'PIX' ? 'PIX' :
                   payment.method === 'CREDIT_CARD' ? 'CARTÃO CRÉDITO' :
                   payment.method === 'DEBIT_CARD' ? 'CARTÃO DÉBITO' : payment.method}
                  : {formatCurrency(payment.amount)}
                </div>
              ))}
              {change > 0 && (
                <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "5px", color: "#d9534f" }}>
                  TROCO: {formatCurrency(change)}
                </div>
              )}
            </div>

            {/* LINHA SEPARADORA */}
            <div style={{
              height: "2px",
              backgroundColor: "#000",
              margin: "10px 0"
            }}></div>

            {/* MENSAGEM FINAL */}
            <div style={{
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
              lineHeight: "1.3"
            }}>
              OBRIGADO PELA PREFERÊNCIA!<br />
              VOLTE SEMPRE!
            </div>

            <div style={{
              textAlign: "center",
              fontSize: "10px",
              marginBottom: "5px"
            }}>
              {formatDate(new Date())}
            </div>
          </div>

          <div className="print-controls">
            <button onClick={handlePrint}>🖨️ Imprimir Cupom Térmico</button>
            <button onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintReceiptModal;