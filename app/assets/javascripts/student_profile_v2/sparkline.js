(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  /*
  Project quads outside of the date range, since interpolation will connect with previous data points.
  */
  var Sparkline = window.shared.Sparkline = React.createClass({
    displayName: 'Sparkline',

    propTypes: {
      height: React.PropTypes.number.isRequired,
      width: React.PropTypes.number.isRequired,
      quads: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)).isRequired,
      dateRange: React.PropTypes.array.isRequired,
      valueRange: React.PropTypes.array.isRequired,
      thresholdValue: React.PropTypes.number.isRequired,
    },

    getDefaultProps: function() {
      return {
        shouldDrawCircles: true
      };
    },

    render: function() {
      var padding = 3; // for allowing circle data points at the edge to be full shown
      
      // TODO(kr) work more on coloring across all charts
      // for now, disable since the mapping to color isn't clear enough and
      // doesn't match the longer-view charts
      function makeGradientColor(color1, color2, percent) {
          var newColor = {};

          function makeChannel(a, b) {
              return(a + Math.round((b-a)*(percent/100)));
          }

          function makeColorPiece(num) {
              num = Math.min(num, 255);   // not more than 255
              num = Math.max(num, 0);     // not less than 0
              var str = num.toString(16);
              if (str.length < 2) {
                  str = "0" + str;
              }
              return(str);
          }

          newColor.r = makeChannel(color1.r, color2.r);
          newColor.g = makeChannel(color1.g, color2.g);
          newColor.b = makeChannel(color1.b, color2.b);
          newColor.cssColor = "#" + 
                              makeColorPiece(newColor.r) + 
                              makeColorPiece(newColor.g) + 
                              makeColorPiece(newColor.b);
          return(newColor);
      }

      var color = function(val) {
          //val represents a number of how much the line on the 
          //chart increased or decreased.

          //If the line in the viewable area of the chart 
          //increases, color it green, otherwise color it red.

          //This amplifies the amount of the move so that 
          //the colorizing significantly colorizes small moves
          //
          //Perhaps an argument could be made to colorize against
          //the maximum change from the maximum student
          if (val < 5){
             val = val * 8
          }

          if (val > 100)    {  val = 100;  }
          else if (val < -100) {  val = -100;    }

          var red = new Object();
          red.r = 255;
          red.g = 0;
          red.b = 0;

          var blue = new Object();
          blue.r = 0;
          blue.g = 0;
          blue.b = 255;

          var grey = new Object();
          grey.r = 120;
          grey.g = 120;
          grey.b = 120;
          if (val > 0){
              var stuff = makeGradientColor(grey, blue, val)
          }
          else{
              var stuff = makeGradientColor(grey, red, -val)
          }
          var rgb = "rgb(" + stuff.r + "," + stuff.g + "," + stuff.b + ")"
          return rgb;
      };

      var x = d3.time.scale()
        .domain(this.props.dateRange)
        .range([padding, this.props.width - padding]);
      var y = d3.scale.linear()
        .domain(this.props.valueRange)
        .range([this.props.height - padding, padding]);
      var lineGenerator = d3.svg.line()
        .x(function(d) { return x(this.quadDate(d)); }.bind(this))
        .y(function(d) { return y(d[3]); })
        .interpolate('linear');
      //console.log(this.props);
      if (this.props.colorize == true){
        var lineColor = color(this.delta(this.props));
      }
      else{
        var lineColor = color(0);  //0 means default grey color
      }
      return dom.div({ className: 'Sparkline', style: { overflow: 'hidden' }},
        dom.svg({
          height: this.props.height,
          width: this.props.width
        },
          dom.line({
            x1: x.range()[0],
            x2: x.range()[1],
            y1: y(this.props.thresholdValue),
            y2: y(this.props.thresholdValue),
            stroke: '#ccc',
            strokeDasharray: 5
          }),
          this.renderYearStarts(padding, x, y),
          dom.path({
            d: lineGenerator(this.props.quads),
            stroke: lineColor,
            strokeWidth: 3,
            fill: 'none'
          }),
          (!this.props.shouldDrawCircles) ? null : this.props.quads.map(function(quad) {
            return dom.circle({
              key: quad.slice(0, 3).join(','),
              cx: lineGenerator.x()(quad),
              cy: lineGenerator.y()(quad),
              r: 3,
              fill: lineColor
            });
          })
        )
      );
    },

    // TODO(kr) check start of school year
    renderYearStarts: function(padding, x, y) {
      var years = _.range(this.props.dateRange[0].getFullYear(), this.props.dateRange[1].getFullYear());
      return years.map(function(year) {
        var yearStartDate = moment.utc([year, 8, 15].join('-'), 'YYYY-M-D').toDate();
        return dom.line({
          key: year,
          x1: x(yearStartDate),
          x2: x(yearStartDate),
          y1: y.range()[0],
          y2: y.range()[1],
          stroke: '#ccc'
        });
      });
    },
    delta: function(local_props) {
      //This method returns a number representing the amount of gain or loss 
      //in the viewable box of the chart.  If the window cuts off the
      //line between two points, the midpoint between the two points is 
      //estimated.  This is a hack because the chart is hidden from view by 
      //the css overflow:hidden property and we have to be clever
      //to find that point again so we can decide is the visible slope is
      //positive or negative, to color the line correctly.

      //If there are no quads for data points, this method returns zero.
      //console.log(local_props);

      var leftWindowDate = local_props.dateRange[0];
      //flipPoint tells us the first index where the line got cut off by the overflow:hidden
      var flipPoint = -1;
      for(index = 0; index < local_props.quads.length; index++){
          var pointdate = new Date(local_props.quads[index][0] + "-" + 
                  local_props.quads[index][1] + "-" + 
                  local_props.quads[index][2]);
          if (pointdate < leftWindowDate){
              flipPoint = index; 
          }
      }
      //console.log("flipPoint: " + flipPoint);
      if (flipPoint == -1){
          return 0;
      }
      if (flipPoint == local_props.quads.length-1){
          return local_props.quads[local_props.quads.length-1] - local_props.quads[local_props.quads.length-2];
      }

      var rightDate = this.quadDate(local_props.quads[flipPoint+1]);
      var leftDate =  this.quadDate(local_props.quads[flipPoint]);
      //what percentage is the leftMost Boundary date of the window between
      //the two data points found left and right of that leftmost point.
      var percentageBetweenDates = Math.round(100 - ((rightDate.valueOf() - 
          leftDate.valueOf()) * 100 ) / local_props.dateRange[0].valueOf());

      //console.log("percentageBetweenDates: " + percentageBetweenDates);

      var left_value1 = local_props.quads[flipPoint][3];
      var left_value2 = local_props.quads[flipPoint+1][3];
      var right_value = local_props.quads[local_props.quads.length-1][3];

      var difference = left_value2 - left_value1;   
      //We need the difference value with positive/negative sign, so we can calculate slope

      //console.log("left_value1: " + left_value1);
      //The leftmost value is the percentage we are at between the dates plus the left.
      var leftWindowValue = (left_value1 + ((percentageBetweenDates /100) * difference));

      //console.log("leftWindowValue: " + leftWindowValue);
      var gain = right_value - leftWindowValue;    //This is the gain or loss in the viewable window
      //console.log("gain is: " + gain);
      return gain;


    },
    quadDate: function(quad) {
      return new Date(quad[0], quad[1] - 1, quad[2]);
    }

  });
})();
