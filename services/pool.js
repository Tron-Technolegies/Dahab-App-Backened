import axios from "axios";

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

  async getWorkerHistory(workerName) {
    return this.request("POST", "/hash_rate/worker/history", {
      mining_user_name: "dahabminers",
      currency: "bitcoin",
      worker_name: workerName,
      interval: 3600,
      duration: 259200,
    });
  }

  async getWOrkerHistoryDay(workerName) {
    return this.request("POST", "/hash_rate/worker/history", {
      mining_user_name: "dahabminers",
      currency: "bitcoin",
      worker_name: workerName,
      interval: 3600,
      duration: 86400,
    });
  }

  async getTransactionList(start, end) {
    return this.request("POST", "/assets/transactions/list", {
      mining_user_name: "dahabminers",
      currency: "bitcoin",
      type: "all",
      start_time: start,
      end_time: end,
    });
  }
}

export default F2PoolAPI;
