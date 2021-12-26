import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshControl, ScrollView, InteractionManager, ActivityIndicator, StyleSheet, View, Image, Text } from 'react-native';
import { useSelector } from 'react-redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import AccountOverview from '../../UI/AccountOverview';
import Tokens from '../../UI/Tokens';
import { getWalletNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { renderFromWei, weiToFiat, hexToBN } from '../../../util/number';
import Engine from '../../../core/Engine';
import CollectibleContracts from '../../UI/CollectibleContracts';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { getTicker } from '../../../util/transactions';
import OnboardingWizard from '../../UI/OnboardingWizard';
import ErrorBoundary from '../ErrorBoundary';

import TabNavigator from 'react-native-tab-navigator';

const assetIcon = require('../../../images/tabs/asset.png');
const assetActiveIcon = require('../../../images/tabs/asset_active.png');
const ecologyIcon = require('../../../images/tabs/ecology.png');
const ecologyActiveIcon = require('../../../images/tabs/ecology_active.png');
const homeIcon = require('../../../images/tabs/home.png');
const homeActiveIcon = require('../../../images/tabs/home_active.png');
const findIcon = require('../../../images/tabs/find.png');
const findActiveIcon = require('../../../images/tabs/find_active.png');
const myIcon = require('../../../images/tabs/my.png');
const myActiveIcon = require('../../../images/tabs/my_active.png');

const styles = StyleSheet.create({
	tabBarStyle: {
		height: 58,
		backgroundColor: colors.white,
	},
	tabText: {
		color: colors.grey400,
		marginBottom: 6,
	},
	tabIcon: {
		width: 24,
		height: 24,
		borderRadius: 12,
	},
	tabIconSel: {
		color: '#7778f7',
	},
	tabBadgeView:{
		width: 16,
		height: 16,
		backgroundColor: '#7778f7',
		borderWidth: 1,
		marginLeft: 10,
		marginTop: 1,
		borderColor: '#FFF',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
	},
	tabBadgeText:{
		color: '#ffffff',
		fontSize: 8,
	},
	wrapper: {
		flex: 1,
		backgroundColor: colors.white,
	},
	tabUnderlineStyle: {
		height: 2,
		backgroundColor: colors.blue,
	},
	tabStyle: {
		paddingBottom: 0,
	},
	textStyle: {
		fontSize: 12,
		letterSpacing: 0.5,
		...(fontStyles.bold as any),
	},
	loader: {
		backgroundColor: colors.white,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

/**
 * Main view for the wallet
 */
const Wallet = ({ navigation }: any) => {
	const [refreshing, setRefreshing] = useState(false);
	const accountOverviewRef = useRef(null);
	/**
	 * Map of accounts to information objects including balances
	 */
	const accounts = useSelector((state: any) => state.engine.backgroundState.AccountTrackerController.accounts);
	/**
	 * ETH to current currency conversion rate
	 */
	const conversionRate = useSelector(
		(state: any) => state.engine.backgroundState.CurrencyRateController.conversionRate
	);
	/**
	 * Currency code of the currently-active currency
	 */
	const currentCurrency = useSelector(
		(state: any) => state.engine.backgroundState.CurrencyRateController.currentCurrency
	);
	/**
	 * An object containing each identity in the format address => account
	 */
	const identities = useSelector((state: any) => state.engine.backgroundState.PreferencesController.identities);
	/**
	 * A string that represents the selected address
	 */
	const selectedAddress = useSelector(
		(state: any) => state.engine.backgroundState.PreferencesController.selectedAddress
	);
	/**
	 * An array that represents the user tokens
	 */
	const tokens = useSelector((state: any) => state.engine.backgroundState.TokensController.tokens);
	/**
	 * Current provider ticker
	 */
	const ticker = useSelector((state: any) => state.engine.backgroundState.NetworkController.provider.ticker);
	/**
	 * Current onboarding wizard step
	 */
	const wizardStep = useSelector((state: any) => state.wizard.step);

	useEffect(() => {
		navigation.setOptions(getWalletNavbarOptions('wallet.title', navigation));
		requestAnimationFrame(async () => {
			const { AssetsDetectionController, AccountTrackerController } = Engine.context as any;
			AssetsDetectionController.detectAssets();
			AccountTrackerController.refresh();
		});
	}, [navigation]);

	const onRefresh = useCallback(async () => {
		requestAnimationFrame(async () => {
			setRefreshing(true);
			const {
				AssetsDetectionController,
				AccountTrackerController,
				CurrencyRateController,
				TokenRatesController,
			} = Engine.context as any;
			const actions = [
				AssetsDetectionController.detectAssets(),
				AccountTrackerController.refresh(),
				CurrencyRateController.start(),
				TokenRatesController.poll(),
			];
			// await Promise.all(actions); // zyl 私有链刷新一直转圈，先禁用
			setRefreshing(false);
		});
	}, [setRefreshing]);

	const renderTabBar = useCallback(
		() => (
			<DefaultTabBar
				underlineStyle={styles.tabUnderlineStyle}
				activeTextColor={colors.blue}
				inactiveTextColor={colors.fontTertiary}
				backgroundColor={colors.white}
				tabStyle={styles.tabStyle}
				textStyle={styles.textStyle}
			/>
		),
		[]
	);

	const onChangeTab = useCallback((obj) => {
		InteractionManager.runAfterInteractions(() => {
			if (obj.ref.props.tabLabel === strings('wallet.tokens')) {
				Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_TOKENS);
			} else {
				Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_COLLECTIBLES);
			}
		});
	}, []);

	const onRef = useCallback((ref) => {
		accountOverviewRef.current = ref;
	}, []);

	const renderContent = useCallback(() => {
		let balance: any = 0;
		let assets = tokens;
		if (accounts[selectedAddress]) {
			balance = renderFromWei(accounts[selectedAddress].balance);
			assets = [
				{
					name: 'Ether', // FIXME: use 'Ether' for mainnet only, what should it be for custom networks?
					symbol: getTicker(ticker),
					isETH: true,
					balance,
					balanceFiat: weiToFiat(
						hexToBN(accounts[selectedAddress].balance) as any,
						conversionRate,
						currentCurrency
					),
					logo: '../images/eth-logo.png',
				},
				...(tokens || []),
			];
		} else {
			assets = tokens;
		}
		const account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] };

		return (
			<View style={styles.wrapper}>
				<AccountOverview account={account} navigation={navigation} onRef={onRef} />
				<ScrollableTabView
					renderTabBar={renderTabBar}
					// eslint-disable-next-line react/jsx-no-bind
					onChangeTab={onChangeTab}
				>
					<Tokens
						tabLabel={strings('wallet.tokens')}
						key={'tokens-tab'}
						navigation={navigation}
						tokens={assets}
					/>
					<CollectibleContracts
						tabLabel={strings('wallet.collectibles')}
						key={'nfts-tab'}
						navigation={navigation}
					/>
				</ScrollableTabView>
			</View>
		);
	}, [
		renderTabBar,
		accounts,
		conversionRate,
		currentCurrency,
		identities,
		navigation,
		onChangeTab,
		onRef,
		selectedAddress,
		ticker,
		tokens,
	]);

	const renderLoader = useCallback(
		() => (
			<View style={styles.loader}>
				<ActivityIndicator size="small" />
			</View>
		),
		[]
	);

	/**
	 * Return current step of onboarding wizard if not step 5 nor 0
	 */
	const renderOnboardingWizard = useCallback(
		() =>
			[1, 2, 3, 4].includes(wizardStep) && (
				<OnboardingWizard navigation={navigation} coachmarkRef={accountOverviewRef.current} />
			),
		[navigation, wizardStep]
	);

	const showBrowser = useCallback(
		() =>
			navigation.navigate('BrowserTabHome'),
		[navigation, wizardStep]
	);

	const showMy = useCallback(
		() =>
			navigation.openDrawer(),
		[navigation, wizardStep]
	);

	return (
		<TabNavigator tabBarStyle={styles.tabBarStyle}>
		  <TabNavigator.Item
			selected={true}
			selectedTitleStyle={styles.tabIconSel}
			title={strings('zyl.wallet')}
			titleStyle={styles.tabText}
			renderIcon={() => <Image style={styles.tabIcon} source={assetIcon} />}
			renderSelectedIcon={() => <Image style={styles.tabIcon} source={assetActiveIcon} />}
			onPress={() => {}}>
			<ErrorBoundary view="Wallet">
				<View style={baseStyles.flexGrow} testID={'wallet-screen'}>
					<ScrollView
						style={styles.wrapper}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
					>
						{selectedAddress ? renderContent() : renderLoader()}
					</ScrollView>
					{renderOnboardingWizard()}
				</View>
			</ErrorBoundary>
		  </TabNavigator.Item>
		  <TabNavigator.Item
			selected={false}
			selectedTitleStyle={styles.tabIconSel}
			title={strings('zyl.find')}
			titleStyle={styles.tabText}
			renderIcon={() => <Image style={styles.tabIcon} source={findIcon} />}
			renderSelectedIcon={() => <Image style={styles.tabIcon} source={findActiveIcon} />}
			// renderBadge={()=><View style={styles.tabBadgeView}><Text style={styles.tabBadgeText}>新</Text></View>}
			onPress={() => showBrowser()}>
			<View />
		  </TabNavigator.Item>
		  <TabNavigator.Item
			selected={false}
			selectedTitleStyle={styles.tabIconSel}
			title={strings('zyl.my')}
			titleStyle={styles.tabText}
			renderIcon={() => <Image style={styles.tabIcon} source={myIcon} />}
			renderSelectedIcon={() => <Image style={styles.tabIcon} source={myActiveIcon} />}
			onPress={() => showMy()}>
			<View />
		  </TabNavigator.Item>
		</TabNavigator>
	);
};

export default Wallet;
