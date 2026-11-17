import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL!;

if (!REDIS_URL) {
  throw new Error('Please define the REDIS_URL environment variable');
}

const redis = createClient({
  url: REDIS_URL,
});

redis.on('error', (err) => console.error('Redis Client Error:', err));

let isConnected = false;

async function connectRedis() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
    console.log('Redis connected successfully');
  }
  return redis;
}

async function disconnectRedis() {
  if (isConnected) {
    await redis.disconnect();
    isConnected = false;
  }
}

export { redis, connectRedis, disconnectRedis };
