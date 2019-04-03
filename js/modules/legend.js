// funciton to get legend lists (cargo types, cargo volume, city volume)
export function getLegendLists(legend) {
  const cargoTypesList = legend.querySelector(".legend__cargo-types-list");
  const cargoVolumeList = legend.querySelector(".legend__cargo-volume-list");
  const cityVolumeTable = legend.querySelector(".legend__city-volume-table");

  return {
    cargoTypesList: cargoTypesList,
    cargoVolumeList: cargoVolumeList,
    cityVolumeTable: cityVolumeTable
  };
}

// function to fill Legend
export function fillLegend(
  legendLists,
  cargoColorArray,
  cargoVolumeClassArray,
  cityVolumeClassArray
) {
  addCargoTypes(legendLists.cargoTypesList, cargoColorArray);
  addCargoVolume(legendLists.cargoVolumeList, cargoVolumeClassArray);
  addCityVolume(legendLists.cityVolumeTable, cityVolumeClassArray);
}

// function to update cargo volume legend block
export function updateCargoVolume(legendLists, cargoVolumeClassArray) {
  const cargoVolumeList = legendLists.cargoVolumeList;

  while (cargoVolumeList.firstChild) {
    cargoVolumeList.removeChild(cargoVolumeList.firstChild);
  }

  addCargoVolume(cargoVolumeList, cargoVolumeClassArray);
}

// function to update city volume legend block
export function updateCityVolume(legendLists, cityVolumeClassArray) {
  const cityVolumeTable = legendLists.cityVolumeTable;

  while (cityVolumeTable.firstChild) {
    cityVolumeTable.removeChild(cityVolumeTable.firstChild);
  }

  addCityVolume(cityVolumeTable, cityVolumeClassArray);
}

// function to add cargo types to legend
function addCargoTypes(cargoTypesList, cargoColorArray) {
  cargoColorArray.forEach(cargoObj => {
    const cargoTypeItem = createCargoTypeItem(cargoObj);
    cargoTypesList.appendChild(cargoTypeItem);
  });
}

// function to create one cargo type item
function createCargoTypeItem(cargoObj) {
  const cargoTypeItem = document.createElement("li");
  cargoTypeItem.classList.add(
    "legend__cargo-types-item",
    `legend__cargo-types-item--${cargoObj.type}`,
    `legend__cargo-types-item--${cargoObj.id}`
  );

  const colorBox = document.createElement("span");
  colorBox.classList.add("color-box", "color-box--legend");
  colorBox.style.background = cargoObj.color;

  const cargoName = document.createElement("span");
  cargoName.classList.add("legend__cargo-type-name");
  cargoName.textContent = cargoObj.type;

  cargoTypeItem.appendChild(colorBox);
  cargoTypeItem.appendChild(cargoName);

  return cargoTypeItem;
}

// function to create cargo volume class array
export function createCargoVolumeClassArray(widthArray, edgeJenks) {
  const cargoVolumeClassArray = [];

  for (let i = 0, max = widthArray.length; i < max; i++) {
    const cargoVolumeClassItem = {
      id: i + 1,
      lineWidth: widthArray[i],
      minVolume: edgeJenks[i],
      maxVolume: edgeJenks[i + 1]
    };

    cargoVolumeClassArray.push(cargoVolumeClassItem);
  }

  return cargoVolumeClassArray;
}

// function to add cargo volume to legend
function addCargoVolume(cargoVolumeList, cargoVolumeClassArray) {
  const reversedArray = cargoVolumeClassArray.slice().reverse();

  reversedArray.forEach(cargoVolumeClass => {
    const cargoVolumeItem = createCargoVolumeItem(cargoVolumeClass);
    cargoVolumeList.appendChild(cargoVolumeItem);
  });
}

