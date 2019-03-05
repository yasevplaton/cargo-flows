import { calculateMaxWidth } from "./orig-lines";
import { interpolateRound } from 'd3-interpolate';
import { isInRange } from "./common";


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

// function to calculate node radius
export function addNodeAttr(origLines, node, cargoTypes, map) {

    // var adjacentLines = node.properties.adjacentLines;
    // var filledAdjacentLines = node.properties.filledAdjacentLines;

    // if (filledAdjacentLines.length === 1) {
    //     node.properties.deadEnd = true;
    // } else {
    //     node.properties.deadEnd = false;
    // }


    // var maxWidth = calculateMaxWidth(origLines, adjacentLines);
    // node.properties.radius = maxWidth - 1;


    cargoTypes.forEach(cargo => {
        const cornersPoints = getTapeCornersPoints(map, node, cargo);
        addRadiusAndPosition(node, cargo, cornersPoints, map);
    });

}

// function to get same cargo edges
function getSameCargoEdges(node, cargoType) {
    const sameCargoEdges = [];

    node.properties.inEdges.forEach(edge => {
        if (edge.type === cargoType) {
            sameCargoEdges.push(edge);
        }
    });

    node.properties.outEdges.forEach(edge => {
        if (edge.type === cargoType) {
            sameCargoEdges.push(edge);
        }
    });

    return sameCargoEdges;
}

// function to get coordinates of tapes corners
function getTapeCornersPoints(map, node, cargoType) {
    const cornersPoints = [];

    const nodeGeomPix = map.project(node.geometry.coordinates);

    cornersPoints.push(nodeGeomPix);

    let vector, secondPoint;

    const edges = getSameCargoEdges(node, cargoType);

    if (edges.length !== 0) {
        edges.forEach(edge => {

            // edge is output edge
            if (edge.hasOwnProperty('secondPoint')) {
                secondPoint = edge.secondPoint;
                vector = getVector(nodeGeomPix, secondPoint);

                // or edge is input edge
            } else {
                secondPoint = edge.beforeLastPoint;
                vector = getVector(secondPoint, nodeGeomPix);
            }

            const offsetAngle = getOffsetAngle(vector);

            const dist = edge.offset + (edge.width / 2);
            const corner = getCornerCoordinates(nodeGeomPix, dist, offsetAngle);

            cornersPoints.push(corner);
        });
    }

    return cornersPoints;
}

// function to fill node attribute
function addRadiusAndPosition(node, cargoType, cornersPoints, map) {

    const cargoRadiusName = `${cargoType}-radius`;
    const cargoPositionName = `${cargoType}-position`;

    if (cornersPoints.length !== 0) {
        const circle = makeCircle(cornersPoints);

        node.properties[cargoRadiusName] = circle.r;

        const coords = map.unproject([circle.x, circle.y]);
        const lng = coords.lng;
        const lat = coords.lat;

        node.properties[cargoPositionName] = [lng, lat];

    } else {
        node.properties[cargoRadiusName] = 0;
        node.properties[cargoPositionName] = node.geometry.coordinates;
    }

}

// function to get vector from two points
function getVector(pt1, pt2) {

    return {
        x: pt2.x - pt1.x,
        y: pt2.y - pt1.y
    }
}

// function to get offset angle
function getOffsetAngle(vector) {
    const segmentAngle = Math.atan2(vector.y, vector.x);
    const offsetAngle = segmentAngle + Math.PI / 2;

    return offsetAngle;
}

// function to get corner coordinates
function getCornerCoordinates(pt, dist, offsetAngle) {
    return {
        x: pt.x + dist * Math.cos(offsetAngle),
        y: pt.y + dist * Math.sin(offsetAngle)
    };
}

// function to create object for specific type of cargo
function createSingleCargoNodesObject(cargoType, nodes) {

    const singleCargoNodesObject = { type: 'FeatureCollection', features: [] };
    const cargoRadiusName = `${cargoType}-radius`;
    const cargoPositionName = `${cargoType}-position`;

    nodes.features.forEach(node => {
        const cargoNode = {
            type: "Feature",
            properties: {
                radius: node.properties[cargoRadiusName],
                deadEnd: node.properties.deadEnd
            },
            geometry: {
                type: "Point",
                coordinates: node.properties[cargoPositionName]
            }
        };

        singleCargoNodesObject.features.push(cargoNode);
    });

    return singleCargoNodesObject;
}


