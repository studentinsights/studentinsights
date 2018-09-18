import mixpanel from 'mixpanel-browser';
import {readEnv} from '../envForJs';


// To use it, call `registerUser` first, then `track`.
export default {
  registerUser(currentEducator) {
    try {
      if (!isEnabled()) return;
      mixpanel.init(readEnv().mixpanelToken);
      mixpanel.set_config({
        track_pageview: true,
        secure_cookie: true,
        cross_subdomain_cookie: false // https://help.mixpanel.com/hc/en-us/articles/115004507486-Track-Across-Hosted-Subdomains
      });
      mixpanel.identify(currentEducator.id);
      mixpanel.register({
        'deployment_key': readEnv().deploymentKey,
        'district_key': readEnv().districtKey,
        'educator_id': currentEducator.id,
        'educator_school_id': currentEducator.school_id
      });
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  },

  track(key, attrs) {
    try {
      if (!isEnabled()) return;
      return mixpanel.track(key, attrs);
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }
};

function isEnabled() {
  const {shouldReportAnalytics, mixpanelToken} = readEnv();
  return (shouldReportAnalytics && mixpanelToken);
}
