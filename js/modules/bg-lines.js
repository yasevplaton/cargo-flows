import { collectSameLineEdges } from "./common";

export function fillBackgroundLines(backgroundLines, edges, origLines, origLineWidth) {

  const bgLinesOneDir = [];
  const bgLinesTwoDir = [];

  fillSingleDirBgLines(edges, origLines, 1, bgLinesOneDir, origLineWidth);
  fillSingleDirBgLines(edges, origLines, -1, bgLinesTwoDir, origLineWidth);

  const bgFeatures = [...bgLinesOneDir, ...bgLinesTwoDir];
  backgroundLines.features.push(...bgFeatures);

}

function fillSingleDirBgLines(edges, origLines, direction, bgLinesArray, origLineWidth) {
  
  origLines.features.forEach(line => {

    const sameLineEdges = collectSameLineEdges(edges, line);

    let totalWidth = 0;
    let totalVolume = 0;
    const values = {};
    let src, dest, dir, geom;
    const origLineId = line.properties.lineID;
    const edgesId = [];

    sameLineEdges.forEach(edge => {
      
      if (edge.properties.dir === direction) {
        totalWidth += edge.properties.width;
        totalVolume += edge.properties.value;
        values[edge.properties.type] = edge.properties.value;
        src = edge.properties.src;
        dest = edge.properties.dest;
        dir = edge.properties.dir;
        geom = edge.geometry;
        edgesId.push(+edge.id);
      }

    });

    const bgLine = {
      properties: {
        src: src,
        dest: dest,
        dir: dir,
        values: values,
        totalWidth: totalWidth + (origLineWidth / 2),
        totalVolume: totalVolume,
        origLineId: origLineId,
        edgesId: edgesId,
        offset: totalWidth / 2
      },
      geometry: geom
    };

    bgLinesArray.push(bgLine);
    
  });
}

export function addShadowOffset(line, origLineWidth) {
  const isShadowLine = line.properties.isShadowLine;
  const curTotalWidth = line.properties.totalWidth;

  if (isShadowLine && (curTotalWidth !== origLineWidth / 2)) {
    const shadowTotalWidth = curTotalWidth + 30;
    line.properties.totalWidth = shadowTotalWidth;
    line.properties.offset = shadowTotalWidth / 2;
  }
}

export function isShadowLine(line) {
  const firstPoint = line.geometry.coordinates[0];
  const lastPoint = line.geometry.coordinates[line.geometry.coordinates.length - 1];
  if (lastPoint[0] >= firstPoint[0]) {
    line.properties.isShadowLine = true;
  } else {
    line.properties.isShadowLine = false;
  }

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