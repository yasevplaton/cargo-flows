onLoad = () => {

    // get access to mapbox api
    mapboxgl.accessToken = 'pk.eyJ1IjoieWFzZXZwbGF0b24iLCJhIjoiY2poaTJrc29jMDF0YzM2cDU1ZnM1c2xoMiJ9.FhmWdHG7ar14dQv1Aoqx4A';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9', // mapbox tiles location
        // style: 'https://maps.tilehosting.com/styles/darkmatter/style.json?key=9jsySrA6E6EKeAPy7tod', // tiles from tilehosting.com
        center: [37.64, 55.75],
        zoom: 8
    });

    map.on('load', () => {

        // remove greeting panel and make interface elements visible
        document.getElementById("loading-map-panel").remove();
        document.getElementById("greeting-panel").classList.remove('hidden');

        // get access to the necessary elements
        const demoBtn = document.getElementById('btn-demo');
        const uploadBtn = document.getElementById('btn-upload');
        const mainInterface = document.getElementById('main-interface-wrapper');
        const inputFileElement = document.getElementById('inputGoodsTable');
        const buttonSubmit = document.getElementById('btn-submit');
        const loadingDataPanel = document.getElementById('loading-data-panel');
        const editInterface = document.getElementById('edit-interface-wrapper');
        const colorTableBody = document.getElementById('color-table-body');
        const widthSlider = document.getElementById('widthSlider');
        const minWidthInput = document.getElementById('min-width-input');
        const maxWidthInput = document.getElementById('max-width-input');
        const junctionCheckbox = document.getElementById('junctions-checkbox');
        const backgroundLinesCheckbox = document.getElementById('background-lines-checkbox');
        const edgesCheckbox = document.getElementById('edges-checkbox');

        // store server url
        // localhost url for testing
        // const url = 'http://127.0.0.1:5000/upload_data';

        // pythonanywhere url for production
        const url = 'https://yasevplaton.pythonanywhere.com/upload_data';

        // initialize variable to store input file
        let cargoTable,
            edgesPromise,
            nodesPromise;

        // add click listener to sumbit button
        buttonSubmit.addEventListener('click', (e) => {
            // prevent default submit action
            e.preventDefault();

            // if we've already have input file
            if (cargoTable) {
                //  compare its name with name of current input file
                if (inputFileElement.files[0].name = cargoTable.name) {
                    // if names are same don't do anything
                    alert('Выбран тот же файл! Пожалуйста, выберите другой.');
                    return;
                }
            }

            if (inputFileElement.files[0]) {

                // show loading panel
                loadingDataPanel.classList.remove('hidden');

                edgesPromise = fetch(url, {
                    method: 'POST',
                    body: inputFileElement.files[0]
                }).then(response => response.json());

                nodesPromise = fetch('data/pointsVolga.geojson?ass=' + Math.random()).then(response => response.json());

                Promise.all([edgesPromise, nodesPromise])
                    .then(([edges, nodes]) => main(edges, nodes))
                    .catch(error => {
                        loadingDataPanel.classList.add('hidden');
                        alert("Увы, произошла какая-то ошибка :( Если вы разработчик, можете глянуть в консоли и зарепортить багу на гитхабе https://github.com/yasevplaton/linear-cartodiagram. Если вы не понимаете, что такое консоль, бага или гитхаб, обратитесь в службу поддержки по адресу yasevplaton@gmail.com");
                        console.error("Error with loading of data:", error)
                    });

            } else {

                alert("Сначала нужно выбрать файл!");
                return;

            }
        });

        // add click listener to upload button
        uploadBtn.addEventListener('click', () => {
            document.getElementById("greeting-panel").classList.add('hidden');
            mainInterface.classList.remove('hidden');
        });

        // add click listener to demo button
        demoBtn.addEventListener('click', () => {

            // hide greeting panel
            document.getElementById("greeting-panel").classList.add('hidden');
            // show loading panel
            loadingDataPanel.classList.remove('hidden');

            // initialize promises for data
            edgesPromise = fetch('data/edgesVolgaAssym.geojson?ass=' + Math.random()).then(response => response.json());
            nodesPromise = fetch('data/pointsVolga.geojson?ass=' + Math.random()).then(response => response.json());

            // if all promises are resolved invoke main function
            Promise.all([edgesPromise, nodesPromise])
                .then(([edges, nodes]) => main(edges, nodes))
                .catch(error => console.error("Error with loading of data:", error));
        });


        // main function
        function main(edges, nodes) {

            // store input file in variable
            cargoTable = inputFileElement.files[0];

            // hide loading panel
            loadingDataPanel.classList.add('hidden');

            // show main interface if it is hidden
            if (mainInterface.classList.contains('hidden')) {
                mainInterface.classList.remove('hidden');
            }
            // show edit interface
            editInterface.classList.remove('hidden');

            // set original line width
            const origLineWidth = 1;
            const shadowOffset = 12;

            // get bounding box of data to center and zoom map
            let boundingBox = getBoundingBox(nodes);

            // get flow values
            let flowValues = getFlowValues(edges);

            // get marks of classes for flow values
            let jenks = classifyFlowValuesArray(flowValues, 4);

            // get cargo types
            let cargoTypes = getCargoTypes(edges);

            // get random colors for cargo types
            let cargoColorArray = getRandomCargoColorArray(cargoTypes);

            // create a blank object for storage original lines
            let origLines = { "type": 'FeatureCollection', features: [] };

            // add colors to edges
            // addColors(edges, cargoColorArray);

            // collect ids of lines
            let linesIDArray = collectLinesIDs(edges);

            // fill adjacent lines attribute to nodes
            fillAdjacentLinesAttr(nodes, edges);

            // fill original lines object with data
            fillOrigLines(linesIDArray, origLines, edges);

            // set default values for width of edges
            let minWidthDefault = 2, maxWidthDefault = 20;

            minWidthInput.value = minWidthDefault;
            maxWidthInput.value = maxWidthDefault;

            // get width array
            widthArray = getWidthArray(minWidthDefault, maxWidthDefault);

            // calculate width for edges
            calculateWidth(edges, widthArray, jenks);

            // calculate offset for edges
            calculateOffset(edges, origLineWidth);

            // add attribute with total width of band to original lines
            addWidthAttr(origLines, edges, origLineWidth, cargoTypes);

            calculateShadowOffset(origLines, shadowOffset);

            // calculate node radius
            nodes.features.forEach(node => {
                addRadiusAttr(origLines, node, cargoTypes);
            });

            // render background lines
            // renderBackgroundLines(map, origLines, origLineWidth);
            // render edges
            renderEdges(map, edges, cargoColorArray, nodes);
            // render original lines
            renderOrigLines(map, origLines, origLineWidth);
            // render nodes
            renderNodes(map, nodes);

            // create color table
            createColorTable(colorTableBody, cargoColorArray, edges, map);

            // create width slider
            createSlider(widthSlider, minWidthDefault, maxWidthDefault, 100);

            // initialize render counter
            let startRenderCounter = 0;

            // bind update listener to slider
            widthSlider.noUiSlider.on('update', function (values, handle) {

                if (startRenderCounter === 0 || startRenderCounter === 1) {
                    startRenderCounter += 1;
                    return;
                }

                let value = values[handle];

                if (handle) {
                    maxWidthInput.value = Math.round(value);
                    updateSliderHandler();

                } else {
                    minWidthInput.value = Math.round(value);
                    updateSliderHandler();
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

            // add click listener to junctions, background lines and edges checkboxes to toggle visibility of layers
            junctionCheckbox.addEventListener('click', () => {
                toggleLayerVisibility(junctionCheckbox, map, 'junctions');
            });

            backgroundLinesCheckbox.addEventListener('click', () => {
                toggleLayerVisibility(backgroundLinesCheckbox, map, 'background-lines');
            });

            edgesCheckbox.addEventListener('click', () => {
                cargoTypes.forEach(type => {
                    toggleLayerVisibility(edgesCheckbox, map, type);
                });
            });

            // function to update map when slider updates
            function updateSliderHandler() {
                widthArray = getWidthArray(+minWidthInput.value, +maxWidthInput.value);
                calculateWidth(edges, widthArray, jenks);
                calculateOffset(edges, origLineWidth);
                addWidthAttr(origLines, edges, origLineWidth, cargoTypes);
                nodes.features.forEach(node => {
                    addRadiusAttr(origLines, node, cargoTypes);
                });
                // renderBackgroundLines(map, origLines, origLineWidth);
                renderEdges(map, edges, cargoColorArray, nodes);
                renderNodes(map, nodes);
            }

            // center and zoom map to data
            map.fitBounds(
                [[boundingBox.xMin, boundingBox.yMin], [boundingBox.xMax, boundingBox.yMax]],
                { linear: false, speed: 0.3 }
            );
        }

    });
};
