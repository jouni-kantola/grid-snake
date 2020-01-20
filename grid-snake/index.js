const start = document.querySelector("#start");
const grid = document.querySelector(".grid");

const snakeHeadCssClass = "head";
const snakeTailCssClass = "tail";
let numberOfColumns, numberOfRows, numberOfCells;
const directions = {
  up: "ArrowUp",
  right: "ArrowRight",
  down: "ArrowDown",
  left: "ArrowLeft"
};
let direction = directions.right;

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
const game = () => {
  const cells = grid.querySelectorAll(".cell");

  // TODO: prevent collisions
  let level = 1;
  const startLevelConfig = levelConfig[level];
  new Array(startLevelConfig.hearts)
    .fill("heart")
    .map(_ => Math.floor(Math.random() * numberOfCells))
    .forEach(heartPos => cells[heartPos].classList.add("heart"));

  new Array(startLevelConfig.hearts)
    .fill("stop")
    .map(_ => Math.floor(Math.random() * numberOfCells))
    .forEach(stopPos => cells[stopPos].classList.add("stop"));

  let headPos = Math.floor(Math.random() * numberOfCells);
  let tailPos = headPos - 1;

  setInterval(() => {
    requestAnimationFrame(() => {
      cells[headPos].classList.remove(snakeHeadCssClass);
      cells[headPos].classList.remove("right");
      cells[headPos].classList.remove("up");
      cells[headPos].classList.remove("down");
      cells[headPos].classList.remove("left");
      cells[tailPos].classList.remove(snakeTailCssClass);

      // TODO: When wrapping, should just wrap around head
      const row = Math.ceil(headPos / numberOfRows);
      let directionCssClass;

      if (direction === directions.right) {
        headPos = headPos + 1;
        if (headPos / row >= numberOfColumns)
          headPos = (row - 1) * numberOfColumns + 1;
        tailPos = headPos - 1;
        directionCssClass = "right";
      } else if (direction === directions.up) {
        headPos = headPos - numberOfColumns;
        if (headPos <= 0)
          headPos =
            (numberOfRows - 1) * numberOfColumns + (headPos % numberOfColumns);
        tailPos = headPos + numberOfColumns;
        directionCssClass = "up";
      } else if (direction === directions.down) {
        if (row >= numberOfRows)
          headPos = numberOfColumns + (headPos % numberOfColumns);
        else headPos = row * numberOfColumns + (headPos % numberOfColumns);

        tailPos = headPos - numberOfColumns;
        directionCssClass = "down";
      } else if (direction === directions.left) {
        if (headPos % numberOfColumns === 0) {
          headPos = row * numberOfColumns + numberOfColumns - 2;
        } else {
          headPos = headPos - 1;
        }
        tailPos = headPos + 1;
        directionCssClass = "left";
      }

      cells[headPos].classList.add(snakeHeadCssClass);
      cells[headPos].classList.add(directionCssClass);
      cells[tailPos].classList.add(snakeTailCssClass);
    });
  }, 400);
};

start.addEventListener("click", () => {
  numberOfColumns = +document.querySelector("#columns").value;
  numberOfRows = +document.querySelector("#rows").value;

  numberOfCells = numberOfColumns * numberOfRows;
  const cells = new Array(numberOfCells)
    .fill(document.createElement("span"))
    .map(span => {
      const cell = span.cloneNode();
      cell.classList.add("cell");
      return cell;
    });

  requestAnimationFrame(() => {
    grid.style.gridTemplateColumns = `repeat(${numberOfColumns}, 2rem)`;
    cells.forEach(cell => {
      grid.appendChild(cell);
    });

    game();
  });
});

window.addEventListener("keydown", event => {
  switch (event.key) {
    case "ArrowLeft":
      direction = directions.left;
      break;
    case "ArrowUp":
      direction = directions.up;
      break;
    case "ArrowRight":
      direction = directions.right;
      break;
    case "ArrowDown":
      direction = directions.down;
      break;
  }
});
