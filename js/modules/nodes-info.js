export function showNodeData(e, infoWindowElements) {
  // console.log(e.features);

  const nodeProps = e.features[0].properties;
  const tableBody = infoWindowElements.tableBody;

  infoWindowElements.dirOne.title.textContent = 'Вход';
  infoWindowElements.dirTwo.title.textContent = 'Выход';

  let inTotal = 0;
  let outTotal = 0;
  const denominator = 10000;
  const factor = 10;

  const inCargos = JSON.parse(nodeProps.inCargos);
  const outCargos = JSON.parse(nodeProps.outCargos);

  for (let cargoType in inCargos) {
    if (inCargos.hasOwnProperty(cargoType)) {
      let value = inCargos[cargoType] / denominator;
      const reqCargoRow = tableBody.querySelector(`.info-window__row--${cargoType}`);
      const reqCargoValueCol = reqCargoRow.querySelector('.info-window__col--dir-1');
      value = Math.ceil(value) * factor;
      reqCargoValueCol.textContent = value;
      inTotal += value;
    }
  }

  for (let cargoType in outCargos) {
    if (outCargos.hasOwnProperty(cargoType)) {
      let value = outCargos[cargoType] / denominator;
      const reqCargoRow = tableBody.querySelector(`.info-window__row--${cargoType}`);
      const reqCargoValueCol = reqCargoRow.querySelector('.info-window__col--dir-2');
      value = Math.ceil(value) * factor;
      reqCargoValueCol.textContent = value;
      outTotal += value;
    }
  }

  infoWindowElements.dirOne.totalVolume.textContent = inTotal;
  infoWindowElements.dirTwo.totalVolume.textContent = outTotal;

  // while (Math.abs(e.lngLat.lng - popupPosition[0]) > 180) {
  //   popupPosition[0] += e.lngLat.lng > popupPosition[0] ? 360 : -360;
  // }


  // linePopup.setLngLat(popupPosition)
  //   .setHTML(getInfoWindowMarkup(infoWindow))
  //   .addTo(map);


}

export function hideNodeData(infoWindowElements) {

  const tableBody = infoWindowElements.tableBody;

  infoWindowElements.dirOne.title.textContent = 'Прямо';
  infoWindowElements.dirTwo.title.textContent = 'Обратно';

  const cargoValuesDirOne = tableBody.querySelectorAll('.info-window__col--dir-1');
  const cargoValuesDirTwo = tableBody.querySelectorAll('.info-window__col--dir-2');

  Array.from(cargoValuesDirOne).forEach(col => {
    col.textContent = "-"
  });

  Array.from(cargoValuesDirTwo).forEach(col => {
    col.textContent = "-"
  });
}