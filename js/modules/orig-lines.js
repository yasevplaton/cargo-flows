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

// function to fill orig lines with attributes
export function createOrigLines(linesIDArray, origLines, edges) {
  linesIDArray.forEach(id => {

      var origLine = {
          id: id,
          properties: {
              lineID: id
          },
          geometry: getLineGeometry(edges, id)
      };

      origLines.features.push(origLine);
  });
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

export function fillOrigLinesWithData(origLines, edges) {
  origLines.features.forEach(line => {

    const sameLineEdges = collectSameLineEdges(edges, line);

    const dataOneDir = {
      values: {},
      totalVolume: 0
    };
    const dataTwoDir = {
      values: {},
      totalVolume: 0
    };

    sameLineEdges.forEach(edge => {

      const edgeProps = edge.properties;
      
      if (edgeProps.dir === 1) {
        dataOneDir.dir = edgeProps.dir;
        dataOneDir.src = edgeProps.src;
        dataOneDir.dest = edgeProps.dest;
        dataOneDir.values[edgeProps.type] = edgeProps.value;
        dataOneDir.totalVolume += edgeProps.value;
      } else {
        dataTwoDir.dir = edgeProps.dir;
        dataTwoDir.src = edgeProps.src;
        dataTwoDir.dest = edgeProps.dest;
        dataTwoDir.values[edgeProps.type] = edgeProps.value;
        dataTwoDir.totalVolume += edgeProps.value;
      }

    });

    line.properties.totalVolume = dataOneDir.totalVolume + dataTwoDir.totalVolume;

    line.properties.dataOneDir = dataOneDir;
    line.properties.dataTwoDir = dataTwoDir;
    
    
  });

}