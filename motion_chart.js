var all_data = [
  [10, 20, 300, 34, 76, 10, 67, 87, 34, 22],
  [12, 54, 34, 55, 345, 55, 11, 22, 33, 44],
  [30, 23, 66, 77, 34, 23, 123, 34, 54, 66],
  [0, 33, 232, 222, 34, 67, 77, 123, 45, 56, 78]
];

motionChart("body", all_data, {"point_color":"red"});

function motionChart(div_element, all_data, options){
  
  // Setting up variables and defaults
  if (!div_element || !all_data) {
    return
  }
  if (options) {
    point_color = options["point_color"] || "black"
    pause_interval = options["pause_interval"] || 1000
    transition_interval = options["transition_interval"] || 500
    width = options["width"] || 800
    height = options["height"] || 500
    point_size = options["point_size"] || 5
  } else {
    point_color = "black"
    pause_interval = 1000
    transition_interval = 500
    width = 800
    height = 500
    point_size = 5
  }
  
  // Find the minimums and the maximums of both x and y for all series
  var val_array = [];
  var maxvalx = 0,
      minvalx = 1000000,
      maxvaly = 0,
      minvaly = 1000000;
  for (var j = 0; j < all_data.length; j++) {
    var data = all_data[j];
    for (var i = 0; i < data.length; i++) {
        val_array[i] = {
            label: data[i],
            x: parseFloat(i + 1),
            y: parseFloat(data[i]),
            size: point_size,
            color: point_color
        };
        maxvalx = Math.max(maxvalx, val_array[i].x);
        maxvaly = Math.max(maxvaly, val_array[i].y);
        minvalx = Math.min(minvalx, val_array[i].x);
        minvaly = Math.min(minvaly, val_array[i].y);
    }
  }
  // Compute min and max of chart axes based on min, max of the input
  maxvalx = (Math.ceil(maxvalx / 10)) * 10;
  maxvaly = (10 + Math.floor(maxvaly / 10)) * 10;
  minvalx = (Math.floor(minvalx / 10)) * 10;
  minvaly = ((Math.floor(minvaly / 10)) * 10 ) - 50;

  // Setting width and height and borders
  var w = width,
      h = height,
      p = 80;
  // x and y transformation functions 
  var x = d3.scale.linear().domain([0, maxvalx]).range([0, w]),
      y = d3.scale.linear().domain([minvaly, maxvaly]).range([h, 0]);
  
  // Create the initial empty chart with border
  var vis = d3.select(div_element)
              .data([val_array])
              .append("svg:svg")
              .attr("width", w + p * 2)
              .attr("height", h + p * 2)
              .append("svg:g")
              .attr("transform", "translate(" + p + "," + p + ")");
              
  // Create the x axis grid lines.
  var rules = vis.selectAll("g.rule")
                  .data(x.ticks(10))
                  .enter()
                  .append("svg:g")
                  .attr("class", "rule");
  rules.append("svg:line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", 0)
      .attr("y2", h - 1)
  rules.append("svg:line")
      .attr("class", function(d) { return d ? null : "axis"; })
      .data(y.ticks(10))
      .attr("y1", y)
      .attr("y2", y)
      .attr("x1", 0)
      .attr("x2", w - 1);

  // Place axis tick labels
  rules.append("svg:text")
      .attr("x", x)
      .attr("y", h + 15)
      .attr("dy", ".71em")
      .attr("text-anchor", "middle")
      .text(x.tickFormat(10))
      .text(String);
  rules.append("svg:text")
      .data(y.ticks(12))
      .attr("y", y)
      .attr("x", -10)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(y.tickFormat(5));

  // Draw the points on the scatter plots
  vis.selectAll("circle")
      .data(val_array)
      .enter()
      .append("svg:circle")
      .attr("class", "line")
      .attr("fill", function(d) { return d.color; })
      .attr("cx", function(d) { return x(d.x); })
      .attr("cy", function(d) { return y(d.y) - 5; })
      .attr("r", function(d) { return d.size });

  // Add bubble labels: in two steps
  vis.selectAll("g.rule")
      .data(val_array)
      .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y) + d.size + point_size; })
      .attr("dy", ".3em")
      .attr("fill", "black")
      .attr("class", "datalabels")
      .attr("clip", "inherit")
      .text(function(d) { return d.label; });
  vis.selectAll("g.rule")
      .data(val_array)
      .enter()
      .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y) + d.size + point_size; })
      .attr("dy", ".3em")
      .attr("fill", "black")
      .attr("clip", "inherit")
      .text(function(d) { return d.label; });
  
  // Function to create val_array from next array
  function get_val_array(simple_array) {
      var val_array = new Array();
      for (var i = 0; i < simple_array.length; i++) {
          val_array[i] = {
            label: simple_array[i],
            x: parseFloat(i + 1),
            y: parseFloat(simple_array[i]),
            size: point_size,
            color: point_color
          };
      }
      return val_array
  }
  
  // Pausing after displaying an array before starting the next transition
  var i = 0
  setInterval( function(){
      if (i == all_data.length) {
          return            
      }
      var data = get_val_array(all_data[i])
      redraw(data)
      i = i + 1
  }, pause_interval);

  // Change the cy for each of these points
  // Show the transition to the new place
  // Change the data labels for these points
  function redraw(data) {
    var transition_duration = transition_interval;
    vis.selectAll("circle")
        .data(data)
        .transition()
        .duration(transition_duration)
        .attr("cy", function(d) { return y(d.y) - 5; });
    vis.selectAll(".datalabels")
        .data(data)
        .transition()
        .duration(transition_duration)
        .attr("y", function(d) { return y(d.y) + d.size + 4; })
        .text(function(d) { return d.label; });
  }
}