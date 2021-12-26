import ReactNative from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from 'react-native-i18n';
import { LANGUAGE } from '../app/constants/storage';

// Import all locales
import en from './languages/en.json';
import zh from './languages/zh-cn.json';
import tw from './languages/zh-tw.json';
// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;
I18n.defaultLocale = 'en';
// Define the supported translations
I18n.translations = {
	en,
	zh,
	tw,
};
// If language selected get locale
getUserPreferableLocale();

// Uncomment this for using RTL
//const currentLocale = I18n.currentLocale();

// Is it a RTL language?
export const isRTL = false; // currentLocale.indexOf('jaJp') === 0;

// Set locale
export async function setLocale(locale) {
	I18n.locale = locale;
	await AsyncStorage.setItem(LANGUAGE, locale);
}

// Get languages
export function getLanguages() {
	return {
		en: 'English',
		zh: '中文简体',
		tw: '中文繁體',
	};
}

// Allow RTL alignment in RTL languages
ReactNative.I18nManager.allowRTL(isRTL);

// The method we'll use instead of a regular string
export function strings(name, params = {}) {
	return I18n.t(name, params);
}

// Allow persist locale after app closed
async function getUserPreferableLocale() {
	const locale = await AsyncStorage.getItem(LANGUAGE);
	if (locale) {
		I18n.locale = locale;
	} else {
		I18n.locale = 'en';
	}
}

export default I18n;
