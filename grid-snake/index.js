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
    const tailLength = levelConfig[this.level].hearts - this.hearts.length + 1;
    return this.snake.slice(1, tailLength + 1);
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
        gameState.score += levelConfig[gameState.level].score;
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
  }, 400);
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
