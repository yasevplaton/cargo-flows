// import js modules
import "../css/index.scss";
import "bootstrap";
import mapboxgl from "mapbox-gl";
import { getBoundingBox, classifyArray } from "./modules/common";
import {
  getFlowValues,
  getCargoTypes,
  getRandomCargoColorArray,
  getWidthArray,
  calculateWidth,
  calculateOffset
} from "./modules/edges";

import {
  fillAdjacentLinesAttr,
  bindEdgesInfoToNodes,
  fillNodeTrafficArray,
  addLoadingClass,
  getCityRadiusArray,
  addCityRadiusAttr
} from "./modules/nodes";

import {
  addNodeAttr,
  createMultipleCargoNodesObject
} from "./modules/cargo-nodes";

import {
  renderEdges,
  renderOrigLines,
  renderNodes,
  renderBackgroundLines
} from "./modules/render";
import {
  getTextElems,
  createColorTable,
  createSlider,
  toggleLayerVisibility,
  bindColorPickerToCitiesColorBoxes,
  fetchLanguageData,
  changeInfoWindowText
} from "./modules/interface";
import {
  collectLinesIDs,
  createOrigLines,
  fillOrigLinesWithData
} from "./modules/orig-lines";
import { addWidthAndOffsetAttr } from "./modules/bg-lines";
import { getInfoWindowElements, addCargoList } from "./modules/info-window";
import { showLineData, hideLineData } from "./modules/lines-info";
import { showNodeData, hideNodeData } from "./modules/nodes-info";
import { createHighlightLines, fillHighlightLines } from "./modules/highlight";
import { getLegendLists, fillLegend, createCargoVolumeClassArray, createCityVolumeClassArray } from "./modules/legend";

