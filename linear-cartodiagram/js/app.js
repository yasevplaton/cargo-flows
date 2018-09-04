(() => {
    // get access mapbox api
    mapboxgl.accessToken = 'pk.eyJ1IjoieWFzZXZwbGF0b24iLCJhIjoiY2poaTJrc29jMDF0YzM2cDU1ZnM1c2xoMiJ9.FhmWdHG7ar14dQv1Aoqx4A';

    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/dark-v9', // tiles location
        // style: 'https://maps.tilehosting.com/styles/darkmatter/style.json?key=9jsySrA6E6EKeAPy7tod',
        center: [37.64, 55.75], // starting position [lng, lat]
        zoom: 10 // starting zoom
    });

    map.on('load', () => {

        // load data
        Promise.all([
            fetch('./data/edges4326.geojson?ass=' + Math.random()).then(response => response.json()),
            fetch('./data/nodes4326.geojson?ass=' + Math.random()).then(response => response.json())
        ]).then(([edges, nodes]) => {

            // set constants for some properties
            const widthArray = [0, 2, 6, 10];
            const colorsArray = { "chocolate": '#661a00', "bananas": '#ffff00', "oranges": '#ff751a' };
            const origLineWidth = 2;

            // function to add colors to edges
            function addColors(colors) {
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
            function calculateWidth(width) {
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
            function calculateOffset(origLineWidth) {
                for (var i = 0; i < edges.features.length; i++) {
                    if (edges.features[i].properties.order === 0) {
                        edges.features[i].properties.offset = (origLineWidth / 2) + (edges.features[i].properties.width / 2);
                    } else {
                        edges.features[i].properties.offset = edges.features[i - 1].properties.offset +
                            (edges.features[i - 1].properties.width / 2) + (edges.features[i].properties.width / 2);
                    }
                };

            }

            // add colors to edges
            addColors(colorsArray);

            // calculate width of edges
            calculateWidth(widthArray);

            // calculate offset of edges
            calculateOffset(origLineWidth);

            // create a blank object for storage original lines
            var origLines = { "type": 'FeatureCollection', features: [] };

            // function to collect IDs of original lines
            function collectLinesIDs() {

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
            function getLineGeometry(lineID) {
                var geom = {};

                edges.features.forEach(e => {
                    if (e.properties.ID_line == lineID) {
                        geom = e.geometry;
                    }
                });

                return geom;
            }

            // function to collect edges that belong to the same original line
            function collectSameLineEdges(lineID) {

                var sameLineEdges = [];

                edges.features.forEach(e => {
                    if (e.properties.ID_line === lineID) {
                        sameLineEdges.push(e);
                    }
                })

                return sameLineEdges;
            }

            // function to calculate total width of edges that belong to specific original line
            function calculateSumWidth(lineID) {

                var sameLineEdges = collectSameLineEdges(lineID);
                var sumWidth = 0;

                sameLineEdges.forEach(e => {
                    sumWidth += e.properties.width;
                });

                return sumWidth;
            }

            // collect ids of lines
            var linesIDArray = collectLinesIDs();

            // calculate summary width of each band in pixels and add to specific property in origLine object
            linesIDArray.forEach(id => {
                var sumWidth = calculateSumWidth(id) + origLineWidth;

                var origLine = {
                    properties: {
                        lineID: id,
                        sumWidth: sumWidth
                    },
                    geometry: getLineGeometry(id)
                };

                origLines.features.push(origLine);
            })

            // function to find lines that adjacent to specific node
            function findAdjacentLines(nodeID) {
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

            // function to calculate node diameter
            function calculateNodeDiameter(nodeID) {

                var adjacentLines = findAdjacentLines(nodeID);
                var maxWidth = calculateMaxWidth(origLines, adjacentLines);
                var nodeDiameter = maxWidth;

                return nodeDiameter;
            }

            // calculate adaptive radius of node
            nodes.features.forEach(node => {
                node.properties.radius = calculateNodeDiameter(node.properties.OBJECTID) / 2 + 2;
            });

            // set sources for map
            map.addSource("edges", { type: "geojson", data: edges });
            map.addSource("nodes", { type: "geojson", data: nodes });
            map.addSource("lines", { type: "geojson", data: origLines });


            // add layers
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

        });

    });
})();