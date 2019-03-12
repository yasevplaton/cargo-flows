export function getInfoWindowElements(infoWindow) {

  const tableHeading = infoWindow.querySelector('.info-window__table-heading');
  const tableBody = infoWindow.querySelector('.info-window__table-body');
  const titleDirOne = tableHeading.querySelector('.info-window__col--dir-1');
  const titleDirTwo = tableHeading.querySelector('.info-window__col--dir-2');
  const totalVolumeRow = tableBody.querySelector('.info-window__row--total');
  const totalVolumeDirOne = totalVolumeRow.querySelector('.info-window__col--dir-1');
  const totalVolumeDirTwo = totalVolumeRow.querySelector('.info-window__col--dir-2');

  console.log(titleDirOne, titleDirTwo);

  return {

    tableHeading: tableHeading,
    tableBody: tableBody,
    totalVolumeRow: totalVolumeRow,

    dirOne: {
      title: titleDirOne,
      totalVolume: totalVolumeDirOne
    },

    dirTwo: {
      title: titleDirTwo,
      totalVolume: totalVolumeDirTwo
    }

  }
}

export function addCargoList(infoWindowElements, cargoColorArray) {

  const tableBody = infoWindowElements.tableBody;
  const totalVolumeRow = infoWindowElements.totalVolumeRow;

  cargoColorArray.forEach(cargoObj => {

    const cargoRow = document.createElement('tr');
    cargoRow.classList.add('info-window__row', `info-window__row--${cargoObj.id}`, `info-window__row--${cargoObj.type}`);

    const cargoColorBoxCol = document.createElement('td');
    cargoColorBoxCol.classList.add('info-window__col', 'info-window__col--cargo-color');
    
    const cargoColorBox = document.createElement('span');
    cargoColorBox.classList.add('color-box', 'color-box--info-window');
    cargoColorBox.style.background = cargoObj.color;
    cargoColorBoxCol.appendChild(cargoColorBox);

    const cargoTypeCol = document.createElement('td');
    cargoTypeCol.classList.add('info-window__col', 'info-window__col--cargo-name');
    cargoTypeCol.textContent = cargoObj.type;
  
    const cargoDirOneCol = document.createElement('td');
    cargoDirOneCol.classList.add('info-window__col', 'info-window__col--dir-1');
    
    const cargoDirTwoCol = document.createElement('td');
    cargoDirTwoCol.classList.add('info-window__col', 'info-window__col--dir-2');

    const cargoCols = [cargoColorBoxCol, cargoTypeCol, cargoDirOneCol, cargoDirTwoCol];

    cargoCols.forEach(col => {
      cargoRow.appendChild(col);
    });

    tableBody.insertBefore(cargoRow, totalVolumeRow);

  });
}

export function changeColorInfoWindowColorBox(color, cargoId, infoWindow) {
  const reqCargoRow = infoWindow.querySelector(`.info-window__row--${cargoId}`);
  const reqColorBox = reqCargoRow.querySelector('.color-box--info-window');
  reqColorBox.style.background = color;
}

export function getInfoWindowMarkup(infoWindow) {
  return infoWindow.outerHTML;
}