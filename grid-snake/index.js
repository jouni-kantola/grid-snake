const start = document.querySelector("#start");
const grid = document.querySelector(".grid");

let numberOfCells;

const snakeHeadCssClass = "head";
const snakeTailCssClass = "tail";
let numberOfColumns, numberOfRows;

const game = () => {
  let headPos = Math.floor(Math.random() * numberOfCells);
  let tailPos = headPos - 1;
  const cells = grid.querySelectorAll(".cell");

  setInterval(() => {
    requestAnimationFrame(() => {
      cells[headPos].classList.remove(snakeHeadCssClass);
      cells[tailPos].classList.remove(snakeTailCssClass);

      const row = Math.ceil(headPos / numberOfRows);
      headPos = headPos + 1;
      if (headPos / row >= numberOfColumns)
        headPos = (row - 1) * numberOfColumns + 1;
      tailPos = headPos - 1;

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