// function to create object for all types of cargos
export function createMultipleCargoNodesObject(cargoTypes, nodes) {
    const multipleCargoNodesObject = {};

    cargoTypes.forEach(cargo => {
        multipleCargoNodesObject[cargo] = createSingleCargoNodesObject(cargo, nodes);
    });

    return multipleCargoNodesObject;
}


// FUNCTIONS TO GET MINIMUM BOUNDING CIRCLE
// Initially: No boundary points known
function makeCircle(points) {
    // Clone list to preserve the caller's data, do Durstenfeld shuffle
    var shuffled = points.slice();
    for (var i = points.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        j = Math.max(Math.min(j, i), 0);
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }

    // Progressively add points to circle or recompute circle
    var c = null;
    shuffled.forEach(function (p, i) {
        if (c === null || !isInCircle(c, p))
            c = makeCircleOnePoint(shuffled.slice(0, i + 1), p);
    });
    return c;
}


// One boundary point known
function makeCircleOnePoint(points, p) {
    var c = { x: p.x, y: p.y, r: 0 };
    points.forEach(function (q, i) {
        if (!isInCircle(c, q)) {
            if (c.r == 0)
                c = makeDiameter(p, q);
            else
                c = makeCircleTwoPoints(points.slice(0, i + 1), p, q);
        }
    });
    return c;
}


// Two boundary points known
function makeCircleTwoPoints(points, p, q) {
    var circ = makeDiameter(p, q);
    var left = null;
    var right = null;

    // For each point not in the two-point circle
    points.forEach(function (r) {
        if (isInCircle(circ, r))
            return;

        // Form a circumcircle and classify it on left or right side
        var cross = crossProduct(p.x, p.y, q.x, q.y, r.x, r.y);
        var c = makeCircumcircle(p, q, r);
        if (c === null)
            return;
        else if (cross > 0 && (left === null || crossProduct(p.x, p.y, q.x, q.y, c.x, c.y) > crossProduct(p.x, p.y, q.x, q.y, left.x, left.y)))
            left = c;
        else if (cross < 0 && (right === null || crossProduct(p.x, p.y, q.x, q.y, c.x, c.y) < crossProduct(p.x, p.y, q.x, q.y, right.x, right.y)))
            right = c;
    });

    // Select which circle to return
    if (left === null && right === null)
        return circ;
    else if (left === null && right !== null)
        return right;
    else if (left !== null && right === null)
        return left;
    else if (left !== null && right !== null)
        return left.r <= right.r ? left : right;
    else
        throw "Assertion error";
}


function makeDiameter(a, b) {
    var cx = (a.x + b.x) / 2;
    var cy = (a.y + b.y) / 2;
    var r0 = distance(cx, cy, a.x, a.y);
    var r1 = distance(cx, cy, b.x, b.y);
    return { x: cx, y: cy, r: Math.max(r0, r1) };
}


function makeCircumcircle(a, b, c) {
    // Mathematical algorithm from Wikipedia: Circumscribed circle
    var ox = (Math.min(a.x, b.x, c.x) + Math.max(a.x, b.x, c.x)) / 2;
    var oy = (Math.min(a.y, b.y, c.y) + Math.max(a.y, b.y, c.y)) / 2;
    var ax = a.x - ox, ay = a.y - oy;
    var bx = b.x - ox, by = b.y - oy;
    var cx = c.x - ox, cy = c.y - oy;
    var d = (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) * 2;
    if (d == 0)
        return null;
    var x = ox + ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    var y = oy + ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    var ra = distance(x, y, a.x, a.y);
    var rb = distance(x, y, b.x, b.y);
    var rc = distance(x, y, c.x, c.y);
    return { x: x, y: y, r: Math.max(ra, rb, rc) };
}


/* Simple mathematical functions */

var MULTIPLICATIVE_EPSILON = 1 + 1e-14;

function isInCircle(c, p) {
    return c !== null && distance(p.x, p.y, c.x, c.y) <= c.r * MULTIPLICATIVE_EPSILON;
}


// Returns twice the signed area of the triangle defined by (x0, y0), (x1, y1), (x2, y2).
function crossProduct(x0, y0, x1, y1, x2, y2) {
    return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
}


function distance(x0, y0, x1, y1) {
    return Math.hypot(x0 - x1, y0 - y1);
}


if (!("hypot" in Math)) {  // Polyfill
    Math.hypot = function (x, y) {
        return Math.sqrt(x * x + y * y);
    };
}
