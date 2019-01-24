/* 

FUNCTIONS FOR TREATMENT OF MAP FEATURES

*/

// function to get bounding box of nodes layer
function getBoundingBox(data) {
    var bounds = {}, coords, point, latitude, longitude;

    // We want to use the “features” key of the FeatureCollection (see above)
    data = data.features;

    // Loop through each “feature”
    for (var i = 0; i < data.length; i++) {

        // Pull out the coordinates of this feature
        coords = data[i].geometry.coordinates;

        // For each individual coordinate in this feature's coordinates…

        longitude = coords[0];
        latitude = coords[1];

        // Update the bounds recursively by comparing the current
        // xMin/xMax and yMin/yMax with the coordinate
        // we're currently checking
        bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
        bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
        bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
        bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;

    }

    // Returns an object that contains the bounds of this GeoJSON
    // data. The keys of this object describe a box formed by the
    // northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
    return bounds;
}

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

// function to get cargo types
function getCargoTypes(edges) {
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
function getRandomCargoColorArray(cargoTypes) {

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
function addColors(edges, colorArray) {
    edges.features.forEach(f => {

        let cargoType = f.properties.type;

        colorArray.forEach(item => {
            if (item.type === cargoType) {
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

function calcCargoMaxWidth(edges, line, cargoTypes) {
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
function calculateTapeTotalWidth(edges, line) {
    let sameLineEdges = collectSameLineEdges(edges, line);

    let tapeTotalWidth = 0;

    sameLineEdges.forEach(e => {
        tapeTotalWidth += e.properties.width;
    });

    return tapeTotalWidth;
}

// function to calculate shadow offset for background lines
function calculateShadowOffset(origLines, shadowOffset) {
    origLines.features.forEach(line => {

        let firstNodelat, lastNodelat;

        if (line.geometry.type === "LineString") {

            firstNodelat = line.geometry.coordinates[0][1];
            lastNodelat = line.geometry.coordinates[line.geometry.coordinates.length - 1][1];

        } else if (line.geometry.type === "MultiLineString") {

            firstNodelat = line.geometry.coordinates[0][0][1];
            lastNodelat = line.geometry.coordinates[0][line.geometry.coordinates[0].length - 1][1];
        }

        if (firstNodelat <= lastNodelat) {
            line.properties.shadowOffset = shadowOffset;
        } else {
            line.properties.shadowOffset = -shadowOffset;
        }
    });
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
function addWidthAttr(origLines, edges, origLineWidth, cargoTypes) {

    origLines.features.forEach(line => {
        let widestSideWidth = calculateWidestSideWidth(edges, line) + (origLineWidth / 2);
        let tapeTotalWidth = calculateTapeTotalWidth(edges, line) + origLineWidth + 2;

        let cargoMaxWidth = calcCargoMaxWidth(edges, line, cargoTypes);

        line.properties.widestSideWidth = widestSideWidth;
        line.properties.tapeTotalWidth = tapeTotalWidth;
        line.properties.cargoMaxWidth = cargoMaxWidth;
    });
}

function getMaxCargoRadius(origLines, adjacentLines, cargo) {
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


// function to calculate node radius
function addRadiusAttr(origLines, node, cargoTypes) {

    var adjacentLines = node.properties.adjacentLines;
    var maxWidth = calculateMaxWidth(origLines, adjacentLines);
    node.properties.radius = maxWidth - 1;


    cargoTypes.forEach(cargo => {
        let cargoPropName = cargo + "MaxRadius";
        node.properties[cargoPropName] = getMaxCargoRadius(origLines, adjacentLines, cargo);
    });

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
                "line-width": [
                    'interpolate', ['linear'], ['zoom'],
                    5, ['/', ['get', 'tapeTotalWidth'], 6],
                    10, ['get', 'tapeTotalWidth']
                ],
                "line-blur": 10,
                'line-offset': [
                    'interpolate', ['linear'], ['zoom'],
                    5, ['/', ['get', 'shadowOffest'], 1],
                    10, ['get', 'shadowOffest']
                ]
            },
            "layout": {
                "line-cap": "round"
            }
        });
    }
}

// function to render edges
function renderEdges(map, edges, cargoColorArray, nodes) {

    if (map.getSource('edges')) {
        map.getSource('edges').setData(edges);
        map.getSource('junction-nodes').setData(nodes);

    } else {

        map.addSource("edges", { type: "geojson", data: edges });
        map.addSource("junction-nodes", { type: "geojson", data: nodes });

        let reverseCargoArray = cargoColorArray.slice().reverse();

        // add array of layers to map (one for each type of cargo)
        reverseCargoArray.forEach(cargoObj => {

            map.addLayer({
                "id": cargoObj.type,
                "source": "edges",
                "type": "line",
                "filter": [
                    "all",
                    ["==", "type", cargoObj.type],
                    ["!=", "value", 0]
                ],
                "paint": {
                    'line-color': ['get', 'color'],
                    "line-opacity": 1,
                    'line-offset': [
                        'interpolate', ['linear'], ['zoom'],
                        5, ['/', ['get', 'offset'], 10],
                        10, ['get', 'offset']
                    ],
                    "line-width": [
                        'interpolate', ['linear'], ['zoom'],
                        5, ['/', ['get', 'width'], 10],
                        10, ['get', 'width']
                    ]
                }
            });


            // render junctions nodes layer
            let cargoPropName = cargoObj.type + "MaxRadius";

            map.addLayer({
                "id": cargoObj.type + "node",
                "source": "junction-nodes",
                "type": "circle",
                "paint": {
                    "circle-color": cargoObj.color,
                    "circle-radius": [
                        'interpolate', ['linear'], ['zoom'],
                        5, ['/', ['get', cargoPropName], 10],
                        10, ['get', cargoPropName]
                    ]
                }
            });

        });
    }
}


// function to change colors of edges
function changeEdgesColor(map, cargoColorArray) {
    let reverseCargoArray = cargoColorArray.slice().reverse();

    reverseCargoArray.forEach(cargoObj => {
        map.setPaintProperty(cargoObj.type, 'line-color', cargoObj.color);
        let layerNodeID = cargoObj.type + "node";
        map.setPaintProperty(layerNodeID, 'circle-color', cargoObj.color);
    })
    
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
                'visibility': 'none'
            },
            "paint": {
                "circle-color": "#c4c4c4",
                "circle-radius": [
                    'interpolate', ['linear'], ['zoom'],
                    5, ['/', ['get', 'radius'], 10],
                    10, ['get', 'radius']
                ],
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
                "circle-radius": [
                    'interpolate', ['linear'], ['zoom'],
                    5, ['/', ['get', 'radius'], 10],
                    10, ['get', 'radius']
                ],
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
                "text-size": [
                    'interpolate', ['linear'], ['zoom'],
                    5, ['/', ['get', 'radius'], 3],
                    10, ['get', 'radius']
                ],
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
            "filter": ["!=", "widestSideWidth", origLineWidth / 2],
            "type": "line",
            "paint": {
                'line-color': "#333",
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
function createColorBox(cargo) {
    let colorBox = document.createElement('span');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = cargo.color;
    colorBox.id = cargo.id;

    return colorBox;
}

// function to create color table
function createColorTable(tableBody, cargoColorArray, edges, map, nodes) {

    cargoColorArray.forEach(cargo => {
        let row = document.createElement('tr');
        let colId = document.createElement('td');
        colId.innerHTML = cargo.id;
        let colType = document.createElement('td');
        colType.innerHTML = cargo.type;

        let colColor = document.createElement('td');
        let colorBox = createColorBox(cargo);
        colColor.appendChild(colorBox);

        bindColorPicker(colorBox, cargoColorArray, edges, map, nodes);

        let cols = [colId, colType, colColor];

        cols.forEach(col => {
            row.appendChild(col);
        });

        tableBody.appendChild(row);
    });
}

// function to bind color picker and change color handler
function bindColorPicker(colorBox, cargoColorArray, edges, map, nodes) {
    var hueb = new Huebee(colorBox, {
        setText: false,
        notation: 'hex'
    });

    hueb.on('change', function (color) {
        let cargoID = +this.anchor.id;
        changeCargoColor(cargoColorArray, cargoID, color);
        // addColors(edges, cargoColorArray);
        // renderEdges(map, edges, cargoColorArray, nodes);
        changeEdgesColor(map, cargoColorArray);
    });

}

// function to change color in array of cargo
function changeCargoColor(cargoColorArray, id, color) {
    cargoColorArray.forEach(cargo => {
        if (cargo.id === id) {
            cargo.color = color;
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

// function to toggle layer visibility
function toggleLayerVisibility(layerCheckbox, map, layerId) {

    if (layerCheckbox.checked) {
        map.setLayoutProperty(layerId, 'visibility', 'visible');
    } else {
        map.setLayoutProperty(layerId, 'visibility', 'none');
    }
}