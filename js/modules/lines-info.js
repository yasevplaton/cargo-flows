export function getInfoWindowElements(infoWindow) {

  const colDirOne = infoWindow.querySelector('#info-window__col-1');
  const sourceColDirOne = colDirOne.querySelector('.info-window__source');
  const destColDirOne = colDirOne.querySelector('.info-window__destination');
  const totalVolumeColDirOne = colDirOne.querySelector('.info-window__total-volume');
  const cargoListDirOne = colDirOne.querySelector('.info-window__cargo-list--dir-1');

  const colDirTwo = infoWindow.querySelector('#info-window__col-2');
  const sourceColDirTwo = colDirTwo.querySelector('.info-window__source');
  const destColDirTwo = colDirTwo.querySelector('.info-window__destination');
  const totalVolumeColDirTwo = colDirTwo.querySelector('.info-window__total-volume');
  const cargoListDirTwo = colDirTwo.querySelector('.info-window__cargo-list--dir-2');

  return {

    dirOne: {
      sourceCol: sourceColDirOne,
      destCol: destColDirOne,
      cargoList: cargoListDirOne,
      totalVolumeCol: totalVolumeColDirOne
    },

    dirTwo: {
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


export function showInfoWindow(e, infoWindow, infoWindowElements) {
  // const popupPosition = e.lngLat;
  // console.log(e);
  const infoOneDir = JSON.parse(e.features[0].properties.dataOneDir);
  const infoTwoDir = JSON.parse(e.features[0].properties.dataTwoDir);

  infoWindowElements.dirOne.sourceCol.textContent = infoOneDir.src;
  infoWindowElements.dirOne.destCol.textContent = infoOneDir.dest;
  infoWindowElements.dirOne.totalVolumeCol.textContent = infoOneDir.totalVolume;

  infoWindowElements.dirTwo.sourceCol.textContent = infoTwoDir.src;
  infoWindowElements.dirTwo.destCol.textContent = infoTwoDir.dest;
  infoWindowElements.dirTwo.totalVolumeCol.textContent = infoTwoDir.totalVolume;

  const cargoListDirOne = infoWindowElements.dirOne.cargoList;
  const cargoListDirTwo = infoWindowElements.dirTwo.cargoList;

  const valuesOneDir = infoOneDir.values;
  const valuesTwoDir = infoTwoDir.values;

  for (let cargoType in valuesOneDir) {
    if (valuesOneDir.hasOwnProperty(cargoType)) {
      const value = valuesOneDir[cargoType];
      const reqCargoItem = cargoListDirOne.querySelector(`.info-window__cargo-item-${cargoType}`);
      const reqValueSpan = reqCargoItem.querySelector('.info-window__cargo-value');
      reqValueSpan.textContent = value;
    }
  }

  for (let cargoType in valuesTwoDir) {
    if (valuesTwoDir.hasOwnProperty(cargoType)) {
      const value = valuesTwoDir[cargoType];
      const reqCargoItem = cargoListDirTwo.querySelector(`.info-window__cargo-item-${cargoType}`);
      const reqValueSpan = reqCargoItem.querySelector('.info-window__cargo-value');
      reqValueSpan.textContent = value;
    }
  }

  infoWindow.style.display = 'inline-flex';

  // while (Math.abs(e.lngLat.lng - popupPosition[0]) > 180) {
  //   popupPosition[0] += e.lngLat.lng > popupPosition[0] ? 360 : -360;
  // }


  // linePopup.setLngLat(popupPosition)
  //   .setHTML(getInfoWindowMarkup(infoWindow))
  //   .addTo(map);


}

export function hideInfoWindow(infoWindow) {
  infoWindow.style.display = 'none';
  // linePopup.remove();
}

export function changeColorInfoWindowColorBox(color, cargoId, infoWindow) {
  const reqCargoItems = infoWindow.querySelectorAll(`.info-window__cargo-item-${cargoId}`);

  Array.from(reqCargoItems).forEach(item => {
    const reqColorBox = item.querySelector('.color-box--info-window');
    reqColorBox.style.background = color;
  });
}