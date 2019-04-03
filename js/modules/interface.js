import { changeCargoColor } from "./common";
import {
  changeEdgesColor,
  changeCitiesFillColor,
  changeCitiesStrokeColor
} from "./render";
import "nouislider";
import { changeColorInfoWindowColorBox } from "./info-window";
import { changeColorLegendColorBox } from "./legend";

const Huebee = require("huebee");

// function to get text elements of app
export function getTextElems(
  greetingPanel,
  handleDataPanel,
  mainInterface,
  infoWindow
) {
  const greetingRow = mainInterface.querySelector(".greeting-row");
  const greetingRowTitle = greetingRow.querySelector(".title");

  const uploadRow = mainInterface.querySelector(".upload-data");
  const uploadRowTitle = uploadRow.querySelector(".step-title");
  const uploadRowText = uploadRow.querySelector(".upload-data__text");
  const buttonSubmit = uploadRow.querySelector("#btn-submit");

  const cargoColorsRow = mainInterface.querySelector(".cargo-colors");
  const cargoColorsRowTitle = cargoColorsRow.querySelector(".step-title");
  const cargoColorsRowText = cargoColorsRow.querySelector(
    ".cargo-colors__text"
  );

  const linearScaleRow = mainInterface.querySelector(".linear-scale");
  const linearScaleRowTitle = linearScaleRow.querySelector(".step-title");
  const linearScaleRowText = linearScaleRow.querySelector(
    ".linear-scale__text"
  );

  const nodesSettingsRow = mainInterface.querySelector(".nodes-settings");
  const nodesSettingsRowTitle = nodesSettingsRow.querySelector(".step-title");
  const citiesCheckboxLabel = nodesSettingsRow.querySelector(
    ".checkbox__label--cities"
  );
  const junctionsCheckboxLabel = nodesSettingsRow.querySelector(
    ".checkbox__label--junctions"
  );
  const citiesFillLabel = nodesSettingsRow.querySelector(
    ".nodes-settings__text--fill-color"
  );
  const citiesStrokeLabel = nodesSettingsRow.querySelector(
    ".nodes-settings__text--stroke-color"
  );
  const nodesSettingsSliderText = nodesSettingsRow.querySelector(
    ".nodes-settings__text--slider"
  );

  const layersRow = mainInterface.querySelector(".other-settings");
  const layersRowTitle = layersRow.querySelector(".step-title");
  const ribbonsCheckboxLabel = layersRow.querySelector(
    ".checkbox__label--ribbons"
  );
  const cargoNodesCheckboxLabel = layersRow.querySelector(
    ".checkbox__label--cargo-nodes"
  );
  const shadowCheckboxLabel = layersRow.querySelector(
    ".checkbox__label--shadow"
  );

  const greetingPanelText = greetingPanel.querySelector(
    ".greeting-panel__text"
  );
  const demoBtn = greetingPanel.querySelector("#btn-demo");
  const uploadBtn = greetingPanel.querySelector("#btn-upload");

  const handleDataPanelText = handleDataPanel.querySelector(
    ".handle-data-panel__text"
  );

  const infoWindowThead = infoWindow.querySelector(
    ".info-window__table-heading"
  );
  const infoWindowTypeColText = infoWindowThead.querySelector(
    ".info-window__col--cargo-color"
  );
  const infoWindowDirOneColText = infoWindowThead.querySelector(
    ".info-window__col--dir-1"
  );
  const infoWindowDirTwoColText = infoWindowThead.querySelector(
    ".info-window__col--dir-2"
  );
  const infoWindowTotalColText = infoWindow.querySelector(
    ".info-window__col--total-title"
  );

  const textElems = {
    mainInterface: {
      greetingRow: {
        title: greetingRowTitle
      },
      uploadDataRow: {
        title: uploadRowTitle,
        text: uploadRowText,
        btnSubmit: buttonSubmit
      },
      cargoColorsRow: {
        title: cargoColorsRowTitle,
        text: cargoColorsRowText
      },
      linearScaleRow: {
        title: linearScaleRowTitle,
        text: linearScaleRowText
      },
      nodesSettingsRow: {
        title: nodesSettingsRowTitle,
        citiesCheckboxLabel: citiesCheckboxLabel,
        junctionsCheckboxLabel: junctionsCheckboxLabel,
        citiesFillLabel: citiesFillLabel,
        citiesStrokeLabel: citiesStrokeLabel,
        nodesSettingsSliderText: nodesSettingsSliderText
      },
      layersRow: {
        title: layersRowTitle,
        ribbonsCheckboxLabel: ribbonsCheckboxLabel,
        cargoNodesCheckboxLabel: cargoNodesCheckboxLabel,
        shadowCheckboxLabel: shadowCheckboxLabel
      }
    },

    greetingPanel: {
      greetingPanelText: greetingPanelText,
      demoBtn: demoBtn,
      uploadBtn: uploadBtn
    },

    handleDataPanelText: handleDataPanelText,

    infoWindow: {
      typeText: infoWindowTypeColText,
      dirOneText: infoWindowDirOneColText,
      dirTwoText: infoWindowDirTwoColText,
      totalText: infoWindowTotalColText
    }
  };

  return textElems;
}

