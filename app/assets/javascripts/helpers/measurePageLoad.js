export default function measurePageLoad(callback) {
  window.onload = () => {
    setTimeout(() => {
      const perfData = window.performance.timing; 
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const networkTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      const info = {pageLoadTime, networkTime, renderTime};
      callback(info);
      window.info = info;
    }, 0);
  };
}