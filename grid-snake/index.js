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
  score: 0,
  snake: [],
  get head() {
    const [head, ...tail] = this.snake;
    return head;
  }
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

  gameState.snake.push(
    ensureFree(1, gameState.numberOfCells, [
      ...gameState.hearts,
      ...gameState.stops
    ])
  );

  // TODO: Ensure tail doesn't collide
  gameState.snake.push(gameState.head - 1);

  const intervalId = setInterval(() => {
    requestAnimationFrame(() => {
      cells[gameState.head].classList.remove(snakeHeadCssClass);
      cells[gameState.head].classList.remove("right");
      cells[gameState.head].classList.remove("up");
      cells[gameState.head].classList.remove("down");
      cells[gameState.head].classList.remove("left");
      cells[gameState.snake[1]].classList.remove(snakeTailCssClass);

      gameState.snake.unshift(updateSnake(gameState.head));

      const directionCssClass =
        gameState.direction === directions.right
          ? "right"
          : gameState.direction === directions.up
          ? "up"
          : gameState.direction === directions.down
          ? "down"
          : "left";

      if (gameState.stops.includes(gameState.head)) {
        grid.classList.add("game-over");
        clearInterval(intervalId);
      } else if (gameState.hearts.includes(gameState.head)) {
        cells[gameState.head].classList.remove(heartCssClass);
        gameState.hearts = gameState.hearts.filter(
          heart => heart !== gameState.head
        );
        gameState.score += levelConfig[gameState.level].score;
        score.textContent = gameState.score;

        if (!gameState.hearts.length) {
          grid.classList.add("level-clear");
          clearInterval(intervalId);
        }
      }

      cells[gameState.head].classList.add(snakeHeadCssClass);
      cells[gameState.head].classList.add(directionCssClass);
      cells[gameState.snake[1]].classList.add(snakeTailCssClass);
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

function updateSnake(previous) {
  const row = Math.ceil(previous / gameState.numberOfRows);
  let updated;
  if (gameState.direction === directions.right) {
    updated = previous + 1;
    if (updated / row === gameState.numberOfColumns)
      updated = (row - 1) * gameState.numberOfColumns;
  } else if (gameState.direction === directions.up) {
    updated = previous - gameState.numberOfColumns;
    if (updated <= 0) {
      updated =
        gameState.numberOfRows * gameState.numberOfColumns +
        (updated % gameState.numberOfColumns);
    }
  } else if (gameState.direction === directions.down) {
    updated = previous + gameState.numberOfColumns;
    if (updated / gameState.numberOfRows > gameState.numberOfRows)
      updated = previous % gameState.numberOfColumns;
  } else if (gameState.direction === directions.left) {
    updated = previous - 1;
    if (previous % gameState.numberOfColumns === 0) {
      updated = row * gameState.numberOfColumns + gameState.numberOfColumns - 1;
    }
  }
  return updated;
}
