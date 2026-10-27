const axios = require('axios');

export default async function handler(req, res) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { valor, chavePix, beneficiario } = req.body;

  // 1. Validação básica de entrada
  if (!valor || valor <= 0 || !chavePix) {
    return res.status(400).json({ success: false, message: 'Dados inválidos para o saque.' });
  }

  try {
    // 2. Leitura da variável de ambiente com o nome exato configurado no Vercel
    const API_TOKEN = process.env.CyberBetVip;
    const API_URL = 'https://api.gateway-pagamentos.com/v1/pix/transfers';

    if (!API_TOKEN) {
      console.error('Erro: Variável de ambiente CyberBetVip não configurada.');
      return res.status(500).json({ 
        success: false, 
        message: 'Configuração interna pendente (Token ausente).' 
      });
    }

    // 3. Chamada de envio do Pix Out para a API
    const response = await axios.post(
      API_URL,
      {
        value: valor,
        pixAddressKey: chavePix,
        description: 'Saque Plataforma CyberBet VIP',
        payerCnpj: '29332369000183',
        recipientName: beneficiario || undefined
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 4. Verificação da resposta
    const status = response.data?.status;
    if (status === 'DONE' || status === 'APPROVED' || status === 'CONFIRMED') {
      return res.status(200).json({
        success: true,
        transactionId: response.data.id || response.data.transactionId,
        message: 'Pix enviado com sucesso!'
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Falha ao processar o Pix na instituição financeira.' 
      });
    }

  } catch (error) {
    console.error('Erro no Pix Out:', error.response ? error.response.data : error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro na conexão com a API de pagamentos.' 
    });
  }
}