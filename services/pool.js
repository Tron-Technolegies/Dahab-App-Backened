import axios from "axios";

class F2PoolService {
  constructor() {
    this.baseUrl = "https://api.f2pool.com";
    this.auth = {
      username: process.env.F2POOL_API_KEY,
      password: process.env.F2POOL_API_SECRET,
    };
  }
  async getMinerStats(minerId) {
    try {
      const response = await axios.get(`${this.baseUrl}/miner/${minerId}`, {
        auth: this.auth,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching F2Pool miner stats:", error);
      return null;
    }
  }
  async getAllMiners() {
    try {
      const response = await axios.get(`${this.baseUrl}/miners`, {
        auth: this.auth,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching F2Pool miners:", error);
      return null;
    }
  }
}
