import { collectSameLineEdges } from "./orig-lines";

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

    const offset = getBgLineOffset(totalWidthOneDir, totalWidthTwoDir);
    line.properties.offset = offset;

  });

}

function getBgLineOffset(totalWidthOneDir, totalWidthTwoDir) {
  const offsetValue = totalWidthOneDir - totalWidthTwoDir;

  return offsetValue * (-1) / 2;

}