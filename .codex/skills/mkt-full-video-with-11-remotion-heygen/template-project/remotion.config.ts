import path from 'path';
import { Config } from '@remotion/cli/config';

// Explicit publicDir — without this, Remotion's bundler can resolve to the
// template-project/public/ directory when node_modules is symlinked, instead
// of using the workspace's local public/. Set to cwd/public so each workspace
// uses its own assets folder.
Config.setPublicDir(path.resolve(process.cwd(), 'public'));

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setConcurrency(null); // auto-detect
