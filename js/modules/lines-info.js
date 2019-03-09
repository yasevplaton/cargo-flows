export function getInfoWindowElements(infoWindow) {
  const colDirOne = infoWindow.querySelector('#info-window__col-1');
  const sourceColDirOne = colDirOne.querySelector('.info-window__source');
  const destColDirOne = colDirOne.querySelector('.info-window__destination');
  const totalVolumeColDirOne = colDirOne.querySelector('.info-window__total-volume');
  const cargoListDirONe = colDirOne.querySelector('.info-wondow__cargo-list');
  const colDirTwo = infoWindow.querySelector('#info-window__col-2');
  const sourceColDirTwo = colDirTwo.querySelector('.info-window__source');
  const destColDirTwo = colDirTwo.querySelector('.info-window__destination');
  const totalVolumeColDirTwo = colDirTwo.querySelector('.info-window__total-volume');

  return {
    dirOne: {
      sourceCol: sourceColDirOne,
      destCol: destColDirOne,
      totalVolumeCol: totalVolumeColDirOne
    },

    dirTwo: {
      sourceCol: sourceColDirTwo,
      destCol: destColDirTwo,
      totalVolumeCol: totalVolumeColDirTwo
    }

  }
}


export function showInfoWindow(e, infoWindow, infoWindowElements) {
  // const coordinates = e.lngLat;
  const infoOneDir = JSON.parse(e.features[0].properties.dataOneDir);
  const infoTwoDir = JSON.parse(e.features[0].properties.dataTwoDir);
  // console.log(infoOneDir);
  // console.log(infoTwoDir);

  infoWindowElements.dirOne.sourceCol.textContent = infoOneDir.src;
  infoWindowElements.dirOne.destCol.textContent = infoOneDir.dest;
  infoWindowElements.dirOne.totalVolumeCol.textContent = infoOneDir.totalVolume;
  infoWindowElements.dirTwo.sourceCol.textContent = infoTwoDir.src;
  infoWindowElements.dirTwo.destCol.textContent = infoTwoDir.dest;
  infoWindowElements.dirTwo.totalVolumeCol.textContent = infoTwoDir.totalVolume;

  infoWindow.style.display = 'flex';

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  // }

  // Populate the popup and set its coordinates
  // based on the feature found.
  // linePopup.setLngLat(coordinates)
  //   .setHTML(info)
  //   .addTo(map);
}

export function hideInfoWindow(infoWindow, infoWindowElements) {
  infoWindow.style.display = 'none';
}

