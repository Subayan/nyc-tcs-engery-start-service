export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  energyStar: {
    apiKey: process.env.ENERGY_STAR_API_KEY,
    baseUrl: process.env.ENERGY_STAR_BASE_URL,
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  }
}); 