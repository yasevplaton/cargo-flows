// function to get bounding box of nodes layer
export function getBoundingBox(data) {
  var bounds = {}, coords, point, latitude, longitude;

  // We want to use the “features” key of the FeatureCollection (see above)
  data = data.features;

  // Loop through each “feature”
  for (var i = 0; i < data.length; i++) {

      // Pull out the coordinates of this feature
      coords = data[i].geometry.coordinates;

      // For each individual coordinate in this feature's coordinates…

      longitude = coords[0];
      latitude = coords[1];

      // Update the bounds recursively by comparing the current
      // xMin/xMax and yMin/yMax with the coordinate
      // we're currently checking
      bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
      bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
      bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
      bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;

  }

  // Returns an object that contains the bounds of this GeoJSON
  // data. The keys of this object describe a box formed by the
  // northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
  return bounds;
}

// function to get random color
export function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// function to collect IDs of original lines
export function collectLinesIDs(edges) {

  var linesIDArray = [];

  edges.features.forEach(e => {
      var indexLine = linesIDArray.indexOf(e.properties.ID_line);

      if (indexLine === -1) {
          linesIDArray.push(e.properties.ID_line);
      }
  });

  return linesIDArray;
}

// function to get geometry of line by ID
export function getLineGeometry(edges, lineID) {
  var geom = {};

  edges.features.forEach(e => {
      if (e.properties.ID_line == lineID) {
          geom = e.geometry;
      }
  });

  return geom;
}

// function to collect edges that belong to the same original line
export function collectSameLineEdges(edges, line) {

  var sameLineEdges = [];

  edges.features.forEach(e => {
      if (e.properties.ID_line === line.properties.lineID) {
          sameLineEdges.push(e);
      }
  })

  return sameLineEdges;
}


// function to change color in array of cargo
export function changeCargoColor(cargoColorArray, id, color) {
  cargoColorArray.forEach(cargo => {
      if (cargo.id === id) {
          cargo.color = color;
      };
  });
}