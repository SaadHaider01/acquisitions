import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from aquisitions');
});

export default app;
