/* eslint-disable import/prefer-default-export */
import { TokenListMap } from '@happywallet/controllers';

/**
 * Convert token list object to token list array
 */
export const tokenListToArray = (tokenList: TokenListMap) => Object.values(tokenList).map((tokenData) => tokenData);
