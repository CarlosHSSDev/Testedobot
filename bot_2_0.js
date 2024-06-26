const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');
const app = express();

const client = new Client({
    puppeteer: {
      headless: true,
      args: ['--no-sandbox']
  },
    authStrategy: new LocalAuth({
        clientId: "client-one"
    }),
    webVersionCache: {
        type: "remote",
        remotePath:
            "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente Logado!');
});

client.on("message", async msg => {
    const numero = msg.from
    const dataAtual = new Date();
    dataAtual.setHours(dataAtual.getHours() - 3);  // Ajusta para o fuso horário GMT-3

    const data = {
        message: msg.body.replace('"', '\"'),
        current_date: dataAtual.toISOString(),  // Envia a data e hora ajustada
        user_timezone_offset: -180,  // Offset de fuso horário GMT-3 em minutos (-3 horas)
    };

    const url = `https://4268888Isaias.pythonanywhere.com/chat?numero=${numero}`;
                

    // Configuração do cabeçalho para indicar que estamos enviando JSON
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    axios.post(url, data, config)
        .then(response => {
            let resp = response.data.response
            client.sendMessage(msg.from, resp)
        })
        .catch(error => {
            console.error('Erro na requisição para o serviço:', error);
        });
});

app.use(express.json());

app.post('/send-message', (req, res) => {
    const { number, message } = req.body;
    client.sendMessage(number, message).then(response => {
        res.status(200).send('Mensagem enviada com sucesso!');
    }).catch(err => {
        console.log(err)
        res.status(500).send('Falha ao enviar a mensagem');
    });
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
