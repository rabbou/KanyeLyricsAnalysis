// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {select} from 'd3-selection';
import {axisTop, axisBottom} from 'd3-axis';
import {stack, stackOrderNone, stackOffsetWiggle, stackOffsetNone, curveBasis, area} from 'd3-shape';
import {min, max} from 'd3-array';
// (I tend to think it's best to use screaming snake case for imported json)
const domReady = require('domready');
domReady(() => {
  Promise.all([
    fetch('./data/data.json')
      .then(response => response.json()),
    fetch('./data/dataAlbum.json')
      .then(response => response.json()),
    fetch('./kanye_face.svg')
      .then(x => x.text())
  ]).then(data => myVis(data));
});

const colorData = [
  {attribute: 'positive', color: '#b2182b'},
  {attribute: 'negative', color: '#2166ac'},
  {attribute: 'strong', color: '#ef8a62'},
  {attribute: 'weak', color: '#67a9cf'},
  {attribute: 'active', color: '#fddbc7'},
  {attribute: 'passive', color: '#d1e5f0'},
  {attribute: 'anger', color: '#8dd3c7'},
  {attribute: 'sadness', color: '#ffffb3'},
  {attribute: 'fear', color: '#bebada'},
  {attribute: 'disgust', color: '#fb8072'},
  {attribute: 'surprise', color: '#80b1d3'},
  {attribute: 'joy', color: '#fdb462'}
];

function myVis(originalData) {

  const data = originalData[0];
  const albumData = originalData[1];
  const externalSvgs = [originalData[2]];

  const height = 2000;
  const width = 36 / 24 * height;

  const svg = select('body').append('svg')
      .attr('width', width)
      .attr('height', height);

  svg.selectAll('.external-svg-container').data(externalSvgs)
    .enter().append('g')
    .attr('transform', `translate(0, ${height / 10})`)
    .html(d => d);

  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#F0EAD6')
    .attr('fill-opacity', 0.6);

  addAlbumSections(data, height, width, svg);
  makeSection(albumData, height / 4, width - width * 4 / 35, 0,
              {x: width / 2.5 / 7, y: height * 1.2 / 8, isAlbums: 1}, svg);

  addKey(svg, width, height);
  addArrows(svg, width, height);
  addTitle(svg, width, height);
  addAnnotations(svg, height, width);
}

function addAlbumSections(data, height, width, svg) {

  const aHeight = width / 7;
  const aWidth = height * 5 / 8;

  const tcdData = data.filter(d => (d.album === 'The College Dropout'));
  const lrData = data.filter(d => (d.album === 'Late Registration'));
  const gData = data.filter(d => (d.album === 'Graduation'));
  const hData = data.filter(d => (d.album === '808s & Heartbreak'));
  const mbdtfData = data.filter(d => (d.album === 'My Beautiful Dark Twisted Fantasy'));
  const yData = data.filter(d => (d.album === 'Yeezus'));
  const tlopData = data.filter(d => (d.album === 'The Life of Pablo'));

  makeSection(tcdData, aHeight, aWidth, 90, {x: aHeight, y: 3 * height / 8, isAlbums: 0}, svg);
  makeSection(lrData, aHeight, aWidth, 90, {x: 2 * aHeight, y: 3 * height / 8, isAlbums: 0}, svg);
  makeSection(gData, aHeight, aWidth, 90, {x: 3 * aHeight, y: 3 * height / 8, isAlbums: 0}, svg);
  makeSection(hData, aHeight, aWidth, 90, {x: 4 * aHeight, y: 3 * height / 8, isAlbums: 0}, svg);
  makeSection(mbdtfData, aHeight, aWidth, 90, {x: 5 * aHeight, y: 3 * height / 8, isAlbums: 0}, svg);
  makeSection(yData, aHeight, aWidth, 90, {x: 6 * aHeight, y: 3 * height / 8, isAlbums: 0}, svg);
  makeSection(tlopData, aHeight, aWidth, 90, {x: 7 * aHeight, y: 3 * height / 8, isAlbums: 0}, svg);
}

