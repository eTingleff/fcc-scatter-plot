(function() {
"use-strict";

/**
 * Example JSON Data
 * {
 *    "Time": "36:50",
 *    "Place": 1,
 *    "Seconds": 2210,
 *    "Name": "Marco Pantani",
 *    "Year": 1995,
 *    "Nationality": "ITA",
 *    "Doping": "Alleged drug use during 1995 due to high hematocrit levels",
 *    "URL": "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
 * }
 */

const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const WIDTH = 900;
const HEIGHT = 600;
const PADDING = 50;

let startDate, endDate, slowestTime, fastestTime;

const SVG = d3.select("#plot")
              .append("svg")
              .attr("width", WIDTH)
              .attr("height", HEIGHT);

d3.json(URL, function(data) {
  // console.log(data);
  data.sort((a, b) => a.Year - b.Year);
  init(data);
}, (err) => {
  console.log(err);
})

function init(data) {
  // console.log(data);
  
  const xScale = d3.scaleLinear()
                  .domain([d3.min(data, (d) => d.Year - 1), d3.max(data, (d) => d.Year + 1)])
                  .range([PADDING, WIDTH - PADDING]);

  const yScale = d3.scaleLinear()
                  .domain([d3.min(data, (d) => d.Seconds), d3.max(data, (d) => d.Seconds)])
                  .range([HEIGHT - PADDING, PADDING]);

  const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft().scale(yScale);

  SVG.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${HEIGHT - PADDING})`)
    .call(xAxis);
  
  SVG.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${PADDING}, 0)`)
    .call(yAxis);
    
  SVG.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", "dot")
      .attr("data-xvalue", (d, i) => d.Year)
      .attr("data-yvalue", (d, i) => {
        let date = new Date(d.Year);
        let minutes = d.Time.split(":")[0];
        let seconds = d.Time.split(":")[1];
        date.setMinutes(+minutes);
        date.setSeconds(+seconds);
        return date;
      })
      .attr("cx", (d, i) => xScale(d.Year))
      .attr("cy", (d, i) => HEIGHT - yScale(d.Seconds))
      .attr("r", 4)
      .attr("fill", "red");
}

})()