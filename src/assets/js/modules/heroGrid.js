"use strict";

import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initHeroGrid() {
  const heroGrid = document.querySelector(".hero-grid");

  if (!heroGrid) return;

  const clickableCells = heroGrid.querySelectorAll(
    ".hero-grid-cell-mot, .hero-grid-cell-edito, .hero-grid-cell-priorites",
  );

  // ==========================================================================
  // lignes de la grille
  // ==========================================================================

  // On lit la grille directement depuis le CSS.
  // Ça évite que le JS écrase la media query mobile quand aucun expand n'est ouvert.
  function getCssRows() {
    return getComputedStyle(heroGrid).gridTemplateRows;
  }

  function getRowsArray() {
    return getCssRows().split(" ");
  }

  // Remplace une ligne 0px par la vraie hauteur de l'expand.
  // rowIndex est en base 0 : ligne CSS 5 = index 4.
  function getRowsWithOpenExpand(rowIndex, expandHeight) {
    const rows = getRowsArray();

    // Remet les lignes des autres expands à 0, au cas où leur transition de
    // fermeture ne serait pas terminée (sinon on figerait une hauteur intermédiaire).
    ["r2", "r3", "r4"].forEach((rowType) => {
      const otherRowIndex = getExpandRowIndex(rowType);
      if (otherRowIndex !== undefined) rows[otherRowIndex] = "0px";
    });

    rows[rowIndex] = `${expandHeight}px`;

    return rows.join(" ");
  }

  function getExpandRowIndex(rowType) {
    const rows = {
      // desktop : r2 = ligne 3, r3 = ligne 5, r4 = ligne 7
      // mobile avec ton CSS : r3 = ligne 5, r2 = ligne 14, r4 = ligne 17
      r2: window.matchMedia("(max-width: 768px)").matches ? 13 : 2,
      r3: window.matchMedia("(max-width: 768px)").matches ? 4 : 4,
      r4: window.matchMedia("(max-width: 768px)").matches ? 16 : 6,
    };

    return rows[rowType];
  }

  // ==========================================================================
  // ouverture / fermeture des expands
  // ==========================================================================

  function closeAll() {
    // Très important : on enlève la valeur inline pour redonner la main au CSS.
    heroGrid.style.removeProperty("grid-template-rows");

    heroGrid.classList.remove("open-r2", "open-r3", "open-r4");

    clickableCells.forEach((cell) => {
      cell.classList.remove("active");
    });

    // Remet "voir plus" par défaut quand on referme une ligne.
    heroGrid.querySelectorAll(".hero-grid-expand").forEach((expand) => {
      expand.classList.remove("is-expanded");
    });
  }

  // Calcule la vraie hauteur de l'expand et l'injecte à la bonne ligne.
  // On fait ça parce qu'une transition CSS ne peut pas animer proprement vers "auto".
  function openRow(rowType) {
    const expand = heroGrid.querySelector(`.hero-grid-expand-${rowType}`);
    const rowIndex = getExpandRowIndex(rowType);

    if (!expand || rowIndex === undefined) return;

    // On enlève d'abord l'inline style pour repartir de la grille CSS actuelle.
    heroGrid.style.removeProperty("grid-template-rows");

    const expandHeight = expand.scrollHeight;
    const rowHeights = getRowsWithOpenExpand(rowIndex, expandHeight);

    heroGrid.classList.add(`open-${rowType}`);
    heroGrid.style.gridTemplateRows = rowHeights;
  }

  clickableCells.forEach((cell) => {
    cell.addEventListener("click", (event) => {
      event.preventDefault();

      const rowType = cell.getAttribute("data-row");

      if (!rowType) return;

      const isAlreadyOpen = heroGrid.classList.contains(`open-${rowType}`);

      closeAll();

      if (!isAlreadyOpen) {
        cell.classList.add("active");

        // Attend le prochain frame pour mesurer la hauteur une fois le DOM stable.
        requestAnimationFrame(() => {
          openRow(rowType);
        });
      }
    });
  });

  // ==========================================================================
  // fermeture au clic sur un lien du hero (contact, sessions, etc.)
  // ==========================================================================

  heroGrid.querySelectorAll("a.hero-grid-cell, .hero-grid-cell a").forEach((link) => {
    link.addEventListener("click", () => {
      closeAll();
    });
  });

  // ==========================================================================
  // voir plus / voir moins
  // ==========================================================================

  heroGrid.querySelectorAll(".hero-grid-expand").forEach((expand) => {
    const suite = expand.querySelector(".hero-grid-expand-text-suite");
    const voirPlus = expand.querySelector(".hero-grid-voir-plus");
    const voirMoins = expand.querySelector(".hero-grid-voir-moins");

    if (!suite || !voirPlus || !voirMoins) return;

    const rowType = [...expand.classList]
      .find((className) => /^hero-grid-expand-r\d$/.test(className))
      ?.replace("hero-grid-expand-", "");

    // Si cet expand est déjà ouvert, on recalcule sa hauteur après le toggle.
    const refreshHeightIfOpen = () => {
      if (rowType && heroGrid.classList.contains(`open-${rowType}`)) {
        requestAnimationFrame(() => {
          openRow(rowType);
        });
      }
    };

    voirPlus.addEventListener("click", () => {
      expand.classList.add("is-expanded");
      refreshHeightIfOpen();
    });

    voirMoins.addEventListener("click", () => {
      expand.classList.remove("is-expanded");
      refreshHeightIfOpen();
    });
  });

  // ==========================================================================
  // recalcul au resize
  // ==========================================================================

  window.addEventListener("resize", () => {
    const openedRow = ["r2", "r3", "r4"].find((rowType) =>
      heroGrid.classList.contains(`open-${rowType}`),
    );

    if (openedRow) {
      requestAnimationFrame(() => {
        openRow(openedRow);
      });
    } else {
      heroGrid.style.removeProperty("grid-template-rows");
    }

    ScrollTrigger.refresh();
  });
}
