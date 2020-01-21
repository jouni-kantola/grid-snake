const start = document.querySelector("#start");
const grid = document.querySelector(".grid");

const snakeHeadCssClass = "head";
const snakeTailCssClass = "tail";
const directions = {
  up: "ArrowUp",
  right: "ArrowRight",
  down: "ArrowDown",
  left: "ArrowLeft"
};

let gameState = {
  numberOfColumns: 0,
  numberOfRows: 0,
  get numberOfCells() {
    return this.numberOfColumns * this.numberOfRows;
  },
  level: 1,
  direction: directions.right,
  hearts: [],
  stops: []
};

const levelConfig = {
  1: {
    hearts: 2,
    stops: 2
  },
  2: {
    hearts: 3,
    stops: 3
  }
};

const ensureFree = (max, alreadyTaken = []) => {
  const rnd = Math.floor(Math.random() * max);
  return !alreadyTaken.includes(rnd) ? rnd : ensureFree(max, alreadyTaken);
};

const game = () => {
  const cells = grid.querySelectorAll(".cell");

  new Array(levelConfig[gameState.level].hearts).fill("heart").forEach(_ => {
    const heart = ensureFree(gameState.numberOfCells, gameState.hearts);
    gameState.hearts.push(heart);
    cells[heart].classList.add("heart");
  });

  new Array(levelConfig[gameState.level].stops).fill("stop").forEach(_ => {
    const stop = ensureFree(gameState.numberOfCells, [
      ...gameState.hearts,
      ...gameState.stops
    ]);
    gameState.stops.push(stop);
    cells[stop].classList.add("stop");
  });

  let headPos = ensureFree(gameState.numberOfCells, [
    ...gameState.hearts,
    ...gameState.stops
  ]);
  // TODO: Ensure tail doesn't collide
  let tailPos = headPos - 1;

  const intervalId = setInterval(() => {
    requestAnimationFrame(() => {
      cells[headPos].classList.remove(snakeHeadCssClass);
      cells[headPos].classList.remove("right");
      cells[headPos].classList.remove("up");
      cells[headPos].classList.remove("down");
      cells[headPos].classList.remove("left");
      cells[tailPos].classList.remove(snakeTailCssClass);

      let directionCssClass;

      // TODO: When wrapping, should just wrap around head
      const row = Math.ceil(headPos / gameState.numberOfRows);
      if (gameState.direction === directions.right) {
        headPos = headPos + 1;
        if (headPos / row >= gameState.numberOfColumns)
          headPos = (row - 1) * gameState.numberOfColumns + 1;
        tailPos = headPos - 1;
        directionCssClass = "right";
      } else if (gameState.direction === directions.up) {
        headPos = headPos - gameState.numberOfColumns;
        if (headPos <= 0)
          headPos =
            (gameState.numberOfRows - 1) * gameState.numberOfColumns +
            (headPos % gameState.numberOfColumns);
        tailPos = headPos + gameState.numberOfColumns;
        directionCssClass = "up";
      } else if (gameState.direction === directions.down) {
        if (row >= gameState.numberOfRows)
          headPos =
            gameState.numberOfColumns + (headPos % gameState.numberOfColumns);
        else
          headPos =
            row * gameState.numberOfColumns +
            (headPos % gameState.numberOfColumns);

        tailPos = headPos - gameState.numberOfColumns;
        directionCssClass = "down";
      } else if (gameState.direction === directions.left) {
        if (headPos % gameState.numberOfColumns === 0) {
          headPos =
            row * gameState.numberOfColumns + gameState.numberOfColumns - 2;
        } else {
          headPos = headPos - 1;
        }
        tailPos = headPos + 1;
        directionCssClass = "left";
      }

      if (gameState.stops.includes(headPos)) {
        grid.classList.add("game-over");
        clearInterval(intervalId);
      }
      cells[headPos].classList.add(snakeHeadCssClass);
      cells[headPos].classList.add(directionCssClass);
      cells[tailPos].classList.add(snakeTailCssClass);
    });
  }, 400);
};

start.addEventListener("click", () => {
  gameState.numberOfColumns = +document.querySelector("#columns").value;
  gameState.numberOfRows = +document.querySelector("#rows").value;
  gameState.hearts = [];
  gameState.stops = [];
  gameState.direction = directions.right;

  const cells = new Array(gameState.numberOfCells)
    .fill(document.createElement("span"))
    .map(span => {
      const cell = span.cloneNode();
      cell.classList.add("cell");
      return cell;
    });

  requestAnimationFrame(() => {
    grid.innerHTML = "";
    grid.classList.remove("game-over");
    grid.style.gridTemplateColumns = `repeat(${gameState.numberOfColumns}, 2rem)`;
    cells.forEach(cell => {
      grid.appendChild(cell);
    });

    game();
  });
});

window.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowLeft":
      gameState.direction = directions.left;
      break;
    case "ArrowUp":
      gameState.direction = directions.up;
      break;
    case "ArrowRight":
      gameState.direction = directions.right;
      break;
    case "ArrowDown":
      gameState.direction = directions.down;
      break;
  }
});
