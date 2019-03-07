import { interpolateRound } from 'd3-interpolate';
import { isInRange } from "./common";

// function to bind information about edges to node
export function bindEdgesInfoToNodes(node, edges, map) {
    let nodeID = node.properties.OBJECTID;
    let inEdges = [];
    let outEdges = [];
    let filledAdjacentLines = [];
    let nodeTraffic = 0;

    edges.features.forEach(e => {
        let edgesProps = e.properties;
        let edgeID = e.id;
        let edgeGeom = e.geometry.coordinates;
        let numOfPoints = edgeGeom.length;

        if (edgesProps.value !== 0) {
            if (edgesProps.src === nodeID) {

                nodeTraffic += edgesProps.value;
                outEdges.push({
                    'id': edgeID,
                    'type': edgesProps.type,
                    'value': edgesProps.value,
                    'width': edgesProps.width,
                    'offset': edgesProps.offset,
                    'lineID': edgesProps.ID_line,
                    'secondPoint': map.project(edgeGeom[1])
                });

                if (!filledAdjacentLines.includes(edgesProps.ID_line)) {
                    filledAdjacentLines.push(edgesProps.ID_line);
                }

            } else if (edgesProps.dest === nodeID) {

                nodeTraffic += edgesProps.value;

                inEdges.push({
                    'id': edgeID,
                    'type': edgesProps.type,
                    'value': edgesProps.value,
                    'width': edgesProps.width,
                    'offset': edgesProps.offset,
                    'lineID': edgesProps.ID_line,
                    'beforeLastPoint': map.project(edgeGeom[numOfPoints - 2])
                });

                if (!filledAdjacentLines.includes(edgesProps.ID_line)) {
                    filledAdjacentLines.push(edgesProps.ID_line);
                }
            }

        }

    });

    node.properties.filledAdjacentLines = filledAdjacentLines;
    node.properties.inEdges = inEdges;
    node.properties.outEdges = outEdges;
    node.properties.nodeTraffic = nodeTraffic;
}

// function to fill array with node traffic for all nodes
export function fillNodeTrafficArray(nodeTrafficArray, node) {
    const nodeTraffic = node.properties.nodeTraffic;

    if (nodeTraffic !== 0) {
        nodeTrafficArray.push(nodeTraffic);
    }

}

// function to add loading class attributs to node
export function addLoadingClass(node, nodeJenks) {
    const nodeTraffic = node.properties.nodeTraffic;
    let loadingClass;

    if (isInRange(nodeTraffic, nodeJenks[0], nodeJenks[1])) {
        loadingClass = 1;
    } else if (isInRange(nodeTraffic, nodeJenks[1], nodeJenks[2])) {
        loadingClass = 2;
    } else if (isInRange(nodeTraffic, nodeJenks[2], nodeJenks[3])) {
        loadingClass = 3;
    } else if (isInRange(nodeTraffic, nodeJenks[3], nodeJenks[4])) {
        loadingClass = 4;
    } else if (isInRange(nodeTraffic, nodeJenks[4], nodeJenks[5])) {
        loadingClass = 5;
    } else {
        loadingClass = 0;
    }

    node.properties.loadingClass = loadingClass;
}

// function to get array of interpolated radii for nodes
export function getCityRadiusArray(minCityRadius, maxCityRadius) {

    const interpolator = interpolateRound(minCityRadius, maxCityRadius);

    const cityRadiusArray = [minCityRadius, interpolator(0.25), interpolator(0.5), interpolator(0.75), maxCityRadius];

    return cityRadiusArray;

}

// function to add attribute of city radius to node
export function addCityRadiusAttr(node, cityRadiusArray) {
    let cityRadius;

    switch (node.properties.loadingClass) {

        case 0:
            cityRadius = 0;
            break;
        case 1:
            cityRadius = cityRadiusArray[0];
            break;
        case 2:
            cityRadius = cityRadiusArray[1];
            break;
        case 3:
            cityRadius = cityRadiusArray[2];
            break;
        case 4:
            cityRadius = cityRadiusArray[3];
            break;
        case 5:
            cityRadius = cityRadiusArray[4];
            break;
    }

    node.properties.cityRadius = cityRadius;
}

// function to find lines that adjacent to specific node
export function findAdjacentLines(edges, nodeID) {
    var adjacentLines = [];

    edges.features.forEach(e => {
        if (e.properties.src === nodeID || e.properties.dest === nodeID) {
            if (adjacentLines.indexOf(e.properties.ID_line) === -1) {
                adjacentLines.push(e.properties.ID_line);
            }
        }
    });

    return adjacentLines;
}

// function to fill adjacent lines attribute to nodes
export function fillAdjacentLinesAttr(nodes, edges) {
    nodes.features.forEach(node => {
        node.properties.adjacentLines = findAdjacentLines(edges, node.properties.OBJECTID);
    });
}