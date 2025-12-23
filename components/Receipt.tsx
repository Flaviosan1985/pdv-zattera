
import React from 'react';
import { Order, PizzaSize, PrinterSettings, StoreConfig, PaymentPart } from '../types';

interface ReceiptProps {
  order: Order | null;
  printerSettings?: PrinterSettings;
  storeConfig: StoreConfig;
}

const Receipt: React.FC<ReceiptProps> = ({ order, printerSettings, storeConfig }) => {
  if (!order) return null;

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

  return (
    <div id="printable-receipt" style={{ 
      display: "none",
      width: "80mm", 
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      fontSize: "14px",
      padding: "8px 6px",
      lineHeight: "1.3",
      fontWeight: "900",
      letterSpacing: "0.5px",
      WebkitPrintColorAdjust: "exact",
      color: "#000000",
      backgroundColor: "#ffffff",
      boxSizing: "border-box",
      maxWidth: "80mm"
    }}>
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
        {order.orderType === 'DELIVERY' ? "ENTREGA EM DOMICÍLIO" : "RETIRADA NO LOCAL"}
      </div>
      
      {/* ENDEREÇO */}
      {enderecoFormatado && (
        <div style={{ 
          marginBottom: "12px", 
          fontSize: "13px",
          padding: "6px",
          border: "1px solid #000",
          backgroundColor: "#f9f9f9",
          lineHeight: "1.4"
        }}>
          <strong>ENDEREÇO:</strong><br />
          {enderecoFormatado.toUpperCase()}
          {order.motoboyName && <div style={{ marginTop: "4px", borderTop: "1px solid #ccc", paddingTop: "2px" }}><strong>MOTOBOY:</strong> {order.motoboyName.toUpperCase()}</div>}
        </div>
      )}
      
      {/* LINHA SEPARADORA */}
      <div style={{ 
        height: "2px",
        backgroundColor: "#000",
        margin: "10px 0 12px 0"
      }}></div>
      
      {/* CABEÇALHO ITENS */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "15mm 1fr 22mm",
        fontSize: "14px",
        fontWeight: "900",
        marginBottom: "8px",
        paddingBottom: "6px",
        borderBottom: "3px solid #000",
        textTransform: "uppercase"
      }}>
        <div>QTD</div>
        <div>DESCRIÇÃO</div>
        <div style={{ textAlign: "right" }}>VALOR</div>
      </div>
      
      {/* ITENS DO PEDIDO */}
      {processedItems.map((item, index) => (
        <div key={index} style={{ 
          display: "grid", 
          gridTemplateColumns: "15mm 1fr 22mm",
          fontSize: "14px",
          marginBottom: "10px",
          alignItems: "start",
          fontWeight: "900"
        }}>
          <div style={{ fontSize: "15px", fontWeight: "900" }}>{item.qtd}x</div>
          <div style={{ 
            whiteSpace: "normal", 
            wordBreak: "break-word",
            paddingRight: "8px",
            fontWeight: "900",
            color: "#000000",
            lineHeight: "1.2",
            fontSize: "13px"
          }}>
            {item.descricao}
          </div>
          <div style={{ 
            textAlign: "right",
            fontWeight: "900",
            fontSize: "15px",
            color: "#000000"
          }}>
            R$ {item.total}
          </div>
        </div>
      ))}
      
      {/* LINHA SEPARADORA GROSSA */}
      <div style={{ 
        height: "3px",
        backgroundColor: "#000",
        margin: "12px 0 15px 0"
      }}></div>
      
      {/* TOTAIS */}
      <div style={{ 
        fontSize: "15px",
        fontWeight: "900",
        marginBottom: "15px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span><strong>TOTAL BRUTO:</strong></span>
          <span><strong>R$ {formatCurrency(order.subtotal)}</strong></span>
        </div>
        
        {order.deliveryFee > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span><strong>TAXA ENTREGA:</strong></span>
            <span><strong>R$ {formatCurrency(order.deliveryFee)}</strong></span>
          </div>
        )}
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          fontWeight: "900", 
          margin: "15px 0",
          padding: "10px 8px",
          borderTop: "3px solid #000",
          borderBottom: "3px solid #000",
          fontSize: "18px",
          backgroundColor: "#f0f0f0",
          textTransform: "uppercase"
        }}>
          <span>VALOR A PAGAR:</span>
          <span>R$ {formatCurrency(order.total)}</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", marginTop: "12px" }}>
          <span><strong>VALOR PAGO:</strong></span>
          <span><strong>R$ {formatCurrency(totalPaid)}</strong></span>
        </div>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          fontWeight: "900",
          fontSize: "16px",
          marginTop: "10px",
          paddingTop: "10px",
          borderTop: "2px solid #000"
        }}>
          <span>TROCO:</span>
          <span>R$ {formatCurrency(change)}</span>
        </div>
      </div>
      
      {/* FORMA DE PAGAMENTO */}
      <div style={{ 
        margin: "15px 0 18px 0", 
        fontSize: "16px",
        fontWeight: "900",
        textAlign: "center",
        padding: "10px 6px",
        backgroundColor: "#000",
        color: "#fff",
        border: "2px solid #000",
        borderRadius: "5px",
        textTransform: "uppercase",
        letterSpacing: "1px"
      }}>
        <strong>PAGAMENTO:</strong> {order.payments.map(p => p.method).join(' + ').replace(/CREDIT_CARD/g, 'CRÉDITO').replace(/DEBIT_CARD/g, 'DÉBITO').replace(/CASH/g, 'DINHEIRO').toUpperCase()}
      </div>
      
      {/* LINHA SEPARADORA FINAL */}
      <div style={{ 
        height: "3px",
        backgroundColor: "#000",
        margin: "15px 0 18px 0"
      }}></div>
      
      {/* RODAPÉ */}
      <div style={{ 
        textAlign: "center", 
        fontSize: "18px",
        fontWeight: "900",
        marginTop: "15px",
        marginBottom: "15px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        padding: "10px 5px",
        lineHeight: "1.4",
        border: "2px solid #000",
        backgroundColor: "#f5f5f5"
      }}>
        OBRIGADO E VOLTE SEMPRE!
      </div>
      
      <div style={{
        textAlign: "center",
        fontSize: "11px",
        marginTop: "10px",
        paddingTop: "8px",
        borderTop: "1px solid #666",
        color: "#666",
        fontWeight: "bold"
      }}>
        Cupom não fiscal • Sistema PizzaAI PDV
      </div>
    </div>
  );
};

export default Receipt;
