const express = require('express');
const OpenAI = require('openai');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/sendData', async (req, res) => {
  const { inputMessage } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: inputMessage }],
      model: 'gpt-3.5-turbo',
    });

    if (completion && completion.choices && completion.choices.length > 0) {
      res.json({ response: completion.choices[0].message.content });
    } else {
      throw new Error('Invalid response from OpenAI');
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});