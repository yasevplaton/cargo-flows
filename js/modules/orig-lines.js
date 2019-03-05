import { getLineGeometry } from "./common";

// function to fill orig lines with attributes
export function fillOrigLines(linesIDArray, origLines, edges) {
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