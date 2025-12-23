
import { GoogleGenAI } from "@google/genai";
import { OrderAnalysisResult, PizzaSize, Product } from "../types";

export const parseSmartOrder = async (userPrompt: string, currentMenu: Product[]): Promise<OrderAnalysisResult> => {
  const simplifiedMenu = currentMenu.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price
  }));

  // Always use the object-based constructor for GoogleGenAI
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            productId: { type: "string" },
            quantity: { type: "integer" },
            size: { type: "string", enum: [PizzaSize.SMALL, PizzaSize.MEDIUM, PizzaSize.LARGE] }
          },
          required: ["productId", "quantity"]
        }
      },
      customerName: { type: "string" },
      customerPhone: { type: "string" },
      address: {
        type: "object",
        properties: {
          street: { type: "string" },
          number: { type: "string" },
          neighborhood: { type: "string" },
          city: { type: "string" },
          complement: { type: "string" }
        }
      },
      paymentMethod: { type: "string", enum: ['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD'] },
      orderType: { type: "string", enum: ['DELIVERY', 'PICKUP'] },
      confirmationMessage: { type: "string" },
      missingInfo: {
        type: "array",
        items: { type: "string" },
        description: "Lista de informações que o atendente deve perguntar pois não foram encontradas no texto (ex: 'faltou o número do endereço')"
      }
    },
    required: ["items", "confirmationMessage"]
  };

  const systemInstruction = `
    Você é um Agente IA especialista em PDV de Pizzaria. Sua função é ler conversas de WhatsApp e montar o pedido.
    
    Cardápio Atual: ${JSON.stringify(simplifiedMenu)}

    Diretrizes:
    1. Identifique os produtos. Se for pizza, o padrão é 'Grande'.
    2. Extraia o NOME e TELEFONE do cliente se houver.
    3. Extraia o ENDEREÇO (Rua, Número, Bairro, Cidade). Se for entrega, defina orderType como 'DELIVERY'.
    4. Identifique a forma de pagamento (Dinheiro=CASH, PIX=PIX, Cartão=CREDIT_CARD).
    5. No campo 'missingInfo', liste o que FALTA para fechar o pedido (ex: "Qual o número da casa?", "Como será o pagamento?").
    6. Seja amigável na 'confirmationMessage'.
  `;

  try {
    // Correctly call generateContent with model name and prompt
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // Directly access the text property as defined in guidelines
    if (response.text) {
      return JSON.parse(response.text) as OrderAnalysisResult;
    }
    throw new Error("Resposta vazia");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

/**
 * Fornece ajuda técnica para impressoras térmicas usando Gemini AI.
 * Segue as diretrizes de codificação do Google GenAI SDK.
 */
export const getPrinterHelp = async (userPrompt: string, history: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Histórico da Conversa:\n${history.join('\n')}\n\nUsuário: ${userPrompt}`,
    config: {
      systemInstruction: 'Você é um técnico especializado em impressoras térmicas (Elgin, Bematech, Epson, POS-80). Ajude o usuário a resolver problemas técnicos de instalação, drivers ou falhas de impressão de forma concisa e prática. Responda em português.',
    }
  });
  // Return extracted text or a fallback string
  return response.text || 'Desculpe, não consegui processar sua solicitação de suporte no momento.';
};