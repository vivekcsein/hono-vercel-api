// import { Redis } from "@upstash/redis";
// import { envRedisConfig } from "../env/env.redis";

// const redis = new Redis({
//   url: envRedisConfig.REDIS_URL,
//   token: envRedisConfig.REDIS_TOKEN,
// });

// export const connectRedisDatabase = async () => {
//   try {
//     if (envRedisConfig.REDIS_CONNECTION_ON) {
//       const pingCommandResult = await redis.ping();
//       console.log("redis data base is ready to " + pingCommandResult);
//     }
//   } catch (error) {
//     throw new Error("Unhandled Redis error");
//   }
// };

// export default redis;
