// Call this to get page load data using the Performance Timing API.
// It expects to be called in the page load cycle, and then calls back
// with data on page load.
//
// usage:
// measurePageLoad(info => console.log(JSON.stringify(info, null, 2)));
export default function measurePageLoad(callback) {
  window.onload = () => {
    setTimeout(() => {
      const perfData = window.performance.timing; 
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const networkTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      const info = {pageLoadTime, networkTime, renderTime};
      callback(info);
    }, 0);
  };
}