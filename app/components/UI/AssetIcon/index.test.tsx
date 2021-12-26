import React from 'react';
import { shallow } from 'enzyme';
import AssetIcon from './';
const sampleLogo = 'https://hld-chain.oss-cn-beijing.aliyuncs.com/tokens/WBTC.png';

describe('AssetIcon', () => {
	it('should render correctly', () => {
		const wrapper = shallow(<AssetIcon logo={sampleLogo} />);
		expect(wrapper).toMatchSnapshot();
	});
});
