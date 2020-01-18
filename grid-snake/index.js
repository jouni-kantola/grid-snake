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

const game = () => {
  let headPos = Math.floor(Math.random() * numberOfCells);
  let tailPos = headPos - 1;
  const cells = grid.querySelectorAll(".cell");

  setInterval(() => {
    requestAnimationFrame(() => {
      cells[headPos].classList.remove(snakeHeadCssClass);
      cells[tailPos].classList.remove(snakeTailCssClass);

      // TODO: When wrapping, should just wrap around head
      if (direction === directions.right) {
        const row = Math.ceil(headPos / numberOfRows);
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
