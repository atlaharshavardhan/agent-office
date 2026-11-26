import { Config } from '@remotion/cli/config';
// Cloud render box only: set REMOTION_CHROME to a local Chromium. On your PC leave it unset.
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
