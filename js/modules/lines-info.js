export function getInfoWindowElements(infoWindow) {

  const sourceRows = infoWindow.querySelectorAll('.info-window__table-row--source');
  const destRows = infoWindow.querySelectorAll('.info-window__table-row--destination');

  const colDirOne = infoWindow.querySelector('#info-window__col-1');
  const titleDirOne = colDirOne.querySelector('.info-window__title');
  const sourceColDirOne = colDirOne.querySelector('.info-window__source');
  const destColDirOne = colDirOne.querySelector('.info-window__destination');
  const totalVolumeColDirOne = colDirOne.querySelector('.info-window__total-volume');
  const cargoListDirOne = colDirOne.querySelector('.info-window__cargo-list--dir-1');

  const colDirTwo = infoWindow.querySelector('#info-window__col-2');
  const titleDirTwo = colDirTwo.querySelector('.info-window__title');
  const sourceColDirTwo = colDirTwo.querySelector('.info-window__source');
  const destColDirTwo = colDirTwo.querySelector('.info-window__destination');
  const totalVolumeColDirTwo = colDirTwo.querySelector('.info-window__total-volume');
  const cargoListDirTwo = colDirTwo.querySelector('.info-window__cargo-list--dir-2');


  return {

    sourceRows: sourceRows,
    destRows: destRows,

    dirOne: {
      title: titleDirOne,
      sourceCol: sourceColDirOne,
      destCol: destColDirOne,
      cargoList: cargoListDirOne,
      totalVolumeCol: totalVolumeColDirOne
    },

    dirTwo: {
      title: titleDirTwo,
      sourceCol: sourceColDirTwo,
      destCol: destColDirTwo,
      cargoList: cargoListDirTwo,
      totalVolumeCol: totalVolumeColDirTwo
    }

  }
}

export function createInfoWindowCargoListItems(cargoColorArray) {

  const cargoListItems = [];

  cargoColorArray.forEach(cargoObj => {
    const cargoItem = document.createElement('li');
    cargoItem.classList.add('info-window__cargo-item', `info-window__cargo-item-${cargoObj.id}`, `info-window__cargo-item-${cargoObj.type}`);

    const cargoNameBlock = document.createElement('div');
    cargoNameBlock.classList.add('info-window__cargo-name-block');

    const cargoColorBox = document.createElement('span');
    cargoColorBox.classList.add('color-box', 'color-box--info-window');
    cargoColorBox.style.background = cargoObj.color;

    const cargoName = document.createElement('span');
    cargoName.classList.add('info-window__cargo-name');
    cargoName.textContent = cargoObj.type;

    const cargoValue = document.createElement('span');
    cargoValue.classList.add('info-window__cargo-value');
    cargoValue.textContent = 0;

    cargoNameBlock.appendChild(cargoColorBox);
    cargoNameBlock.appendChild(cargoName);

    cargoItem.appendChild(cargoNameBlock);
    cargoItem.appendChild(cargoValue);

    cargoListItems.push(cargoItem);

  });

  return cargoListItems;
}

export function addCargoListItems(cargoListItems, infoWindowElements) {
  const cargoListDirOne = infoWindowElements.dirOne.cargoList;
  const cargoListDirTwo = infoWindowElements.dirTwo.cargoList;

  cargoListItems.forEach(item => {
    const clone = item.cloneNode(true);
    cargoListDirOne.appendChild(item);
    cargoListDirTwo.appendChild(clone);
  });


}

function getInfoWindowMarkup(infoWindow) {
  return infoWindow.outerHTML;
}


export function showLineInfoWindow(e, infoWindow, infoWindowElements, map) {
  // const popupPosition = e.lngLat;

  const lineID = e.features[0].properties.lineID;

  map.setFilter('background-lines-hover', [
    "all",
    ["!=", "totalWidth", 0],
    ["==", "lineID", lineID]
  ]);

  let totalOneDir = 0;
  let totalTwoDir = 0;
  const denominator = 100000;
  const factor = 100;

  infoWindowElements.dirOne.title.textContent = 'Прямо';
  infoWindowElements.dirTwo.title.textContent = 'Обратно';

  const sourceRows = infoWindowElements.sourceRows;
  const destRows = infoWindowElements.destRows;

  const rowsToHide = [sourceRows, destRows];

  for (let rows of rowsToHide) {
    Array.from(rows).forEach(row => {
      row.style.display = 'table-row';
    });
  }

  const infoOneDir = JSON.parse(e.features[0].properties.dataOneDir);
  const infoTwoDir = JSON.parse(e.features[0].properties.dataTwoDir);

  infoWindowElements.dirOne.sourceCol.textContent = infoOneDir.src;
  infoWindowElements.dirOne.destCol.textContent = infoOneDir.dest;

  infoWindowElements.dirTwo.sourceCol.textContent = infoTwoDir.src;
  infoWindowElements.dirTwo.destCol.textContent = infoTwoDir.dest;

  const cargoListDirOne = infoWindowElements.dirOne.cargoList;
  const cargoListDirTwo = infoWindowElements.dirTwo.cargoList;

  const valuesOneDir = infoOneDir.values;
  const valuesTwoDir = infoTwoDir.values;

  for (let cargoType in valuesOneDir) {
    if (valuesOneDir.hasOwnProperty(cargoType)) {
      let value = valuesOneDir[cargoType] / denominator;
      const reqCargoItem = cargoListDirOne.querySelector(`.info-window__cargo-item-${cargoType}`);
      const reqValueSpan = reqCargoItem.querySelector('.info-window__cargo-value');
      value = Math.ceil(value) * factor;
      reqValueSpan.textContent = value;
      totalOneDir += value;
    }
  }

  for (let cargoType in valuesTwoDir) {
    if (valuesTwoDir.hasOwnProperty(cargoType)) {
      let value = valuesTwoDir[cargoType] / denominator;
      const reqCargoItem = cargoListDirTwo.querySelector(`.info-window__cargo-item-${cargoType}`);
      const reqValueSpan = reqCargoItem.querySelector('.info-window__cargo-value');
      value = Math.ceil(value) * factor;
      reqValueSpan.textContent = value;
      totalTwoDir += value;
    }
  }

  infoWindowElements.dirOne.totalVolumeCol.textContent = totalOneDir;
  infoWindowElements.dirTwo.totalVolumeCol.textContent = totalTwoDir;

  infoWindow.style.display = 'inline-flex';

  // while (Math.abs(e.lngLat.lng - popupPosition[0]) > 180) {
  //   popupPosition[0] += e.lngLat.lng > popupPosition[0] ? 360 : -360;
  // }


  // linePopup.setLngLat(popupPosition)
  //   .setHTML(getInfoWindowMarkup(infoWindow))
  //   .addTo(map);


}

export function hideLineInfoWindow(infoWindow, map) {

  infoWindow.style.display = 'none';

  map.setFilter('background-lines-hover', [
    "all",
    ["!=", "totalWidth", 0],
    ["==", "lineID", ""]
  ]);
  // linePopup.remove();
}

export function changeColorInfoWindowColorBox(color, cargoId, infoWindow) {
  const reqCargoItems = infoWindow.querySelectorAll(`.info-window__cargo-item-${cargoId}`);

  Array.from(reqCargoItems).forEach(item => {
    const reqColorBox = item.querySelector('.color-box--info-window');
    reqColorBox.style.background = color;
  });
}