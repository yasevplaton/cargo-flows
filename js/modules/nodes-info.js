export function showNodeInfoWindow(e, infoWindow, infoWindowElements, map) {
  // const popupPosition = e.lngLat;
  // console.log(e);
  
  const nodeProps = e.features[0].properties;

  const sourceRows = infoWindowElements.sourceRows;
  const destRows = infoWindowElements.destRows;

  const rowsToHide = [sourceRows, destRows];
  for (let rows of rowsToHide) {
    Array.from(rows).forEach(row => {
      row.style.display = 'none';
    });
  }

  infoWindowElements.dirOne.title.textContent = 'Вход';
  infoWindowElements.dirTwo.title.textContent = 'Выход';



  // const lineID = e.features[0].properties.lineID;

  // map.setFilter('background-lines-hover', [
  //   "all",
  //   ["!=", "totalWidth", 0],
  //   ["==", "lineID", lineID]
  // ]);

  const denominator = 100000;
  const factor = 100;

  const inCargos = JSON.parse(nodeProps.inCargos);
  const outCargos= JSON.parse(nodeProps.outCargos);
  let inTotal = 0;
  let outTotal = 0;

  const cargoListDirOne = infoWindowElements.dirOne.cargoList;
  const cargoListDirTwo = infoWindowElements.dirTwo.cargoList;

  for (let cargoType in inCargos) {
    if (inCargos.hasOwnProperty(cargoType)) {
      let value = inCargos[cargoType] / denominator;
      const reqCargoItem = cargoListDirOne.querySelector(`.info-window__cargo-item-${cargoType}`);
      const reqValueSpan = reqCargoItem.querySelector('.info-window__cargo-value');
      value = Math.ceil(value) * factor
      reqValueSpan.textContent = value;
      inTotal += value;
    }
  }

  for (let cargoType in outCargos) {
    if (outCargos.hasOwnProperty(cargoType)) {
      let value = outCargos[cargoType] / denominator;
      const reqCargoItem = cargoListDirTwo.querySelector(`.info-window__cargo-item-${cargoType}`);
      const reqValueSpan = reqCargoItem.querySelector('.info-window__cargo-value');
      value = Math.ceil(value) * factor
      reqValueSpan.textContent = value;
      outTotal += value;
    }
  }

  infoWindowElements.dirOne.totalVolumeCol.textContent = inTotal;
  infoWindowElements.dirTwo.totalVolumeCol.textContent = outTotal;

  infoWindow.style.display = 'inline-flex';

  // while (Math.abs(e.lngLat.lng - popupPosition[0]) > 180) {
  //   popupPosition[0] += e.lngLat.lng > popupPosition[0] ? 360 : -360;
  // }


  // linePopup.setLngLat(popupPosition)
  //   .setHTML(getInfoWindowMarkup(infoWindow))
  //   .addTo(map);


}

export function hideNodeInfoWindow(infoWindow, map) {

  infoWindow.style.display = 'none';

  // map.setFilter('background-lines-hover', [
  //   "all",
  //   ["!=", "totalWidth", 0],
  //   ["==", "lineID", ""]
  // ]);
  // linePopup.remove();
}