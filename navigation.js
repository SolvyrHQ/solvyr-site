const menus = [...document.querySelectorAll(".tabs .navDropdown")];

function closeOutside(target) {
  for (const menu of menus) {
    if (menu.open && !menu.contains(target)) menu.open = false;
  }
}

document.addEventListener("click", (event) => closeOutside(event.target));
document.addEventListener("focusin", (event) => closeOutside(event.target));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const menu = menus.find((item) => item.open);
  if (!menu) return;
  event.preventDefault();
  menu.open = false;
  menu.querySelector("summary")?.focus();
});
