const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai');

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

const app = express();

app.use(bodyParser.json());
app.use(cors());

jest.mock('openai', () => {
  const mockChat = {
    completions: {
      create: jest.fn(),
    },
  };

  return jest.fn(() => ({
    chat: mockChat,
  }));
});

const openai = new OpenAI();

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

describe('POST /api/sendData', () => {
  it('should respond with a valid response from OpenAI', async () => {
    const inputMessage = 'Test message';
    const responseData = { response: 'Bot response' };

    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: responseData.response } }],
    });

    const response = await request(app)
      .post('/api/sendData')
      .send({ inputMessage })
      .expect(200);

    expect(response.body).toEqual(responseData);
  });

  it('should handle errors and respond with 500 status code', async () => {
    const inputMessage = 'Test message';

    openai.chat.completions.create.mockRejectedValue(new Error('OpenAI error'));

    const response = await request(app)
      .post('/api/sendData')
      .send({ inputMessage })
      .expect(500);

    expect(response.body.error).toBe('Internal server error');
  });
});