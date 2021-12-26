import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ImageBackground,
    StatusBar,
	Dimensions,
	InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import StyledButton from '../../UI/StyledButton';
import QRCode from 'react-native-qrcode-svg';
const shareImg = require('../../../images/share.png');
import { colors } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import Share from 'react-native-share';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import Device from '../../../util/device';
const logoImg = require('../../../images/fox.png');

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const QR_WIDTH = DEVICE_WIDTH / 3.5;
const styles = StyleSheet.create({
    container: {
        flex: 1,
		backgroundColor: colors.blue,
    },
	topReturn: {
		marginTop: 20,
		marginLeft: 10,
		height: 30,
		width: 80,
	},
	qrcode: {
		marginTop: DEVICE_HEIGHT - QR_WIDTH * 2.5,
		padding: 10,
		width: QR_WIDTH + 20,
		marginLeft: (DEVICE_WIDTH - QR_WIDTH - 20) / 2,
		backgroundColor: colors.white,
		borderRadius: 15,
	},
	buttonWrapper: {
		marginTop: 20,
		width: DEVICE_WIDTH * 0.8,
		marginLeft: DEVICE_WIDTH * 0.1,
		height: 20,
		borderWidth: 0,
	},
});

const shareAddress = 'https://home.hld.im/pages/download';

export default class extends React.Component {
	topReturn = () => {
		this.props.navigation.navigate('WalletView');
	};
	onShare = () => {
		const { selectedAddress } = this.props;
		Share.open({
			message: shareAddress,
		})
			.then(() => {
				this.props.protectWalletModalVisible();
			})
			.catch((err) => {
				Logger.log('Error while trying to share address', err);
			});
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_SHARE_PUBLIC_ADDRESS);
	};

	trackEvent = (event) => {
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(event);
		});
	};

    render() {
        return (
            <ImageBackground style={styles.container} source={shareImg}>
				<StyledButton type={'blue'} containerStyle={styles.topReturn} onPress={this.topReturn}>
					{strings('app_settings.back')}
				</StyledButton>
				<View style={styles.qrcode}>
					<QRCode
						value={shareAddress}
						size={QR_WIDTH}
						logo={logoImg}
					/>
				</View>
				<View style={styles.buttonWrapper}>
					<StyledButton
						type={'blue'}
						onPress={this.onShare}
					>
						{strings('drawer.share_app')}
					</StyledButton>
				</View>
            </ImageBackground >
        );
    }
}
