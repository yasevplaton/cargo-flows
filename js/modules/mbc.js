// FUNCTIONS TO GET MINIMUM BOUNDING CIRCLE
// Initially: No boundary points known
export function makeCircle(points) {
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

export function distance(x0, y0, x1, y1) {
  return Math.hypot(x0 - x1, y0 - y1);
}


if (!("hypot" in Math)) {  // Polyfill
  Math.hypot = function (x, y) {
      return Math.sqrt(x * x + y * y);
  };
}