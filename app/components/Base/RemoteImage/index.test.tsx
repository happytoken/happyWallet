import React from 'react';
import { shallow } from 'enzyme';
import RemoteImage from './';

describe('RemoteImage', () => {
	it('should render correctly', () => {
		const wrapper = shallow(
			<RemoteImage
				source={{
					uri: `https://hld-chain.oss-cn-beijing.aliyuncs.com/tokens/dai.svg`,
				}}
			/>
		);
		expect(wrapper).toMatchSnapshot();
	});
});
