const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// CREDENCIAIS DA SUA CONTA PJ / GATEWAY (Ex: Asaas / Efí / Mercado Pago / BaaS)
const API_URL = 'https://api.gateway-pagamentos.com/v1/pix/transfers';
const API_TOKEN = 'SEU_TOKEN_DE_API_PRIVADO_AQUI'; // Fornecido pelo seu parceiro bancário

// ENDPOINT DE SAQUE REAL (PIX OUT)
app.post('/api/saque-pix', async (req, res) => {
  const { valor, chavePix, beneficiario } = req.body;

  // Validação de segurança no backend
  if (!valor || valor <= 0 || !chavePix) {
    return res.status(400).json({ success: false, message: 'Dados inválidos para o saque.' });
  }

  try {
    // Chamada à API bancária oficial para realizar a transferência instantânea
    const response = await axios.post(
      API_URL,
      {
        value: valor,
        pixAddressKey: chavePix,
        description: 'Saque Plataforma CyberBet VIP',
        payerCnpj: '29332369000183' // Seu CNPJ cadastrado
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Retorna a confirmação de que o Pix saiu da conta PJ
    if (response.data.status === 'DONE' || response.data.status === 'APPROVED') {
      return res.json({
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
});

app.listen(3000, () => {
  console.log('Servidor Backend do CyberBet VIP rodando na porta 3000');
});