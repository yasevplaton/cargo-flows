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

    // store buttons from DOM to constant
    // const arrayButtons = document.getElementsByTagName('button');

    // prevent submit action
    // for (let b of arrayButtons) {
    //     b.addEventListener('click', preventSubmit);
    // }

    // Select your input type file and store it in a variable
    const inputFileElement = document.getElementById('inputGoodsTable');
    // const inputFile = inputFileElement.files[0];
    const buttonSubmit = document.getElementById('btn-submit');
    // This will upload the file after having read it
    const upload = (file) => {
        fetch('http://127.0.0.1:5000/upload_data', { // Your POST endpoint
            method: 'POST',
            body: file // This is your file object
        }).then(
            response => response.json() // if the response is a JSON object
        ).then(
            success => console.log(success) // Handle the success response object
        ).catch(
            error => console.log(error) // Handle the error response object
        );
    };

    // Event handler executed when a file is selected
    buttonSubmit.addEventListener('click', (e) => {
        e.preventDefault();
        upload(inputFileElement.files[0]);
    });

    inputFileElement.addEventListener('change', () => {
        console.log(inputFileElement.files[0]);
    });

    map.on('load', () => {

        // remove greeting panel and make interface elements visible
        d3.select("#greeting-panel").remove();
        d3.select("#interface-wrapper").style('visibility', 'visible');

        // load data
        Promise.all([
            fetch('data/edges4326.geojson?ass=' + Math.random()).then(response => response.json()),
            fetch('data/nodes4326.geojson?ass=' + Math.random()).then(response => response.json())
        ]).then(([edges, nodes]) => {

            // set constants for some properties
            const widthArray = [0, 2, 6, 10];
            const colorsArray = { "chocolate": '#661a00', "bananas": '#ffff00', "oranges": '#ff751a' };
            const origLineWidth = 2;

            // create a blank object for storage original lines
            const origLines = { "type": 'FeatureCollection', features: [] };

            // add colors to edges
            addColors(edges, colorsArray);

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

        });

    });
})();
