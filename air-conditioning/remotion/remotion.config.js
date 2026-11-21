// In the Claude cloud container use the preinstalled headless shell (remotion.media is blocked there).
// Elsewhere (e.g. the GCP GPU VM) Remotion downloads / uses its own browser.
import fs from 'fs';
import { Config } from '@remotion/cli/config';
const SHELL = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(SHELL)) {
  Config.setBrowserExecutable(SHELL);
  Config.setChromiumOpenGlRenderer('swangle');
  Config.setConcurrency(4);
} else {
  Config.setChromiumOpenGlRenderer('angle');
}
