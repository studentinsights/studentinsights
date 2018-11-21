// Mixpanel is no longer in use.
//
// This maintains an analytics API since JS code is already instrumented in various places
// and this keeps those hooks in place.
export default {
  registerUser(currentEducator) {
    return;
  },

  track(key, attrs) {
    return;
  }
};
