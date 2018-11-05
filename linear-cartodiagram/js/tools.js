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
function calculateSumWidth(edges, line) {

    let sameLineEdges = collectSameLineEdges(edges, line);
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
                widthArray.push(line.properties.sumWidth);
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
function addSumWidthAttr(origLines, edges, origLineWidth) {

    origLines.features.forEach(line => {
        let sumWidth = calculateSumWidth(edges, line) + (origLineWidth / 2);

        line.properties.sumWidth = sumWidth;
    });
}


// function to calculate node radius
function calculateNodeRadius(origLines, node) {

    var adjacentLines = node.properties.adjacentLines;
    var maxWidth = calculateMaxWidth(origLines, adjacentLines);
    var nodeRadius = maxWidth;

    return nodeRadius;
}

// function to render edges
function renderEdges(map, edges) {

    if (map.getSource('edges')) {
        map.getSource('edges').setData(edges);

    } else {

        map.addSource("edges", { type: "geojson", data: edges });

        // add edges layer
        map.addLayer({
            "id": "edges",
            "source": "edges",
            "type": "line",
            "paint": {
                'line-color': ['get', 'color'],
                "line-opacity": 1,
                'line-offset': ['get', 'offset'],
                "line-width": ['get', 'width']
            }
        });
    }
}

// function to render nodes
function renderNodes(map, nodes) {

    if (map.getSource('nodes')) {
        map.getSource('nodes').setData(nodes);

    } else {

        map.addSource("nodes", { type: "geojson", data: nodes });

        // add nodes layer
        map.addLayer({
            "id": "nodes",
            "source": "nodes",
            "type": "circle",
            "paint": {
                "circle-color": "#ffffff",
                "circle-radius": ['get', 'radius'],
                "circle-stroke-color": "#000000",
                "circle-stroke-width": 2
            }
        });

        // add nodes labels
        map.addLayer({
            "id": "nodes-label",
            "source": "nodes",
            "type": "symbol",
            "layout": {
                "text-font": ["PT Sans Narrow Bold"],
                "text-field": "{NAME}",
                "text-size": ['get', 'radius'],
                "text-offset": [1, 0]
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
function createSlider(el) {
    noUiSlider.create(el, {
        start: [2, 10],
        connect: true,
        range: {
            'min': [2, 1],
            'max': [30]
        }
    });
}