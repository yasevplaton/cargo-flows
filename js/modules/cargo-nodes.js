import { makeCircle } from "./mbc";

// function to calculate node radius
export function addNodeAttr(node, cargoTypes, map) {

  cargoTypes.forEach(cargo => {
      const cornersPoints = getTapeCornersPoints(map, node, cargo);
      addRadiusAndPosition(node, cargo, cornersPoints, map);
  });

}

// function to get same cargo edges
function getSameCargoEdges(node, cargoType) {
  const sameCargoEdges = [];

  node.properties.inEdges.forEach(edge => {
      if (edge.type === cargoType) {
          sameCargoEdges.push(edge);
      }
  });

  node.properties.outEdges.forEach(edge => {
      if (edge.type === cargoType) {
          sameCargoEdges.push(edge);
      }
  });

  return sameCargoEdges;
}

// function to get coordinates of tapes corners
function getTapeCornersPoints(map, node, cargoType) {
  const cornersPoints = [];

  const nodeGeomPix = map.project(node.geometry.coordinates);

  cornersPoints.push(nodeGeomPix);

  let vector, secondPoint;

  const edges = getSameCargoEdges(node, cargoType);

  if (edges.length !== 0) {
      edges.forEach(edge => {

          // edge is output edge
          if (edge.hasOwnProperty('secondPoint')) {
              secondPoint = edge.secondPoint;
              vector = getVector(nodeGeomPix, secondPoint);

              // or edge is input edge
          } else {
              secondPoint = edge.beforeLastPoint;
              vector = getVector(secondPoint, nodeGeomPix);
          }

          const offsetAngle = getOffsetAngle(vector);

          const dist = edge.offset + (edge.width / 2);
          const corner = getCornerCoordinates(nodeGeomPix, dist, offsetAngle);

          cornersPoints.push(corner);
      });
  }

  return cornersPoints;
}

// function to fill node attribute
function addRadiusAndPosition(node, cargoType, cornersPoints, map) {

  const cargoRadiusName = `${cargoType}-radius`;
  const cargoPositionName = `${cargoType}-position`;

  if (cornersPoints.length !== 0) {
      const circle = makeCircle(cornersPoints);

      node.properties[cargoRadiusName] = circle.r;

      const coords = map.unproject([circle.x, circle.y]);
      const lng = coords.lng;
      const lat = coords.lat;

      node.properties[cargoPositionName] = [lng, lat];

  } else {
      node.properties[cargoRadiusName] = 0;
      node.properties[cargoPositionName] = node.geometry.coordinates;
  }

}

// function to get vector from two points
function getVector(pt1, pt2) {

  return {
      x: pt2.x - pt1.x,
      y: pt2.y - pt1.y
  }
}

// function to get offset angle
function getOffsetAngle(vector) {
  const segmentAngle = Math.atan2(vector.y, vector.x);
  const offsetAngle = segmentAngle + Math.PI / 2;

  return offsetAngle;
}

// function to get corner coordinates
function getCornerCoordinates(pt, dist, offsetAngle) {
  return {
      x: pt.x + dist * Math.cos(offsetAngle),
      y: pt.y + dist * Math.sin(offsetAngle)
  };
}

// function to create object for specific type of cargo
function createSingleCargoNodesObject(cargoType, nodes) {

  const singleCargoNodesObject = { type: 'FeatureCollection', features: [] };
  const cargoRadiusName = `${cargoType}-radius`;
  const cargoPositionName = `${cargoType}-position`;

  nodes.features.forEach(node => {
      const cargoNode = {
          type: "Feature",
          properties: {
              radius: node.properties[cargoRadiusName],
              deadEnd: node.properties.deadEnd
          },
          geometry: {
              type: "Point",
              coordinates: node.properties[cargoPositionName]
          }
      };

      singleCargoNodesObject.features.push(cargoNode);
  });

  return singleCargoNodesObject;
}

// function to create object for all types of cargos
export function createMultipleCargoNodesObject(cargoTypes, nodes) {
  const multipleCargoNodesObject = {};

  cargoTypes.forEach(cargo => {
      multipleCargoNodesObject[cargo] = createSingleCargoNodesObject(cargo, nodes);
  });

  return multipleCargoNodesObject;
}