// functiont to fetch language data depending on language mode
export function fetchLanguageData(elems, langMode) {
  let languageDataPromise;

  if (langMode === "en") {
    languageDataPromise = fetch("./data/en.json?ass=" + Math.random()).then(
      response => response.json()
    );

    languageDataPromise.then(data => {
      changeInterfaceLanguage(elems, data);
    });
  }

  if (langMode === "ru") {
    languageDataPromise = fetch("./data/ru.json?ass=" + Math.random()).then(
      response => response.json()
    );

    languageDataPromise.then(data => {
      changeInterfaceLanguage(elems, data);
    });
  }
}

// function to change interface language
function changeInterfaceLanguage(elems, data) {
  const greetingRow = elems.mainInterface.greetingRow;
  const dataGreetingRow = data.mainInterface.greetingRow;
  changeInnerHtml(greetingRow.title, dataGreetingRow.title);

  const uploadDataRow = elems.mainInterface.uploadDataRow;
  const dataUploadDataRow = data.mainInterface.uploadDataRow;
  changeInnerHtml(uploadDataRow.title, dataUploadDataRow.title);
  changeInnerHtml(uploadDataRow.text, dataUploadDataRow.text);
  changeInnerHtml(uploadDataRow.btnSubmit, dataUploadDataRow.btnSubmit);

  const cargoColorsRow = elems.mainInterface.cargoColorsRow;
  const dataCargoColorsRow = data.mainInterface.cargoColorsRow;
  changeInnerHtml(cargoColorsRow.title, dataCargoColorsRow.title);
  changeInnerHtml(cargoColorsRow.text, dataCargoColorsRow.text);

  const linearScaleRow = elems.mainInterface.linearScaleRow;
  const dataLinearScaleRow = data.mainInterface.linearScaleRow;
  changeInnerHtml(linearScaleRow.title, dataLinearScaleRow.title);
  changeInnerHtml(linearScaleRow.text, dataLinearScaleRow.text);

  const nodesSettingsRow = elems.mainInterface.nodesSettingsRow;
  const dataNodesSettingsRow = data.mainInterface.nodesSettingsRow;
  changeInnerHtml(nodesSettingsRow.title, dataNodesSettingsRow.title);
  changeInnerHtml(
    nodesSettingsRow.citiesCheckboxLabel,
    dataNodesSettingsRow.citiesCheckboxLabel
  );
  changeInnerHtml(
    nodesSettingsRow.junctionsCheckboxLabel,
    dataNodesSettingsRow.junctionsCheckboxLabel
  );
  changeInnerHtml(
    nodesSettingsRow.citiesFillLabel,
    dataNodesSettingsRow.citiesFillLabel
  );
  changeInnerHtml(
    nodesSettingsRow.citiesStrokeLabel,
    dataNodesSettingsRow.citiesStrokeLabel
  );
  changeInnerHtml(
    nodesSettingsRow.nodesSettingsSliderText,
    dataNodesSettingsRow.nodesSettingsSliderText
  );

  const layersRow = elems.mainInterface.layersRow;
  const dataLayersRow = data.mainInterface.layersRow;
  changeInnerHtml(layersRow.title, dataLayersRow.title);
  changeInnerHtml(
    layersRow.ribbonsCheckboxLabel,
    dataLayersRow.ribbonsCheckboxLabel
  );
  changeInnerHtml(
    layersRow.cargoNodesCheckboxLabel,
    dataLayersRow.cargoNodesCheckboxLabel
  );
  changeInnerHtml(
    layersRow.shadowCheckboxLabel,
    dataLayersRow.shadowCheckboxLabel
  );

  const greetingPanel = elems.greetingPanel;
  const dataGreetingPanel = data.greetingPanel;
  changeInnerHtml(
    greetingPanel.greetingPanelText,
    dataGreetingPanel.greetingPanelText
  );
  changeInnerHtml(greetingPanel.demoBtn, dataGreetingPanel.demoBtn);
  changeInnerHtml(greetingPanel.uploadBtn, dataGreetingPanel.uploadBtn);

  const handleDataPanelText = elems.handleDataPanelText;
  const datahandleDataPanelText = data.handleDataPanelText;
  changeInnerHtml(handleDataPanelText, datahandleDataPanelText);

  const infoWindow = elems.infoWindow;
  const dataInfoWindow = data.infoWindow;
  changeInnerHtml(infoWindow.typeText, dataInfoWindow.typeText);
  changeInnerHtml(infoWindow.dirOneText, dataInfoWindow.dirOneText);
  changeInnerHtml(infoWindow.dirTwoText, dataInfoWindow.dirTwoText);
  changeInnerHtml(infoWindow.totalText, dataInfoWindow.totalText);
}

