const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const margin = {
  top: 50,
  right: 20,
  bottom: 30,
  left: 60
};
const width = 920 - margin.left - margin.right;
const height = 630 - margin.top - margin.bottom;
let svg, tooltip;

const createTitle = () => {
    return d3.select("main")
             .append("title")
             .attr("id", "title")
             .text("Doping in Professional Bicycle Racing")
};

const createCanvas = () => {
    return d3.select("main")
             .append("svg")
             .attr("width", width + margin.left + margin.right)
             .attr("height", height + margin.top + margin.bottom)
             .attr("class", "svg")
             .append('g')
             .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
};

const createTooltip = () => {
    return d3.select("body")
             .append("div")
             .attr("id", "tooltip")
             .attr("class", "tooltip")
             .style("opacity", 0);
};

const createGraph = () => {
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleTime().range([0, height]);
  const xAxis = d3.axisBottom(x).tickFormat(d3.format('d')); //We specify the tickFormat to avoid displaying years like so: 1,998 - 2,000 - 2,002.
  const timeFormat = d3.timeFormat("%M:%S");
  const yAxis = d3.axisLeft(y).tickFormat(timeFormat);
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  
  d3.json(url) //Since we practiced XMLHttp in previous project (Bar Chart), we'll do fetch here (which d3.json method uses).
    .then(data => {
      data.forEach((d) => {
        const parsedTime = d.Time.split(":");
        d.Time = new Date(1980, 0, 1, 0, parsedTime[0], parsedTime[1]);
        //Since we'll need the Date format, we convert the "MM:SS" string stored in .time into a Date object where only the minutes and seconds hold relevant information for us (the year is already stored in .year).
      });
      
      x.domain([
        d3.min(data, (d) => d.Year - 1),
        d3.max(data, (d) => d.Year + 1)
      ]);
      y.domain(d3.extent(data, (d) => d.Time));
    
      svg
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

      svg
        .append("g")
        .attr("id", "y-axis")
        .call(yAxis)
    
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -160)
        .attr("y", -44)
        .style('font-size', 20)
        .text("Time in Minutes")
    
      svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 7)
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(d.Time))
        .attr("data-xvalue", (d) => d.Year)
        .attr("data-yvalue", (d) => d.Time.toISOString())
        .style("fill", (d) => color(d.Doping !== ""))
        .on("mouseover", (event, d) => {
          tooltip.style("opacity", 0.8);
          tooltip.attr("data-year", d.Year);
          tooltip
            .html(
              d.Name +
              ": " +
              d.Nationality +
              "<br/>" +
              "Year: " +
              d.Year +
              ", Time: " +
              timeFormat(d.Time) +
              (d.Doping ? "<br></br>" + d.Doping : "")
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
   
      const legendContainer = svg.append("g").attr("id", "legend");
      
      const legend = legendContainer
        .selectAll("#legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "legend-label")
        .attr("transform", (d, i) => "translate(0," + (height / 2 - i * 20) + ")");
      
      legend
        .append("rect")
        .attr("x", width -20)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", color);
    
      legend
        .append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", "6px")
        .style("text-anchor", "end")
        .text((d) => {
          if (d) {
            return "Doping allegations";
          } else {
            return "No doping allegations";
          }
         });
  })
  .catch(err => console.log(err));
};


const driver = () => {
    createTitle();
    svg = createCanvas();
    tooltip = createTooltip();
    createGraph();
};

driver();
