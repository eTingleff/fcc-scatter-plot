(() => {
'use-strict';

/**
 * Example JSON Data
 * {
 *    'Time': '36:50',
 *    'Place': 1,
 *    'Seconds': 2210,
 *    'Name': 'Marco Pantani',
 *    'Year': 1995,
 *    'Nationality': 'ITA',
 *    'Doping': 'Alleged drug use during 1995 due to high hematocrit levels',
 *    'URL': 'https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use'
 * }
 */

const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const WIDTH = 900;
const HEIGHT = 600;
const TOOLTIP_HEIGHT = 200;
const TOOLTIP_WIDTH = 200;
const TOOLTIP_PADDING = 5;
const PADDING = 50;
const color = d3.scaleOrdinal(['rgb(199,21,133)', 'rgb(0,139,139)']);

let startDate, endDate, slowestTime, fastestTime;

const SVG = d3.select('#plot')
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

d3.json(URL, (data) => {
  // console.log(data);
  data.sort((a, b) => a.Year - b.Year);
  init(data);
}, (err) => {
  console.log(err);
});

const formatMin = (seconds) => {
  const min = Math.floor(seconds / 60);
  return min < 10 ? `0${min}` : `${min}`;
}

const formatSec = (seconds) => {
  const sec = seconds % 60;
  return sec < 10 ? `0${sec}` : `${sec}`;
}

const formatYAxisTime = (seconds) => {
  return `${formatMin(seconds)}:${formatSec(seconds)}`;
}

const displayTooltip = (d, x, y) => {
  const dopingString = d.Doping ? d.Doping : 'No allegations or evidence';
  d3.select('body')
    .append('div')
      .attr('id', 'tooltip')
      .html(
        `${d.Name}, ${d.Nationality}</br>
        Year: ${d.Year}</br>
        Place: ${d.Place}</br>
        Time: ${d.Time}</br>
        Doping: ${dopingString}`);
  
  const pageWidth = document.documentElement.clientWidth;
  const pageHeight = document.documentElement.clientHeight;
  const tooltipWidth = document.getElementById('tooltip').offsetWidth;
  const tooltipHeight = document.getElementById('tooltip').offsetHeight;
  const xMargin = (pageWidth - WIDTH) / 2;
  const yMargin = (pageHeight - HEIGHT) / 2;
  const tooltipX = x + tooltipWidth + TOOLTIP_PADDING > WIDTH + xMargin ? x - tooltipWidth : x + TOOLTIP_PADDING;
  const tooltipY = y + tooltipHeight + TOOLTIP_PADDING + PADDING > HEIGHT + yMargin ? y - tooltipHeight : y + TOOLTIP_PADDING;
        
  d3.select('#tooltip')
    .attr('class', 'tooltip')
    .attr('data-year', d.Year)
    .style('position', 'absolute')
    .style('left', `${tooltipX}px`)
    .style('top', `${tooltipY}px`)
    .style('z-index', '1000');
}

const hideTooltip = () => {
  d3.select('#tooltip')
    .remove();
}

const init = (data) => {
  const xScale = d3.scaleLinear()
    .domain([d3.min(data, (d) => d.Year - 1), d3.max(data, (d) => d.Year + 1)])
    .range([PADDING, WIDTH - PADDING]);

  const yScale = d3.scaleLinear()
    .domain([d3.max(data, (d) => d.Seconds), d3.min(data, (d) => d.Seconds)])
    .range([HEIGHT - PADDING, PADDING])

  const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft().scale(yScale).tickFormat(formatYAxisTime);
  
  SVG.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${HEIGHT - PADDING})`)
    .call(xAxis);
  
  SVG.append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${PADDING}, 0)`)
    .call(yAxis);
    
  SVG.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
      .attr('id', (d, i) => `circle-${i}`)
      .attr('class', 'dot')
      .attr('data-xvalue', (d, i) => d.Year)
      .attr('data-yvalue', (d, i) => {
        let date = new Date(d.Year);
        let minutes = d.Time.split(':')[0];
        let seconds = d.Time.split(':')[1];
        date.setMinutes(+minutes);
        date.setSeconds(+seconds);
        return date;
      })
      .attr('cx', (d, i) => xScale(d.Year))
      .attr('cy', (d, i) => yScale(d.Seconds))
      .attr('r', 5)
      .attr('fill', (d) => color(d.Doping != ''))
      .on('mouseover', (d, i) => {
        const x = d3.event.pageX;
        const y = d3.event.pageY;
        displayTooltip(d, x, y);
      })
      .on('mouseleave', (d, i) => {
        hideTooltip();
      });

  const legend = SVG.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
      .attr('id', 'legend')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        var vert = i * 20 + 50;
        return `translate(${WIDTH - 250}, ${vert})`;
      });
  
  legend.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', color)
    .style('stroke', color);

  legend.append('text')
    .attr('x', 10 + 5)
    .attr('y', 10)
    .style('font-size', 14)
    .style('font-family', 'arial')
    .text((d) => d ? 'Doping allegations or evidence' : 'No doping allegations or evidence');
}

})()