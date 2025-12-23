
import { Order, SatConfig, SatResponse, StoreConfig } from '../types';

/**
 * Serviço de Comunicação com o SAT.
 * 
 * NOTA TÉCNICA:
 * Navegadores não acessam DLLs diretamente.
 * Este serviço simula a chamada a um "Proxy Local" (ex: ACBrMonitorPLUS ou API Node.js Local)
 * que estaria rodando em http://localhost:8888 ou similar.
 */

const MOCK_DELAY = 1500;

export const SatService = {
  
  /**
   * Consulta o status operacional do equipamento SAT.
   */
  async consultarStatus(config: SatConfig): Promise<SatResponse> {
    console.log("SAT: Consultando Status...");
    
    if (config.isSimulation) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            code: '107000',
            message: 'SAT EM OPERACAO',
            log: '107000|0000|SAT EM OPERACAO|'
          });
        }, MOCK_DELAY);
      });
    }

    // Aqui entraria a chamada real: await fetch('http://localhost:8888/sat/status')
    throw new Error("Ponte local SAT não detectada (Ative o modo Simulação para testar)");
  },

  /**
   * Envia os dados da venda para o SAT emitir o CF-e.
   */
  async enviarVenda(order: Order, storeConfig: StoreConfig): Promise<SatResponse> {
    console.log("SAT: Enviando Venda...", order.id);

    if (storeConfig.sat.isSimulation) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simula sucesso aleatório (95% de chance)
          const success = Math.random() > 0.05;
          
          if (success) {
            resolve({
              success: true,
              code: '06000',
              message: 'EMITIDO COM SUCESSO',
              chaveConsulta: `35${new Date().getFullYear()}0000000000000059000000000000000000000000`,
              qrCode: 'https://satsp.fazenda.sp.gov.br/COMSAT/Public/ConsultaPublica/ConsultaPublicaCfe.aspx',
              xml: '<cfe>...</cfe>'
            });
          } else {
            resolve({
              success: false,
              code: '06010',
              message: 'ERRO DE COMUNICACAO COM O EQUIPAMENTO',
            });
          }
        }, 2000);
      });
    }

    // Aqui entraria a montagem do XML/INI e POST para o localhost
    throw new Error("Ponte local SAT não detectada.");
  },

  /**
   * Cancela um cupom fiscal emitido anteriormente (dentro de 30 min).
   */
  async cancelarVenda(chaveCfe: string, config: SatConfig): Promise<SatResponse> {
    console.log("SAT: Cancelando Venda...", chaveCfe);

    if (config.isSimulation) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            code: '07000',
            message: 'CANCELADO COM SUCESSO',
            chaveConsulta: chaveCfe,
          });
        }, MOCK_DELAY);
      });
    }

    throw new Error("Ponte local SAT não detectada.");
  },

  /**
   * Ativa o equipamento SAT (Uso Administrativo).
   */
  async ativarSat(config: SatConfig, cnpj: string): Promise<SatResponse> {
    console.log("SAT: Ativando Equipamento...");

    if (config.isSimulation) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            code: '04000',
            message: 'SAT ATIVADO COM SUCESSO',
          });
        }, MOCK_DELAY * 2);
      });
    }

    throw new Error("Ponte local SAT não detectada.");
  },

  /**
   * Imprime o Extrato (Cupom) do SAT.
   * Na web, isso geralmente significa gerar o HTML do cupom ou mandar comando para impressora local.
   */
  async imprimirExtrato(xml: string, config: SatConfig): Promise<boolean> {
     console.log("SAT: Imprimindo Extrato...");
     return true; // Assume que o serviço de impressão local lidou com isso
  }
};
