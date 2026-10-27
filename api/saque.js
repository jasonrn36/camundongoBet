const axios = require('axios');

export default async function handler(req, res) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { valor, chavePix, beneficiario } = req.body;

  if (!valor || valor <= 0 || !chavePix) {
    return res.status(400).json({ success: false, message: 'Dados inválidos para o saque.' });
  }

  try {
    // Exemplo de integração com a API real de pagamentos
    const API_URL = 'https://api.gateway-pagamentos.com/v1/pix/transfers';
    const API_TOKEN = process.env.API_TOKEN_SEGREDO; // Use variáveis de ambiente no painel do Vercel

    const response = await axios.post(
      API_URL,
      {
        value: valor,
        pixAddressKey: chavePix,
        description: 'Saque Plataforma CyberBet VIP',
        payerCnpj: '29332369000183'
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'DONE' || response.data.status === 'APPROVED') {
      return res.status(200).json({
        success: true,
        transactionId: response.data.id,
        message: 'Pix enviado com sucesso!'
      });
    } else {
      return res.status(400).json({ success: false, message: 'Falha ao processar o Pix na instituição financeira.' });
    }

  } catch (error) {
    console.error('Erro no Pix Out:', error.response ? error.response.data : error.message);
    return res.status(500).json({ success: false, message: 'Erro na conexão com a API de pagamentos.' });
  }
}