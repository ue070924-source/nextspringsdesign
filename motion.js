const allowMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");

// 画面に入った要素を一度だけ表示する。data-delay は1段階35ms、最大105ms。
if (allowMotion.matches && "IntersectionObserver" in window) {
  const revealTargets = [...document.querySelectorAll("[data-reveal]")];
  const pendingTargets = revealTargets.filter((element) => {
    const bounds = element.getBoundingClientRect();

    return bounds.top >= window.innerHeight
      || (bounds.bottom > 0 && (bounds.left >= window.innerWidth || bounds.right <= 0));
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
  }, { rootMargin: "0px 0px 24px 0px" });

  for (const element of pendingTargets) {
    const order = Number(element.dataset.delay) || 0;

    if (order > 0) {
      element.style.setProperty("--reveal-delay", `${Math.min(order, 3) * 35}ms`);
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

if (motionGallery) {
  let galleryFrame = null;
  let previousPan = "";

  function updateGallery() {
    galleryFrame = null;
    const progress = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    const pan = `${(progress * 1.5).toFixed(2)}%`;

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
