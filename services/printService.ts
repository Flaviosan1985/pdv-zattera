import { Order, StoreConfig } from '../types';

export const imprimirCupomTermico = (order: Order, storeConfig: StoreConfig) => {
  // Abre nova janela para impressão
  const janelaImpressao = window.open('', '_blank', 'width=400,height=600');

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
    const isSmall = item.selectedSize === 'BROTO';

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
      description += ` [${item.selectedSize}]`;
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

  // HTML LIMPO para impressão térmica
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cupom - ${storeConfig.name || 'Pizzaria Zattera'}</title>
      <meta charset="UTF-8">
      <style>
        /* RESET COMPLETO - NADA MAIS EXISTE */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* CONFIGURAÇÃO PARA 80mm */
        @page {
          size: 80mm auto;
          margin: 0;
          padding: 0;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        body {
          width: 80mm;
          font-family: 'Courier New', monospace;
          font-size: 9pt;
          line-height: 1.1;
          color: #000000;
          background: white;
          padding: 2mm 3mm;
          margin: 0;
        }

        /* ESTILOS DO CUPOM */
        .cabecalho {
          text-align: center;
          font-weight: bold;
          margin-bottom: 2mm;
          border-bottom: 1px solid #000;
          padding-bottom: 1mm;
        }

        .titulo {
          font-size: 12pt;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .sub-titulo {
          font-size: 8pt;
          margin-top: 1mm;
        }

        .linha {
          height: 1px;
          background: #000;
          margin: 2mm 0;
        }

        .linha-grossa {
          height: 2px;
          background: #000;
          margin: 3mm 0;
        }

        .info-pedido {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2mm;
          font-weight: bold;
          font-size: 10pt;
        }

        .cliente {
          background: #f0f0f0;
          padding: 2mm;
          margin-bottom: 3mm;
          border: 1px solid #ccc;
          font-size: 9pt;
        }

        .tipo-pedido {
          text-align: center;
          font-weight: bold;
          font-size: 11pt;
          text-transform: uppercase;
          padding: 3mm 2mm;
          border: 2px dashed #000;
          background: #f5f5f5;
          margin-bottom: 3mm;
          letter-spacing: 1px;
        }

        .endereco {
          background: #fff3cd;
          padding: 2mm;
          margin-bottom: 3mm;
          border: 1px solid #ffeaa7;
          font-size: 8pt;
          font-weight: bold;
        }

        .itens {
          margin-bottom: 3mm;
        }

        .item-row {
          display: grid;
          grid-template-columns: 12mm 1fr 18mm;
          font-size: 9pt;
          margin-bottom: 1mm;
          align-items: start;
        }

        .item-qtd {
          text-align: center;
          font-weight: bold;
        }

        .item-desc {
          margin-left: 2mm;
          line-height: 1.2;
        }

        .item-total {
          text-align: right;
          font-weight: bold;
        }

        .totais {
          margin-bottom: 3mm;
          font-size: 9pt;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1mm;
        }

        .total-final {
          display: flex;
          justify-content: space-between;
          font-size: 11pt;
          font-weight: bold;
          margin-top: 2mm;
          padding-top: 2mm;
          border-top: 1px solid #000;
        }

        .pagamento {
          margin-bottom: 3mm;
          font-size: 9pt;
        }

        .pagamento-item {
          margin-bottom: 1mm;
        }

        .troco {
          font-weight: bold;
          color: #d9534f;
          margin-top: 2mm;
        }

        .rodape {
          text-align: center;
          font-size: 9pt;
          font-weight: bold;
          margin-top: 3mm;
          line-height: 1.3;
        }

        .data-impressao {
          text-align: center;
          font-size: 8pt;
          margin-top: 2mm;
        }
      </style>
    </head>
    <body>
      <!-- CABEÇALHO -->
      <div class="cabecalho">
        <div class="titulo">${storeConfig.name || 'PIZZARIA ZATTERA'}</div>
        <div class="sub-titulo">${storeConfig.address || 'Rua Tiradentes, 403 - JANGADA'}<br>CNPJ: ${storeConfig.cnpj || '46.339.369/0001-24'}</div>
      </div>

      <!-- LINHA SEPARADORA GROSSA -->
      <div class="linha-grossa"></div>

      <!-- INFO PEDIDO -->
      <div class="info-pedido">
        <span>PEDIDO N°: ${order.id.slice(-4).toUpperCase()}</span>
        <span>${formatDate(order.date)}</span>
      </div>

      <!-- CLIENTE -->
      <div class="cliente">
        <div><strong>CLIENTE:</strong> ${order.customerName || 'Visitante'}</div>
        ${order.customerPhone ? `<div style="margin-top: 1mm;"><strong>TEL:</strong> ${order.customerPhone}</div>` : ''}
      </div>

      <!-- TIPO DE PEDIDO -->
      <div class="tipo-pedido">
        ${order.orderType === 'DELIVERY' ? 'ENTREGA' : 'RETIRADA'}
      </div>

      <!-- ENDEREÇO SE FOR ENTREGA -->
      ${order.orderType === 'DELIVERY' && enderecoFormatado ? `
        <div class="endereco">
          <div style="margin-bottom: 1mm;"><strong>ENDEREÇO:</strong></div>
          <div>${enderecoFormatado.toUpperCase()}</div>
        </div>
      ` : ''}

      <!-- LINHA SEPARADORA -->
      <div class="linha"></div>

      <!-- ITENS DO PEDIDO -->
      <div class="itens">
        ${processedItems.map(item => `
          <div class="item-row">
            <span class="item-qtd">${item.qtd}x</span>
            <span class="item-desc">${item.descricao}</span>
            <span class="item-total">${item.total}</span>
          </div>
        `).join('')}
      </div>

      <!-- LINHA SEPARADORA -->
      <div class="linha"></div>

      <!-- TOTAIS -->
      <div class="totais">
        <div class="total-row">
          <span>SUBTOTAL:</span>
          <span>${formatCurrency(order.subtotal)}</span>
        </div>
        ${order.deliveryFee > 0 ? `
          <div class="total-row">
            <span>ENTREGA:</span>
            <span>${formatCurrency(order.deliveryFee)}</span>
          </div>
        ` : ''}
        <div class="total-final">
          <span>TOTAL:</span>
          <span>${formatCurrency(order.total)}</span>
        </div>
      </div>

      <!-- PAGAMENTO -->
      <div class="pagamento">
        <div style="margin-bottom: 2mm; font-weight: bold;">FORMA DE PAGAMENTO:</div>
        ${order.payments?.map(payment => `
          <div class="pagamento-item">
            ${payment.method === 'CASH' ? 'DINHEIRO' :
              payment.method === 'PIX' ? 'PIX' :
              payment.method === 'CREDIT_CARD' ? 'CARTÃO CRÉDITO' :
              payment.method === 'DEBIT_CARD' ? 'CARTÃO DÉBITO' : payment.method}
            : ${formatCurrency(payment.amount)}
          </div>
        `).join('')}
        ${change > 0 ? `
          <div class="troco">
            TROCO: ${formatCurrency(change)}
          </div>
        ` : ''}
      </div>

      <!-- LINHA SEPARADORA -->
      <div class="linha-grossa"></div>

      <!-- RODAPÉ -->
      <div class="rodape">
        OBRIGADO PELA PREFERÊNCIA!<br>
        VOLTE SEMPRE!
      </div>

      <div class="data-impressao">
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