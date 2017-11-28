// HELPERS
import '../app/assets/javascripts/helpers/ReactHelpers';
import '../app/assets/javascripts/helpers/GraphHelpers';
import '../app/assets/javascripts/helpers/FeedHelpers';
// (unordered)
import '../app/assets/javascripts/helpers/FromPair';
import '../app/assets/javascripts/helpers/GraphHelpers';
import '../app/assets/javascripts/helpers/MixpanelUtils';
import '../app/assets/javascripts/helpers/ProfileDetailsStyle';
import '../app/assets/javascripts/helpers/PropTypes';
import '../app/assets/javascripts/helpers/SortHelpers';
import * as Routes from '../app/assets/javascripts/helpers/Routes';
import {colors, styles} from '../app/assets/javascripts/helpers/Theme';

// Export these so legacy components can use this, and
// new components can pull in components
window.shared || (window.shared = {});
window.shared.Routes = Routes;
window.shared.colors = colors;
window.shared.styles =styles;