// function to change inner html of an element
function changeInnerHtml(elem, html) {
  elem.innerHTML = html;
}

export function changeInfoWindowText(infoWindowText, langMode) {
  
  if (langMode === "en") {
    infoWindowText.lineDirOne = "Straight";
    infoWindowText.lineDirTwo = "Back";
    infoWindowText.nodeDirOne = "In";
    infoWindowText.nodeDirTwo = "Out";


  } else if (langMode === "ru") {

    infoWindowText.lineDirOne = "Прямо";
    infoWindowText.lineDirTwo = "Обратно";
    infoWindowText.nodeDirOne = "Вход";
    infoWindowText.nodeDirTwo = "Выход";
  }
}

// function to create color box
export function createColorBox(cargo) {
  let colorBox = document.createElement("span");
  colorBox.classList.add("color-box");
  colorBox.style.backgroundColor = cargo.color;
  colorBox.id = cargo.id;

  return colorBox;
}

// function to bind color picker and change color handler
export function bindColorPicker(colorBox, cargoColorArray, map, infoWindow, legend) {
  var hueb = new Huebee(colorBox, {
    setText: false,
    notation: "hex"
  });

  hueb.on("change", function(color) {
    let cargoID = +this.anchor.id;
    changeCargoColor(cargoColorArray, cargoID, color);
    changeEdgesColor(map, cargoColorArray);
    changeColorInfoWindowColorBox(color, cargoID, infoWindow);
    changeColorLegendColorBox(color, cargoID, legend);
  });
}

// function to create color table
export function createColorTable(tableBody, cargoColorArray, map, infoWindow, legend) {
  cargoColorArray.forEach(cargo => {
    let row = document.createElement("tr");
    row.classList.add("cargo-colors__row");
    let colId = document.createElement("td");
    colId.innerHTML = cargo.id;
    let colType = document.createElement("td");
    colType.innerHTML = cargo.type;

    let colColor = document.createElement("td");
    let colorBox = createColorBox(cargo);
    colColor.appendChild(colorBox);

    bindColorPicker(colorBox, cargoColorArray, map, infoWindow, legend);

    let cols = [colId, colType, colColor];

    cols.forEach(col => {
      col.classList.add("cargo-colors__col");
      row.appendChild(col);
    });

    tableBody.appendChild(row);
  });
}

// function to set up width slider
export function createSlider(el, minWidthDefault, maxWidthDefault, maxWidth) {
  noUiSlider.create(el, {
    start: [minWidthDefault, maxWidthDefault],
    connect: true,
    range: {
      min: [0, 1],
      max: [maxWidth]
    }
  });
}

// function to toggle layer visibility
export function toggleLayerVisibility(layerCheckbox, map, layerId) {
  if (layerCheckbox.checked) {
    map.setLayoutProperty(layerId, "visibility", "visible");
  } else {
    map.setLayoutProperty(layerId, "visibility", "none");
  }
}

export function toggleLayerOpacity(layerCheckbox, map, layerId) {
  if (layerCheckbox.checked) {
    map.setLayoutProperty(layerId, "line-opacity", 1);
  } else {
    map.setLayoutProperty(layerId, "line-opacity", 0);
  }
}

export function bindColorPickerToCitiesColorBoxes(
  fillColorBox,
  strokeColorBox,
  map
) {
  const fillHueb = new Huebee(fillColorBox, {
    setText: false,
    notation: "hex"
  });

  const strokeHueb = new Huebee(strokeColorBox, {
    setText: false,
    notation: "hex"
  });

  fillHueb.element.classList.add("huebee__cities-color");
  strokeHueb.element.classList.add("huebee__cities-color");

  fillHueb.container.style.left = "-241px";
  strokeHueb.container.style.left = "-241px";

  fillHueb.on("change", function(color) {
    changeCitiesFillColor(map, color);
  });

  strokeHueb.on("change", function(color) {
    changeCitiesStrokeColor(map, color);
  });
}
