/* 

FUNCTIONS FOR TREATMENT OF MAP FEATURES

*/

// function to get flow values
function getFlowValues(edges) {
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
function classifyFlowValuesArray(flowValuesArray, classNum) {
    let statSerie = new geostats(flowValuesArray);

    let jenks = statSerie.getClassJenks(classNum);

    return jenks;
}

// function to get width array
function getWidthArray(widthMin, widthMax) {

    let interpolator = d3.interpolateRound(widthMin, widthMax);

    let widthArray = [widthMin, interpolator(0.333), interpolator(0.666), widthMax];

    return widthArray;
}

// function to calculate width of edge
function calculateWidth(edges, widthArray, jenks) {
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
function calculateOffset(edges, origLineWidth) {
    for (var i = 0, max = edges.features.length; i < max; i++) {
        if (edges.features[i].properties.order === 0) {
            edges.features[i].properties.offset = (origLineWidth / 2) + (edges.features[i].properties.width / 2);
        } else {
            edges.features[i].properties.offset = edges.features[i - 1].properties.offset +
                (edges.features[i - 1].properties.width / 2) + (edges.features[i].properties.width / 2);
        }
    };

}

// function to get random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// function to get goods types
function getGoodsTypes(edges) {
    let goodsTypes = [];

    edges.features.forEach(edge => {
        let goodsType = edge.properties.type;
        if (goodsTypes.indexOf(goodsType) === -1) {
            goodsTypes.push(goodsType);
        }
    });

    return goodsTypes;
}

// function to get random colors array for different types of goods
function getRandomGoodsColorArray(goodsTypes) {

    let randomGoodsColorArray = [];
    let idCounter = 0;

    goodsTypes.forEach(goodsType => {
        randomGoodsColorArray.push({
            id: idCounter,
            type: goodsType,
            color: getRandomColor()
        });
        idCounter += 1;
    });

    return randomGoodsColorArray;

}

// function to add colors to edges
function addColors(edges, colorArray) {
    edges.features.forEach(f => {

        let goodsType = f.properties.type;

        colorArray.forEach(item => {
            if (item.type === goodsType) {
                f.properties.color = item.color;
            }
        });
    });
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
function collectSameLineEdges(edges, line) {

    var sameLineEdges = [];

    edges.features.forEach(e => {
        if (e.properties.ID_line === line.properties.lineID) {
            sameLineEdges.push(e);
        }
    })

    return sameLineEdges;
}

// function to calculate width of the widest side of specific original line
function calculateWidestSideWidth(edges, line) {

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

function calculateTapeTotalWidth(edges, line) {
    let sameLineEdges = collectSameLineEdges(edges, line);

    let tapeTotalWidth = 0;

    sameLineEdges.forEach(e => {
        tapeTotalWidth += e.properties.width;
    });

    return tapeTotalWidth;
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

// function to fill adjacent lines attribute to nodes
function fillAdjacentLinesAttr(nodes, edges) {
    nodes.features.forEach(node => {
        node.properties.adjacentLines = findAdjacentLines(edges, node.properties.OBJECTID);
    });
}

// function to calculate the maximum width of the adjacent line
function calculateMaxWidth(origLines, adjacentLines) {

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
function fillOrigLines(linesIDArray, origLines, edges) {
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
function addWidthAttr(origLines, edges, origLineWidth) {

    origLines.features.forEach(line => {
        let widestSideWidth = calculateWidestSideWidth(edges, line) + (origLineWidth / 2);
        let tapeTotalWidth = calculateTapeTotalWidth(edges, line) + origLineWidth + 2;

        line.properties.widestSideWidth = widestSideWidth;
        line.properties.tapeTotalWidth = tapeTotalWidth;
    });
}


// function to calculate node radius
function calculateNodeRadius(origLines, node) {

    var adjacentLines = node.properties.adjacentLines;
    var maxWidth = calculateMaxWidth(origLines, adjacentLines);
    var nodeRadius = maxWidth;

    return nodeRadius;
}

// function to render background lines
function renderBackgroundLines(map, origLines, origLineWidth) {

    if (map.getSource('background-lines')) {
        map.getSource('background-lines').setData(origLines);

    } else {

        map.addSource("background-lines", { type: "geojson", data: origLines });

        // add background lines layer
        map.addLayer({
            "id": "background-lines",
            "source": "background-lines",
            "filter": ["!=", "widestSideWidth", origLineWidth / 2],
            "type": "line",
            "paint": {
                'line-color': "#000",
                "line-opacity": 0.5,
                "line-width": ['get', 'tapeTotalWidth'],
                "line-blur": 10,
                'line-offset': 12
            },
            "layout": {
                "line-cap": "round"
            }
        });
    }
}

// function to render edges
function renderEdges(map, edges, goodsTypes) {

    if (map.getSource('edges')) {
        map.getSource('edges').setData(edges);

    } else {

        map.addSource("edges", { type: "geojson", data: edges });

        // add array of layers to map (one for each type of cargo)
        goodsTypes.reverse().forEach(good => {
            map.addLayer({
                "id": good,
                "source": "edges",
                "type": "line",
                "filter": ["==", "type", good],
                "paint": {
                    'line-color': ['get', 'color'],
                    "line-opacity": 1,
                    'line-offset': ['get', 'offset'],
                    "line-width": ['get', 'width']
                }
            });
        });
    }
}

// function to render nodes
function renderNodes(map, nodes) {

    if (map.getSource('nodes')) {
        map.getSource('nodes').setData(nodes);

    } else {

        map.addSource("nodes", { type: "geojson", data: nodes });

        // add junctions layer
        map.addLayer({
            "id": "junctions",
            "source": "nodes",
            "type": "circle",
            "filter": ["==", "NAME", "junction"],
            'layout': {
                'visibility': 'visible'
            },
            "paint": {
                "circle-color": "#c4c4c4",
                "circle-radius": ['get', 'radius'],
                "circle-stroke-color": "#000000",
                "circle-stroke-width": 2
            }
        });

        // add cities layer
        map.addLayer({
            "id": "cities",
            "source": "nodes",
            "type": "circle",
            "filter": ["!=", "NAME", "junction"],
            "paint": {
                "circle-color": "#ffffff",
                "circle-radius": ['get', 'radius'],
                "circle-stroke-color": "#000000",
                "circle-stroke-width": 2
            }
        });

        // add cities labels
        map.addLayer({
            "id": "nodes-label",
            "source": "nodes",
            "type": "symbol",
            "filter": ["!=", "NAME", "junction"],
            "layout": {
                "text-font": ["PT Sans Narrow Bold"],
                "text-field": "{NAME}",
                "text-size": ['get', 'radius'],
                "text-offset": [1.2, -1.5]
            },
            "paint": {
                "text-color": "#000000",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1,
                "text-halo-blur": 1
            }
        });
    }
}

// function to render original lines
function renderOrigLines(map, origLines, origLineWidth) {

    if (map.getSource('lines')) {
        map.getSource('lines').setData(origLines);

    } else {

        map.addSource("lines", { type: "geojson", data: origLines });

        // add orig lines layer
        map.addLayer({
            "id": "lines",
            "source": "lines",
            "type": "line",
            "paint": {
                'line-color': "#ffffff",
                "line-opacity": 1,
                "line-width": origLineWidth
            },
            "layout": {
                "line-cap": "round"
            }
        });
    }
}

/* 

FUNCTIONS FOR EDIT INTERFACE

*/

// function to create color box
function createColorBox(good) {
    let colorBox = document.createElement('span');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = good.color;
    colorBox.id = good.id;

    return colorBox;
}

// function to create color table
function createColorTable(tableBody, goodsColorArray, edges, map) {

    goodsColorArray.forEach(good => {
        let row = document.createElement('tr');
        let colId = document.createElement('td');
        colId.innerHTML = good.id;
        let colType = document.createElement('td');
        colType.innerHTML = good.type;

        let colColor = document.createElement('td');
        let colorBox = createColorBox(good);
        colColor.appendChild(colorBox);

        bindColorPicker(colorBox, goodsColorArray, edges, map);

        let cols = [colId, colType, colColor];

        cols.forEach(col => {
            row.appendChild(col);
        });

        tableBody.appendChild(row);
    });
}

// function to bind color picker and change color handler
function bindColorPicker(colorBox, goodsColorArray, edges, map) {
    var hueb = new Huebee(colorBox, {
        setText: false,
        notation: 'hex'
    });

    hueb.on('change', function (color) {
        let goodID = +this.anchor.id;
        changeGoodColor(goodsColorArray, goodID, color);
        addColors(edges, goodsColorArray);
        renderEdges(map, edges);
    });

}

// function to change color in array of goods
function changeGoodColor(goodsColorArray, id, color) {
    goodsColorArray.forEach(good => {
        if (good.id === id) {
            good.color = color;
        };
    });
}

// function to set up width slider
function createSlider(el, minWidthDefault, maxWidthDefault, maxWidth) {
    noUiSlider.create(el, {
        start: [minWidthDefault, maxWidthDefault],
        connect: true,
        range: {
            'min': [minWidthDefault, 1],
            'max': [maxWidth]
        }
    });
}

/* 

FUNCTIONS FOR OTHER INTERFACE

*/

function toggleLayerVisibility(layerCheckbox, map, layerId) {

    if (layerCheckbox.checked) {
        map.setLayoutProperty(layerId, 'visibility', 'visible');
    } else {
        map.setLayoutProperty(layerId, 'visibility', 'none');
    }
}