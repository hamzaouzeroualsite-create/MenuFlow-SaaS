import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import { initSocket } from './socket';
import { redis } from './lib/redis';
import { prisma } from './lib/prisma';

const PORT = parseInt(process.env.API_PORT || '4000', 10);

async function main() {
  const httpServer = createServer(app);
  initSocket(httpServer);

  try {
    await redis.connect();
    console.log('✅ Redis connected');
  } catch {
    console.warn('⚠️  Redis not available, running without cache');
  }

  await prisma.$connect();
  console.log('✅ Database connected');

  httpServer.listen(PORT, () => {
    console.log(`🚀 MenuFlow API running on http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});
