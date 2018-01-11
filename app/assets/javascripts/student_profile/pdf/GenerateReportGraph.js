import Highcharts from 'highcharts';

export default function generateReportGraph(containerSelector, yAxisLabel, xAxisSettings, title, dataSeries){

  const stacking = (dataSeries.length > 1)
    ? "normal"
    : "";

  $(containerSelector).highcharts({
    chart: {
      type: 'column'
    },
    title: {
      text: title
    },
    credits: false,
    exporting: {
      enabled: false
    },
    plotOptions: {
      // This sets charts to render immediately, so we can
      // synchronously set window.status and pass control back
      // to wkhtmltopdf to render the PDF.
      series: { animation: false },
      column: {
        stacking: stacking,
        dataLabels: {
          enabled: true,
          color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
          formatter: function(){
            const val = this.y < 1 ? '' : this.y;
            return val;
          },
        }
      }
    },
    xAxis: xAxisSettings,
    yAxis: {
      title: {
        text: yAxisLabel
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        },
        formatter: function(){
          const val = this.y < 1 ? '' : this.y;
          return val;
        },
      },
      min: 0,
      max: 20,
    },
    series: dataSeries
  });

}
