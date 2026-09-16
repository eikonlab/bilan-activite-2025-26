"use strict";

const clearBootClasses = () => {
  document.documentElement.classList.remove(
    "boot-loader-dough",
    "boot-loader-tetris",
  );
};

const hideLoader = (selector, delay) => {
  setTimeout(() => {
    const loader = document.querySelector(selector);
    if (!loader) return;
    loader.style.transition = "opacity 0.5s ease-out";
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.classList.remove("active");
      loader.style.opacity = "";
      document.body.classList.remove("loading");
      clearBootClasses();
    }, 1000);
  }, delay);
};

export function initLoader() {
  document.body.classList.add("loading");

  const isDough = sessionStorage.getItem("dough");
  sessionStorage.removeItem("dough");

  if (isDough) {
    document.documentElement.classList.add("boot-loader-dough");
    document.documentElement.classList.remove("boot-loader-tetris");
    document.querySelector(".loader-dough")?.classList.add("active");
    hideLoader(".loader-dough", 1500);
  } else {
    document.documentElement.classList.add("boot-loader-tetris");
    document.documentElement.classList.remove("boot-loader-dough");
    document.querySelector(".loader-tetris")?.classList.add("active");
    hideLoader(".loader-tetris", 3000);
  }
}

export function initDoughNavigation() {
  document.querySelectorAll(".projet-page-retour").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const href = el.getAttribute("href");
      if (!href) return;

      sessionStorage.setItem("dough", "true");

      // Affiche le loader pâte tout de suite, avant le changement de page
      document.body.classList.add("loading");
      document.documentElement.classList.add("boot-loader-dough");
      document.documentElement.classList.remove("boot-loader-tetris");
      document.querySelector(".loader-dough")?.classList.add("active");

      requestAnimationFrame(() => {
        window.location.href = href;
      });
    });
  });
}