window.onload = () => {
  // get access to mapbox api
  mapboxgl.accessToken =
    "pk.eyJ1IjoieWFzZXZwbGF0b24iLCJhIjoiY2poaTJrc29jMDF0YzM2cDU1ZnM1c2xoMiJ9.FhmWdHG7ar14dQv1Aoqx4A";

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v9", // mapbox tiles location
    // style: 'https://maps.tilehosting.com/styles/darkmatter/style.json?key=9jsySrA6E6EKeAPy7tod', // tiles from tilehosting.com
    center: [37.64, 55.75],
    zoom: 10
  });

  // when map loads
  map.on("load", () => {


    // add scale bar
    const scaleBar = new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: "metric"
    });
    map.addControl(scaleBar);

    // remove greeting panel and make interface elements visible
    document.getElementById("loading-map-panel").remove();

    const greetingPanel = document.getElementById("greeting-panel");
    greetingPanel.classList.remove("hidden");

    const demoBtn = greetingPanel.querySelector("#btn-demo");
    const uploadBtn = greetingPanel.querySelector("#btn-upload");

    // get access to the necessary elements
    const handleDataPanel = document.querySelector("#handle-data-panel");

    const mainInterface = document.getElementById("main-interface-wrapper");
    const inputFileElement = mainInterface.querySelector("#inputGoodsTable");
    const buttonSubmit = mainInterface.querySelector("#btn-submit");
    const editInterface = mainInterface.querySelector(
      "#edit-interface-wrapper"
    );
    const colorTableBody = mainInterface.querySelector("#color-table-body");
    const widthSlider = mainInterface.querySelector("#widthSlider");
    const minWidthInput = mainInterface.querySelector("#min-width-input");
    const maxWidthInput = mainInterface.querySelector("#max-width-input");
    const cityRadiusSlider = mainInterface.querySelector("#cityRadiusSlider");
    const minCityRadiusInput = mainInterface.querySelector("#min-radius-input");
    const maxCityRadiusInput = mainInterface.querySelector("#max-radius-input");
    const citiesCheckbox = mainInterface.querySelector("#cities-checkbox");
    const junctionCheckbox = mainInterface.querySelector("#junctions-checkbox");
    const citiesFillColorBox = mainInterface.querySelector(
      "#cities-fill-color-box"
    );
    const citiesStrokeColorBox = mainInterface.querySelector(
      "#cities-stroke-color-box"
    );
    const backgroundLinesCheckbox = mainInterface.querySelector(
      "#background-lines-checkbox"
    );
    const edgesCheckbox = mainInterface.querySelector("#edges-checkbox");
    const cargoNodesCheckbox = mainInterface.querySelector(
      "#cargo-nodes-checkbox"
    );

    const infoWindow = document.querySelector(".info-window");
    const languageInterface = document.querySelector(
      ".language-interface--main-window"
    );

    const legend = document.querySelector("#legend");

    // get access to text elems to change interface language
    const engBtns = document.querySelectorAll(".btn-lang-en");
    const ruBtns = document.querySelectorAll(".btn-lang-ru");

    // get text elements of app
    const textElems = getTextElems(
      greetingPanel,
      handleDataPanel,
      mainInterface,
      infoWindow
    );

    // set language mode as english by default
    let langMode = "en";

    // set text in info window as english by default
    const infoWindowText = {
      lineDirOne: "Straight",
      lineDirTwo: "Back",
      nodeDirOne: "In",
      nodeDirTwo: "Out"
    };

    // change interface language to english when click on "en" button
    Array.from(engBtns).forEach(btn => {
      btn.addEventListener("click", () => {
        langMode = "en";
        fetchLanguageData(textElems, langMode);
        changeInfoWindowText(infoWindowText, langMode);
      });
    });

    // change interface language to russian when click on "ru" button
    Array.from(ruBtns).forEach(btn => {
      btn.addEventListener("click", () => {
        langMode = "ru";
        fetchLanguageData(textElems, langMode);
        changeInfoWindowText(infoWindowText, langMode);
      });
    });

    // store server url
    // localhost url for testing
    // const url = 'http://127.0.0.1:5000/upload_data';

    // pythonanywhere url for production
    const url = "https://yasevplaton.pythonanywhere.com/upload_data";

    // initialize variable to store input file
    let cargoTable, edgesPromise, nodesPromise;

    // add click listener to sumbit button
    buttonSubmit.addEventListener("click", e => {
      // prevent default submit action
      e.preventDefault();

      // if we've already have input file
      if (cargoTable) {
        //  compare its name with name of current input file
        if ((inputFileElement.files[0].name = cargoTable.name)) {
          // if names are same don't do anything
          alert("Выбран тот же файл! Пожалуйста, выберите другой.");
          return;
        }
      }

      if (inputFileElement.files[0]) {
        // show loading panel
        handleDataPanel.classList.remove("hidden");

        edgesPromise = fetch(url, {
          method: "POST",
          body: inputFileElement.files[0]
        }).then(response => response.json());

        nodesPromise = fetch(
          "./data/pointsVolgaRus.geojson?ass=" + Math.random()
        ).then(response => response.json());

        Promise.all([edgesPromise, nodesPromise])
          .then(([edges, nodes]) => main(edges, nodes))
          .catch(error => {
            handleDataPanel.classList.add("hidden");
            alert(
              "Увы, произошла какая-то ошибка :( Если вы разработчик, можете глянуть в консоли и зарепортить багу на гитхабе https://github.com/yasevplaton/linear-cartodiagram. Если вы не понимаете, что такое консоль, бага или гитхаб, обратитесь в службу поддержки по адресу yasevplaton@gmail.com"
            );
            console.error("Error with loading of data:", error);
          });
      } else {
        alert("Сначала нужно выбрать файл!");
        return;
      }
    });

    // add click listener to upload button
    uploadBtn.addEventListener("click", () => {
      document.getElementById("greeting-panel").classList.add("hidden");
      mainInterface.classList.remove("hidden");
    });

    // add click listener to demo button
    demoBtn.addEventListener("click", () => {
      // hide greeting panel
      greetingPanel.classList.add("hidden");

      // show loading panel
      handleDataPanel.classList.remove("hidden");

      // initialize promises for data
      edgesPromise = fetch(
        "./data/edgesVolgaAssym.geojson?ass=" + Math.random()
      ).then(response => response.json());
      nodesPromise = fetch(
        "./data/pointsVolgaRus.geojson?ass=" + Math.random()
      ).then(response => response.json());

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
      handleDataPanel.classList.add("hidden");

      // show main interface if it is hidden
      if (mainInterface.classList.contains("hidden")) {
        mainInterface.classList.remove("hidden");
      }
      // show edit interface
      editInterface.classList.remove("hidden");
      languageInterface.classList.remove("hidden");

      // set original line width
      const origLineWidth = 1;
      // const shadowOffset = 12;

      // get bounding box of data to center and zoom map
      let boundingBox = getBoundingBox(nodes);

      // get flow values
      let flowValues = getFlowValues(edges);

      // get marks of classes for flow values
      let edgeJenks = classifyArray(flowValues, 4);

      // get cargo types
      let cargoTypes = getCargoTypes(edges);

      // get random colors for cargo types
      let cargoColorArray = getRandomCargoColorArray(cargoTypes);

      // create a blank object for storage original lines
      const origLines = { type: "FeatureCollection", features: [] };

      // collect ids of lines
      let linesIDArray = collectLinesIDs(edges);

      // fill adjacent lines attribute to nodes
      fillAdjacentLinesAttr(nodes, edges);

      // fill original lines object with data
      createOrigLines(linesIDArray, origLines, edges);

      // set default values for width of edges and for city radius
      let minWidthDefault = 20,
        maxWidthDefault = 100,
        maxEdgeWidth = 200;

      
      let minDefaultCityRadius = 5,
        maxDefaultCityRadius = 15,
        maxCityRadius = 40;

      minWidthInput.value = minWidthDefault;
      maxWidthInput.value = maxWidthDefault;

      minCityRadiusInput.value = minDefaultCityRadius;
      maxCityRadiusInput.value = maxDefaultCityRadius;

      // get width array
      let widthArray = getWidthArray(minWidthDefault, maxWidthDefault);

      // calculate width for edges
      calculateWidth(edges, widthArray, edgeJenks);

      // calculate offset for edges
      calculateOffset(edges, origLineWidth);

      // bind data to original lines
      fillOrigLinesWithData(origLines, edges);
      addWidthAndOffsetAttr(origLines, edges);

      // create highlight lines
      const highlightLines = createHighlightLines(origLines);

      // fill highlight lines with attributes
      origLines.features.forEach(line => {
        fillHighlightLines(highlightLines, line);
      });

      const nodeTrafficArray = [];

      // calculate node radius
      nodes.features.forEach(node => {
        bindEdgesInfoToNodes(node, edges, map, cargoTypes);
        fillNodeTrafficArray(nodeTrafficArray, node);
        addNodeAttr(node, cargoTypes, map);
      });

      const nodeJenks = classifyArray(nodeTrafficArray, 5);

      let cityRadiusArray = getCityRadiusArray(
        minDefaultCityRadius,
        maxDefaultCityRadius
      );

      const loadingClassArray = [1, 2, 3, 4, 5];

      nodes.features.forEach(node => {
        addLoadingClass(node, nodeJenks);
        addCityRadiusAttr(node, cityRadiusArray);
      });

      let multipleCargoNodesObject = createMultipleCargoNodesObject(
        cargoTypes,
        nodes
      );

      // render background lines
      renderBackgroundLines(map, origLines);
      // render edges
      renderEdges(
        map,
        edges,
        cargoColorArray,
        multipleCargoNodesObject,
        highlightLines
      );
      // render original lines
      renderOrigLines(map, origLines, origLineWidth);
      // render nodes
      renderNodes(map, nodes, loadingClassArray);

      // create color table
      createColorTable(colorTableBody, cargoColorArray, map, infoWindow);

      // create width slider
      createSlider(widthSlider, minWidthDefault, maxWidthDefault, maxEdgeWidth);

      // create slider for cities radius
      createSlider(
        cityRadiusSlider,
        minDefaultCityRadius,
        maxDefaultCityRadius,
        maxCityRadius
      );

      // bind color picker to cities layers
      bindColorPickerToCitiesColorBoxes(
        citiesFillColorBox,
        citiesStrokeColorBox,
        map
      );

      const infoWindowElements = getInfoWindowElements(infoWindow);
      addCargoList(infoWindowElements, cargoColorArray);

      // show info window
      infoWindow.style.display = "block";

      // legend treatment
      const legendLists = getLegendLists(legend);
      const cargoVolumeClassArray = createCargoVolumeClassArray(widthArray, edgeJenks);
      const cityVolumeClassArray = createCityVolumeClassArray(cityRadiusArray, nodeJenks);
      fillLegend(legendLists, cargoColorArray, cargoVolumeClassArray, cityVolumeClassArray);

      // initialize variables to store id of hovered feature
      let hoveredLineId = null;
      let hoveredCityId = null;

      map.on("mousemove", "background-lines", e => {
        map.getCanvas().style.cursor = "pointer";

        // if under cursor one or more feauteres
        if (e.features.length > 0) {
          // and if hovered feature id is not null
          if (hoveredLineId) {
            // change feature state hover to false
            map.setFeatureState(
              { source: "highlight-lines", id: hoveredLineId },
              { hover: false }
            );
          }

          // take id of first feature
          hoveredLineId = e.features[0].id;

          // set hover state for this line as true (it will change appearence of layer)
          map.setFeatureState(
            { source: "highlight-lines", id: hoveredLineId },
            { hover: true }
          );
        }

        // show data for infoWindow
        showLineData(e, infoWindowElements, infoWindowText);
      });

      map.on("mouseleave", "background-lines", () => {
        map.getCanvas().style.cursor = "";

        if (hoveredLineId) {
          map.setFeatureState(
            { source: "highlight-lines", id: hoveredLineId },
            { hover: false }
          );
        }

        hoveredLineId = null;

        hideLineData(infoWindowElements, infoWindowText);
      });

      map.on("mousemove", "cities-hover", e => {
        map.getCanvas().style.cursor = "pointer";

        if (hoveredLineId) {
          map.setFeatureState(
            { source: "highlight-lines", id: hoveredLineId },
            { hover: false }
          );
        }

        if (e.features.length > 0) {
          if (hoveredCityId) {
            map.setFeatureState(
              { source: "nodes", id: hoveredCityId },
              { hover: false }
            );
          }

          hoveredCityId = e.features[0].id;

          map.setFeatureState(
            { source: "nodes", id: hoveredCityId },
            { hover: true }
          );
        }

        showNodeData(e, infoWindowElements, infoWindowText);
      });

      map.on("mouseleave", "cities-hover", () => {
        map.getCanvas().style.cursor = "";

        if (hoveredCityId) {
          map.setFeatureState(
            { source: "nodes", id: hoveredCityId },
            { hover: false }
          );
        }

        hoveredCityId = null;

        hideNodeData(infoWindowElements, infoWindowText);
      });

      // initialize render counter
      let startWidthSliderCounter = 0;
      let startRadiusSliderCounter = 0;

      // bind update listener to edge width slider
      widthSlider.noUiSlider.on("update", function(values, handle) {
        if (startWidthSliderCounter === 0 || startWidthSliderCounter === 1) {
          startWidthSliderCounter += 1;
          return;
        }

        let value = values[handle];

        if (handle) {
          maxWidthInput.value = Math.round(value);
        } else {
          minWidthInput.value = Math.round(value);
        }

        updateWidthSliderHandler();
      });

      // bind update listener to city radius slider
      cityRadiusSlider.noUiSlider.on("update", function(values, handle) {
        if (startRadiusSliderCounter === 0 || startRadiusSliderCounter === 1) {
          startRadiusSliderCounter += 1;
          return;
        }

        let value = values[handle];

        if (handle) {
          maxCityRadiusInput.value = Math.round(value);
        } else {
          minCityRadiusInput.value = Math.round(value);
        }

        updateCityRadiusSliderHandler();
      });

      // bind change listeners to width inputs
      minWidthInput.addEventListener("change", function() {
        if (this.value > +maxWidthInput.value) {
          minWidthInput.value = maxWidthInput.value;
          widthSlider.noUiSlider.set([+maxWidthInput.value, null]);
        } else {
          widthSlider.noUiSlider.set([this.value, null]);
        }
      });

      maxWidthInput.addEventListener("change", function() {
        if (this.value < +minWidthInput.value) {
          maxWidthInput.value = minWidthInput.value;
          widthSlider.noUiSlider.set([null, +minWidthInput.value]);
        } else {
          widthSlider.noUiSlider.set([null, this.value]);
        }
      });

      // change listeners for city radius inputs
      minCityRadiusInput.addEventListener("change", function() {
        if (this.value > +maxCityRadiusInput.value) {
          minCityRadiusInput.value = maxCityRadiusInput.value;
          cityRadiusSlider.noUiSlider.set([+maxCityRadiusInput.value, null]);
        } else {
          cityRadiusSlider.noUiSlider.set([this.value, null]);
        }
      });

      maxCityRadiusInput.addEventListener("change", function() {
        if (this.value < +minCityRadiusInput.value) {
          maxCityRadiusInput.value = minCityRadiusInput.value;
          cityRadiusSlider.noUiSlider.set([null, +minCityRadiusInput.value]);
        } else {
          cityRadiusSlider.noUiSlider.set([null, this.value]);
        }
      });

      // add click listener to junctions, background lines and edges checkboxes to toggle visibility of layers
      citiesCheckbox.addEventListener("click", () => {
        toggleLayerVisibility(citiesCheckbox, map, "cities");
        loadingClassArray.forEach(loadingClass => {
          toggleLayerVisibility(
            citiesCheckbox,
            map,
            `nodes-label-class-${loadingClass}`
          );
        });
      });

      junctionCheckbox.addEventListener("click", () => {
        toggleLayerVisibility(junctionCheckbox, map, "junctions");
      });

      backgroundLinesCheckbox.addEventListener("click", () => {
        toggleLayerVisibility(backgroundLinesCheckbox, map, "background-lines");
        toggleLayerVisibility(
          backgroundLinesCheckbox,
          map,
          "cargo-nodes-shadow"
        );
      });

      edgesCheckbox.addEventListener("click", () => {
        cargoTypes.forEach(type => {
          toggleLayerVisibility(edgesCheckbox, map, type);
        });
      });

      cargoNodesCheckbox.addEventListener("click", () => {
        cargoTypes.forEach(type => {
          toggleLayerVisibility(cargoNodesCheckbox, map, `${type}-nodes`);
        });
      });

      // function to update edges width
      function updateWidthSliderHandler() {
        const currZoom = map.getZoom();
        widthArray = getWidthArray(+minWidthInput.value, +maxWidthInput.value);
        calculateWidth(edges, widthArray, edgeJenks);
        calculateOffset(edges, origLineWidth);
        addWidthAndOffsetAttr(origLines, edges);

        origLines.features.forEach(line => {
          fillHighlightLines(highlightLines, line);
        });

        map.setZoom(10);

        nodes.features.forEach(node => {
          bindEdgesInfoToNodes(node, edges, map, cargoTypes);
          addNodeAttr(node, cargoTypes, map);
        });

        multipleCargoNodesObject = createMultipleCargoNodesObject(
          cargoTypes,
          nodes
        );
        renderBackgroundLines(map, origLines);
        renderEdges(
          map,
          edges,
          cargoColorArray,
          multipleCargoNodesObject,
          highlightLines
        );

        map.setZoom(currZoom);
      }

      // function to update cityRadius
      function updateCityRadiusSliderHandler() {
        cityRadiusArray = getCityRadiusArray(
          +minCityRadiusInput.value,
          +maxCityRadiusInput.value
        );

        nodes.features.forEach(node => {
          addCityRadiusAttr(node, cityRadiusArray);
        });

        renderNodes(map, nodes, loadingClassArray);
      }

      // center and zoom map to data
      map.fitBounds(
        [
          [boundingBox.xMin, boundingBox.yMin],
          [boundingBox.xMax, boundingBox.yMax]
        ],
        { linear: false, speed: 0.3 }
      );
    }
  });
  map.on("zoomend", function() {
    document.getElementById("zoom-level").innerHTML =
      "Zoom Level: " + map.getZoom();
  });

  const to10ZoomBtn = document.getElementById("to-10-zoom-level");
  to10ZoomBtn.addEventListener("click", () => map.setZoom(10));
};
