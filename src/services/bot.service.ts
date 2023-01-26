import { http } from '../services/api'
import { 
  IBotAddRequest, 
  IBotTradingRequest, 
  IBot, 
  IBotUpdateRequest, 
  IBotStatus, 
  IBotHistory,
  IAutoBotAddRequest,
  IVolumeBotAddRequest,
  ETradingInitiator,
  IAutoBot,
  IVolumeBot,
  ILiquidatorBot,
  ILiquidatorBotAddRequest,
  ILiquidatorTransaction,
  ILiquidatorDailyOrderResponse,
  ILiquidatorBotStatus,
  LiquidatorFilter,
  PaginatedResponse,
  IVolumeBotStatus,
  BotFilter,
  VolumeBotFilter,
  IWasherBot,
  WasherFilter,
  IWasherTransaction
 } from '../types'

class BotService {
  async getAll (initiator: ETradingInitiator=ETradingInitiator.BOT) {
    const res = await http.get<IBot[]>(`/bot/all/${initiator}`);
    return res.data;
  }

  async searchBots (filter: BotFilter) {
    const res = await http.post<PaginatedResponse>(`/bot/search`, filter);
    return res.data;
  }

  async getMyBots () {
    const res = await http.put<IBot[]>('/bot')
    return res.data;
  }

  async getBotById (botId: string) {
    const res = await http.get<IBot>(`/bot/id/${botId}`);
    return res.data;
  }

  async addBot (payload: IBotAddRequest) {
    const res = await http.post<IBot>('/bot', payload);
    return res.data;
  }

  async updateBot(botId: string, payload: IBotUpdateRequest) {
    const res = await http.put<IBot>(`/bot/${botId}`, payload);
    return res.data;
  }

  async deleteBot (botId: string) {
    const res = await http.delete<IBot>(`/bot/${botId}`);
    return res.data;
  }

  async startBot (payload: IBotTradingRequest) {
    const res = await http.post<IBot>('/bot/start', payload);
    return res.data;
  }

  async stopBot (payload: IBotTradingRequest) {
    const res = await http.post<IBot>('/bot/stop', payload);
    return res.data;
  }

  async getAllStatus (initiator: ETradingInitiator=ETradingInitiator.BOT) {
    const res = await http.get<IBotStatus[]>(`/bot/status/all/${initiator}`);
    return res.data;
  }

  async getBotLog (botId: string) {
    const res = await http.get<any>(`/bot/log/${botId}`);
    return res;
  }

  async getBotHistory (botId: string) {
    const res = await http.get<IBotHistory[]>(`/bot/history/${botId}`);
    return res;
  }

  // Auto bot
  async addAutoBot (payload: IAutoBotAddRequest) {
    const res = await http.post<IAutoBot>('/autobot', payload);
    return res.data;
  }

  async getAutoBotById (botId: string) {
    const res = await http.get<IAutoBot>(`/autobot/id/${botId}`);
    return res.data;
  }

  async getAutoBotHistory (botId: string) {
    const res = await http.get<IBotHistory[]>(`/autobot/history/${botId}`);
    return res;
  }

  async getAutoBotLog (botId: string) {
    const res = await http.get<any>(`/autobot/log/${botId}`);
    return res;
  }

  async startAutoBot (payload: IBotTradingRequest) {
    const res = await http.post<IAutoBot>('/autobot/start', payload);
    return res.data;
  }

  async stopAutoBot (payload: IBotTradingRequest) {
    const res = await http.post<IAutoBot>('/autobot/stop', payload);
    return res.data;
  }

  async withdrawAutoBotWallet (botId: string) {
    const res = await http.get<any>(`/autobot/withdraw-wallet/${botId}`);
    return res.data;
  }

  // Volume bot
  async getVolumeBots () {
    const res = await http.get<IVolumeBot[]>('/volumebot/all');
    return res.data;
  }

  async searchVolumeBots (filter: VolumeBotFilter) {
    const res = await http.post<PaginatedResponse>('/volumebot/search', filter);
    return res.data;
  }

  async addVolumeBot (payload: IVolumeBotAddRequest) {
    const res = await http.post<IVolumeBot>('/volumebot', payload);
    return res.data;
  }