function makeSection(data, height, width, rotate, origin, newSvg) {
  const margin = {top: 30, right: 50, bottom: 30, left: 50};

  const svg = newSvg.append('g')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${origin.x},${origin.y}) rotate(${rotate}, 0, 0)`)
      .attr('background-color', '#999');

  makeStackedArea(svg, data, margin, height, width);
  makeStreamGraph(svg, data, margin, height, width, origin.isAlbums);

  newSvg.append((origin.isAlbums || origin.x >= height * 7) ? null : 'line')
    .attr('x1', origin.x)
    .attr('y1', origin.y * 1.3 / 3)
    .attr('x2', origin.x)
    .attr('y2', origin.y + width)
    .attr('stroke', 'gray');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '18')
    .attr('x', (origin.isAlbums ? -height * 0.8 / 4 : -height * 0.85 / 4))
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90, 0, 0)')
    .text('ATTITUDES')
    .attr('fill', 'gray');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '18')
    .attr('x', (origin.isAlbums ? -height * 0.9 * 3 / 4 : -3 * height / 4))
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90, 0, 0)')
    .text('EMOTIONS')
    .attr('fill', 'gray');
}

function makeStackedArea(svg, data, margin, height, width, rotate) {

  const topColors = scaleOrdinal([
    '#fddbc7',
    '#ef8a62',
    '#b2182b']);

  const bottomColors = scaleOrdinal([
    '#d1e5f0',
    '#67a9cf',
    '#2166ac']);

  const cHeight = height / 2 - margin.top;
  const cWidth = width - margin.left - margin.right;

  const x = scaleLinear().domain([0, data.length - 1])
      .range([margin.left, margin.left + cWidth]);

  const yTop = scaleLinear()
      .domain([0, 300])
      .range([cHeight / 2, 0]);

  const yBottom = scaleLinear()
      .domain([300, 0])
      .range([cHeight, cHeight / 2]);

  const areaTop = area()
      .x((d, i) => x(i))
      .y0(d => yTop(d[0]))
      .y1(d => yTop(d[1]))
      .curve(curveBasis);
  const areaBottom = area()
      .x((d, i) => x(i))
      .y0(d => yBottom(d[0]))
      .y1(d => yBottom(d[1]))
      .curve(curveBasis);

  const stackTop = stack()
      .keys(['active', 'strong', 'positive'])
      .order(stackOrderNone)
      .offset(stackOffsetNone);

  const stackBottom = stack()
      .keys(['passive', 'weak', 'negative'])
      .order(stackOrderNone)
      .offset(stackOffsetNone);

  svg.selectAll('.layer')
    .data(stackTop(data))
    .enter().append('g')
    .append('path')
        .attr('class', 'area')
        .attr('fill', (d, i) => topColors(i))
        .attr('d', areaTop).exit();

  svg.selectAll('.layer')
    .data(stackBottom(data))
    .enter().append('g')
    .append('path')
      .attr('class', 'area')
      .attr('fill', (d, i) => bottomColors(i))
      .attr('d', areaBottom);

}

function makeStreamGraph(svg, data, margin, height, width, isAlbums) {

  const cHeight = height / 2 - margin.top;
  const cWidth = width - margin.left - margin.right;

  const newStack = stack()
      .keys(['anger', 'sadness', 'fear', 'disgust', 'surprise', 'joy'])
      .order(stackOrderNone)
      .offset(stackOffsetWiggle);

  const series = newStack(data);

  const maxStack = max(series, layer => max(layer, d => d[0] + d[1]));
  const minStack = min(series, layer => min(layer, d => d[0]));

  const x = scaleLinear().domain([0, data.length - 1])
      .range([margin.left, margin.left + cWidth]);

  const y = scaleLinear()
      .domain([minStack, maxStack])
      .range([isAlbums ? (cHeight + margin.top * 1.5) : (cHeight + margin.top * 3), height]);

  const color = scaleOrdinal([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462'
  ]);

  const newArea = area()
      .x((d, i) => x(i))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(curveBasis);

  svg.selectAll('.layer')
      .data(newStack(data))
      .enter().append('path')
      .attr('d', newArea)
      .attr('fill', (d, i) => color(i));

  const xAxis = axisTop(x)
            .tickFormat(d => data[d].song ? data[d].song : data[d].album)
            .tickSize(isAlbums ? 5 : 0)
            .ticks(data.length);

  const years = [2004, 2005, 2007, 2008, 2010, 2013, 2016];

  const xAxis2 = axisBottom(x)
            .tickFormat(d => years[d])
            .ticks(data.length);

  svg.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0, ${isAlbums ? cHeight + margin.top - 30 : cHeight + margin.top})`)
    .call(xAxis)
    .selectAll('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', isAlbums ? 28 : 18)
    .attr('transform', `translate(${isAlbums ? 0 : 8}, ${isAlbums ? -5 : 0}) rotate(${isAlbums ? 0 : -90})`);

  svg.append(isAlbums ? 'g' : null)
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0, ${cHeight + margin.top - 30})`)
    .attr('stroke', 'none')
    .call(xAxis2)
    .selectAll('text')
    .attr('font-size', 28)
    .attr('font-family', 'Futura PT');
}

function addKey(svg, width, height) {

  const radius = height / 150;
  const y = 30;
  const x = 6.3 * width / 7;
  svg.selectAll('.circle')
    .data(colorData)
    .enter()
    .append('circle')
      .attr('cx', (d, i) => x + Math.trunc(i / 6) * 150)
      .attr('cy', (d, i) => y + 50 + (i % 6) * (radius + 5) * 2)
      .attr('r', radius)
      .attr('fill', (d, i) => colorData[i].color);

  svg.selectAll('.rect')
    .data(colorData)
    .enter()
    .append('text')
      .attr('font-family', 'Futura PT')
      .attr('font-size', '18')
      .attr('x', (d, i) => x + Math.trunc(i / 6) * 150 + (radius + 5) * 2.5 / 2)
      .attr('y', (d, i) => y + 35 + (i % 6) * (radius + 5) * 2)
      .attr('dy', '1em')
    .text(d => d.attribute);

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '24')
    .attr('x', x - radius / 2)
    .attr('y', y)
    .attr('dy', '1em')
    .text('Attitudes');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '24')
    .attr('x', x + 150 - radius / 2)
    .attr('y', y)
    .attr('dy', '1em')
    .text('Emotions');

  svg.append('line')
    .attr('x1', 6.275 * width / 7 - 20)
    .attr('x2', 6.275 * width / 7 - 20)
    .attr('y1', 0)
    .attr('y2', 300)
    .attr('stroke', 'black');

  svg.append('line')
    .attr('x1', 6.275 * width / 7 - 20)
    .attr('x2', width)
    .attr('y1', 300)
    .attr('y2', 300)
    .attr('stroke', 'black');
}
function addTitle(svg, width, height) {

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '54')
    .attr('x', width / 2)
    .attr('y', height / 35 - 20)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .text('Attitudes and Emotions in Kanye\'s Lyrics');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '36')
    .attr('x', width * 1.33 / 3)
    .attr('y', height / 18 - 20)
    .attr('dy', '1em')
    .text('by Ruben Abbou and Brendan Sanderson');

  const paragraphY = height / 12 - 20;
  const paragraphX = width / 2;
  const spacing = 30;

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '32')
    .attr('x', paragraphX)
    .attr('y', paragraphY)
    .attr('text-anchor', 'middle')
    .attr('dy', '1em')
    .text('This visualization displays the attitudes and emotions in Kanye' +
    'West\'s music over the course of his career');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '32')
    .attr('x', paragraphX)
    .attr('y', paragraphY + spacing)
    .attr('text-anchor', 'middle')
    .attr('dy', '1em')
    .text('as a function of both release date and location in each individual album.');

}

function addArrows(svg, width, height) {

  const y = height / 20;
  const x = width / 25;
  const length = width / 20;

  svg.append('svg:defs').selectAll('marker')
    .data(['arrow'])
  .enter().append('svg:marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 0 12 12')
    .attr('refX', 6)
    .attr('refY', 6)
    .attr('markerWidth', 20)
    .attr('markerHeight', 20)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M2,2 L10,6 L2,10 L6,6 L2,2');

  svg.append('line')
    .attr('x1', x)
    .attr('y1', y)
    .attr('x2', x + length)
    .attr('y2', y)
    .attr('stroke', 'black')
    .attr('marker-end', 'url(#arrow)');

  svg.append('line')
    .attr('x1', x)
    .attr('y1', y)
    .attr('x2', x)
    .attr('y2', y + length)
    .attr('stroke', 'black')
    .attr('marker-end', 'url(#arrow)');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '18')
    .attr('x', x + length / 2)
    .attr('y', y - 20)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .text('Albums');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '18')
    .attr('transform', `rotate(-90, ${x - 25}, ${y + length / 2})`)
    .attr('x', x - 25)
    .attr('y', y + length / 2)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .text('Songs in album');
}

function addAnnotations(svg, height, width) {
  addAnnotation({x: width * 3 / 7, y: height / 4 + 20},
    {x: width * 3 / 7 + width / 50, y: height / 4 - height / 12},
    height, 'Nov 10 2007', 'Kanye\'s mother dies', svg);

  addAnnotation({x: width * 2 / 7, y: height / 4 + 20},
    {x: width * 2 / 7 - width / 50, y: height / 4 - height / 12},
    height, 'Sept 2 2005', 'Kanye says George Bush doesn\'t care about blacks', svg);

  addAnnotation({x: width * 4 / 7, y: height / 4 + 20},
    {x: width * 4 / 7 + width / 50, y: height / 4 - height / 12},
    height, 'Sept 13 2009', 'Kanye says Beyonce had the best music video at the VMAs', svg);

  // addAnnotation({x: width * 6 / 7, y: height / 4 + 20},
  //   {x: width * 6 / 7 - width / 12, y: height / 4 - height / 15},
  //   height, 'Nov. 2013', 'Kanye makes merch with confederate flag', svg);

  // addAnnotation({x: width * 5 / 7, y: height / 4 + 20},
  //   {x: width * 5 / 7 - width / 50, y: height / 4 - height / 18},
  //   height, 'Aug. 2011', 'Kanye says people look at him like he\'s insane and like Hitler', svg);

  addAnnotation({x: width * 6 / 7, y: height / 4 + 20},
    {x: width * 6 / 7 - width / 20, y: height / 4 - height / 12},
    height, 'May 24 2014', 'Kanye marries Kim Kardashian', svg);

  addAnnotation({x: width * 6.5 / 7, y: height / 4 + 20},
    {x: width * 6.5 / 7 - width / 100, y: height / 4 - height / 15},
    height, 'Nov. 21 2016', 'Kanye is hospitalized for mental breakdown', svg);

  addSidewaysAnnotation({x: width * 5.5 / 7 - 47, y: height * 1.1625 / 2 + 20},
    {x: width * 5.5 / 7 - width / 20, y: height * 1.1625 / 2 - height / 50},
    height, 'Kanye puts confederate flag on appearal', 'after stating that blacks are still slaves', svg);

  addSidewaysAnnotation({x: width * 5.5 / 7 + 47, y: height * 1.0375 / 2 + 20},
    {x: width * 5.5 / 7 + width / 20, y: height * 1.0375 / 2 - height / 100},
    height, 'The only feature on Yeezus', 'is God in I am a God', svg);

  addSidewaysAnnotation({x: width * 0.5 / 7 + 50, y: height * 1.125 / 2 + 20},
    {x: width * 0.5 / 7 + width / 15, y: height * 1.125 / 2 - height / 50},
    height, 'Kanye says "We at war with terrorism, racism, ',
    'but most of all we at war with ourselves"', svg);

  addSidewaysAnnotation({x: width * 6.5 / 7 - 45, y: height * 1.93 / 2 + 20},
    {x: width * 6.5 / 7 - width / 20, y: height * 1.93 / 2 - height / 50},
    height, 'Kanye says that he is "This generation\'s',
    'closest thing to Einstein"', svg);

  addSidewaysAnnotation({x: width * 3.5 / 7 - 55, y: height * 1.8275 / 2 + 20},
    {x: width * 3.5 / 7 - width / 20, y: height * 1.8275 / 2 - height / 100},
    height, 'Kanye refers to how he had just',
    'landed in London when his mom died', svg);

  addSidewaysAnnotation({x: width * 1.5 / 7 - 45, y: height * 1.69 / 2 + 20},
    {x: width * 1.5 / 7 - width / 20, y: height * 1.7 / 2 - height / 100},
    height, 'Kanye expresses his love for',
    'his mom years before she died', svg);

  addSidewaysAnnotation({x: width * 2.5 / 7 - 35, y: height * 0.958 / 2 + 20},
    {x: width * 2.5 / 7 - width / 25, y: height * 0.958 / 2 - height / 100},
    height, 'Kanye samples Daft Punk',
    'in his most popular song ever', svg);

  addSidewaysAnnotation({x: width * 4.5 / 7 - 35, y: height * 1.5475 / 2 + 20},
      {x: width * 4.5 / 7 - width / 20, y: height * 1.5475 / 2 - height / 100},
      height, 'Runaway is reknowned for combining',
      'simplicity with complex emotion and themes', svg);
}

function addAnnotation(start, end, height, date, text, svg) {
  svg.append('line')
    .attr('x1', start.x)
    .attr('y1', start.y)
    .attr('x2', start.x)
    .attr('y2', start.y - height / 20)
    .attr('stroke', 'black');

  svg.append('line')
    .attr('x1', start.x)
    .attr('y1', start.y - height / 20)
    .attr('x2', end.x)
    .attr('y2', end.y)
    .attr('stroke', 'black');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '24')
    .attr('x', end.x)
    .attr('y', end.y - 60)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .text(text);

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '24')
    .attr('x', end.x)
    .attr('y', end.y - 30)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .text(date);
}

function addSidewaysAnnotation(start, end, height, text1, text2, svg) {
  svg.append('line')
    .attr('x1', start.x)
    .attr('y1', start.y)
    .attr('x2', (end.x > start.x ? start.x + height / 25 : start.x - height / 25))
    .attr('y2', start.y)
    .attr('stroke', 'black');

  svg.append('line')
    .attr('x1', (end.x > start.x ? start.x + height / 25 : start.x - height / 25))
    .attr('y1', start.y)
    .attr('x2', end.x)
    .attr('y2', end.y)
    .attr('stroke', 'black');

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '16')
    .attr('x', end.x)
    .attr('y', end.y - 35)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .text(text1);

  svg.append('text')
    .attr('font-family', 'Futura PT')
    .attr('font-size', '16')
    .attr('x', end.x)
    .attr('y', end.y - 20)
    .attr('dy', '1em')
    .attr('text-anchor', 'middle')
    .text(text2);
}
