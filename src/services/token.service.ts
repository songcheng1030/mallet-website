import { http } from '../services/api'
import { ITokenDetailReqDto, ITokenDetailDto, ITokenCreateRequest, ITokenCreator, TokenCreatorFilter, PaginatedResponse, ITokenMintBurnTransaction, ILiquidityPoolTransaction } from 'types';

class TokenService {
  async getTokenDetail (payload: ITokenDetailReqDto) {
    const res = await http.post<ITokenDetailDto>(`/token/detail`, payload);
    return res.data;
  }

  async addTokenCreator (payload: ITokenCreateRequest) {
    return (await http.post<ITokenCreator>('/token-creator', payload)).data;
  }

  async searchTokenCreators (filter: TokenCreatorFilter) {
    const res = await http.post<PaginatedResponse>('/token-creator/search', filter);
    return res.data;
  }

  async mintToken(payload: {amount: string, creatorId: string}) {
    const res = await http.post<boolean>(`/token-creator/mintToken`, payload);
    return res.data;
  }

  async burnToken(payload: {amount: string, creatorId: string}) {
    const res = await http.post<boolean>(`/token-creator/burnToken`, payload);
    return res.data;
  }

  async addLP(payload: {baseCoinAddress: string, baseCoinAmount: string, tokenAmount: string, dexId: string, creatorId: string}) {
    const res = await http.post<boolean>(`/token-creator/addLP`, payload);
    return res.data;
  }

  async removeLP(payload: {baseCoinAddress: string, lpAddress: string, lpAmount: string, dexId: string, creatorId: string}) {
    const res = await http.post<boolean>(`/token-creator/removeLP`, payload);
    return res.data;
  }

  async getTokenCreators () {
    const res = await http.get<ITokenCreator[]>('/token-creator/all');
    return res.data;
  }

  async deleteTokenCreator (tokenId: string) {
    const res = await http.delete<ITokenCreator>(`/token-creator/${tokenId}`);
    return res.data;
  }

  async updateTokenCreator(tokenId: string, payload: ITokenCreateRequest) {
    const res = await http.put<ITokenCreator>(`/token-creator/${tokenId}`, payload);
    return res.data;
  }

  async getAllMintBurnTransactions(creatorId: string) {
    const res = await http.get<ITokenMintBurnTransaction>(`token-creator/mintBurnTransactions/${creatorId}`);
    return res.data
  }

  async getAllLiquidityPoolTransactions(creatorId: string) {
    const res = await http.get<ILiquidityPoolTransaction>(`token-creator/liquidityPoolTransactions/${creatorId}`);
    return res.data
  }
}

export const tokenService = new TokenService()
