
// get access mapbox api
mapboxgl.accessToken = 'pk.eyJ1IjoieWFzZXZwbGF0b24iLCJhIjoiY2poaTJrc29jMDF0YzM2cDU1ZnM1c2xoMiJ9.FhmWdHG7ar14dQv1Aoqx4A';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location
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

        const width = [0, 2, 6, 10];
        const colors = { "chocolate": '#661a00', "bananas": '#ffff00', "oranges": '#ff751a' };
        
        function addColors() {
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

        function calculateWidth() {
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

        const origLineWidth = 2;

        function calculateOffset() {
            for (var i = 0; i < edges.features.length; i++) {
                if (edges.features[i].properties.order === 0) {
                    edges.features[i].properties.offset = (origLineWidth / 2) + (edges.features[i].properties.width / 2);
                } else {
                    edges.features[i].properties.offset = edges.features[i - 1].properties.offset +
                    (edges.features[i - 1].properties.width / 2) + (edges.features[i].properties.width / 2);
                }
            };
    
        }

        addColors();
        calculateWidth();
        calculateOffset();

        // определяем источники данных для карты
        map.addSource("edges", { type: "geojson", data: edges });
        map.addSource("nodes", { type: "geojson", data: nodes });


        // добавляем слой
        map.addLayer({
            "id": "edges",
            "source": "edges",
            "type": "line",
            "paint": {
                'line-color': ['get', 'color'],
                "line-opacity": 1,
                'line-offset': ['get', 'offset'],
                "line-width": ['get', 'width'],
            }
        });

        map.addLayer({
            "id": "lines",
            "source": "edges",
            "type": "line",
            "paint": {
                'line-color': "#ffffff",
                "line-opacity": 0.8,
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
                "circle-radius": 20,
                "circle-stroke-color": "#000000",
                "circle-stroke-width": 2
                // "circle-blur": 0.8
            }
        });

        map.addLayer({
            "id": "nodes-label",
            "source": "nodes",
            "type": "symbol",
            "layout": {
                "text-font": ["PT Sans Narrow Bold"],
                "text-field": "{NAME}",
                "text-size": 15,
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