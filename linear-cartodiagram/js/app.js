onLoad = () => {

    // get access to mapbox api
    mapboxgl.accessToken = 'pk.eyJ1IjoieWFzZXZwbGF0b24iLCJhIjoiY2poaTJrc29jMDF0YzM2cDU1ZnM1c2xoMiJ9.FhmWdHG7ar14dQv1Aoqx4A';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9', // mapbox tiles location
        // style: 'https://maps.tilehosting.com/styles/darkmatter/style.json?key=9jsySrA6E6EKeAPy7tod', // tiles from tilehosting.com
        center: [37.64, 55.75],
        zoom: 8
    });

    map.on('load', () => {

        // remove greeting panel and make interface elements visible
        document.getElementById("greeting-panel").remove();
        document.getElementById("download-data-interface-wrapper").style.visibility = 'visible';

        // get access to input element and submit button
        const inputFileElement = document.getElementById('inputGoodsTable');
        const buttonSubmit = document.getElementById('btn-submit');
        const loadingPanel = document.getElementById('loading-panel');
        const editInterface = document.getElementById('edit-interface-wrapper');
        // const editColorInterface = document.getElementById('edit-color');
        const colorTableBody = document.getElementById('color-table-body');
        // const editWidthInterface = document.getElementById('edit-width');
        const widthSlider = document.getElementById('widthSlider');
        const minWidthInput = document.getElementById('min-width-input');
        const maxWidthInput = document.getElementById('max-width-input');

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

                // set original line width
                const origLineWidth = 2;

                // get flow values
                let flowValues = getFlowValues(edges);

                // get marks of classes for flow values
                let jenks = classifyFlowValuesArray(flowValues, 4);

                // get goods types
                let goodsTypes = getGoodsTypes(edges);

                // get random colors for goods types
                let goodsColorArray = getRandomGoodsColorArray(goodsTypes);

                // create a blank object for storage original lines
                let origLines = { "type": 'FeatureCollection', features: [] };

                // add colors to edges
                addColors(edges, goodsColorArray);

                // collect ids of lines
                var linesIDArray = collectLinesIDs(edges);

                // fill adjacent lines attribute to nodes
                fillAdjacentLinesAttr(nodes, edges);

                // fill original lines object with data
                fillOrigLines(linesIDArray, origLines, edges);

                // set default values for width of edges
                let minWidthDefault = 2, maxWidthDefault = 10;

                minWidthInput.value = minWidthDefault;
                maxWidthInput.value = maxWidthDefault;

                // get width array
                widthArray = getWidthArray(minWidthDefault, maxWidthDefault);

                // calculate width for edges
                calculateWidth(edges, widthArray, jenks);

                // calculate offset for edges
                calculateOffset(edges, origLineWidth);

                // add attribute with total width of band to original lines
                addSumWidthAttr(origLines, edges, origLineWidth);

                // calculate node radius
                nodes.features.forEach(node => {
                    node.properties.radius = calculateNodeRadius(origLines, node) + 2;
                });

                // render edges
                renderEdges(map, edges);
                // render original lines
                renderOrigLines(map, origLines, origLineWidth);
                // render nodes
                renderNodes(map, nodes);

                // create color table
                createColorTable(colorTableBody, goodsColorArray, edges, map);

                // create width slider
                createSlider(widthSlider, minWidthDefault, maxWidthDefault, 30);

                // initialize render counter
                let startRenderCounter = 0;
                
                // bind update listener to slider
                widthSlider.noUiSlider.on('update', function (values, handle) {

                    if (startRenderCounter === 0 || startRenderCounter === 1) {
                        startRenderCounter += 1;
                        return;
                    }

                    var value = values[handle];

                    if (handle) {
                        maxWidthInput.value = Math.round(value);
                        widthArray = getWidthArray(+minWidthInput.value, +maxWidthInput.value);
                        calculateWidth(edges, widthArray, jenks);
                        calculateOffset(edges, origLineWidth);
                        addSumWidthAttr(origLines, edges, origLineWidth);
                        nodes.features.forEach(node => {
                            node.properties.radius = calculateNodeRadius(origLines, node) + 2;
                        });
                        renderEdges(map, edges);
                        renderNodes(map, nodes);

                    } else {
                        minWidthInput.value = Math.round(value);
                        widthArray = getWidthArray(+minWidthInput.value, +maxWidthInput.value);
                        calculateWidth(edges, widthArray, jenks);
                        calculateOffset(edges, origLineWidth);
                        addSumWidthAttr(origLines, edges, origLineWidth);
                        nodes.features.forEach(node => {
                            node.properties.radius = calculateNodeRadius(origLines, node) + 2;
                        });
                        renderEdges(map, edges);
                        renderNodes(map, nodes);
                    }
                });

                // bind change listeners to width inputs
                minWidthInput.addEventListener('change', function () {
                    if (this.value > +maxWidthInput.value) {
                        minWidthInput.value = maxWidthInput.value;
                        widthSlider.noUiSlider.set([+maxWidthInput.value, null]);
                    } else {
                        widthSlider.noUiSlider.set([this.value, null]);
                    }
                });

                maxWidthInput.addEventListener('change', function () {
                    if (this.value < +minWidthInput.value) {
                        maxWidthInput.value = minWidthInput.value;
                        widthSlider.noUiSlider.set([null, +minWidthInput.value]);
                    } else {
                        widthSlider.noUiSlider.set([null, this.value]);
                    }
                });

            }).catch(error => console.log("Error with the loading of data:", error));

        });

    });
};
