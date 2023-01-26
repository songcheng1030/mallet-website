import { http } from '../services/api'
import { PaginatedResponse, PoolFilter } from '../types';
class PoolService {
  async getAll () {
    const res = await http.get<PaginatedResponse>(`/pool/all`);
    return res.data;
  }

  async search (filter: PoolFilter) {
    const res = await http.post<PaginatedResponse>('/pool/search', filter);
    return res.data;
  }

  async searchRunning (filter: PoolFilter) {
    const res = await http.post<PaginatedResponse>('/pool/search-running', filter);
    return res.data;
  }
}

export const poolService = new PoolService()
