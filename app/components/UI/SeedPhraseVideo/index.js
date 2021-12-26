import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import MediaPlayer from '../../Views/MediaPlayer';
import { TextTrackType } from 'react-native-video';
import scaling from '../../../util/scaling';
import { strings } from '../../../../locales/i18n';

import RemoteImage from '../../Base/RemoteImage';
const newMp4 = require('../../../videos/newMp4.png');

const HEIGHT = scaling.scale(180);

const styles = StyleSheet.create({
	videoContainer: {
		height: HEIGHT,
		width: '100%',
		borderRadius: 15,
	},
	mediaPlayer: {
		height: HEIGHT,
	},
});

const SeedPhraseVideo = ({ style, onClose }) => {
	const video_source_uri = 'https://hld-chain.oss-cn-beijing.aliyuncs.com/recovery-phrase.mp4';
	console.log('zyl: ' + video_source_uri)
	const subtitle_source_tracks = [
		{
			index: 0,
			title: strings('secret_phrase_video_subtitle.title'),
			language: strings('secret_phrase_video_subtitle.language'),
			type: TextTrackType.VTT,
			uri: strings('secret_phrase_video_subtitle.uri'),
		},
	];

	// <MediaPlayer
	// 	onClose={onClose}
	// 	uri={video_source_uri}
	// 	style={[styles.mediaPlayer, style]}
	// 	textTracks={subtitle_source_tracks}
	// 	selectedTextTrack={{ type: 'index', value: 0 }}
	// />
	
	return (
		<View style={styles.videoContainer}>
			<RemoteImage fadeIn source={newMp4} style={[styles.videoContainer]} />
		</View>
	);
};

SeedPhraseVideo.propTypes = {
	style: PropTypes.object,
	onClose: PropTypes.func,
};

export default SeedPhraseVideo;
