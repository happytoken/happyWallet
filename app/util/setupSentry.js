import { init } from '@sentry/react-native';
import { Dedupe, ExtraErrorData } from '@sentry/integrations';

const happywallet_ENVIRONMENT = process.env['happywallet_ENVIRONMENT'] || 'local'; // eslint-disable-line dot-notation
const SENTRY_DSN_PROD = 'https://ae39e4b08d464bba9fbf121c85ccfca0@sentry.io/2299799'; // happywallet-mobile
const SENTRY_DSN_DEV = 'https://332890de43e44fe2bc070bb18d0934ea@sentry.io/2651591'; // test-happywallet-mobile

// Setup sentry remote error reporting
export default function setupSentry() {
	const environment = __DEV__ || !happywallet_ENVIRONMENT ? 'development' : happywallet_ENVIRONMENT;
	const dsn = environment === 'production' ? SENTRY_DSN_PROD : SENTRY_DSN_DEV;
	init({
		dsn,
		debug: __DEV__,
		environment,
		integrations: [new Dedupe(), new ExtraErrorData()],
	});
}
