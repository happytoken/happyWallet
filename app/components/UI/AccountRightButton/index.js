import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import Identicon from '../Identicon';
import { toggleAccountsModal } from '../../../actions/modals';
import Device from '../../../util/device';
const happywallet_fox = require('../../../images/fox.png');

const styles = StyleSheet.create({
	leftButton: {
		marginTop: 12,
		marginRight: Device.isAndroid() ? 7 : 18,
		marginLeft: Device.isAndroid() ? 7 : 0,
		marginBottom: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	identiconBorder2: {
		borderRadius: 96,
		borderWidth: 2,
		padding: 2,
		// borderColor: colors.blue,
		width: 35,
		height: 35,
	},
});

/**
 * UI PureComponent that renders on the top right of the navbar
 * showing an identicon for the selectedAddress
 */
class AccountRightButton extends PureComponent {
	static propTypes = {
		/**
		 * Selected address as string
		 */
		address: PropTypes.string,
		/**
		 * Action that toggles the account modal
		 */
		toggleAccountsModal: PropTypes.func,
	};

	animating = false;

	toggleAccountsModal = () => {
		if (!this.animating) {
			this.animating = true;
			this.props.toggleAccountsModal();
			setTimeout(() => {
				this.animating = false;
			}, 500);
		}
	};

	render = () => {
		const { address } = this.props;
		return (
			<TouchableOpacity
				style={styles.leftButton}
				onPress={this.toggleAccountsModal}
				testID={'navbar-account-button'}
			>
				{false && (<Identicon diameter={28} address={address} />)}
				<Image source={happywallet_fox} style={styles.identiconBorder2} resizeMethod={'auto'} />
			</TouchableOpacity>
		);
	};
}

const mapStateToProps = (state) => ({ address: state.engine.backgroundState.PreferencesController.selectedAddress });
const mapDispatchToProps = (dispatch) => ({
	toggleAccountsModal: () => dispatch(toggleAccountsModal()),
});
export default connect(mapStateToProps, mapDispatchToProps)(AccountRightButton);
