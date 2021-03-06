const start = document.querySelector("#start");
const grid = document.querySelector(".grid");
const score = document.querySelector(".score");
const level = document.querySelector(".level");
let useHip = true;
let gameloop;

const snakeHeadCssClass = "head";
const snakeTailCssClass = "tail";
const heartCssClass = "heart";

const directions = {
  up: "ArrowUp",
  right: "ArrowRight",
  down: "ArrowDown",
  left: "ArrowLeft",
};

const Snake = (numberOfColumns, numberOfRows) => {
  return {
    move: (from, direction) => {
      switch (direction) {
        case directions.left: {
          const updated = from - 1;
          const row = Math.ceil(updated / numberOfColumns);
          const wrapAround = from % numberOfColumns === 0;
          if (wrapAround && !useHip) {
            return false;
          }
          return wrapAround
            ? row * numberOfColumns + numberOfColumns - 1
            : updated;
        }
        case directions.up: {
          const updated = from - numberOfColumns;
          const wrapAround = updated < 0;
          if (wrapAround && !useHip) return false;
          return wrapAround
            ? numberOfRows * numberOfColumns +
                (from % numberOfColumns) -
                numberOfColumns
            : updated;
        }
        case directions.down: {
          const updated = from + numberOfColumns;
          const wrapAround =
            Math.ceil(updated / numberOfColumns) > numberOfRows ||
            updated >= numberOfColumns * numberOfRows;
          if (wrapAround && !useHip) return false;
          return wrapAround ? from % numberOfColumns : updated;
        }
        default: {
          let updated = from + 1;
          const wrapAround = updated % numberOfColumns === 0;
          if (wrapAround && !useHip) return false;
          return wrapAround ? updated - numberOfColumns : updated;
        }
      }
    },
  };
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
  tailLength: 0,
  levelSpeeds: [Infinity, 500, 450, 400, 350, 300, 250, 200, 150, 100],
  scoreUp: function () {
    this.score += this.level * 10;
  },
  get head() {
    return this.snake[0];
  },
  get tail() {
    return this.snake.slice(1, this.tailLength + 1);
  },
  get speed() {
    return (
      this.levelSpeeds[this.level] ||
      this.levelSpeeds[this.levelSpeeds.length - 1]
    );
  },
  gameOver: false,
};

const ensureFree = (min, max, alreadyTaken = []) => {
  const rnd = Math.floor(Math.random() * max);
  return rnd >= min && !alreadyTaken.includes(rnd)
    ? rnd
    : ensureFree(min, max, alreadyTaken);
};

const game = snake => {
  grid.classList.remove("level-clear");
  gameState.hearts = [];
  gameState.stops = [];
  const cells = grid.querySelectorAll(".cell");
  cells.forEach(cell => {
    cell.classList.remove("heart");
    cell.classList.remove("stop");
  });

  new Array(useHip ? gameState.level + 1 : 1)
    .fill(heartCssClass)
    .forEach(cssClass => {
      const heart = ensureFree(0, gameState.numberOfCells, [
        gameState.head,
        ...gameState.tail,
        gameState.hearts,
      ]);
      gameState.hearts.push(heart);
      cells[heart].classList.add(cssClass);
    });

  if (useHip)
    new Array(gameState.level + 1).fill("stop").forEach(_ => {
      const stop = ensureFree(0, gameState.numberOfCells, [
        gameState.head,
        ...gameState.tail,
        ...gameState.hearts,
        ...gameState.stops,
      ]);
      gameState.stops.push(stop);
      cells[stop].classList.add("stop");
    });

  if (gameState.level === 1) {
    gameState.snake.push(
      ensureFree(1, gameState.numberOfCells, [
        ...gameState.hearts,
        ...gameState.stops,
      ])
    );

    gameState.snake.push(gameState.head - 1);
  }

  let lastTick = 0;
  gameloop = requestAnimationFrame(function render(timestamp) {
    if (timestamp - lastTick > gameState.speed) {
      lastTick = timestamp;
      cells[gameState.head].classList.remove(
        snakeHeadCssClass,
        "right",
        "up",
        "down",
        "left"
      );
      cells[gameState.tail[gameState.tail.length - 1]].classList.remove(
        snakeTailCssClass
      );

      const next = snake.move(gameState.head, gameState.direction);
      if (next !== false) gameState.snake.unshift(next);
      else {
        gameState.gameOver = true;
      }

      if (
        gameState.stops.includes(gameState.head) ||
        gameState.tail.includes(gameState.head)
      ) {
        gameState.gameOver = true;
      } else if (gameState.hearts.includes(gameState.head)) {
        cells[gameState.head].classList.remove(heartCssClass);
        gameState.hearts = gameState.hearts.filter(
          heart => heart !== gameState.head
        );
        gameState.tailLength++;
        gameState.scoreUp();
        score.textContent = gameState.score;
      }

      const directionCssClass =
        gameState.direction === directions.right
          ? "right"
          : gameState.direction === directions.up
          ? "up"
          : gameState.direction === directions.down
          ? "down"
          : "left";

      cells[gameState.head].classList.add(snakeHeadCssClass, directionCssClass);
      cells[gameState.tail[0]].classList.add(snakeTailCssClass);
    }

    if (gameState.gameOver) {
      grid.classList.add("game-over");
    } else if (!gameState.hearts.length) {
      grid.classList.add("level-clear");
      gameState.level++;
      level.textContent = gameState.level;
      game(snake);
    } else {
      gameloop = requestAnimationFrame(render);
    }
  });
};

