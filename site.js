// 制作事例をカード1枚ずつ切り替える。スマホはスワイプでも操作できる。
const projectTrack = document.querySelector(".project-track");
const projectControls = document.querySelector(".project-controls");

if (projectTrack && projectControls) {
  const projects = [...projectTrack.querySelectorAll(".project")];
  const previousButton = projectControls.querySelector('[data-direction="-1"]');
  const nextButton = projectControls.querySelector('[data-direction="1"]');
  const projectStatus = projectControls.querySelector(".project-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let targetPosition = null;
  let scrollTimer;

  function maxScroll() {
    return projectTrack.scrollWidth - projectTrack.clientWidth;
  }

  function offsetFor(project) {
    return project.offsetLeft - projects[0].offsetLeft;
  }

  function updateControls() {
    const leftEdge = projectTrack.scrollLeft;
    const rightEdge = leftEdge + projectTrack.clientWidth;
    const visible = projects.filter((project) => {
      const center = offsetFor(project) + project.offsetWidth / 2;

      return center >= leftEdge && center <= rightEdge;
    });

    if (visible.length) {
      const first = projects.indexOf(visible[0]) + 1;
      const last = first + visible.length - 1;
      const range = first === last ? first : `${first}–${last}`;
      const status = `${range} / ${projects.length}`;

      if (projectStatus.textContent !== status) {
        projectStatus.textContent = status;
      }
    }

    previousButton.setAttribute("aria-disabled", String(leftEdge <= 1));
    nextButton.setAttribute("aria-disabled", String(leftEdge >= maxScroll() - 1));
    projectControls.hidden = maxScroll() <= 1;
  }

  function moveProject(direction) {
    if (projects.length < 2) {
      return;
    }

    const step = offsetFor(projects[1]);
    const position = targetPosition ?? projectTrack.scrollLeft;
    const nextIndex = Math.round(position / step) + direction;
    const nextPosition = Math.max(0, Math.min(nextIndex * step, maxScroll()));

    if (Math.abs(nextPosition - position) <= 1) {
      return;
    }

    targetPosition = nextPosition;
    projectTrack.scrollTo({
      left: nextPosition,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  }

  projectTrack.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      targetPosition = null;
      updateControls();
    }, 140);
  }, { passive: true });

  projectTrack.addEventListener("keydown", (event) => {
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];

    if (event.target === projectTrack && direction) {
      event.preventDefault();
      moveProject(direction);
    }
  });

  previousButton.addEventListener("click", () => moveProject(-1));
  nextButton.addEventListener("click", () => moveProject(1));

  new ResizeObserver(() => {
    targetPosition = null;
    updateControls();
  }).observe(projectTrack);

  projectTrack.dataset.enhanced = "";
  updateControls();
}

// スマホでは、画面内に相談ボタンがある間とフッター付近で追従バーを隠す。
const mobileConsultation = document.querySelector(".mobile-consultation");

if (mobileConsultation && "IntersectionObserver" in window) {
  const visibleTargets = new Set();
  const consultationObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        visibleTargets.add(entry.target);
      } else {
        visibleTargets.delete(entry.target);
      }
    }

    mobileConsultation.hidden = visibleTargets.size > 0;
  }, { rootMargin: "0px 0px 68px 0px" });

  for (const target of document.querySelectorAll("[data-consultation-target]")) {
    consultationObserver.observe(target);
  }
}
