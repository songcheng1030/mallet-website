import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';
import { IBlockchain, IDex, INode, ICoin } from '../../types';

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

export interface NetworkState {
    blockchains: IBlockchain[],
    nodes: INode[],
    dexs: IDex[],
    coins: ICoin[],
}

interface NetworkAction extends Action {
    payload: {
        blockchainId: string,
        blockchain: IBlockchain,
        blockchains: IBlockchain[],

        nodeId: string,
        node: INode,
        nodes: INode[],

        dexId: string,
        dex: IDex,
        dexs: IDex[],

        coinId: string,
        coin: ICoin,
        coins: ICoin[],
    }
}

const initialState: NetworkState = {
    blockchains: [],
    nodes: [],
    dexs: [],
    coins: [],
}

export const networkReducer: Reducer<NetworkState, NetworkAction> = handleActions(
    {
        [BLOCKCHAIN_GETALL]: (state: NetworkState, { payload: { blockchains } }: NetworkAction) => ({
            ...state,
            blockchains
        }),
        [BLOCKCHAIN_CREATE]: (state: NetworkState, { payload: { blockchain } }: NetworkAction) => {
            const blockchains = state.blockchains.slice();
            blockchains.push(blockchain);
            return {
                ...state,
                blockchains
            };
        },
        [BLOCKCHAIN_UPDATE]: (state: NetworkState, { payload: { blockchain }}: NetworkAction) => {
            const blockchains = state.blockchains.map(item => (item._id === blockchain._id ? blockchain : item))
            return {
                ...state,
                blockchains
            }
        },
        [BLOCKCHAIN_DELETE]: (state: NetworkState, { payload: { blockchainId }}: NetworkAction) => {
            const blockchains = state.blockchains.filter(item => item._id !== blockchainId);
            return {
                ...state,
                blockchains
            }
        },

        [NODE_GETALL]: (state: NetworkState, { payload: { nodes } }: NetworkAction) => ({
            ...state,
            nodes
        }),
        [NODE_CREATE]: (state: NetworkState, { payload: { node }}: NetworkAction) => {
            const nodes = state.nodes.slice();
            nodes.push(node);
            return {
                ...state,
                nodes
            }
        },
        [NODE_UPDATE]: (state: NetworkState, { payload: { node }}: NetworkAction) => {
            const nodes = state.nodes.map(item => (item._id === node._id ? node : item));
            return {
                ...state,
                nodes
            }
        },
        [NODE_DELETE]: (state: NetworkState, { payload: { nodeId }}: NetworkAction) => {
            const nodes = state.nodes.filter(item => item._id !== nodeId);
            return {
                ...state,
                nodes
            }
        },

        [DEX_GETALL]: (state: NetworkState, { payload: { dexs } }: NetworkAction) => ({
            ...state,
            dexs
        }),
        [DEX_CREATE]: (state: NetworkState, { payload: {dex }}: NetworkAction) => {
            const dexs = state.dexs.slice();
            dexs.push(dex);
            return {
                ...state,
                dexs
            }
        },
        [DEX_UPDATE]: (state: NetworkState, { payload: {dex}}: NetworkAction) => {
            const dexs = state.dexs.map(item => (item._id === dex._id ? dex : item));
            return {
                ...state,
                dexs
            }
        },
        [DEX_DELETE]: (state: NetworkState, { payload: {dexId}}: NetworkAction) => {
            const dexs = state.dexs.filter(item =>  item._id !== dexId);
            return {
                ...state,
                dexs
            }
        },

        [COIN_GETALL]: (state: NetworkState, { payload: { coins } }: NetworkAction) => ({
            ...state,
            coins
        }),
        [COIN_CREATE]: (state: NetworkState, { payload: {coin }}: NetworkAction) => {
            const coins = state.coins.slice();
            coins.push(coin);
            return {
                ...state,
                coins
            }
        },
        [COIN_UPDATE]: (state: NetworkState, { payload: {coin}}: NetworkAction) => {
            const coins = state.coins.map(item => (item._id === coin._id ? coin : item));
            return {
                ...state,
                coins
            }
        },
        [COIN_DELETE]: (state: NetworkState, { payload: {coinId}}: NetworkAction) => {
            const coins = state.coins.filter(item =>  item._id !== coinId);
            return {
                ...state,
                coins
            }
        }
    },
    initialState
)