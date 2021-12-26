import Device from '../util/device';
import { MAINNET, RINKEBY } from '../constants/network';

const DEVELOPMENT = 'development';

export default {
	IS_DEV: process.env?.NODE_ENV === DEVELOPMENT,
	DEFAULT_LOCK_TIMEOUT: -1,
	DEFAULT_SEARCH_ENGINE: 'Google',
	TX_CHECK_MAX_FREQUENCY: 5000,
	TX_CHECK_NORMAL_FREQUENCY: 10000,
	TX_CHECK_BACKGROUND_FREQUENCY: 30000,
	IPFS_OVERRIDE_PARAM: 'mm_override',
	IPFS_DEFAULT_GATEWAY_URL: 'https://cloudflare-ipfs.com/ipfs/',
	IPNS_DEFAULT_GATEWAY_URL: 'https://cloudflare-ipfs.com/ipns/',
	SWARM_DEFAULT_GATEWAY_URL: 'https://swarm-gateways.net/bzz:/',
	supportedTLDs: ['eth', 'xyz', 'test'],
	MAX_PUSH_NOTIFICATION_PROMPT_TIMES: 2,
	CONNEXT: {
		HUB_EXCHANGE_CEILING_TOKEN: 69,
		MIN_DEPOSIT_ETH: 0.03,
		MAX_DEPOSIT_TOKEN: 30,
		BLOCKED_DEPOSIT_DURATION_MINUTES: 5,
		CONTRACTS: {
			4: '0x0Fa90eC3AC3245112c6955d8F9DD74Ec9D599996',
			1: '0xdfa6edAe2EC0cF1d4A60542422724A48195A5071',
		},
		SUPPORTED_NETWORKS: [MAINNET, RINKEBY],
	},
	MM_UNIVERSAL_LINK_HOST: 'home.hld.im/pages',
	SAI_ADDRESS: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
	UNIV3_NFT_CONTRACT_ADDRESS: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
	HOMEPAGE_URL: 'https://home.hld.im/',
	SHORT_HOMEPAGE_URL: 'hld.im',
	ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
	USER_AGENT: Device.isAndroid()
		? 'Mozilla/5.0 (Linux; Android 10; Android SDK built for x86 Build/OSM1.180201.023) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36'
		: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/76.0.3809.123 Mobile/15E148 Safari/605.1',
	NOTIFICATION_NAMES: {
		accountsChanged: 'happywallet_accountsChanged',
		unlockStateChanged: 'happywallet_unlockStateChanged',
		chainChanged: 'happywallet_chainChanged',
	},
	FIAT_ORDERS: {
		TRANSAK_URL: 'https://global.transak.com/',
		TRANSAK_URL_STAGING: 'https://staging-global.transak.com/',
		TRANSAK_API_URL_PRODUCTION: 'https://api.transak.com/',
		TRANSAK_API_URL_STAGING: 'https://staging-api.transak.com/',
		TRANSAK_REDIRECT_URL: 'https://home.hld.im/',
		WYRE_API_ENDPOINT: 'https://api.sendwyre.com/',
		WYRE_API_ENDPOINT_TEST: 'https://api.testwyre.com/',
		WYRE_MERCHANT_ID: 'merchant.im.hld.wyre',
		WYRE_MERCHANT_ID_TEST: 'merchant.im.hld.wyre.test',
		POLLING_FREQUENCY: 10000,
	},
	DEEPLINKS: {
		ORIGIN_DEEPLINK: 'deeplink',
		ORIGIN_QR_CODE: 'qr-code',
	},
	SWAPS: {
		ACTIVE: true,
		ONLY_MAINNET: true,
		CLIENT_ID: 'mobile',
		LIVENESS_POLLING_FREQUENCY: 5 * 60 * 1000,
		POLL_COUNT_LIMIT: 3,
		DEFAULT_SLIPPAGE: 3,
		CACHE_AGGREGATOR_METADATA_THRESHOLD: 5 * 60 * 1000,
		CACHE_TOKENS_THRESHOLD: 5 * 60 * 1000,
		CACHE_TOP_ASSETS_THRESHOLD: 5 * 60 * 1000,
	},
	MAX_SAFE_CHAIN_ID: 4503599627370476,
	URLS: {
		TERMS_AND_CONDITIONS: 'https://home.hld.im/pages/teams',
		PRIVACY_POLICY: 'https://home.hld.im/pages/privacy',
		CONNECTIVITY_ISSUES: 'https://home.hld.im/pages/issues',
		NFT: 'https://home.hld.im/pages/nft',
		SECURITY: 'https://home.hld.im/pages/security',
	},
	ERRORS: {
		INFURA_BLOCKED_MESSAGE: 'EthQuery - RPC Error - This service is not available in your country',
	},
	GAS_OPTIONS: {
		LOW: 'low',
		MEDIUM: 'medium',
		HIGH: 'high',
	},
	GAS_TIMES: {
		UNKNOWN: 'unknown',
		MAYBE: 'maybe',
		LIKELY: 'likely',
		VERY_LIKELY: 'very_likely',
		AT_LEAST: 'at_least',
		LESS_THAN: 'less_than',
		RANGE: 'range',
	},
};
