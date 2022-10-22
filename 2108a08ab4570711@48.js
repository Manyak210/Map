function _map(d3,width,height,path,outline,location,graticule,land,data,projection)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const defs = svg.append("defs");

  defs.append("path")
      .attr("id", "outline")
      .attr("d", path(outline));

  defs.append("clipPath")
      .attr("id", "clip")
    .append("use")
      .attr("xlink:href", new URL("#outline", location));

  const g = svg.append("g")
      .attr("clip-path", `url(${new URL("#clip", location)})`);

  g.append("use")
      .attr("xlink:href", new URL("#outline", location))
      .attr("fill", "#fff");

  g.append("path")
      .attr("d", path(graticule))
      .attr("stroke", "#ddd")
      .attr("fill", "none");

  g.append("path")
      .attr("d", path(land))
      .attr("fill", "#ddd");

  svg.append("use")
      .attr("xlink:href", new URL("#outline", location))
      .attr("stroke", "#000")
      .attr("fill", "none");

  svg.append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
      .attr("transform", d => `translate(${projection([d.longitude, d.latitude])})`)
      .attr("r", 4)
	  .attr("fill", "#ff0000")
    .append("title")
      .text(d => d.country+'\n'+d.name+'\n'+d.alt);

  return svg.node();
}

function _path(d3,projection){return(
d3.geoPath(projection)
)}

function _projection(d3){return(
d3.geoNaturalEarth1()
)}

function _height(d3,projection,width,outline)
{
  const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
  const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
  projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
  return dy;
}


function _outline(){return(
{type: "Sphere"}
)}

function _graticule(d3){return(
d3.geoGraticule10()
)}

function _land(topojson,world){return(
topojson.feature(world, world.objects.land)
)}

function _world(FileAttachment){return(
FileAttachment("land-50m.json").json()
)}

function _data(FileAttachment){return(
FileAttachment("world.csv").csv({typed: true})
)}

function _topojson(require){return(
require("topojson-client@3")
)}

function _d3(require){return(
require("d3@6")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["world.csv", {url: new URL("https://github.com/Manyak210/Study/blob/810ab3810de682f9d46bcfe7ffd7f0fa7d94a1a8/world.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["land-50m.json", {url: new URL("https://github.com/Manyak210/Study/blob/810ab3810de682f9d46bcfe7ffd7f0fa7d94a1a8/land-50m.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("map")).define("map", ["d3","width","height","path","outline","location","graticule","land","data","projection"], _map);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("path")).define("path", ["d3","projection"], _path);
  main.variable(observer("projection")).define("projection", ["d3"], _projection);
  main.variable(observer("height")).define("height", ["d3","projection","width","outline"], _height);
  main.variable(observer("outline")).define("outline", _outline);
  main.variable(observer("graticule")).define("graticule", ["d3"], _graticule);
  main.variable(observer("land")).define("land", ["topojson","world"], _land);
  main.variable(observer("world")).define("world", ["FileAttachment"], _world);
  main.variable(observer("topojson")).define("topojson", ["require"], _topojson);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
