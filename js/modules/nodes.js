import { calculateMaxWidth, getMaxCargoRadius } from "./edges";

// function to find lines that adjacent to specific node
export function findAdjacentLines(edges, nodeID) {
  var adjacentLines = [];

  edges.features.forEach(e => {
      if (e.properties.src === nodeID || e.properties.dest === nodeID) {
          if (adjacentLines.indexOf(e.properties.ID_line) === -1) {
              adjacentLines.push(e.properties.ID_line);
          }
      }
  });

  return adjacentLines;
}

// function to fill adjacent lines attribute to nodes
export function fillAdjacentLinesAttr(nodes, edges) {
  nodes.features.forEach(node => {
      node.properties.adjacentLines = findAdjacentLines(edges, node.properties.OBJECTID);
  });
}

// function to calculate node radius
export function addRadiusAttr(origLines, node, cargoTypes) {

  var adjacentLines = node.properties.adjacentLines;
  var maxWidth = calculateMaxWidth(origLines, adjacentLines);
  node.properties.radius = maxWidth - 1;


  cargoTypes.forEach(cargo => {
      let cargoPropName = cargo + "MaxRadius";
      node.properties[cargoPropName] = getMaxCargoRadius(origLines, adjacentLines, cargo);
  });

}