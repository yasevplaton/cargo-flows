export function createHighlightLines(origLines) {

  const highlightLines = { type: "FeatureCollection", features: [] };
  const hllFeatures = highlightLines.features;
  let counter = 0;

  origLines.features.forEach(origLine => {
    
    hllFeatures.push({
      id: origLine.id,
      uniqueId: counter,
      isSecondLine: false,
      geometry: {
        type: "LineString",
        coordinates: reverseLineGeometry(origLine.geometry.coordinates)
      },
    });

    hllFeatures.push({
      id: origLine.id,
      uniqueId: counter + 1,
      isSecondLine: true,
      geometry: origLine.geometry
    });

    counter += 2;

  });

  return highlightLines;
}

export function fillHighLightLines(hlLines, origLine) {
  const sameHlLines = collectSameOrigLineHlLines(origLine.id, hlLines);

  sameHlLines.forEach(line => {
    
  });
}

function collectSameOrigLineHlLines(origLineId, hlLines) {
  const sameHlLines = [];

  hlLines.features.forEach(line => {
    if (line.id === origLineId) {
      sameHlLines.push(line);
    }
  });

  return sameHlLines;
}

function reverseLineGeometry(coordinates) {
  const reverseCoordinates = coordinates.slice().reverse();

  return reverseCoordinates;
}