const { default: axios } = require("axios");

class F2PoolAPI {
  constructor() {
    this.instance = axios.create({
      baseURL: "https://api.f2pool.com/v2",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "F2P-API-SECRET": process.env.F2POOL_TOKEN,
      },
    });
  }

  async request(method, endpoint, data = {}) {
    try {
      const response = await this.instance({
        method,
        url: endpoint,
        data,
      });
      return response.data;
    } catch (error) {
      console.error(
        `F2Pool API Error: ${endpoint}`,
        error.response?.data || error.message
      );
      throw new Error(`F2Pool API request failed: ${error.message}`);
    }
  }

  async getWorkers() {
    return this.request("POST", "/hash_rate/worker/list", {
      mining_user_name: "dahabminers",
      currency: "bitcoin",
    });
  }
}
