import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, TextInput, StyleSheet, Text, View, TouchableOpacity, InteractionManager, Image } from 'react-native';
import { swapsUtils } from '@happywallet/swaps-controller';
import { connect } from 'react-redux';
import Engine from '../../../core/Engine';
import Analytics from '../../../core/Analytics';
import AnalyticsV2 from '../../../util/analyticsV2';
import AppConstants from '../../../core/AppConstants';
import { strings } from '../../../../locales/i18n';

import { swapsLivenessSelector } from '../../../reducers/swaps';
import { showAlert } from '../../../actions/alert';
import { protectWalletModalVisible } from '../../../actions/user';
import { toggleAccountsModal, toggleReceiveModal } from '../../../actions/modals';
import { newAssetTransaction } from '../../../actions/transaction';

import Device from '../../../util/device';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { renderFiat } from '../../../util/number';
import { renderAccountName } from '../../../util/address';
import { getEther } from '../../../util/transactions';
import { doENSReverseLookup, isDefaultAccountName } from '../../../util/ENSUtils';
import { isSwapsAllowed } from '../Swaps/utils';

import Identicon from '../Identicon';
import AssetActionButton from '../AssetActionButton';
import EthereumAddress from '../EthereumAddress';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import { allowedToBuy } from '../FiatOrders';
import AssetSwapButton from '../Swaps/components/AssetSwapButton';
import ClipboardManager from '../../../core/ClipboardManager';
import {setUseBlockieIcon} from '../../../actions/settings';
import AsyncStorage from '@react-native-community/async-storage';
const happywallet_fox = require('../../../images/fox.png'); // eslint-disable-line

const styles = StyleSheet.create({
	scrollView: {
		backgroundColor: colors.white,
	},
	wrapper: {
		paddingTop: 20,
		paddingHorizontal: 20,
		paddingBottom: 0,
		alignItems: 'center',
	},
	info: {
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
	},
	data: {
		textAlign: 'center',
		paddingTop: 7,
	},
	label: {
		fontSize: 24,
		textAlign: 'center',
		...fontStyles.normal,
	},
	labelInput: {
		marginBottom: Device.isAndroid() ? -10 : 0,
	},
	addressWrapper: {
		backgroundColor: colors.blue000,
		borderRadius: 40,
		marginTop: 10,
		marginBottom: 10,
		paddingVertical: 7,
		paddingHorizontal: 15,
		display: 'flex',
		alignItems: 'center'
	},
	address: {
		fontSize: 12,
		color: colors.grey400,
		...fontStyles.normal,
		letterSpacing: 0.8,
	},
	amountFiat: {
		fontSize: 12,
		paddingTop: 5,
		color: colors.fontSecondary,
		...fontStyles.normal,
	},
	identiconBorder: {
		borderRadius: 80,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.white,
	},
	identiconBorder2: {
		borderRadius: 96,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.white,
		width: 65,
		height: 65,
	},
	onboardingWizardLabel: {
		borderWidth: 2,
		borderRadius: 4,
		paddingVertical: Device.isIos() ? 2 : -4,
		paddingHorizontal: Device.isIos() ? 5 : 5,
		top: Device.isIos() ? 0 : -2,
	},
	actions: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-start',
		flexDirection: 'row',
	},
});

/**
 * View that's part of the <Wallet /> component
 * which shows information about the selected account
 */
