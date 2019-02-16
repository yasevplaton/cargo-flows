import { changeCargoColor } from "./common";
import { changeEdgesColor } from "./render";
import 'nouislider';

const Huebee = require('huebee');

// function to create color box
export function createColorBox(cargo) {
  let colorBox = document.createElement('span');
  colorBox.classList.add('color-box');
  colorBox.style.backgroundColor = cargo.color;
  colorBox.id = cargo.id;

  return colorBox;
}

// function to bind color picker and change color handler
export function bindColorPicker(colorBox, cargoColorArray, edges, map, nodes) {
  var hueb = new Huebee(colorBox, {
      setText: false,
      notation: 'hex'
  });

  hueb.on('change', function (color) {
      let cargoID = +this.anchor.id;
      changeCargoColor(cargoColorArray, cargoID, color);
      changeEdgesColor(map, cargoColorArray);
  });

}

// function to create color table
export function createColorTable(tableBody, cargoColorArray, edges, map, nodes) {

  cargoColorArray.forEach(cargo => {
      let row = document.createElement('tr');
      let colId = document.createElement('td');
      colId.innerHTML = cargo.id;
      let colType = document.createElement('td');
      colType.innerHTML = cargo.type;

      let colColor = document.createElement('td');
      let colorBox = createColorBox(cargo);
      colColor.appendChild(colorBox);

      bindColorPicker(colorBox, cargoColorArray, edges, map, nodes);

      let cols = [colId, colType, colColor];

      cols.forEach(col => {
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
          'min': [0, 1],
          'max': [maxWidth]
      }
  });
}

// function to toggle layer visibility
export function toggleLayerVisibility(layerCheckbox, map, layerId) {

  if (layerCheckbox.checked) {
      map.setLayoutProperty(layerId, 'visibility', 'visible');
  } else {
      map.setLayoutProperty(layerId, 'visibility', 'none');
  }
}
