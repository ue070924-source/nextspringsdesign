// スクロールで初めて画面に入った要素を表示する。
// data-reveal で動きの種類、data-delay で登場順（1段階 = 75ms）を指定する。
if ("IntersectionObserver" in window) {
  const revealTargets = [...document.querySelectorAll("[data-reveal]")];
  const pendingTargets = revealTargets.filter((element) => {
    return element.getBoundingClientRect().top >= window.innerHeight;
  });

  function reveal(element) {
    element.classList.remove("is-reveal-pending");
    revealObserver.unobserve(element);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        reveal(entry.target);
      }
    }
  });

  for (const element of pendingTargets) {
    const order = Number(element.dataset.delay) || 0;

    if (order > 0) {
      element.style.setProperty("--reveal-delay", `${order * 75}ms`);
    }

    element.classList.add("is-reveal-pending");
    revealObserver.observe(element);
  }

  // Tabキーで移動した先は、登場のタイミングを待たずその場で表示する。
  document.addEventListener("focusin", (event) => {
    const element = event.target.closest(".is-reveal-pending");

    if (element) {
      reveal(element);
    }
  });
}

// トップの写真は、最初の画面をスクロールする間だけ枠の内側で動かす。
const motionGallery = document.querySelector(".hero-gallery");
const allowMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");

if (motionGallery) {
  let galleryFrame = null;
  let previousPan = "";

  function updateGallery() {
    galleryFrame = null;
    const progress = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    const pan = `${(progress * 3).toFixed(2)}%`;

    if (pan !== previousPan) {
      motionGallery.style.setProperty("--gallery-pan", pan);
      previousPan = pan;
    }
  }

  function queueGalleryUpdate() {
    if (galleryFrame === null) {
      galleryFrame = requestAnimationFrame(updateGallery);
    }
  }

  function syncGalleryMotion() {
    if (allowMotion.matches) {
      window.addEventListener("scroll", queueGalleryUpdate, { passive: true });
      window.addEventListener("resize", queueGalleryUpdate);
      queueGalleryUpdate();
    } else {
      window.removeEventListener("scroll", queueGalleryUpdate);
      window.removeEventListener("resize", queueGalleryUpdate);

      if (galleryFrame !== null) {
        cancelAnimationFrame(galleryFrame);
        galleryFrame = null;
      }
    }
  }

  allowMotion.addEventListener("change", syncGalleryMotion);
  syncGalleryMotion();
}