class AccountOverview extends PureComponent {
	static propTypes = {
		/**
		 * String that represents the selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		/* Identities object required to get account name
		*/
		identities: PropTypes.object,
		/**
		 * Object that represents the selected account
		 */
		account: PropTypes.object,
		/**
		/* Selected currency
		*/
		currentCurrency: PropTypes.string,
		/**
		/* Triggers global alert
		*/
		showAlert: PropTypes.func,
		/**
		 * Action that toggles the accounts modal
		 */
		toggleAccountsModal: PropTypes.func,
		/**
		 * whether component is being rendered from onboarding wizard
		 */
		onboardingWizard: PropTypes.bool,
		/**
		 * Used to get child ref
		 */
		onRef: PropTypes.func,
		/**
		 * Prompts protect wallet modal
		 */
		protectWalletModalVisible: PropTypes.func,
		/**
		 * Start transaction with asset
		 */
		newAssetTransaction: PropTypes.func,
		/**
		/* navigation object required to access the props
		/* passed by the parent component
		*/
		navigation: PropTypes.object,
		/**
		 * Action that toggles the receive modal
		 */
		toggleReceiveModal: PropTypes.func,
		/**
		 * Chain id
		 */
		chainId: PropTypes.string,
		/**
		 * Wether Swaps feature is live or not
		 */
		swapsIsLive: PropTypes.bool,
		/**
		 * ID of the current network
		 */
		network: PropTypes.string,
		/**
		 * Current provider ticker
		 */
		ticker: PropTypes.string,
	};

	state = {
		accountLabelEditable: false,
		accountLabel: '',
		originalAccountLabel: '',
		ens: undefined,
	};

	editableLabelRef = React.createRef();
	scrollViewContainer = React.createRef();
	mainView = React.createRef();

	animatingAccountsModal = false;

	toggleAccountsModal = () => {
		const { onboardingWizard } = this.props;
		if (!onboardingWizard && !this.animatingAccountsModal) {
			this.animatingAccountsModal = true;
			this.props.toggleAccountsModal();
			setTimeout(() => {
				this.animatingAccountsModal = false;
			}, 500);
		}
	};

	input = React.createRef();