// function to create one cargo volume item
function createCargoVolumeItem(cargoVolumeClass) {
  const denominator = 10000;
  const factor = 10;

  const cargoVolumeItem = document.createElement("li");
  cargoVolumeItem.classList.add(
    "legend__cargo-volume-item",
    `legend__cargo-volume-item--${cargoVolumeClass.id}`
  );

  const line = document.createElement("span");
  line.classList.add("legend__cargo-volume-line");
  line.style.height = `${cargoVolumeClass.lineWidth}px`;

  const caption = document.createElement("div");
  caption.classList.add("legend__cargo-volume-caption");

  const minVolume = document.createElement("span");
  minVolume.classList.add("legend__cargo-volume-min");
  let minLegendValue = cargoVolumeClass.minVolume / denominator;
  minLegendValue = Math.ceil(minLegendValue) * factor;
  minVolume.textContent = minLegendValue;

  const separator = document.createElement("span");
  separator.textContent = " - ";

  const maxVolume = document.createElement("span");
  maxVolume.classList.add("legend__cargo-volume-max");
  let maxLegendValue = cargoVolumeClass.maxVolume / denominator;
  maxLegendValue = Math.ceil(maxLegendValue) * factor;
  maxVolume.textContent = maxLegendValue;

  cargoVolumeItem.appendChild(line);
  caption.appendChild(minVolume);
  caption.appendChild(separator);
  caption.appendChild(maxVolume);
  cargoVolumeItem.appendChild(caption);

  return cargoVolumeItem;
}

// function to create city volume class array
export function createCityVolumeClassArray(radiusArray, nodeJenks) {
  const cityVolumeClassArray = [];

  for (let i = 0, max = radiusArray.length; i < max; i++) {
    const cityVolumeClassItem = {
      id: i,
      circleRadius: radiusArray[i],
      minVolume: nodeJenks[i],
      maxVolume: nodeJenks[i + 1]
    };

    cityVolumeClassArray.push(cityVolumeClassItem);
  }

  return cityVolumeClassArray;
}

// function to add city volume to legend
function addCityVolume(cityVolumeTable, cityVolumeClassArray) {
  const reversedArray = cityVolumeClassArray.slice().reverse();

  reversedArray.forEach(cityVolumeClass => {
    const cityVolumeRow = createCityVolumeRow(cityVolumeClass);
    cityVolumeTable.appendChild(cityVolumeRow);
  });
}

// function to create one city volume item
function createCityVolumeRow(cityVolumeClass) {
  const denominator = 10000;
  const factor = 10;

  const cityVolumeRow = document.createElement("tr");
  cityVolumeRow.classList.add(
    "legend__city-volume-row",
    `legend__city-volume-row--${cityVolumeClass.id}`
  );

  const circleCol = document.createElement("td");
  circleCol.classList.add(
    "legend__city-volume-col",
    "legend__city-volume-col--circle"
  );

  const captionCol = document.createElement("td");
  captionCol.classList.add("legend__city-volume-col");

  const circle = document.createElement("span");
  circle.classList.add("legend__city-volume-circle");
  circle.style.height = `${cityVolumeClass.circleRadius * 2}px`;
  circle.style.width = `${cityVolumeClass.circleRadius * 2}px`;

  circleCol.appendChild(circle);

  const caption = document.createElement("div");
  caption.classList.add("legend__city-volume-caption");

  const minVolume = document.createElement("span");
  minVolume.classList.add("legend__city-volume-min");
  let minLegendValue = cityVolumeClass.minVolume / denominator;
  minLegendValue = Math.ceil(minLegendValue) * factor;
  minVolume.textContent = minLegendValue;

  const separator = document.createElement("span");
  separator.textContent = " - ";

  const maxVolume = document.createElement("span");
  maxVolume.classList.add("legend__city-volume-max");
  let maxLegendValue = cityVolumeClass.maxVolume / denominator;
  maxLegendValue = Math.ceil(maxLegendValue) * factor;
  maxVolume.textContent = maxLegendValue;

  caption.appendChild(minVolume);
  caption.appendChild(separator);
  caption.appendChild(maxVolume);

  captionCol.appendChild(caption);

  cityVolumeRow.appendChild(circleCol);
  cityVolumeRow.appendChild(captionCol);

  return cityVolumeRow;
}

// function to change cargo type colors
export function changeColorLegendColorBox(color, cargoId, legend) {
  const reqCargoItem = legend.querySelector(
    `.legend__cargo-types-item--${cargoId}`
  );
  const reqColorBox = reqCargoItem.querySelector(".color-box--legend");
  reqColorBox.style.background = color;
}
