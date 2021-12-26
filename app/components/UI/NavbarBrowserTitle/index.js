import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TouchableOpacity, View, StyleSheet, Text, Image } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import Networks from '../../../util/networks';
import Icon from 'react-native-vector-icons/FontAwesome';
import Device from '../../../util/device';
import { strings } from '../../../../locales/i18n';
import RemoteImage from '../../Base/RemoteImage';

/* eslint-disable import/no-commonjs */
const ethLogo = require('../../../images/coins/ETH.png');
const bnbLogo = require('../../../images/coins/BNB.png');
const htLogo = require('../../../images/coins/HT.png');
const oktLogo = require('../../../images/coins/OKT.png');
const hldLogo = require('../../../images/coins/HLD.png');
/* eslint-enable import/no-commonjs */

const styles = StyleSheet.create({
	wrapper: {
		alignItems: 'center',
		flex: 1,
	},
	icon: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 3,
	},
	network: {
		flexDirection: 'row',
		marginBottom: 5,
	},
	networkName: {
		fontSize: 11,
		lineHeight: 11,
		color: colors.fontSecondary,
		...fontStyles.normal,
	},
	networkIcon: {
		marginTop: 3,
		width: 5,
		height: 5,
		borderRadius: 100,
		marginRight: 5,
	},
	currentUrlWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
		marginBottom: Device.isAndroid() ? 5 : 0,
		paddingTop: 5
	},
	lockIcon: {
		marginTop: 2,
		marginLeft: 10,
	},
	currentUrl: {
		...fontStyles.normal,
		fontSize: 14,
		textAlign: 'center',
	},
	currentUrlAndroid: {
		maxWidth: '60%',
	},
	siteIcon: {
		width: 16,
		height: 16,
		marginRight: 4,
	},
	urlInput: { // zyl
		...fontStyles.normal,
		backgroundColor: Device.isAndroid() ? colors.white : colors.grey000,
		borderRadius: 30,
		fontSize: Device.isAndroid() ? 16 : 14,
		padding: 9,
		paddingLeft: 50,
		paddingRight: 50,
		textAlign: 'center',
		flex: 1,
		height: Device.isAndroid() ? 40 : 30,
		borderWidth: 1,
		borderColor: colors.blue,
	},
});

/**
 * UI PureComponent that renders inside the navbar
 * showing the view title and the selected network
 */
class NavbarBrowserTitle extends PureComponent {
	static propTypes = {
		/**
		 * String representing the current url
		 */
		url: PropTypes.string,
		/**
		 * Object representing the selected the selected network
		 */
		network: PropTypes.object.isRequired,
		/**
		 * hostname of the current webview
		 */
		hostname: PropTypes.string.isRequired,
		/**
		 * Boolean that specifies if it is a secure website
		 */
		https: PropTypes.bool,
		/**
		 * Boolean that specifies if there is an error
		 */
		error: PropTypes.bool,
		/**
		 * Website icon
		 */
		icon: PropTypes.string,
		/**
		 * Object that represents the current route info like params passed to it
		 */
		route: PropTypes.object,
	};

	onTitlePress = () => {
		this.props.route.params?.showUrlModal?.({ urlInput: this.props.url });
	};

	getNetworkName(network) {
		let name = { ...Networks.rpc, color: null }.name;

		if (network && network.provider) {
			if (network.provider.nickname) {
				name = network.provider.nickname;
			} else if (network.provider.type) {
				const currentNetwork = Networks[network.provider.type];
				if (currentNetwork && currentNetwork.name) {
					name = currentNetwork.name;
				}
			}
		}

		return name;
	}

	render = () => {
		const { https, network, hostname, error, icon } = this.props;
		const color = (Networks[network.provider.type] && Networks[network.provider.type].color) || null;
		const name = this.getNetworkName(network);

		const isHomePage = hostname === strings("browser.title"); // zyl

		const symbol = name;
		let logoTmp = ethLogo;
		if (symbol === 'Ethereum Main Network') {
			logoTmp = ethLogo;
		} else if (symbol === 'Binance Smart Chain Mainnet') {
			logoTmp = bnbLogo;
		} else if (symbol === 'Heco Chain Mainnet') {
			logoTmp = htLogo;
		} else if (symbol === 'Okex Chain Mainnet') {
			logoTmp = oktLogo;
		} else if (symbol === 'Hld Chain Mainnet') {
			logoTmp = hldLogo;
		}
		// <View style={[styles.networkIcon, { backgroundColor: color || colors.red }]} />

		return (
			<TouchableOpacity onPress={this.onTitlePress} style={styles.wrapper}>
				{!isHomePage && (<View style={styles.currentUrlWrapper}>
					{Boolean(icon) && <Image style={styles.siteIcon} source={{ uri: 'https://' + hostname + "/favicon.ico" }} />}
					<Text
						numberOfLines={1}
						ellipsizeMode={'head'}
						style={[styles.currentUrl, Device.isAndroid() ? styles.currentUrlAndroid : {}]}
					>
						{hostname}
					</Text>
					{https && !error ? <Icon name="lock" size={14} style={styles.lockIcon} /> : null}
				</View>)}
				{isHomePage && (<Text onPress={this.onTitlePress} style={styles.urlInput}>
					{ strings('autocomplete.placeholder') }
				</Text>)}
				{false && (<View style={styles.network}>
					<RemoteImage fadeIn source={logoTmp} style={[styles.icon]} />
					<Text style={styles.networkName} testID={'navbar-title-network'}>
						{name}
					</Text>
				</View>)}
			</TouchableOpacity>
		);
	};
}

const mapStateToProps = (state) => ({ network: state.engine.backgroundState.NetworkController });

export default connect(mapStateToProps)(NavbarBrowserTitle);
