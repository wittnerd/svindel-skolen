// JS Confetti 0.12.0 ligger lokalt i vendor/ med tilhørende MIT-lisens.
(() => {
  let confetti;

  window.celebrateQuizResults = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof JSConfetti === "undefined") return;

    // La iframen tilpasse høyden til resultatet før animasjonen starter.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        confetti ??= new JSConfetti();
        confetti.addConfetti({
          confettiNumber: 90,
          confettiRadius: 4,
          confettiColors: ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"],
        });

        // JS Confetti 0.12.0 har ikke et offentlig valg for skytekraft.
        // Tilpass partiklene i den nye puljen før første animasjonsbilde.
        const { width, height } = confetti.canvas.getBoundingClientRect();
        const batch = confetti.activeConfettiBatches.at(-1);
        const speedScale = (1 + Math.min(0.35, width / 1600, height / 1200)) / 2;

        batch.shapes.forEach((shape) => {
          shape.confettiSpeed.x *= speedScale;
          shape.confettiSpeed.y *= speedScale;
          shape.finalConfettiSpeedX *= speedScale;
          const position = {
            x: shape.direction === "right" ? 8 : width - 8,
            y: height - 8,
          };
          shape.initialPosition = { ...position };
          shape.currentPosition = { ...position };
        });
      });
    });
  };
})();
