// 制作事例のカルーセル
const carousel = document.querySelector(".carousel");
const track = carousel.querySelector(".work-track");
const controls = carousel.querySelector(".carousel-controls");
const projects = [...track.querySelectorAll(".project")];
const dots = [...controls.querySelectorAll("[data-slide]")];
const status = carousel.querySelector("[data-carousel-status]");
const mobileLayout = window.matchMedia("(max-width: 850px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// PCで最後の作品を左端に表示するため、その右側に先頭の2枚を並べる。
for (const project of projects.slice(0, 2)) {
  const clone = project.cloneNode(true);
  clone.classList.add("is-clone");
  clone.setAttribute("aria-hidden", "true");
  clone.removeAttribute("aria-label");
  clone.querySelector(".project-link")?.remove();
  clone.inert = true;
  track.append(clone);
}

let activeIndex = 0;
let pendingIndex = null;
let scrollTimer;

function offsetFor(project) {
  return project.offsetLeft - projects[0].offsetLeft;
}

function setCurrent(index) {
  activeIndex = index;
  dots.forEach((dot, position) => {
    if (position === index) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });

  const title = projects[index].querySelector("h3").textContent;
  status.textContent = `${index + 1} / ${projects.length}　${title}`;
}

function showProject(index, smooth = true) {
  const nextIndex = (index + projects.length) % projects.length;
  const left = offsetFor(projects[nextIndex]);
  const shouldAnimate = smooth && !reducedMotion.matches;
  const willScroll = Math.abs(track.scrollLeft - left) > 1;

  pendingIndex = shouldAnimate && willScroll ? nextIndex : null;
  setCurrent(nextIndex);

  track.scrollTo({
    left,
    behavior: shouldAnimate ? "smooth" : "instant",
  });
}

// スワイプやスクロールが止まったら、最も左端に近い作品を選択状態にする。
function settleScroll() {
  pendingIndex = null;

  const nearest = projects.reduce((best, project, index) => {
    const distance = Math.abs(track.scrollLeft - offsetFor(project));
    const bestDistance = Math.abs(track.scrollLeft - offsetFor(projects[best]));

    return distance < bestDistance ? index : best;
  }, 0);

  setCurrent(nearest);
}

track.addEventListener(
  "scroll",
  () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(settleScroll, 130);
  },
  { passive: true },
);

controls.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.hasAttribute("data-direction")) {
    const direction = Number(button.dataset.direction);
    showProject((pendingIndex ?? activeIndex) + direction);
  } else {
    showProject(Number(button.dataset.slide));
  }
});

track.addEventListener("keydown", (event) => {
  const movement = { ArrowRight: 1, ArrowLeft: -1 }[event.key];

  if (!movement) {
    return;
  }

  event.preventDefault();
  showProject((pendingIndex ?? activeIndex) + movement);
});

mobileLayout.addEventListener("change", () => {
  requestAnimationFrame(() => showProject(activeIndex, false));
});

carousel.dataset.enhanced = "";
controls.hidden = false;
setCurrent(0);
