"use strict";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Draggable } from "gsap/Draggable";
import { SplitText } from "gsap/SplitText";

import { initLoader, initDoughNavigation } from "./modules/pageLoader.js";
import { initPortfolioModal } from "./modules/portfolioModal.js";
import { initBiographyModal } from "./modules/biographyModal.js";
import { initFooterMarquee } from "./modules/footerMarquee.js";
import { initHeroGrid } from "./modules/heroGrid.js";
import { initEasterEggRotate } from "./modules/easterEggRotate.js";
import { initProjetPageThumbnail } from "./modules/projetPageThumbnail.js";
import { initSplitTextReveal } from "./modules/splitTextReveal.js";
import { initImagesBatchReveal } from "./modules/imagesBatchReveal.js";
import { initScrollTopButton } from "./modules/scrollTopButton.js";
import { initTeamExplosion } from "./modules/teamExplosion.js";
import { initProjectGalleryParallax } from "./modules/projectGalleryParallax.js";
import { initDvdScreensaver } from "./modules/screensaverDvd.js";
import { initVodPlayers } from "./modules/vodPlayer.js";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Draggable, SplitText);

// Le loader et l'écran de veille doivent démarrer dès que possible,
// sans attendre DOMContentLoaded.
initLoader();
initDvdScreensaver();

document.addEventListener("DOMContentLoaded", () => {
  initPortfolioModal();
  initBiographyModal();
  initFooterMarquee();
  initHeroGrid();
  initEasterEggRotate();
  initProjetPageThumbnail();
  initSplitTextReveal();
  initImagesBatchReveal();
  initScrollTopButton();
  initDoughNavigation();
  initVodPlayers();
});

window.addEventListener("load", () => {
  initTeamExplosion();
  initProjectGalleryParallax();
});
