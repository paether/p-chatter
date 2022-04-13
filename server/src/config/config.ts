export default function getConfig() {
  const config = {
    PORT: process.env.PORT || 8800,
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  };
  return config;
};