	componentDidMount = () => {
		const { identities, selectedAddress, onRef } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabel });
		onRef && onRef(this);
		InteractionManager.runAfterInteractions(() => {
			this.doENSLookup();
		});
	};

	componentDidUpdate(prevProps) {
		if (prevProps.account.address !== this.props.account.address || prevProps.network !== this.props.network) {
			requestAnimationFrame(() => {
				this.doENSLookup();
			});
		}
	}

	setAccountLabel = () => {
		const { PreferencesController } = Engine.context;
		const { selectedAddress } = this.props;
		const { accountLabel } = this.state;
		PreferencesController.setAccountLabel(selectedAddress, accountLabel);
		this.setState({ accountLabelEditable: false });
	};

	onAccountLabelChange = (accountLabel) => {
		this.setState({ accountLabel });
	};

	setAccountLabelEditable = () => {
		const { identities, selectedAddress } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabelEditable: true, accountLabel });
		setTimeout(() => {
			this.input && this.input.current && this.input.current.focus();
		}, 100);
	};

	cancelAccountLabelEdition = () => {
		const { identities, selectedAddress } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabelEditable: false, accountLabel });
	};

	copyAccountToClipboard = async () => {
		const { selectedAddress } = this.props;
		await ClipboardManager.setString(selectedAddress);
		this.props.showAlert({
			isVisible: true,
			autodismiss: 1500,
			content: 'clipboard-alert',
			data: { msg: strings('asset_overview.account_copied_to_clipboard') },
		});
		setTimeout(() => this.props.protectWalletModalVisible(), 2000);
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_COPIED_ADDRESS);
		});
	};

	onReceive = () => this.props.toggleReceiveModal();

	onSend = () => {
		const { newAssetTransaction, navigation, ticker } = this.props;
		newAssetTransaction(getEther(ticker));
		navigation.navigate('SendFlowView');
	};

	onBuy = () => {
		this.props.navigation.navigate('FiatOnRamp');
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_BUY_ETH);
			AnalyticsV2.trackEvent(AnalyticsV2.ANALYTICS_EVENTS.ONRAMP_OPENED, {
				button_location: 'Home Screen',
				button_copy: 'Buy',
			});
		});
	};

	goToSwaps = () =>
		this.props.navigation.navigate('Swaps', {
			screen: 'SwapsAmountView',
			params: {
				sourceToken: swapsUtils.NATIVE_SWAPS_TOKEN_ADDRESS,
			},
		});

	goToBrowserUrlSwap = () =>
		this.props.navigation.navigate('BrowserTabHome', {
			screen: 'BrowserView',
			params: {
				newTabUrl: 'https://swap.hld.im/',
			},
		});

	doENSLookup = async () => {
		const { network, account } = this.props;
		try {
			const ens = await doENSReverseLookup(account.address, network);
			this.setState({ ens });
			// eslint-disable-next-line no-empty
		} catch {}
	};

	initHldt2 = async() => {
		// zyl
		// HLD活跃统计
		const now = new Date().getTime()
		const hldActiveTime = AsyncStorage.getItem('hldActiveTime');
		if (isNaN(hldActiveTime?parseFloat(hldActiveTime):0) || (hldActiveTime?parseFloat(hldActiveTime):0) + 5000 < now) {
			await AsyncStorage.setItem('hldActiveTime', now + '');
			try {
				const { selectedAddress } = this.props;
				var xhr = new XMLHttpRequest()
				xhr.open("GET", "https://hld-api.ours.pro/swap/prices?address=" + selectedAddress, true)
				xhr.send("");
				xhr.onreadystatechange =function(){
				if(xhr.readyState === 4 && xhr.status === 200){
					try{
						AsyncStorage.setItem('hldPrices', JSON.stringify(JSON.parse(xhr.responseText).data));
					}catch(e){
					}
					console.log('address active success: ' + xhr.responseText)
				} else{
					console.log('address active fail: ' + xhr.responseText)
				}
			}
		  } catch (e) {
			  console.log('ref error: ' + e)
		  }
		}

		const {
			account: { address, name },
		} = this.props;

		const { TokensController, NetworkController } = Engine.context;
		const { tokens } = TokensController.state;
		if (tokens.length < 2) {
			// 设置默认头像格式,不知道为啥一直不起作用
			this.props.setUseBlockieIcon(false);

			// 添加默认代币
			if (this.props.chainId === "366") {
				const address = "0x672591B938e3bc046Cf60C4DAf0f73316B9C2958";
				const symbol = "USDT";
				const decimals = "6";

				const { TokensController, NetworkController } = Engine.context;
				const { chainId, type } = NetworkController?.state?.provider || {};
				if (chainId === "366") {
					TokensController.addToken(address, symbol, decimals);
				}
				const analyticsParamsAdd = {
					token_address: address,
					token_symbol: symbol,
					network_name: type,
					chain_id: chainId,
					source: 'Custom token',
				};
				AnalyticsV2.trackEvent(AnalyticsV2.ANALYTICS_EVENTS.TOKEN_ADDED, analyticsParamsAdd);
			} else {
				const address = "0x672591B938e3bc046Cf60C4DAf0f73316B9C2958";
				const symbol = "USDT";
				const decimals = "6";

				TokensController.removeToken(address, symbol, decimals);
			}

			// 添加默认代币
			if (this.props.chainId === "366") {
				const address = "0x0d2454b0DA415C6a109C4B592F482C2A77E63752";
				const symbol = "BBB";
				const decimals = "18";

				const { TokensController, NetworkController } = Engine.context;
				const { chainId, type } = NetworkController?.state?.provider || {};
				if (chainId === "366") {
					TokensController.addToken(address, symbol, decimals);
				}
				const analyticsParamsAdd = {
					token_address: address,
					token_symbol: symbol,
					network_name: type,
					chain_id: chainId,
					source: 'Custom token',
				};
				AnalyticsV2.trackEvent(AnalyticsV2.ANALYTICS_EVENTS.TOKEN_ADDED, analyticsParamsAdd);
			} else {
				const address = "0x0d2454b0DA415C6a109C4B592F482C2A77E63752";
				const symbol = "BBB";
				const decimals = "18";

				TokensController.removeToken(address, symbol, decimals);
			}

		}
	}

	render() {
		const {
			account: { address, name },
			currentCurrency,
			onboardingWizard,
			chainId,
			swapsIsLive,
		} = this.props;

		const { TokensController, NetworkController } = Engine.context;
		const { tokens } = TokensController.state;
		const fiatBalance = `${renderFiat(Engine.getTotalFiatAccountBalance(), currentCurrency)}`;

		if (!address) return null;
		const { accountLabelEditable, accountLabel, ens, walletLen } = this.state;

		if (chainId === '366') {
			this.initHldt2();
		}

		return (
			<View style={baseStyles.flexGrow} ref={this.scrollViewContainer} collapsable={false}>
				<ScrollView
					bounces={false}
					keyboardShouldPersistTaps={'never'}
					style={styles.scrollView}
					contentContainerStyle={styles.wrapper}
					testID={'account-overview'}
				>
					<View style={styles.info} ref={this.mainView}>
						<TouchableOpacity
							style={styles.identiconBorder}
							disabled={onboardingWizard}
							onPress={this.toggleAccountsModal}
							testID={'wallet-account-identicon'}
						>
							{false && (<Identicon address={address} diameter={38} noFadeIn={onboardingWizard} />)}
							<Image source={happywallet_fox} style={styles.identiconBorder2} resizeMethod={'auto'} />
						</TouchableOpacity>
						<View ref={this.editableLabelRef} style={styles.data} collapsable={false}>
							{accountLabelEditable ? (
								<TextInput
									style={[
										styles.label,
										styles.labelInput,
										styles.onboardingWizardLabel,
										onboardingWizard ? { borderColor: colors.blue } : { borderColor: colors.white },
									]}
									editable={accountLabelEditable}
									onChangeText={this.onAccountLabelChange}
									onSubmitEditing={this.setAccountLabel}
									onBlur={this.setAccountLabel}
									testID={'account-label-text-input'}
									value={accountLabel}
									selectTextOnFocus
									ref={this.input}
									returnKeyType={'done'}
									autoCapitalize={'none'}
									autoCorrect={false}
									numberOfLines={1}
								/>
							) : (
								<TouchableOpacity onLongPress={this.setAccountLabelEditable}>
									<Text
										style={[
											styles.label,
											styles.onboardingWizardLabel,
											onboardingWizard
												? { borderColor: colors.blue }
												: { borderColor: colors.white },
										]}
										numberOfLines={1}
										testID={'edit-account-label'}
									>
										{isDefaultAccountName(name) && ens ? ens : name}
									</Text>
								</TouchableOpacity>
							)}
						</View>
						{false && (<Text style={styles.amountFiat}>{fiatBalance}</Text>)}
						<TouchableOpacity style={styles.addressWrapper} onPress={this.copyAccountToClipboard}>
							<Text>{strings('asset_overview.copyAccountAddress')}</Text><EthereumAddress address={address} style={styles.address} type={'short'} />
						</TouchableOpacity>

						<View style={styles.actions}>
							<AssetActionButton
								icon="receive"
								onPress={this.onReceive}
								label={strings('asset_overview.receive_button')}
							/>
							{allowedToBuy(chainId) && (
								<AssetActionButton
									icon="buy"
									onPress={this.onBuy}
									label={strings('asset_overview.buy_button')}
								/>
							)}
							<AssetActionButton
								testID={'token-send-button'}
								icon="send"
								onPress={this.onSend}
								label={strings('asset_overview.send_button')}
							/>
							{AppConstants.SWAPS.ACTIVE && (
								<AssetSwapButton
									isFeatureLive={swapsIsLive}
									isNetworkAllowed={isSwapsAllowed(chainId)}
									onPress={this.goToBrowserUrlSwap}
									isAssetAllowed
								/>
							)}
						</View>
					</View>
				</ScrollView>
			</View>
		);
	}
}

const mapStateToProps = (state) => ({
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	identities: state.engine.backgroundState.PreferencesController.identities,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	network: state.engine.backgroundState.NetworkController.network,
	swapsIsLive: swapsLivenessSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
	showAlert: (config) => dispatch(showAlert(config)),
	toggleAccountsModal: () => dispatch(toggleAccountsModal()),
	protectWalletModalVisible: () => dispatch(protectWalletModalVisible()),
	newAssetTransaction: (selectedAsset) => dispatch(newAssetTransaction(selectedAsset)),
	toggleReceiveModal: (asset) => dispatch(toggleReceiveModal(asset)),
	setUseBlockieIcon: (useBlockieIcon) => dispatch(setUseBlockieIcon(useBlockieIcon)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountOverview);
