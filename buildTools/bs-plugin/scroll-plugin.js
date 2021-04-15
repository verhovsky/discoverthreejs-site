// This code gets added to the browser when using browsersync
(($window, $document, bs) => {
  if (!window.name) {
    window.name = `bs_${Math.random()}`;
  }

  const elem = $document.querySelector('.scroller');

  const scrollState = JSON.parse(
    sessionStorage.getItem(`bs-scroll_${window.name}`),
  );

  if (scrollState) {
    // set scroll as early as possible, but won't be perfect
    // elem.scrollTop = scrollState;

    // const intID = setInterval(() => {
    //   elem.scrollTop = scrollState;
    // }, 16);

    // after everything has loaded, refine scroll
    window.addEventListener('load', () => {
      setTimeout(() => {
        elem.scrollTop = scrollState;
        // clearInterval(intID);
      }, 500);
    });
  }

  elem.addEventListener('scroll', (e) => {
    sessionStorage.setItem(
      `bs-scroll_${window.name}`,
      JSON.stringify(e.srcElement.scrollTop),
    );
  });
})(window, document, ___browserSync___);
