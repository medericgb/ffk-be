import express from 'express';
import swaggerUi from 'swagger-ui-express';
import userRoutes from './routes/user.js';
import authRoutes from './routes/auth.js';
import { openapiSpecification } from './docs/openapi.js';

const app = express();
const PORT = 9090;

app.use(express.json());
app.get('/api-docs.json', (req, res) => res.json(openapiSpecification));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Express and PNPM!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
