import chokidar from "chokidar";

import reload from "./livereload.js";
import buildCSS from "./build-css.js";
import buildJS from "./build-js.js";
import buildStatic from "./build-static.js";

let busy = false;

chokidar
  .watch(
    [
      "public/static/images/**/*.png",
      "public/static/images/**/*.svg",
      "public/static/images/**/*.jpg",
      "public/static/examples/assets",
      "public/static/examples/styles",
      "public/static/examples/worlds/**/*.js",
      // "public/**/*.html",
      "styles/**/*.scss",
      "src/**/*.js",
      "markdown/content/**/*.md",
      "layouts/**/*.html",
      "config.toml",
    ],
    {
      ignored: ["templates/chapters/build"],
      ignoreInitial: true,
      followSymlinks: true,
      disableGlobbing: false,

      usePolling: true,
      interval: 200,
      binaryInterval: 500,
      alwaysStat: false,
      depth: 99,
      awaitWriteFinish: true,
    }
  )
  .on("change", async (path) => {
    if (busy) return;
    if (path.includes("index.html")) {
      console.log(`Page changed: ${path}`);
      busy = true;
      reload();
      // Hugo will update many files at once,
      // wait for a while after catching the first one
      setTimeout(() => {
        busy = false;
      }, 2000);
    } else if (path.includes("examples\\")) {
      console.log(`Example files changed: ${path}`);
      reload();
      setTimeout(() => {
        busy = false;
      }, 2000);
    } else if (path.includes("images")) {
      console.log(`Image changed: ${path}`);
      const name = path.split("\\").pop();
      // Doesn't seem to be working for SVG
      reload(name);
      setTimeout(() => {
        busy = false;
      }, 2000);
    } else if (path.includes("styles\\")) {
      busy = true;
      const cssName = await buildCSS(path);
      if (cssName) {
        console.log("cssName: ", cssName);
        reload(`/static/css/${cssName}.min.css`);
      }
      setTimeout(() => {
        busy = false;
      }, 2000);
    } else if (path.includes("src\\") && !busy) {
      busy = true;
      const jsFile = await buildJS(path);
      if (jsFile) {
        reload(`/static/js/${jsFile}`);
      }
      setTimeout(() => {
        busy = false;
      }, 2000);
    } else if (path.includes("markdown\\")) {
      if (!busy) {
        console.log("Rebuilding markdown files");
        busy = true;
        const success = await buildStatic();
        console.log("success: ", success);
        if (success) {
          reload();
        }
        busy = false;
      }
    }
  });
