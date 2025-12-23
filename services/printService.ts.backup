import { Order, StoreConfig, PizzaSize } from '../types';

export const imprimirCupomExato = (order: Order, storeConfig: StoreConfig) => {
  // Abre nova janela para impressão
  const janelaImpressao = window.open('', '_blank', 'width=300,height=500');

  if (!janelaImpressao) {
    alert('Por favor, permita pop-ups para imprimir o cupom.');
    return;
  }

  // Função auxiliar para formatar moeda
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(val);
  };

  // Função auxiliar para formatar data
  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      description += ` [${item.selectedSize === PizzaSize.SMALL ? 'BROTO' : item.selectedSize === PizzaSize.MEDIUM ? 'MEDIA' : 'GRANDE'}]`;
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

  const totalPaid = order.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
  const change = order.changeNeeded || 0;

  // HTML COMPLETAMENTE PURO - ZERO CLASSES CSS - TUDO INLINE
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Cupom</title>
  <meta charset="UTF-8">
  <style>
    /* RESET ABSOLUTO */
    body, html, div, span, p, br, hr {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font: inherit;
      vertical-align: baseline;
    }

    /* CONFIG IMPRESSORA 80mm */
    @page {
      size: 80mm auto;
      margin: 0;
    }

    body {
      width: 80mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11pt;
      line-height: 1;
      color: black;
      background: white;
      padding: 2mm 3mm;
      margin: 0;
      font-weight: normal;
    }

    /* IMPEDIR QUALQUER ELEMENTO EXTRA */
    *:not(body):not(div):not(span):not(br):not(hr) {
      display: none !important;
    }

    /* OCULTAR TUDO NA IMPRESSÃO */
    @media print {
      html, body {
        width: 80mm !important;
        height: auto !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* FORÇAR FONTE ESCURA */
      * {
        color: black !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <!-- CABEÇALHO -->
  <div style="text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 2mm;">${storeConfig.name || 'ZATTERA PIZZARIA'}</div>

  <div style="text-align: center; font-size: 10pt; margin-bottom: 3mm;">
    ${storeConfig.address || 'RUA TIRADENTES, 405 - JANGADA'}<br>
    CNPJ: ${storeConfig.cnpj || '46.359.369/0001-24'}
  </div>

  <hr style="border: none; border-top: 1px solid black; margin: 2mm 0 3mm 0;">

  <!-- INFO PEDIDO -->
  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt; margin-bottom: 3mm;">
    <span>RECIBO: ${order.id.slice(-4).toUpperCase()}</span>
    <span>${formatDate(order.date)}</span>
  </div>

  <!-- CLIENTE -->
  <div style="font-size: 10pt; margin-bottom: 3mm;">
    <div style="font-weight: bold;">${order.customerName || 'CLIENTE'}</div>
    ${order.customerPhone ? `<div>FONE: ${order.customerPhone}</div>` : ''}
  </div>

  <!-- TIPO DE PEDIDO -->
  <div style="font-weight: bold; font-size: 11pt; margin: 3mm 0;">PEDIDO: ${order.id.slice(-4).toUpperCase()}</div>

  <!-- ENDEREÇO SE FOR ENTREGA -->
  ${order.orderType === 'DELIVERY' && enderecoFormatado ? `
    <div style="font-weight: bold; font-size: 10pt; margin-bottom: 2mm;">ENDEREÇO</div>
    <div style="font-size: 9pt; white-space: pre-line; margin-bottom: 3mm;">${enderecoFormatado.toUpperCase()}</div>
  ` : ''}

  <hr style="border: none; border-top: 1px solid black; margin: 3mm 0;">

  <!-- CABEÇALHO DOS ITENS -->
  <div style="display: grid; grid-template-columns: 15mm 25mm 12mm 12mm; font-weight: bold; font-size: 9pt; margin-bottom: 1mm;">
    <span>QTD</span>
    <span>DESCRIÇÃO</span>
    <span>VL UNIT</span>
    <span>VL TOTAL</span>
  </div>

  <hr style="border: none; border-top: 1px solid black; margin-bottom: 2mm;">

  <!-- ITENS DO PEDIDO -->
  ${processedItems.map(item => `
    <div style="display: grid; grid-template-columns: 15mm 25mm 12mm 12mm; font-size: 9pt; margin-bottom: 1mm; align-items: start;">
      <span>${item.qtd}</span>
      <span style="margin-left: 2mm; line-height: 1.2;">${item.descricao}</span>
      <span>${(parseFloat(item.total.replace(',', '.')) / item.qtd).toFixed(2).replace('.', ',')}</span>
      <span>${item.total}</span>
    </div>
  `).join('')}

  <hr style="border: none; border-top: 1px solid black; margin: 2mm 0;">

  <!-- TOTAIS -->
  <div style="font-size: 10pt; margin-bottom: 2mm;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 1mm;">
      <span>SUBTOTAL:</span>
      <span>${formatCurrency(order.subtotal)}</span>
    </div>
    ${order.deliveryFee > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 1mm;">
        <span>ENTREGA:</span>
        <span>${formatCurrency(order.deliveryFee)}</span>
      </div>
    ` : ''}
    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11pt; margin-top: 2mm; padding-top: 2mm; border-top: 1px solid black;">
      <span>TOTAL:</span>
      <span>${formatCurrency(order.total)}</span>
    </div>
  </div>

  <!-- PAGAMENTO -->
  <div style="font-size: 10pt; margin-bottom: 2mm;">
    <div style="font-weight: bold; margin-bottom: 2mm;">FORMA DE PAGAMENTO:</div>
    ${order.payments?.map(payment => `
      <div style="margin-bottom: 1mm;">
        ${payment.method === 'CASH' ? 'DINHEIRO' :
          payment.method === 'PIX' ? 'PIX' :
          payment.method === 'CREDIT_CARD' ? 'CARTÃO CRÉDITO' :
          payment.method === 'DEBIT_CARD' ? 'CARTÃO DÉBITO' : payment.method}
        : ${formatCurrency(payment.amount)}
      </div>
    `).join('')}
    ${change > 0 ? `
      <div style="font-weight: bold; margin-top: 2mm; color: black;">TROCO: ${formatCurrency(change)}</div>
    ` : ''}
  </div>

  <hr style="border: none; border-top: 1px solid black; margin: 3mm 0;">

  <!-- RODAPÉ -->
  <div style="text-align: center; font-size: 10pt; font-weight: bold; margin-bottom: 2mm; line-height: 1.3;">
    OBRIGADO PELA PREFERÊNCIA!<br>
    VOLTE SEMPRE!
  </div>

  <div style="text-align: center; font-size: 9pt; margin-top: 2mm;">
    ${formatDate(new Date())}
  </div>

  <script>
    // Imprimir automaticamente quando carregar
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() {
          window.close();
        }, 500);
      }, 100);
    };
  </script>
</body>
</html>
  `;

  // Escrever o HTML na nova janela
  janelaImpressao.document.write(html);
  janelaImpressao.document.close();
};