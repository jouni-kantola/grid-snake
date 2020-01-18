const start = document.querySelector("#start");
const grid = document.querySelector(".grid");

start.addEventListener("click", () => {
  const numberOfColumns = +document.querySelector("#columns").value;
  const numberOfRows = +document.querySelector("#rows").value;

  const cells = new Array(numberOfColumns * numberOfRows)
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
  });
});
