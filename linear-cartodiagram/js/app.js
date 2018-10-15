onLoad = () => {

    // get access to mapbox api
    mapboxgl.accessToken = 'pk.eyJ1IjoieWFzZXZwbGF0b24iLCJhIjoiY2poaTJrc29jMDF0YzM2cDU1ZnM1c2xoMiJ9.FhmWdHG7ar14dQv1Aoqx4A';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9', // mapbox tiles location
        // style: 'https://maps.tilehosting.com/styles/darkmatter/style.json?key=9jsySrA6E6EKeAPy7tod', // tiles from tilehosting.com
        center: [37.64, 55.75],
        zoom: 10
    });

    map.on('load', () => {

        // remove greeting panel and make interface elements visible
        d3.select("#greeting-panel").remove();
        d3.select("#download-data-interface-wrapper").style('visibility', 'visible');

        // get access to input element and submit button
        const inputFileElement = document.getElementById('inputGoodsTable');
        const buttonSubmit = document.getElementById('btn-submit');
        const loadingPanel = document.getElementById('loading-panel');
        const editInterface = document.getElementById('edit-interface-wrapper');

        // store server url
        // localhost url for testing
        // const url = 'http://127.0.0.1:5000/upload_data';

        // pythonanywhere url for production
        const url = 'https://yasevplaton.pythonanywhere.com/upload_data';

        // initialize variable to store input file
        var goodsTable;

        // add click listener to submit button
        buttonSubmit.addEventListener('click', (e) => {
            // prevent default submit action
            e.preventDefault();

            // if we've already have input file
            if (goodsTable) {
                //  compare its name with name of current input file
                if (inputFileElement.files[0].name = goodsTable.name) {
                    // if names are same don't do anything
                    console.log('The same file was selected, select another file');
                    return;
                }
            }

            // show loading panel
            loadingPanel.classList.remove('hidden');

            // request edges and nodes
            Promise.all([

                // edges for production
                fetch(url, {
                    method: 'POST',
                    body: inputFileElement.files[0]
                }).then(response => response.json()),

                // edges for testing
                // fetch('data/edges4326.geojson?ass=' + Math.random())
                //     .then(response => response.json()),

                // nodes
                fetch('data/nodes4326.geojson?ass=' + Math.random())
                    .then(response => response.json())

            ]).then(([edges, nodes]) => {

                goodsTable = inputFileElement.files[0];

                // hide loading panel
                loadingPanel.classList.add('hidden');

                // show edit interface
                editInterface.classList.remove('hidden');

                // set constants for some properties
                const widthArray = [0, 2, 4, 8];
                const origLineWidth = 2;

                // get goods types
                let goodsTypes = getGoodsTypes(edges);

                // get random colors for goods types
                let goodsColorArray = getRandomGoodsColorArray(goodsTypes);

                // create a blank object for storage original lines
                const origLines = { "type": 'FeatureCollection', features: [] };

                // add colors to edges
                addColors(edges, goodsColorArray);

                // calculate width of edges
                calculateWidth(edges, widthArray);

                // calculate offset of edges
                calculateOffset(edges, origLineWidth);

                // collect ids of lines
                var linesIDArray = collectLinesIDs(edges);

                // calculate width of the widest side of each band in pixels and add to specific property in origLine object
                linesIDArray.forEach(id => {
                    var sumWidth = calculateSumWidth(edges, id) + (origLineWidth / 2);

                    var origLine = {
                        properties: {
                            lineID: id,
                            sumWidth: sumWidth
                        },
                        geometry: getLineGeometry(edges, id)
                    };

                    origLines.features.push(origLine);
                });

                // calculate adaptive radius of node
                nodes.features.forEach(node => {
                    node.properties.radius = calculateNodeRadius(edges, origLines, node.properties.OBJECTID) + 2;
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
            }).catch(error => console.log("Error with the loading of data:", error));

        });

    });
};
