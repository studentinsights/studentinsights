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
          // Since highcharts 8.1.0 we have a problem rendering the pdf with wkhtmltopdf that gets can be resolved by setting
          // this to render as html. At some point we can come back to this for a workaround or fix. We can reenable the color option
          // then as well.
          // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
          useHTML: true,
          formatter() {
            // Sets the number of each type of incident occurences per day
            // If no occurences, displays nothing
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
        formatter() {
          // Sets the total number of occurences per day
          // If no occurences, displays nothing
          const val = this.total < 1 ? '' : this.total;
          return val;
        },
      },
      min: 0,
      max: 20,
    },
    series: dataSeries
  });

}
