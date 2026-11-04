// Quizene og kurssidene ligger på samme domene.
// Følg innholdshøyden også ved nye spørsmål, tilbakemeldinger og vindusendringer.
(() => {
  const frame = window.frameElement;
  if (!frame) return;

  const resizeFrame = () => {
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    frame.style.height = `${height}px`;
  };

  const observer = new ResizeObserver(resizeFrame);
  observer.observe(document.body);
  resizeFrame();
})();
