import {Config} from '@remotion/cli/config';
Config.setEntryPoint('src/index.jsx');
// Local headless Chromium in this environment; remove to let Remotion download its own.
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
