const cards = [...document.querySelectorAll(".adventure-card")];

cards.forEach((card, index) => {
  card.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    cards[(index + direction + cards.length) % cards.length].focus();
  });
});
