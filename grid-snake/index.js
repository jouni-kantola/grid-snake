const start = document.querySelector("#start");
const grid = document.querySelector(".grid");
const score = document.querySelector(".score");
let gameloop;

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
  score: 0,
  snake: [],
  get head() {
    return this.snake[0];
  },
  get tail() {
    const tailLength = this.levelConfig.hearts - this.hearts.length + 1;
    return this.snake.slice(1, tailLength + 1);
  },
  get levelConfig() {
    const score = this.level * 10;
    const hearts = this.level + 1;
    const stops = this.level + 1;
    const levelSpeeds = [500, 450, 400, 350, 300, 250, 200, 150, 100];
    const speed = levelSpeeds[this.level - 1] || levelSpeeds.unshift();
    return { score, hearts, stops, speed };
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

  new Array(gameState.levelConfig.hearts)
    .fill(heartCssClass)
    .forEach(cssClass => {
      const heart = ensureFree(0, gameState.numberOfCells, gameState.hearts);
      gameState.hearts.push(heart);
      cells[heart].classList.add(cssClass);
    });

  //TODO: Only one heart can be on a one-way street
  new Array(gameState.levelConfig.stops).fill("stop").forEach(_ => {
    const stop = ensureFree(0, gameState.numberOfCells, [
      ...gameState.hearts,
      ...gameState.stops
    ]);
    gameState.stops.push(stop);
    cells[stop].classList.add("stop");
  });

  // TODO: Cannot start on the left (even if wrapping) nor right of a stop
  // If would start on left, would directly collide
  // If would start on right, tail would collide (should also consider tail's length)
  gameState.snake.push(
    ensureFree(1, gameState.numberOfCells, [
      ...gameState.hearts,
      ...gameState.stops
    ])
  );

  gameState.snake.push(gameState.head - 1);

  gameloop = setInterval(() => {
    requestAnimationFrame(() => {
      cells[gameState.head].classList.remove(snakeHeadCssClass);
      cells[gameState.head].classList.remove("right");
      cells[gameState.head].classList.remove("up");
      cells[gameState.head].classList.remove("down");
      cells[gameState.head].classList.remove("left");
      gameState.tail.forEach(index =>
        cells[index].classList.remove(snakeTailCssClass)
      );

      gameState.snake.unshift(updateSnake(gameState.head));

      const directionCssClass =
        gameState.direction === directions.right
          ? "right"
          : gameState.direction === directions.up
          ? "up"
          : gameState.direction === directions.down
          ? "down"
          : "left";

      if (
        gameState.stops.includes(gameState.head) ||
        gameState.tail.includes(gameState.head)
      ) {
        grid.classList.add("game-over");
        clearInterval(gameloop);
      } else if (gameState.hearts.includes(gameState.head)) {
        cells[gameState.head].classList.remove(heartCssClass);
        gameState.hearts = gameState.hearts.filter(
          heart => heart !== gameState.head
        );
        gameState.score += gameState.levelConfig.score;
        score.textContent = gameState.score;

        if (!gameState.hearts.length) {
          grid.classList.add("level-clear");
          clearInterval(gameloop);
        }
      }

      cells[gameState.head].classList.add(snakeHeadCssClass);
      cells[gameState.head].classList.add(directionCssClass);
      gameState.tail.forEach(index =>
        cells[index].classList.add(snakeTailCssClass)
      );
    });
  }, gameState.levelConfig.speed);
};

start.addEventListener("click", () => {
  gameState.numberOfColumns = +document.querySelector("#columns").value;
  gameState.numberOfRows = +document.querySelector("#rows").value;
  gameState.snake = [];
  gameState.hearts = [];
  gameState.stops = [];
  gameState.direction = directions.right;
  gameState.score = 0;
  clearInterval(gameloop);

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
    grid.classList.remove("level-clear");
    grid.style.gridTemplateColumns = `repeat(${gameState.numberOfColumns}, 2rem)`;
    cells.forEach(cell => {
      grid.appendChild(cell);
    });

    game();
  });
});

window.addEventListener("keydown", event => {
  switch (event.key) {
    case directions.left:
      gameState.direction = directions.left;
      break;
    case directions.up:
      gameState.direction = directions.up;
      break;
    case directions.right:
      gameState.direction = directions.right;
      break;
    case directions.down:
      gameState.direction = directions.down;
      break;
  }
});

function updateSnake(previous) {
  switch (gameState.direction) {
    case directions.left: {
      const row = Math.ceil(previous / gameState.numberOfRows);
      const updated = previous - 1;
      return previous % gameState.numberOfColumns === 0
        ? row * gameState.numberOfColumns + gameState.numberOfColumns - 1
        : updated;
    }
    case directions.up: {
      const updated = previous - gameState.numberOfColumns;
      return updated <= 0
        ? gameState.numberOfRows * gameState.numberOfColumns +
            (updated % gameState.numberOfColumns)
        : updated;
    }
    case directions.down: {
      const updated = previous + gameState.numberOfColumns;
      return updated / gameState.numberOfRows > gameState.numberOfRows
        ? previous % gameState.numberOfColumns
        : updated;
    }
    default: {
      let updated = previous + 1;
      return updated % gameState.numberOfColumns === 0
        ? updated - gameState.numberOfColumns
        : updated;
    }
  }
}
