
// function to prevent submit action when user clicks on button
function preventDefaultSubmit(event) {
    event.preventDefault();
}

// function to add colors to edges
function addColors(edges, colors) {
    edges.features.forEach(f => {
        if (f.properties.type === "chocolate") {
            f.properties.color = colors.chocolate;
        } else if (f.properties.type === "bananas") {
            f.properties.color = colors.bananas;
        } else if (f.properties.type === "oranges") {
            f.properties.color = colors.oranges;
        };
    });
}

// function to calculate width of edge
function calculateWidth(edges, width) {
    edges.features.forEach(f => {
        if (f.properties.value === 0) {
            f.properties.width = width[0];
        } else if (f.properties.value > 0 && f.properties.value < 5440) {
            f.properties.width = width[1];
        } else if (f.properties.value >= 5440 && f.properties.value < 10880) {
            f.properties.width = width[2];
        } else if (f.properties.value >= 10880) {
            f.properties.width = width[3];
        }
    });
}

// function to calculate offset of edge
function calculateOffset(edges, origLineWidth) {
    for (var i = 0; i < edges.features.length; i++) {
        if (edges.features[i].properties.order === 0) {
            edges.features[i].properties.offset = (origLineWidth / 2) + (edges.features[i].properties.width / 2);
        } else {
            edges.features[i].properties.offset = edges.features[i - 1].properties.offset +
                (edges.features[i - 1].properties.width / 2) + (edges.features[i].properties.width / 2);
        }
    };

}

// function to collect IDs of original lines
function collectLinesIDs(edges) {

    var linesIDArray = [];

    edges.features.forEach(e => {
        var indexLine = linesIDArray.indexOf(e.properties.ID_line);

        if (indexLine === -1) {
            linesIDArray.push(e.properties.ID_line);
        }
    });

    return linesIDArray;
}

// function to get geometry of line by ID
function getLineGeometry(edges, lineID) {
    var geom = {};

    edges.features.forEach(e => {
        if (e.properties.ID_line == lineID) {
            geom = e.geometry;
        }
    });

    return geom;
}

// function to collect edges that belong to the same original line
function collectSameLineEdges(edges, lineID) {

    var sameLineEdges = [];

    edges.features.forEach(e => {
        if (e.properties.ID_line === lineID) {
            sameLineEdges.push(e);
        }
    })

    return sameLineEdges;
}

// function to calculate width of the widest side of specific original line
function calculateSumWidth(edges, lineID) {

    var sameLineEdges = collectSameLineEdges(edges, lineID);
    let sumWidthFirstSide = 0;
    let sumWidthSecondSide = 0;

    sameLineEdges.forEach(e => {
        if (e.properties.dir === 1) {
            sumWidthFirstSide += e.properties.width;
        } else if (e.properties.dir === -1) {
            sumWidthSecondSide += e.properties.width;
        }
    });

    return sumWidthFirstSide >= sumWidthSecondSide ? sumWidthFirstSide : sumWidthSecondSide;
}

// function to find lines that adjacent to specific node
function findAdjacentLines(edges, nodeID) {
    var adjacentLines = [];

    edges.features.forEach(e => {
        if (e.properties.src === nodeID || e.properties.dest === nodeID) {
            if (adjacentLines.indexOf(e.properties.ID_line) === -1) {
                adjacentLines.push(e.properties.ID_line);
            }
        }
    });

    return adjacentLines;
}

// function to calculate the maximum width of the adjacent line
function calculateMaxWidth(origLines, adjacentLines) {

    var widthArray = [];

    adjacentLines.forEach(adjLine => {
        origLines.features.forEach(line => {
            if (adjLine === line.properties.lineID) {
                widthArray.push(line.properties.sumWidth);
            }
        });
    });

    var maxWidth = Math.max(...widthArray);

    return maxWidth;
}

// function to calculate node radius
function calculateNodeRadius(edges, origLines, nodeID) {

    var adjacentLines = findAdjacentLines(edges, nodeID);
    var maxWidth = calculateMaxWidth(origLines, adjacentLines);
    var nodeRadius = maxWidth;

    return nodeRadius;
}