// Use the preinstalled headless shell (remotion.media downloads are blocked in this environment)
import { Config } from '@remotion/cli/config';
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(4);
