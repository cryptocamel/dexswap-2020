// string literals for actions

// set global web3 object
export const INITIALIZE_GLOBAL_WEB3 = 'INITIALIZE_GLOBAL_WEB3';

// web3 actions, all set from action creator to reducer to app
export const SET_WEB3_CONNECTION_STATUS = 'WEB3_CONNECTION_STATUS';
export const CHECK_WEB3_CONNECTION = 'CHECK_WEB3_CONNECTION';
export const SET_CURRENT_MASK_ADDRESS = 'SET_CURRENT_MASK_ADDRESS';

export const METAMASK_LOCKED = 'METAMASK_LOCKED';
export const METAMASK_UNLOCKED = 'METAMASK_UNLOCKED';
export const SET_INTERACTION_STATE = 'SET_INTERACTION_STATE';
export const SET_NETWORK_MESSAGE = 'SET_NETWORK_MESSAGE';

export const SET_BLOCK_TIMESTAMP = 'SET_BLOCK_TIMESTAMP';
export const SET_EXCHANGE_TYPE = 'SET_EXCHANGE_TYPE';

// actions to toggle divs
export const TOGGLE_ABOUT = 'TOGGLE_ABOUT';
export const TOGGLE_INVEST = 'TOGGLE_INVEST';

// CONTRACT actions in actions, action creator, reducer
export const FACTORY_CONTRACT_READY = 'FACTORY_CONTRACT_READY';
export const EXCHANGE_CONTRACT_READY = 'EXCHANGE_CONTRACT_READY';
export const TOKEN_CONTRACT_READY = 'TOKEN_CONTRACT_READY';

// actions for the exchange
export const SET_INPUT_BALANCE = 'SET_INPUT_BALANCE';
export const SET_OUTPUT_BALANCE = 'SET_OUTPUT_BALANCE';
export const SET_INPUT_TOKEN = 'SET_INPUT_TOKEN';
export const SET_OUTPUT_TOKEN = 'SET_OUTPUT_TOKEN';
export const SET_ETH_POOL_1 = 'SET_ETH_POOL_1';
export const SET_ETH_POOL_2 = 'SET_ETH_POOL_2';
export const SET_TOKEN_POOL_1 = 'SET_TOKEN_POOL_1';
export const SET_TOKEN_POOL_2 = 'SET_TOKEN_POOL_2';
export const SET_ALLOWANCE_APPROVAL_STATE = 'SET_ALLOWANCE_APPROVAL_STATE';
export const SET_EXCHANGE_INPUT_VALUE = 'SET_EXCHANGE_INPUT_VALUE';
export const SET_EXCHANGE_OUTPUT_VALUE = 'SET_EXCHANGE_OUTPUT_VALUE';
export const SET_EXCHANGE_RATE = 'SET_EXCHANGE_RATE';
export const SET_EXCHANGE_FEE = 'SET_EXCHANGE_FEE';
export const SET_INVEST_TOKEN = 'SET_INVEST_TOKEN';
export const SET_INVEST_ETH_POOL = 'SET_INVEST_ETH';
export const SET_INVEST_TOKEN_POOL = 'SET_INVEST_TOKENS';
export const SET_INVEST_TOKEN_ALLOWANCE = 'SET_INVEST_TOKEN_ALLOWANCE';
export const SET_INVEST_SHARES = 'SET_INVEST_SHARES';
export const SET_USER_SHARES = 'SET_USER_SHARES';
export const SET_INVEST_TOKEN_BALANCE = 'SET_INVEST_TOKEN_BALANCE';
export const SET_INVEST_ETH_BALANCE = 'SET_INVEST_ETH_BALANCE';
export const SET_INVEST_SHARES_INPUT = 'SET_INVEST_SHARES_INPUT';
export const SET_INVEST_ETH_REQUIRED = 'SET_INVEST_ETH_REQUIRED';
export const SET_INVEST_TOKENS_REQUIRED = 'SET_INVEST_TOKENS_REQUIRED';
export const SET_INVEST_CHECKED = 'SET_INVEST_CHECKED';
