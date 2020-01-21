const start = document.querySelector("#start");
const grid = document.querySelector(".grid");
const score = document.querySelector(".score");

const snakeHeadCssClass = "head";
const snakeTailCssClass = "tail";
const heartCssClass = "heart";

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
  stops: [],
  score: 0
};

const levelConfig = {
  1: {
    hearts: 2,
    score: 10,
    stops: 2
  },
  2: {
    hearts: 3,
    score: 20,
    stops: 3
  }
};

const ensureFree = (min, max, alreadyTaken = []) => {
  const rnd = Math.floor(Math.random() * max);
  return rnd >= min && !alreadyTaken.includes(rnd)
    ? rnd
    : ensureFree(min, max, alreadyTaken);
};

const game = () => {
  const cells = grid.querySelectorAll(".cell");

  new Array(levelConfig[gameState.level].hearts)
    .fill(heartCssClass)
    .forEach(cssClass => {
      const heart = ensureFree(0, gameState.numberOfCells, gameState.hearts);
      gameState.hearts.push(heart);
      cells[heart].classList.add(cssClass);
    });

  new Array(levelConfig[gameState.level].stops).fill("stop").forEach(_ => {
    const stop = ensureFree(0, gameState.numberOfCells, [
      ...gameState.hearts,
      ...gameState.stops
    ]);
    gameState.stops.push(stop);
    cells[stop].classList.add("stop");
  });

  let headPos = ensureFree(1, gameState.numberOfCells, [
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

      // TODO: When wrapping, should just wrap around head
      // TODO: Ensure tail doesn't wrap out of bounds
      const row = Math.ceil(headPos / gameState.numberOfRows);
      if (gameState.direction === directions.right) {
        headPos = headPos + 1;
        if (headPos / row >= gameState.numberOfColumns)
          headPos = (row - 1) * gameState.numberOfColumns + 1;
        tailPos = headPos - 1;
      } else if (gameState.direction === directions.up) {
        headPos = headPos - gameState.numberOfColumns;
        if (headPos <= 0) {
          headPos =
            gameState.numberOfRows * gameState.numberOfColumns +
            (headPos % gameState.numberOfColumns);
          tailPos = headPos % gameState.numberOfColumns;
        } else {
          tailPos = headPos + gameState.numberOfColumns;
        }
      } else if (gameState.direction === directions.down) {
        if (row >= gameState.numberOfRows)
          headPos =
            gameState.numberOfColumns + (headPos % gameState.numberOfColumns);
        else
          headPos =
            row * gameState.numberOfColumns +
            (headPos % gameState.numberOfColumns);

        tailPos = headPos - gameState.numberOfColumns;
      } else if (gameState.direction === directions.left) {
        if (headPos % gameState.numberOfColumns === 0) {
          headPos =
            row * gameState.numberOfColumns + gameState.numberOfColumns - 2;
        } else {
          headPos = headPos - 1;
        }
        tailPos = headPos + 1;
      }

      const directionCssClass =
        gameState.direction === directions.right
          ? "right"
          : gameState.direction === directions.up
          ? "up"
          : gameState.direction === directions.down
          ? "down"
          : "left";

      if (gameState.stops.includes(headPos)) {
        grid.classList.add("game-over");
        clearInterval(intervalId);
      } else if (gameState.hearts.includes(headPos)) {
        cells[headPos].classList.remove(heartCssClass);
        gameState.hearts = gameState.hearts.filter(heart => heart !== headPos);
        gameState.score += levelConfig[gameState.level].score;
        score.textContent = gameState.score;

        if (!gameState.hearts.length) {
          grid.classList.add("level-clear");
          clearInterval(intervalId);
        }
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
  gameState.score = 0;

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
