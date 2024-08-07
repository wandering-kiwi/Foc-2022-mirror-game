let ship;
const ASTEROID_CHANCE = 0.007;
const MIRROR_LEN = 50;
let asteroids = [];
let bullets = [];
let mirrors = [];
let mirror;
let t1 = 0;
let t2 = 0;
let t3 = 0;
let t4 = 0;
let t5 = 0;
let isSelecting = false;
let points = 0;
let bulletTimer = 0;


function setup() {
	// frameRate(2)
	createCanvas(windowWidth, windowHeight);
	background(0);
	ship = createShip();
	mirrors.push(createMirror(createVector(61, 336), createVector(158, 436)));
	mirrors.push(createMirror(createVector(66, 202), createVector(176, 114)));
	mirrors.push(createMirror(createVector(358, 132), createVector(467, 264)));
	mirrors.push(createMirror(createVector(322, 491), createVector(449, 600)));
	mirrors.push(createMirror(createVector(636, 517), createVector(737, 583)));
	createBullet(bullets);
}

function draw() {
	if (ship.isAlive) {
		background(0);
		noStroke();
		fill(255, 0, 0);
		textSize(50);
		text(points, 30, 40);
		fill(0, 0, 255);
		text(ship.health, 30, 90);
		drawShip(ship);
		createAsteroids(ASTEROID_CHANCE, asteroids);
		drawAsteroids(asteroids);
		updateAsteroids(asteroids);
		asteroids = asteroids.filter(ast => ast.isAlive);
		drawMirrors(mirrors);
		drawBullets(bullets);
		updateBullets(bullets);
		bullets = bullets.filter(b => b.isAlive);
		bulletTimer -= 1;
	}
}

function createShip() {
	return {
		pos: createVector(width / 2 - 20, height / 2),
		bound: 100,
		health: 6,
		isAlive: true
	};
}

function drawShip(ship) {
	if (ship.isAlive) {
		// fill('#2D00F7');
		// stroke('#E500A4');
		fill('blue');
		noStroke();
		strokeWeight(20);
		circle(ship.pos.x, ship.pos.y, ship.bound * 2);
	}

}

function createAsteroids(chance, asteroids) {
	if (random(1) < chance) {
		asteroids.push(createAsteroid());
	}
}

function createAsteroid() {
	let newAngle = random(PI * 2);
	let newSpeed = random(0.25, 4) * 2;
	let vel = p5.Vector.fromAngle(newAngle, newSpeed);
	return {
		pos: createVector(random(width), random(height)),
		vel,
		rotStart: random(PI * 2),
		rotSpeed: random(-PI / 72, PI / 72),
		bound: 25,
		isAlive: true
	};
}

function drawAsteroids(asteroids) {
	for (let asteroid of asteroids) {
		drawAsteroid(asteroid);
	}
}

function drawAsteroid(asteroid) {
	fill('gray');
	noStroke();
	circle(asteroid.pos.x, asteroid.pos.y, asteroid.bound * 2);
}

function updateAsteroids(asteroids) {
	for (let asteroid of asteroids) {
		updateAsteroid(asteroid);
	}
}

function updateAsteroid(asteroid) {
	for (let bullet of bullets) {
		if ((dist(asteroid.pos.x, asteroid.pos.y, bullet.midPoint.x, bullet.midPoint.y) - asteroid.bound - bullet.bound < 0)) {
			asteroid.isAlive = false;
			bullet.isAlive = false;
			points += 1;
		}
	}
	if (collision(asteroid, ship) && ship.isAlive) {
		asteroid.isAlive = false;
		ship.health -= 1;
		if (ship.health < 1) {
			triggerGameOver();
			ship.isAlive = false;
		}
	}
	asteroid.pos.add(asteroid.vel)
	asteroid.rotStart += asteroid.rotSpeed;
	if (asteroid.pos.x >= width) {
		asteroid.pos.x = 0;
	} else if (asteroid.pos.x <= 0) {
		asteroid.pos.x = width;
	}
	if (asteroid.pos.y >= height) {
		asteroid.pos.y = 0;
	} else if (asteroid.pos.y <= 0) {
		asteroid.pos.y = height;
	}
}

function collision(obj1, obj2) {
	return (dist(obj1.pos.x, obj1.pos.y, obj2.pos.x, obj2.pos.y) - obj1.bound - obj2.bound < 0);
}


function createBullet(bullets) {
	bullets.push({
		vel: createVector(-15, 0),
		p1: ship.pos.copy().add(createVector(-ship.bound, 0)),
		midPoint: ship.pos.copy().add(createVector(-10, 0)),
		p2: p5.Vector.add(ship.pos.copy().add(createVector(-ship.bound, 0)), createVector(-20, 0)),
		bound: 10,
		isAlive: true
	});
}

function drawBullets(bullets) {
	for (let bullet of bullets) {
		drawBullet(bullet);
	}
}

function drawBullet(bullet) {
	strokeWeight(10);
	stroke('red');
	line(bullet.p1.x, bullet.p1.y, bullet.p2.x, bullet.p2.y);
}

function updateBullets(bullets) {
	for (let bullet of bullets) {
		updateBullet(bullet);
	}
}

