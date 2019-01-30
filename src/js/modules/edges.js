import { interpolateRound } from 'd3-interpolate';
import { getRandomColor, collectSameLineEdges, getLineGeometry } from "./common";
const geostats = require('./geostats');


// function to get flow values
export function getFlowValues(edges) {
  let flowValues = [];

  edges.features.forEach(edge => {
      let value = edge.properties.value;
      if (flowValues.indexOf(value) === -1) {
          flowValues.push(value);
      }
  });

  return flowValues;
}

// function to classify flow values array
export function classifyFlowValuesArray(flowValuesArray, classNum) {
  let statSerie = new geostats(flowValuesArray);

  let jenks = statSerie.getClassJenks(classNum);

  return jenks;
}

// function to get width array
export function getWidthArray(widthMin, widthMax) {

  let interpolator = interpolateRound(widthMin, widthMax);

  let widthArray = [widthMin, interpolator(0.333), interpolator(0.666), widthMax];

  return widthArray;
}

// function to calculate width of edge
export function calculateWidth(edges, widthArray, jenks) {
  edges.features.forEach(f => {
      if (f.properties.value === 0) {
          f.properties.width = 0;
      } else if (f.properties.value > 0 && f.properties.value < jenks[1]) {
          f.properties.width = widthArray[0];
      } else if (f.properties.value >= jenks[1] && f.properties.value < jenks[2]) {
          f.properties.width = widthArray[1];
      } else if (f.properties.value >= jenks[2] && f.properties.value < jenks[3]) {
          f.properties.width = widthArray[2];
      } else if (f.properties.value >= jenks[3]) {
          f.properties.width = widthArray[3];
      }
  });
}

// function to calculate offset of edge
export function calculateOffset(edges, origLineWidth) {
  for (var i = 0, max = edges.features.length; i < max; i++) {
      if (edges.features[i].properties.order === 0) {
          edges.features[i].properties.offset = (origLineWidth / 2) + (edges.features[i].properties.width / 2);
      } else {
          edges.features[i].properties.offset = edges.features[i - 1].properties.offset +
              (edges.features[i - 1].properties.width / 2) + (edges.features[i].properties.width / 2);
      }
  };

}

// function to get cargo types
export function getCargoTypes(edges) {
  let cargoTypes = [];

  edges.features.forEach(edge => {
      let cargoType = edge.properties.type;
      if (cargoTypes.indexOf(cargoType) === -1) {
          cargoTypes.push(cargoType);
      }
  });

  return cargoTypes;
}

// function to get random colors array for different types of cargo
export function getRandomCargoColorArray(cargoTypes) {

  let randomCargoColorArray = [];
  let idCounter = 0;

  cargoTypes.forEach(cargoType => {
      randomCargoColorArray.push({
          id: idCounter,
          type: cargoType,
          color: getRandomColor()
      });
      idCounter += 1;
  });

  return randomCargoColorArray;

}

// function to add colors to edges
// export function addColors(edges, colorArray) {
//   edges.features.forEach(f => {

//       let cargoType = f.properties.type;

//       colorArray.forEach(item => {
//           if (item.type === cargoType) {
//               f.properties.color = item.color;
//           }
//       });
//   });
// }


// function to calculate width of the widest side of specific original line
export function calculateWidestSideWidth(edges, line) {

  let sameLineEdges = collectSameLineEdges(edges, line);
  let widthFirstSide = 0;
  let widthSecondSide = 0;

  sameLineEdges.forEach(e => {
      if (e.properties.dir === 1) {
          widthFirstSide += e.properties.width;
      } else if (e.properties.dir === -1) {
          widthSecondSide += e.properties.width;
      }
  });

  return widthFirstSide >= widthSecondSide ? widthFirstSide : widthSecondSide;
}

export function calcCargoMaxWidth(edges, line, cargoTypes) {
  let cargoMaxWidth = {};
  let sameLineEdges = collectSameLineEdges(edges, line);

  cargoTypes.forEach(cargo => {

      sameLineEdges.forEach(e => {
          if (e.properties.type === cargo) {

              let sumWidth = e.properties.width + e.properties.offset

              if (cargoMaxWidth[cargo]) {
                  if (sumWidth > cargoMaxWidth[cargo]) {
                      cargoMaxWidth[cargo] = sumWidth;
                  }
              } else {
                  cargoMaxWidth[cargo] = sumWidth;
              }
          }
      });
  });

  return cargoMaxWidth;
}

// function to calculate total width of tape
export function calculateTapeTotalWidth(edges, line) {
  let sameLineEdges = collectSameLineEdges(edges, line);

  let tapeTotalWidth = 0;

  sameLineEdges.forEach(e => {
      tapeTotalWidth += e.properties.width;
  });

  return tapeTotalWidth;
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

// function to add total width of line to original lines
export function addWidthAttr(origLines, edges, origLineWidth, cargoTypes) {

  origLines.features.forEach(line => {
      let widestSideWidth = calculateWidestSideWidth(edges, line) + (origLineWidth / 2);
      let tapeTotalWidth = calculateTapeTotalWidth(edges, line) + origLineWidth + 2;

      let cargoMaxWidth = calcCargoMaxWidth(edges, line, cargoTypes);

      line.properties.widestSideWidth = widestSideWidth;
      line.properties.tapeTotalWidth = tapeTotalWidth;
      line.properties.cargoMaxWidth = cargoMaxWidth;
  });
}

// function get cargo max radius
export function getMaxCargoRadius(origLines, adjacentLines, cargo) {
  let cargoMaxRadius;
  let cargoRadiusArray = [];

  adjacentLines.forEach(adjLine => {
      origLines.features.forEach(line => {
          if (adjLine === line.properties.lineID) {
              cargoRadiusArray.push(line.properties.cargoMaxWidth[cargo]);
          }
      });
  });

  cargoMaxRadius = Math.max(...cargoRadiusArray);

  return cargoMaxRadius;
}