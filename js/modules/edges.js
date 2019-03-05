import { interpolateRound } from 'd3-interpolate';
import { getRandomColor } from "./common";


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