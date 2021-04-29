/**
 * This file use a shim to force esbuild to build the plugin's CSS. Passing the
 * CSS file directly to esbuild as an entrypoint bypasses the required plugins.
 */

import './styles.css'
