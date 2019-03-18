


export function showLineInfoWindow(e, infoWindowElements) {
  // console.log(e.features);

  const lineID = e.features[0].properties.lineID;
  const tableBody = infoWindowElements.tableBody;


  let totalOneDir = 0;
  let totalTwoDir = 0;
  const denominator = 10000;
  const factor = 10;

  infoWindowElements.dirOne.title.textContent = 'Прямо';
  infoWindowElements.dirTwo.title.textContent = 'Обратно';

  const infoOneDir = JSON.parse(e.features[0].properties.dataOneDir);
  const infoTwoDir = JSON.parse(e.features[0].properties.dataTwoDir);

  const valuesOneDir = infoOneDir.values;
  const valuesTwoDir = infoTwoDir.values;

  for (let cargoType in valuesOneDir) {
    if (valuesOneDir.hasOwnProperty(cargoType)) {
      let value = valuesOneDir[cargoType] / denominator;
      const reqCargoRow = tableBody.querySelector(`.info-window__row--${cargoType}`);
      const reqCargoValueCol = reqCargoRow.querySelector('.info-window__col--dir-1');
      value = Math.ceil(value) * factor;
      reqCargoValueCol.textContent = value;
      totalOneDir += value;
    }
  }

  for (let cargoType in valuesTwoDir) {
    if (valuesTwoDir.hasOwnProperty(cargoType)) {
      let value = valuesTwoDir[cargoType] / denominator;
      const reqCargoRow = tableBody.querySelector(`.info-window__row--${cargoType}`);
      const reqCargoValueCol = reqCargoRow.querySelector('.info-window__col--dir-2');
      value = Math.ceil(value) * factor;
      reqCargoValueCol.textContent = value;
      totalTwoDir += value;
    }
  }

  infoWindowElements.dirOne.totalVolume.textContent = totalOneDir;
  infoWindowElements.dirTwo.totalVolume.textContent = totalTwoDir;

  // while (Math.abs(e.lngLat.lng - popupPosition[0]) > 180) {
  //   popupPosition[0] += e.lngLat.lng > popupPosition[0] ? 360 : -360;
  // }


  // linePopup.setLngLat(popupPosition)
  //   .setHTML(getInfoWindowMarkup(infoWindow))
  //   .addTo(map);

}

export function hideLineInfoWindow(infoWindowElements) {

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