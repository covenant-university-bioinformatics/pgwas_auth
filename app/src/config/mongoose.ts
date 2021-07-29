export const config = {
  user: process.env.MONGODB_USER,
  password: process.env.MONGODB_PASSWORD,
  host: process.env.MONGO_HOST,
  dbName: "auth_pgwas",
  podName: process.env.MONGODB_PODNAME,
};
