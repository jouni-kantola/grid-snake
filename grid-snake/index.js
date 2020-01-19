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
    apples: 2,
    rocks: 2
  },
  2: {
    apples: 3,
    rocks: 3
  }
};
const game = () => {
  const cells = grid.querySelectorAll(".cell");

  // TODO: prevent collisions
  let level = 1;
  const startLevelConfig = levelConfig[level];
  const apples = new Array(startLevelConfig.apples)
    .fill("apple")
    .map(apple => Math.floor(Math.random() * numberOfCells))
    .forEach(applePos => cells[applePos].classList.add("apple"));

  const rocks = new Array(startLevelConfig.apples)
    .fill("rock")
    .map(rock => Math.floor(Math.random() * numberOfCells))
    .forEach(rockPos => cells[rockPos].classList.add("rock"));

  let headPos = Math.floor(Math.random() * numberOfCells);
  let tailPos = headPos - 1;

  setInterval(() => {
    requestAnimationFrame(() => {
      cells[headPos].classList.remove(snakeHeadCssClass);
      cells[tailPos].classList.remove(snakeTailCssClass);

      // TODO: When wrapping, should just wrap around head
      const row = Math.ceil(headPos / numberOfRows);

      if (direction === directions.right) {
        headPos = headPos + 1;
        if (headPos / row >= numberOfColumns)
          headPos = (row - 1) * numberOfColumns + 1;
        tailPos = headPos - 1;
      } else if (direction === directions.up) {
        headPos = headPos - numberOfColumns;
        if (headPos <= 0)
          headPos =
            (numberOfRows - 1) * numberOfColumns + (headPos % numberOfColumns);
        tailPos = headPos + numberOfColumns;
      } else if (direction === directions.down) {
        if (row >= numberOfRows)
          headPos = numberOfColumns + (headPos % numberOfColumns);
        else headPos = row * numberOfColumns + (headPos % numberOfColumns);

        tailPos = headPos - numberOfColumns;
      } else if (direction === directions.left) {
        if (headPos % numberOfColumns === 0) {
          headPos = row * numberOfColumns + numberOfColumns - 2;
        } else {
          headPos = headPos - 1;
        }
        tailPos = headPos + 1;
      }

      cells[headPos].classList.add(snakeHeadCssClass);
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