start.addEventListener("click", () => {
  document.activeElement.blur();
  useHip =
    document.querySelector('input[name="game-style"]:checked').value === "hip";
  if (useHip) {
    grid.classList.add("hip");
    grid.classList.remove("vintage");
  } else {
    grid.classList.remove("hip");
    grid.classList.add("vintage");
  }
  grid.classList.remove("game-over");
  gameState.gameOver = false;
  gameState.numberOfColumns = +document.querySelector("#columns").value;
  gameState.numberOfRows = +document.querySelector("#rows").value;
  gameState.level = 1;
  gameState.snake = [];
  gameState.tailLength = 1;
  gameState.direction = directions.right;
  gameState.score = 0;

  cancelAnimationFrame(gameloop);

  const cells = new Array(gameState.numberOfCells)
    .fill(document.createElement("span"))
    .map(span => {
      const cell = span.cloneNode();
      cell.classList.add("cell");
      return cell;
    });

  requestAnimationFrame(() => {
    level.textContent = gameState.level;
    score.textContent = gameState.score;

    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${gameState.numberOfColumns}, 1fr)`;
    cells.forEach(cell => {
      grid.appendChild(cell);
    });

    const snake = Snake(gameState.numberOfColumns, gameState.numberOfRows);

    game(snake);
  });
});

const updateDirection = direction => {
  switch (direction) {
    case directions.left:
    case directions.right:
      if (
        gameState.direction !== directions.left &&
        gameState.direction !== directions.right
      )
        gameState.direction = direction;
      break;
    case directions.up:
    case directions.down:
      if (
        gameState.direction !== directions.up &&
        gameState.direction !== directions.down
      )
        gameState.direction = direction;
      break;
  }
};

window.addEventListener("keydown", event => {
  switch (event.key) {
    case directions.left:
      updateDirection(directions.left);
      break;
    case directions.up:
      updateDirection(directions.up);
      break;
    case directions.right:
      updateDirection(directions.right);
      break;
    case directions.down:
      updateDirection(directions.down);
      break;
  }
});

if (window.matchMedia("(pointer: coarse)").matches) {
  document
    .querySelector(".left")
    .addEventListener("touchstart", () => updateDirection(directions.left), {
      passive: true,
    });

  document
    .querySelector(".up")
    .addEventListener("touchstart", () => updateDirection(directions.up), {
      passive: true,
    });

  document
    .querySelector(".down")
    .addEventListener("touchstart", () => updateDirection(directions.down), {
      passive: true,
    });

  document
    .querySelector(".right")
    .addEventListener("touchstart", () => updateDirection(directions.right), {
      passive: true,
    });
}