function updateBullet(bullet) {
	bullet.p1.add(bullet.vel);
	bullet.midPoint.add(bullet.vel);
	bullet.p2.add(bullet.vel);
	for (let mirror of mirrors) {
		let intersection = findIntersection(mirror.p1, mirror.p2, bullet.p1, bullet.p2);
		if (intersection) {
			let rebound = p5.Vector.sub(intersection, bullet.p2);
			bullet.p1.add(rebound);
			bullet.midPoint.add(rebound);
			bullet.p2.add(rebound);
			bullet.vel.reflect(mirror.normal);
			bullet.p1 = intersection.copy().add(mirror.normal.copy().mult(0.1).rotate(PI));
			bullet.midPoint = p5.Vector.add(bullet.p1, bullet.vel.copy().mult(2 / 3));
			bullet.p2 = p5.Vector.add(bullet.midPoint, bullet.vel.copy().mult(2 / 3));
		}
	}
}

function createMirrors(num, mirrors) {
	for (let i = 0; i < num; i++) {
		mirrors.push(createMirror());
	}
}

function createMirror(p1, p2) {
	let mirrorLenVec = p5.Vector.sub(p2, p1);
	return {
		p1,
		midPoint: p5.Vector.add(p5.Vector.div(mirrorLenVec, 2), p1),
		p2,
		normal: mirrorLenVec.copy().rotate(HALF_PI),
		bound: mirrorLenVec.mag() / 2,
		isSelected: false
	};
}

function drawMirrors(mirrors) {
	for (let mirror of mirrors) {
		drawMirror(mirror);
	}
}

function drawMirror(mirror) {
	stroke(255);
	mirror.isSelected = mirror.isSelected && isSelecting;
	if (mirror.isSelected) {
		stroke(200, 255, 200);
		let temp = mirror.midPoint.copy();
		mirror.midPoint = createVector(mouseX, mouseY);
		mirror.p1 = p5.Vector.add(mirror.midPoint, p5.Vector.sub(mirror.p1, temp));
		mirror.p2 = p5.Vector.add(mirror.midPoint, p5.Vector.sub(mirror.p2, temp));
		if (keyIsPressed) {
			if (keyCode === 37) { //left arrow
				// p1
				let temp = p5.Vector.sub(mirror.p1, mirror.midPoint);
				temp.rotate(PI * 2 / -135);
				mirror.p1 = p5.Vector.add(mirror.midPoint, temp);

				//p2
				temp = p5.Vector.sub(mirror.p2, mirror.midPoint);
				temp.rotate(PI * 2 / -135);
				mirror.p2 = p5.Vector.add(mirror.midPoint, temp);
			}
			if (keyCode === 39) { //right arrow
				// p1
				let temp = p5.Vector.sub(mirror.p1, mirror.midPoint);
				temp.rotate(PI * 2 / 135);
				mirror.p1 = p5.Vector.add(mirror.midPoint, temp);

				//p2
				temp = p5.Vector.sub(mirror.p2, mirror.midPoint);
				temp.rotate(PI * 2 / 135);
				mirror.p2 = p5.Vector.add(mirror.midPoint, temp);
			}
		}
	}

	strokeWeight(5);
	if (dist(mouseX, mouseY, mirror.midPoint.x, mirror.midPoint.y) < mirror.bound) {
		strokeWeight(8)
	}
	line(mirror.p1.x, mirror.p1.y, mirror.p2.x, mirror.p2.y)
	mirror.normal = p5.Vector.sub(mirror.p2, mirror.p1).rotate(HALF_PI);
}

function equationForLine(line) {
	let m = (line.b.y - line.a.y)
	m /= (line.b.x - line.a.x)
	let c = line.a.y
	c -= (m * line.a.x)
	return {
		m,
		c
	}
}

function findIntersectionFromCoefficients(a, b, c, d) {
	let x = (d - b)
	x /= (a - c)
	let y = a * x + b
	return createVector(x, y)
}

function isPointInLineSegment(line, point) {
	return abs(line.a.dist(point) + point.dist(line.b) - line.a.dist(line.b)) < 0.001
}

function findIntersection(p1, p2, p3, p4) {
	line1 = {
		a: p1,
		b: p2
	}
	line2 = {
		a: p3,
		b: p4
	}
	let lineEquation1 = equationForLine(line1)
	let lineEquation2 = equationForLine(line2)
	let intersection = findIntersectionFromCoefficients(lineEquation1.m, lineEquation1.c, lineEquation2.m, lineEquation2.c)
	if (isPointInLineSegment(line1, intersection) && isPointInLineSegment(line2, intersection)) {
		return intersection
	}
	return null
}

function selectMirror(mirror) {
	isSelecting = true
	mirror.isSelected = true
}

function triggerGameOver() {
	background(0)
	textSize(100)
	textAlign(CENTER, CENTER);
	fill(255)
	text('YOU DIED.', width / 2, height / 2)
	fill('red')
	text(points, width / 2, height / 4 * 3)
}

function keyPressed() {
	if (key === " ") {
		if (bulletTimer < 0) {
			createBullet(bullets)
			bulletTimer = 25
		}
	}
}

function mousePressed() {
	if (isSelecting) {
		isSelecting = false
		return;
	}
	for (let mirror of mirrors) {
		if (dist(mouseX, mouseY, mirror.midPoint.x, mirror.midPoint.y) < mirror.bound) {
			selectMirror(mirror)
			return
		}
	}
}
