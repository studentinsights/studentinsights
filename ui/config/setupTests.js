// This is a configuration file for Jest
import './sprockets-shims.js';
import '../legacy.js';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-15.4';

Enzyme.configure({ adapter: new Adapter() });
