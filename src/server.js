import 'dotenv/config';
import app from './app';

// Resgatando as variáveis de env
const port = process.env.API_PORT;

app.listen(port, () => {
  console.log(`Server rodando na porta ${port}...`);
});
