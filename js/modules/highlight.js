export function createHighlightLines(origLines) {

  const highlightLines = { type: "FeatureCollection", features: [] };
  const hllFeatures = highlightLines.features;
  let counter = 0;

  origLines.features.forEach(origLine => {
    
    hllFeatures.push({
      id: origLine.id,
      uniqueId: counter,
      properties: origLine.properties.dataOneDir,
      geometry: {
        type: "LineString",
        coordinates: reverseLineGeometry(origLine.geometry.coordinates)
      },
    });

    hllFeatures.push({
      id: origLine.id,
      uniqueId: counter + 1,
      properties: origLine.properties.dataTwoDir,
      geometry: origLine.geometry
    });

    counter += 2;

  });

  return highlightLines;
}

// function to fill highlight lines
export function fillHighlightLines(hlLines, origLine) {

  const sameHlLines = collectSameOrigLineHlLines(origLine.id, hlLines);
  let offset;

  sameHlLines.forEach(line => {

    if (line.properties.dir === 1) {

      offset = origLine.properties.dataOneDir.totalWidth;

    } else {

      offset = origLine.properties.dataTwoDir.totalWidth;
    }

    line.properties.offset = offset;

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