  async deleteVolumeBot (botId: string) {
    const res = await http.delete<IVolumeBot>(`/volumebot/${botId}`);
    return res.data;
  }

  async updateVolumeBot(botId: string, payload: IVolumeBotAddRequest) {
    const res = await http.put<IVolumeBot>(`/volumebot/${botId}`, payload);
    return res.data;
  }

  async startVolumeBot (payload: IBotTradingRequest) {
    const res = await http.post<IVolumeBot>('/volumebot/start', payload);
    return res.data;
  }

  async stopVolumeBot (payload: IBotTradingRequest) {
    const res = await http.post<IVolumeBot>('/volumebot/stop', payload);
    return res.data;
  }

  async getVolumeBotStatus () {
    const res = await http.get<IVolumeBotStatus[]>(`/volumebot/status/all`);
    return res.data;
  }

  // Liquidator bot
  async getLiquidatorBots () {
    const res = await http.get<ILiquidatorBot[]>('/liquidatorbot/all');
    return res.data;
  }

  async searchLiquidatorBots (filter: LiquidatorFilter) {
    const res = await http.post<PaginatedResponse>('/liquidatorbot/search', filter);
    return res.data;
  }

  async addLiquidatorBot (payload: ILiquidatorBotAddRequest) {
    const res = await http.post<ILiquidatorBot>('/liquidatorbot', payload);
    return res.data;
  }

  async deleteLiquidatorBot (botId: string) {
    const res = await http.delete<ILiquidatorBot>(`/liquidatorbot/${botId}`);
    return res.data;
  }

  async updateLiquidatorBot(botId: string, payload: ILiquidatorBotAddRequest) {
    const res = await http.put<ILiquidatorBot>(`/liquidatorbot/${botId}`, payload);
    return res.data;
  }

  async getLiquidatorBotTransactions (botId: string) {
    const response = await http.get<ILiquidatorTransaction[]>(`/liquidatorbot/${botId}/transactions`);
    return response.data;
  }

  async startLiquidatorBot (payload: IBotTradingRequest) {
    const res = await http.post<ILiquidatorBot>('/liquidatorbot/start', payload);
    return res.data;
  }

  async stopLiquidatorBot (payload: IBotTradingRequest) {
    const res = await http.post<ILiquidatorBot>('/liquidatorbot/stop', payload);
    return res.data;
  }

  async getLiquidatorStatus () {
    const res = await http.get<ILiquidatorBotStatus[]>(`/liquidatorbot/status/all`);
    return res.data;
  }

  async getLiquidatorBotOrderboks (payload: any) {
    const response = await http.post<{data: ILiquidatorDailyOrderResponse[], total: number}>(`/liquidatorbot/${payload._id}/orderbooks`, payload);
    return response.data;
  }

  // Washer bot
  async getWasherBots () {
    const res = await http.get<IWasherBot[]>('/washerbot/all');
    return res.data;
  }

  async searchWasherBots (filter: WasherFilter) {
    const res = await http.post<PaginatedResponse>('/washerbot/search', filter);
    return res.data;
  }

  async addWasherBot (payload: IWasherBot) {
    const res = await http.post<IWasherBot>('/washerbot', payload);
    return res.data;
  }

  async deleteWasherBot (botId: string) {
    const res = await http.delete<IWasherBot>(`/washerbot/${botId}`);
    return res.data;
  }

  async updateWasherBot(botId: string, payload: IWasherBot) {
    const res = await http.put<IWasherBot>(`/washerbot/${botId}`, payload);
    return res.data;
  }

  async getWasherBotTransactions (botId: string) {
    const response = await http.get<IWasherTransaction[]>(`/washerbot/${botId}/transactions`);
    return response.data;
  }

  async startWasherBot (payload: IBotTradingRequest) {
    const res = await http.post<IWasherBot>('/washerbot/start', payload);
    return res.data;
  }

  async stopWasherBot (payload: IBotTradingRequest) {
    const res = await http.post<ILiquidatorBot>('/washerbot/stop', payload);
    return res.data;
  }

  async withdrawWasherBotWallet (botId: string) {
    const res = await http.get<any>(`/washerbot/withdraw-wallet/${botId}`);
    return res.data;
  }
}

export const botService = new BotService()
