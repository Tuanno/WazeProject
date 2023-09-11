let cityMap1 = [
    [0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

let cityMap2 = [
    [0, 0, 0, 1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0],
];

let tileSize = 40;
let currentCityMap = cityMap1; // Começamos com o primeiro mapa
let startPoint = null;
let endPoint = null;
let path = [];

// Variável para ativar/desativar a adição de obstáculos
let addObstacles = false;

// Cria o canvas onde a aplicação será desenhada
function setup() {
    createCanvas(currentCityMap[0].length * tileSize, currentCityMap.length * tileSize);
    noLoop();
    drawMap();

    // Crie um botão para alternar entre os mapas
    let switchButton = createButton('Alternar Mapa');
    switchButton.position(10, height + 10);
    switchButton.mousePressed(switchCityMap);

    // Crie um botão para ativar/desativar a adição de obstáculos
    let addObstaclesButton = createButton('Adicionar Obstáculos');
    addObstaclesButton.position(130, height + 10);
    addObstaclesButton.mousePressed(toggleAddObstacles);
}

// Desenha o mapa da cidade na tela
function drawMap() {
    for (let y = 0; y < currentCityMap.length; y++) {
        for (let x = 0; x < currentCityMap[y].length; x++) {
            if (currentCityMap[y][x] === 0) {
                fill(200);
            } else if (currentCityMap[y][x] === 1) {
                fill(100);
            } else if (currentCityMap[y][x] === 2) {
                fill(255, 0, 0); // Cor vermelha para obstáculos
            }
            rect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

// Atualiza o desenho na tela
function draw() {
    background(255);
    drawMap();
    drawPath();
    drawStartAndEndPoints();
}

// Desenha o caminho encontradado na tela
function drawPath() {
    noFill();
    stroke(255, 0, 0);
    strokeWeight(3);
    beginShape();
    for (let p of path) {
        vertex(p.x * tileSize + tileSize / 2, p.y * tileSize + tileSize / 2);
    }
    endShape();
}

// Desenha os pontos de inicio e fim do caminho na tela
function drawStartAndEndPoints() {
    fill(0, 255, 0);// Cor verde
    if (startPoint) {
        ellipse(startPoint.x * tileSize + tileSize / 2, startPoint.y * tileSize + tileSize / 2, 20, 20);
    }
    fill(255, 0, 0); //Cor vermelha
    if (endPoint) {
        ellipse(endPoint.x * tileSize + tileSize / 2, endPoint.y * tileSize + tileSize / 2, 20, 20);
    }
}

// Ativa ou desativa o botão "Adicionar Obstáculos" quando é pressionado
function toggleAddObstacles() {
    addObstacles = !addObstacles;
}

// Define obstaculos ou pontos de inicio e fim
function mousePressed() {
    let x = Math.floor(mouseX / tileSize);
    let y = Math.floor(mouseY / tileSize);

    if (addObstacles) {
        // Adicione obstáculos ao clicar nas células do mapa
        if (currentCityMap[y][x] === 0) {
            currentCityMap[y][x] = 2; // Obstáculos em vermelho
            redraw();
        }
    } else {
        if (currentCityMap[y][x] === 0) {
            if (!startPoint) {
                startPoint = createVector(x, y);
            } else if (!endPoint) {
                endPoint = createVector(x, y);
                path = calculateRoute(startPoint, endPoint);
            }
        }
        redraw();
    }
}

// Testa os possiveis caminhos e retorna um caminho encontrado
function calculateRoute(start, end) {
    let openList = [];
    let closedList = [];
    openList.push(start);

    while (openList.length > 0) {
        let current = openList.shift();
        closedList.push(current);

        if (current.equals(end)) {
            return reconstructPath(current);
        }

        let neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            if (!closedList.some(node => node.equals(neighbor)) && !openList.some(node => node.equals(neighbor))) {
                neighbor.parent = current;
                neighbor.g = current.g + 1;
                neighbor.h = heuristic(neighbor, end);
                openList.push(neighbor);
            }
        }

        openList.sort((a, b) => (a.g + a.h) - (b.g + b.h));
    }

    return [];
}

// Verifica as direções e se não são obstaculos
function getNeighbors(point) {
    let neighbors = [];
    let directions = [createVector(1, 0), createVector(0, 1), createVector(-1, 0), createVector(0, -1)];

    for (let dir of directions) {
        let neighbor = p5.Vector.add(point, dir);
        if (neighbor.x >= 0 && neighbor.x < currentCityMap[0].length && neighbor.y >= 0 && neighbor.y < currentCityMap.length) {
            if (currentCityMap[neighbor.y][neighbor.x] === 0) {
                neighbors.push(neighbor);
            }
        }
    }

    return neighbors;
}

// Calcula a distancia entre dois pontos(X,Y)
function heuristic(point, end) {
    return abs(point.x - end.x) + abs(point.y - end.y);
}

function reconstructPath(current) {
    let path = [];
    while (current.parent) {
        path.push(current);
        current = current.parent;
    }
    path.push(startPoint);
    return path.reverse();
}

// Função para alternar entre mapas de cidade
function switchCityMap() {
    if (currentCityMap === cityMap1) {
        currentCityMap = cityMap2;
    } else {
        currentCityMap = cityMap1;
    }
    // Redimensione o canvas com base no novo mapa de cidade
    resizeCanvas(currentCityMap[0].length * tileSize, currentCityMap.length * tileSize);
    // Redefina startPoint, endPoint e path
    startPoint = null;
    endPoint = null;
    path = [];
    redraw(); // Redesenha o novo mapa
}
