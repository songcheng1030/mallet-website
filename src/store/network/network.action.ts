import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { 
    BLOCKCHAIN_GETALL,
    BLOCKCHAIN_CREATE,
    BLOCKCHAIN_UPDATE,
    BLOCKCHAIN_DELETE,

    NODE_GETALL,
    NODE_CREATE,
    NODE_UPDATE,
    NODE_DELETE,

    DEX_GETALL,
    DEX_CREATE,
    DEX_UPDATE,
    DEX_DELETE,

    COIN_GETALL,
    COIN_CREATE,
    COIN_UPDATE,
    COIN_DELETE,
} from '../action-types';
import errorHandler from '../error-handler';
import { networkService } from '../../services';
import { IBlockchainPostRequest, IDex, INode, ICoin } from '../../types';

export const getAllBlockchain = () => async (dispatch: Dispatch) => {
    try {
        // dispatch(showLoading());
        const blockchains = await networkService.getAllBlockchain();
        // dispatch(hideLoading());

        dispatch({
            type: BLOCKCHAIN_GETALL,
            payload: {
                blockchains
            },
        });
    } catch (error: any) {
        // dispatch(hideLoading());
        errorHandler(error, BLOCKCHAIN_GETALL);
    }
}

export const addBlockchain = (blockchain: IBlockchainPostRequest) => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const res = await networkService.addBlockchain(blockchain);
        dispatch(hideLoading());

        dispatch({
            type: BLOCKCHAIN_CREATE,
            payload: {
                blockchain: res
            }
        })
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, BLOCKCHAIN_CREATE);
    }
}

export const updateBlockchain = (blockchain: IBlockchainPostRequest) => async (dispatch: Dispatch) => {
    try {
        if (!blockchain._id) return;
        const newChain = await networkService.updateBlockchain(blockchain._id, blockchain);
        dispatch({
            type: BLOCKCHAIN_UPDATE,
            payload: {
                blockchain: newChain
            }
        })
    } catch (error: any) {
        errorHandler(error, BLOCKCHAIN_UPDATE);
    }
}

export const deleteBlockchain = (blockchainId: string) => async (dispatch: Dispatch) => {
    try {
        await networkService.deleteBlockchain(blockchainId);
        dispatch({
            type: BLOCKCHAIN_DELETE,
            payload: {
                blockchainId
            }
        });
    } catch (error: any) {
        errorHandler(error, BLOCKCHAIN_DELETE)
    }
}

export const getAllNode = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const nodes = await networkService.getAllNode();
        dispatch(hideLoading());

        dispatch({
            type: NODE_GETALL,
            payload: {
                nodes
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, NODE_GETALL);
    }
}

export const addNode = (node: INode) => async(dispatch: Dispatch) => {
    try {
        const res = await networkService.addNode(node);
        dispatch({
            type: NODE_CREATE,
            payload: {
                node: res
            }
        })
    } catch (error: any) {
        errorHandler(error, NODE_CREATE);
    }
}

export const updateNode = (node: INode) => async (dispatch: Dispatch) => {
    try {
        if (!node._id) return;
        const res = await networkService.updateNode(node._id, node);
        dispatch({
            type: NODE_UPDATE,
            payload: {
                node: res
            }
        })
    } catch (error: any) {
        errorHandler(error, NODE_UPDATE);
    }
}

export const deleteNode = (nodeId: string) => async (dispatch: Dispatch) => {
    try {
        await networkService.deleteNode(nodeId);
        dispatch({
            type: NODE_DELETE,
            payload: {
                nodeId
            }
        });
    } catch (error: any) {
        errorHandler(error, NODE_DELETE);
    }
}

export const getAllDex = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const dexs = await networkService.getAllDex();
        dispatch(hideLoading());

        dispatch({
            type: DEX_GETALL,
            payload: {
                dexs
            },
        });
    } catch (error: any) {
        errorHandler(error, DEX_GETALL);
    }
}

export const addDex = (dex: IDex) => async (dispatch: Dispatch) => {
    try {
        const res = await networkService.addDex(dex);
        dispatch({
            type: DEX_CREATE,
            payload: {
                dex: res
            }
        });
    } catch (error: any) {
        errorHandler(error, DEX_CREATE);
    }
}

export const updateDex = (dex: IDex) => async (dispatch: Dispatch) => {
    try {
        if (!dex._id) return;
        const res = await networkService.updateDex(dex._id, dex);
        dispatch({
            type: DEX_UPDATE,
            payload: {
                dex: res
            }
        })
    } catch (error: any) {
        errorHandler(error, DEX_UPDATE);
    }
}

export const deleteDex = (dexId: string) => async(dispatch: Dispatch) => {
    try {
        await networkService.deleteDex(dexId);
        dispatch({
            type: DEX_DELETE,
            payload: {
                dexId
            }
        });
    } catch (error: any) {
        errorHandler(error, DEX_DELETE);
    }
}

export const getAllCoin = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const coins = await networkService.getAllCoins();
        dispatch(hideLoading());

        dispatch({
            type: COIN_GETALL,
            payload: {
                coins
            }
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, COIN_GETALL);
    }
}

export const addCoin = (coin: ICoin) => async(dispatch: Dispatch) => {
    try {
        const res = await networkService.addCoin(coin);
        dispatch({
            type: COIN_CREATE,
            payload: {
                coin: res
            }
        })
    } catch (error: any) {
        errorHandler(error, COIN_CREATE);
    }
}

export const updateCoin = (coin: ICoin) => async(dispatch: Dispatch) => {
    try {
        if (!coin._id) return;
        const res = await networkService.updateCoin(coin._id, coin);
        dispatch({
            type: COIN_UPDATE,
            payload: {
                coin: res
            }
        })
    } catch (error: any) {
        errorHandler(error, COIN_UPDATE);
    }
}

export const deleteCoin = (coinId: string) => async (dispatch: Dispatch) => {
    try {
        await networkService.deleteCoin(coinId);
        dispatch({
            type: COIN_DELETE,
            payload: {
                coinId
            }
        });
    } catch (error: any) {
        errorHandler(error, COIN_DELETE);
    }
}