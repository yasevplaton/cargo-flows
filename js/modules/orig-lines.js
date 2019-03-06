import { collectSameLineEdges, getLineGeometry } from "./common";

// function to fill orig lines with attributes
export function createOrigLines(linesIDArray, origLines, edges) {
  linesIDArray.forEach(id => {

      var origLine = {
          properties: {
              lineID: id
          },
          geometry: getLineGeometry(edges, id)
      };

      origLines.features.push(origLine);
  });
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

export function addWidthAndOffsetAttr(origLines, edges) {

  origLines.features.forEach(line => {

    let sameLineEdges = collectSameLineEdges(edges, line);
    let totalWidthOneDir = 0;
    let totalWidthTwoDir = 0;
  
    sameLineEdges.forEach(e => {
      if (e.properties.dir === 1) {
        totalWidthOneDir += e.properties.width;
      } else {
        totalWidthTwoDir += e.properties.width;
      }
    });

    const totalWidth = totalWidthOneDir + totalWidthTwoDir;

    line.properties.dataOneDir.totalWidth = totalWidthOneDir;
    line.properties.dataTwoDir.totalWidth = totalWidthTwoDir;
    line.properties.totalWidth = totalWidth;

    const offset = getOrigLineOffset(totalWidthOneDir, totalWidthTwoDir);
    line.properties.offset = offset;

  });

}

function getOrigLineOffset(totalWidthOneDir, totalWidthTwoDir) {
  const offsetValue = totalWidthOneDir - totalWidthTwoDir;

  return offsetValue * (-1) / 2;

}