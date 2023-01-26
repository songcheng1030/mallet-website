import { http } from '../services/api'
import { IBlockchain, IBlockchainPostRequest, INode, IDex, ICoin } from '../types/network.types'

class NetworkService {
  async getAllBlockchain () {
    return (await http.get<IBlockchain[]>('/network/blockchain/all')).data;
  }

  async getBlockchainById (blockchainId: string) {
    return (await http.get<IBlockchain>(`/network/blockchain/id/${blockchainId}`)).data;
  }

  async addBlockchain (payload: IBlockchainPostRequest) {
    return (await http.post<IBlockchain>('/network/blockchain', payload)).data;
  }

  async updateBlockchain(blockchainId: string, payload: IBlockchainPostRequest) {
    return (await http.put<IBlockchain>(`/network/blockchain/${blockchainId}`, payload)).data;
  }

  async deleteBlockchain (blockchainId: string) {
    return (await http.delete<IBlockchain>(`/network/blockchain/${blockchainId}`)).data;
  }

  async getAllNode () {
    return (await http.get<INode[]>('/network/node/all')).data;
  }

  async getNodeById (nodeId: string) {
    return (await http.get<INode>(`/network/node/id/${nodeId}`)).data;
  }

  async addNode (payload: INode) {
    return (await http.post<INode>('/network/node', payload)).data;
  }

  async updateNode(nodeId: string, payload: INode) {
    return (await http.put<INode>(`/network/node/${nodeId}`, payload)).data;
  }

  async deleteNode (nodeId: string) {
    return (await http.delete<INode>(`/network/node/${nodeId}`)).data;
  }

  async getAllDex () {
    return (await http.get<IDex[]>('/network/dex/all')).data;
  }

  async getDexById (dexId: string) {
    return (await http.get<IDex>(`/network/dex/id/${dexId}`)).data;
  }

  async addDex (payload: IDex) {
    return (await http.post<IDex>('/network/dex', payload)).data;
  }

  async updateDex(dexId: string, payload: IDex) {
    return (await http.put<IDex>(`/network/dex/${dexId}`, payload)).data;
  }

  async deleteDex (dexId: string) {
    return (await http.delete<IDex>(`/network/dex/${dexId}`)).data;
  }

  async getAllCoins () {
    return (await http.get<ICoin[]>('/network/coin/all')).data;
  }

  async getCoinById (coinId: string) {
    return (await http.get<ICoin>(`/network/coin/id/${coinId}`)).data;
  }

  async addCoin (payload: ICoin) {
    return (await http.post<ICoin>('/network/coin', payload)).data;
  }

  async updateCoin(coinId: string, payload: ICoin) {
    return (await http.put<ICoin>(`/network/coin/${coinId}`, payload)).data;
  }

  async deleteCoin (coinId: string) {
    return (await http.delete<ICoin>(`/network/coin/${coinId}`)).data;
  }  
}

export const networkService = new NetworkService()
