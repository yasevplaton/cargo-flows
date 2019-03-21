import { isEven } from "./common"

export function createHighlightLines(origLines) {
  const highlightLines = { type: "FeatureCollection", features: [] };
  const hllFeatures = highlightLines.features;
  let counter = 0;

  origLines.features.forEach(origLine => {
    
    hllFeatures.push({
      id: origLine.id,
      uniqueId: counter,
      properties: origLine.properties,
      geometry: origLine.geometry
    });

    hllFeatures.push({
      id: origLine.id,
      uniqueId: counter + 1,
      properties: origLine.properties,
      geometry: origLine.geometry
    });

    counter += 2;

  });

  return highlightLines;
}

export function fillHighlightLines(highlightLines) {

  let origLineId;

  highlightLines.features.forEach(line => {

    const isSecondSideLine = origLineId === line.id ? true : false;

    origLineId = line.id;

    const props = line.properties;
    const oneDirProps = props.dataOneDir;
    const twoDirProps = props.dataTwoDir;
    const isFirstSideMax = oneDirProps.totalWidth - twoDirProps.totalWidth >= 0 ? true : false;

    let offset;

    if (!isSecondSideLine) {
      if (isFirstSideMax) {
        offset = oneDirProps.totalWidth;
      } else {
        offset = oneDirProps.totalWidth * (-1);
      }

    } else {
      if (isFirstSideMax) {
        offset = twoDirProps.totalWidth * (-1);
      } else {
        offset = twoDirProps.totalWidth;
      }
    }

    line.properties.offset = offset;

  });

}

function getHlLineOffset(totalWidthOneDir, totalWidthTwoDir) {
  const widthDiff = totalWidthOneDir - totalWidthTwoDir;
  

  return offsetValue;
}