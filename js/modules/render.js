// function to render background lines
// export function renderBackgroundLines(map, origLines, origLineWidth) {

//   if (map.getSource('background-lines')) {
//       map.getSource('background-lines').setData(origLines);

//   } else {

//       map.addSource("background-lines", { type: "geojson", data: origLines });

//       // add background lines layer
//       map.addLayer({
//           "id": "background-lines",
//           "source": "background-lines",
//           "filter": ["!=", "widestSideWidth", origLineWidth / 2],
//           "type": "line",
//           "paint": {
//               'line-color': "#000",
//               "line-opacity": 0.5,
//               "line-width": [
//                   'interpolate', ['linear'], ['zoom'],
//                   5, ['/', ['get', 'tapeTotalWidth'], 6],
//                   10, ['get', 'tapeTotalWidth']
//               ],
//               "line-blur": 10,
//               'line-offset': [
//                   'interpolate', ['linear'], ['zoom'],
//                   5, ['/', ['get', 'shadowOffest'], 1],
//                   10, ['get', 'shadowOffest']
//               ]
//           },
//           "layout": {
//               "line-cap": "round"
//           }
//       });
//   }
// }

// function to render edges
export function renderEdges(map, edges, cargoColorArray, nodes) {

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
                    'line-color': cargoObj.color,
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
            const cargoRadiusName = `${cargoObj.type}-radius`;
            const cargoTranslateName = `${cargoObj.type}-translate`;

            map.addLayer({
                "id": cargoObj.type + "node",
                "source": "junction-nodes",
                "type": "circle",
                "paint": {
                    "circle-color": cargoObj.color,
                    "circle-radius": [
                        'interpolate', ['linear'], ['zoom'],
                        5, ['/', ['get', cargoRadiusName], 10],
                        10, ['get', cargoRadiusName]
                    ],
                    "circle-translate": ['get', cargoTranslateName]
                }
            });

        });
    }
}

// function to change colors of edges
export function changeEdgesColor(map, cargoColorArray) {
    let reverseCargoArray = cargoColorArray.slice().reverse();

    reverseCargoArray.forEach(cargoObj => {
        map.setPaintProperty(cargoObj.type, 'line-color', cargoObj.color);
        let layerNodeID = cargoObj.type + "node";
        map.setPaintProperty(layerNodeID, 'circle-color', cargoObj.color);
    })

}

// function to render nodes
export function renderNodes(map, nodes) {

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
            'layout': {
                'visibility': 'none'
            },
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
                "text-offset": [1.2, -1.5],
                'visibility': 'none'
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
export function renderOrigLines(map, origLines, origLineWidth) {

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