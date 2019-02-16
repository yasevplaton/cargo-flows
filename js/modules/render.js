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
export function renderEdges(map, edges, cargoColorArray, nodes, multipleCargoNodesObject) {

    const reverseCargoArray = cargoColorArray.slice().reverse();

    if (map.getSource('edges')) {
        map.getSource('edges').setData(edges);

        reverseCargoArray.forEach(cargoObj => {
          map.getSource(`${cargoObj.type}-nodes`).setData(multipleCargoNodesObject[cargoObj.type]);
        });


    } else {

        map.addSource("edges", { type: "geojson", data: edges });
        // map.addSource("junction-nodes", { type: "geojson", data: nodes });

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
                    // "line-offset": ['get', 'offset'],
                    'line-offset': [
                        'interpolate', ['linear'], ['zoom'],
                        1, ['/', ['get', 'offset'], 512],
                        2, ['/', ['get', 'offset'], 256],
                        3, ['/', ['get', 'offset'], 128],
                        4, ['/', ['get', 'offset'], 64],
                        5, ['/', ['get', 'offset'], 32],
                        6, ['/', ['get', 'offset'], 16],
                        7, ['/', ['get', 'offset'], 8],
                        8, ['/', ['get', 'offset'], 4],
                        9, ['/', ['get', 'offset'], 2],
                        10, ['get', 'offset'],
                        11, ['*', ['get', 'offset'], 2],
                        12, ['*', ['get', 'offset'], 4],
                        13, ['*', ['get', 'offset'], 8],
                        14, ['*', ['get', 'offset'], 16],
                        15, ['*', ['get', 'offset'], 32],
                        16, ['*', ['get', 'offset'], 64],
                        17, ['*', ['get', 'offset'], 128],
                        18, ['*', ['get', 'offset'], 256],
                        19, ['*', ['get', 'offset'], 512],
                        20, ['*', ['get', 'offset'], 1024],
                        21, ['*', ['get', 'offset'], 2048],
                        22, ['*', ['get', 'offset'], 4096],

                        // 22, ['*', ['get', 'offset'], 1],
                    ],
                    // "line-width": ['get', 'width']
                    "line-width": [
                      'interpolate', ['linear'], ['zoom'],
                      1, ['/', ['get', 'width'], 512],
                      2, ['/', ['get', 'width'], 256],
                      3, ['/', ['get', 'width'], 128],
                      4, ['/', ['get', 'width'], 64],
                      5, ['/', ['get', 'width'], 32],
                      6, ['/', ['get', 'width'], 16],
                      7, ['/', ['get', 'width'], 8],
                      8, ['/', ['get', 'width'], 4],
                      9, ['/', ['get', 'width'], 2],
                      10, ['get', 'width'],
                      11, ['*', ['get', 'width'], 2],
                      12, ['*', ['get', 'width'], 4],
                      13, ['*', ['get', 'width'], 8],
                      14, ['*', ['get', 'width'], 16],
                      15, ['*', ['get', 'width'], 32],
                      16, ['*', ['get', 'width'], 64],
                      17, ['*', ['get', 'width'], 128],
                      18, ['*', ['get', 'width'], 256],
                      19, ['*', ['get', 'width'], 512],
                      20, ['*', ['get', 'width'], 1024],
                      21, ['*', ['get', 'width'], 2048],
                      22, ['*', ['get', 'width'], 4096],
                        // 22, ['*', ['get', 'width'], 1],
                    ]
                }
            });


            // render junctions nodes layer
            const cargoRadiusName = `${cargoObj.type}-radius`;
            const cargoTranslateName = `${cargoObj.type}-translate`;

            map.addSource(`${cargoObj.type}-nodes`, { type: "geojson", data: multipleCargoNodesObject[cargoObj.type] });

            map.addLayer({
                "id": cargoObj.type + "-nodes",
                "source": `${cargoObj.type}-nodes`,
                "type": "circle",
                "filter": ["!=", ['get', "radius"], 0],
                "paint": {
                    "circle-color": cargoObj.color,
                    // "circle-radius": ['get', "radius"]
                    "circle-radius": [
                      'interpolate', ['linear'], ['zoom'],
                      1, ['/', ['get', 'radius'], 512],
                      2, ['/', ['get', 'radius'], 256],
                      3, ['/', ['get', 'radius'], 128],
                      4, ['/', ['get', 'radius'], 64],
                      5, ['/', ['get', 'radius'], 32],
                      6, ['/', ['get', 'radius'], 16],
                      7, ['/', ['get', 'radius'], 8],
                      8, ['/', ['get', 'radius'], 4],
                      9, ['/', ['get', 'radius'], 2],
                      10, ['get', 'radius'],
                      11, ['*', ['get', 'radius'], 2],
                      12, ['*', ['get', 'radius'], 4],
                      13, ['*', ['get', 'radius'], 8],
                      14, ['*', ['get', 'radius'], 16],
                      15, ['*', ['get', 'radius'], 32],
                      16, ['*', ['get', 'radius'], 64],
                      17, ['*', ['get', 'radius'], 128],
                      18, ['*', ['get', 'radius'], 256],
                      19, ['*', ['get', 'radius'], 512],
                      20, ['*', ['get', 'radius'], 1024],
                      21, ['*', ['get', 'radius'], 2048],
                      22, ['*', ['get', 'radius'], 4096],
                        // 22, ['*', ['get', 'radius'], 1],
                    ]
                    // "circle-translate": ['get', cargoTranslateName]
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
        let layerNodeID = cargoObj.type + "-nodes";
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
