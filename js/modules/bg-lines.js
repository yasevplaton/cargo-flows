import { collectSameLineEdges } from "./common";

export function fillBackgroundLines(backgroundLines, edges, origLines) {

  const bgLinesOneDir = [];
  const bgLinesTwoDir = [];

  fillSingleDirBgLines(edges, origLines, 1, bgLinesOneDir);
  fillSingleDirBgLines(edges, origLines, -1, bgLinesTwoDir);

  const bgFeatures = [...bgLinesOneDir, ...bgLinesTwoDir];
  backgroundLines.features.push(bgFeatures);

}

function fillSingleDirBgLines(edges, origLines, direction, bgLinesArray) {
  
  origLines.features.forEach(line => {

    const sameLineEdges = collectSameLineEdges(edges, line);

    let totalWidth = 0;
    let totalVolume = 0;
    const values = {};
    let src, dest, dir, geom;
    const origLineId = line.properties.lineID;

    sameLineEdges.forEach(edge => {
      
      if (edge.properties.dir === direction) {
        totalWidth += edge.properties.width;
        totalVolume += edge.properties.value;
        values[edge.properties.type] = edge.properties.value;
        src = edge.properties.src;
        dest = edge.properties.dest;
        dir = edge.properties.dir;
        geom = edge.geometry;
      }


    });

    const bgLine = {
      properties: {
        src: src,
        dest: dest,
        dir: dir,
        values: values,
        totalWidth: totalWidth,
        totalVolume: totalVolume,
        origLineId: origLineId
      },
      geometry: geom
    };

    bgLinesArray.push(bgLine);
    
  });
}

// function to calculate width of the widest side of specific original line
export function calculateTotalWidthForDirection(edges, line) {

  let sameLineEdges = collectSameLineEdges(edges, line);
  let totalWidthDirOne = 0;
  let totalWidthDirTwo = 0;

  sameLineEdges.forEach(e => {
    if (e.properties.dir === 1) {
      totalWidthDirOne += e.properties.width;
    } else if (e.properties.dir === -1) {
      totalWidthDirTwo += e.properties.width;
    }
  });

  return {
    totalWidthDirOne: totalWidthDirOne,
    totalWidthDirTwo: totalWidthDirTwo
  };

}

// function to calculate the maximum width of the adjacent line
export function calculateMaxWidth(origLines, adjacentLines) {

  var widthArray = [];

  adjacentLines.forEach(adjLine => {
    origLines.features.forEach(line => {
      if (adjLine === line.properties.lineID) {
        widthArray.push(line.properties.widestSideWidth);
      }
    });
  });

  var maxWidth = Math.max(...widthArray);

  return maxWidth;
}

// function to add total width of line to original lines
export function addWidthAttr(origLines, edges, origLineWidth, cargoTypes) {

  origLines.features.forEach(line => {
    const { totalWidthDirOne, totalWidthDirTwo } = calculateTotalWidthForDirection(edges, line);

    line.properties.totalWidthDirOne = totalWidthDirOne;
    line.properties.totalWidthDirTwo = totalWidthDirTwo;
    line.properties.tapeTotalWidth = totalWidthDirOne + totalWidthDirTwo;
  });
}