import { createFilter, type Plugin, type Rollup } from 'vite';
import lwc, { type RollupLwcOptions } from '@lwc/rollup-plugin';
// import { type RollupLwcOptions } from '@lwc/rollup-plugin'
// import lwc from '../lwc-rollup-plugin'
import path from 'node:path';
import fs from 'node:fs';
import type { ViteLwcOptions } from './types';

// taken from `@lwc/rollup-plugin`
const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js';

function createRollupPlugin(options: RollupLwcOptions) {
  const plugin = lwc(options);

  const buildStart = plugin.buildStart ? ('handler' in plugin.buildStart ? plugin.buildStart.handler : plugin.buildStart) : () => {};
  const resolveId = plugin.resolveId ? ('handler' in plugin.resolveId ? plugin.resolveId.handler : plugin.resolveId) : () => {};
  const load = plugin.load ? ('handler' in plugin.load ? plugin.load.handler : plugin.load) : () => {};
  const transform = plugin.transform ? ('handler' in plugin.transform ? plugin.transform.handler : plugin.transform) : () => {};

  return {
    version: plugin.version,
    buildStart,
    resolveId,
    load,
    transform,
  };
}

export default function lwcVite(config: ViteLwcOptions): Plugin {
  const csr = createRollupPlugin(config);
  const ssr = createRollupPlugin({ ...config, targetSSR: true });

  const exclude = [config.exclude].flat().filter((e) => e !== undefined && e !== null);

  const filter = createFilter(config.include, ['**/vite/**', '**/@vitest/**', '**/.vite/**', 'index.html', '/__vitest_test__/**', ...exclude]);

  return {
    name: 'lwc:vite-plugin',
    config() {
      return {
        define: {
          'process.env.SKIP_LWC_VERSION_MISMATCH_CHECK': 'false',
        },
      };
    },
    async buildStart(options) {
      try {
        await csr.buildStart.call(this, options);
        await ssr.buildStart.call(this, options);
      } catch (e) {
        this.error(getError(e));
      }
    },
    async resolveId(source, importer, options) {
      if (!filter(source)) {
        return;
      }

      // console.log('📦 resolveId ', { source, importer })

      /**
       * When attempting to import HTML from a JS file, double check
       * the file exists. `vite-plugin-lwc` assumes it does and
       * causes errors when it doesn't.
       *
       * Somewhat mimics the `@lwc/rollup-plugin` logic to prevent
       * the assumption of a `.html` file for all LWCs.
       */
      if (importer && path.extname(importer) === '.js' && path.isAbsolute(importer) && (path.extname(source) === '.html' || source.endsWith('html?import'))) {
        const dir = path.dirname(importer);
        let filePath = path.join(dir, source);

        if (path.isAbsolute(source)) {
          filePath = source;
        }

        if (!fs.existsSync(filePath)) {
          // taken from `@lwc/rollup-plugin`
          return IMPLICIT_DEFAULT_HTML_PATH;
        }
      }

      if (importer && path.extname(importer) === '.html' && path.isAbsolute(importer) && path.extname(source) !== '' && path.isAbsolute(source)) {
        const dir = path.dirname(importer);
        return path.join(dir, source);
      }

      try {
        const id = await (options.ssr ? ssr : csr).resolveId.call(this, source, importer, options);
        // console.log('resolveId id ', { id, source, importer })

        if (!id) {
          return;
        }

        return id;
      } catch (e) {
        this.error(getError(e, source));
      }
    },
    load(id, options) {
      if (!filter(id)) {
        return;
      }
      // console.log('📦 load ', { id })

      try {
        return (options?.ssr ? ssr : csr).load.call(this, id);
      } catch (e) {
        this.error(getError(e, id));
      }
    },
    transform(code, id, options) {
      if (!filter(id)) {
        return;
      }
      // console.log('📦 transform ', { id })

      try {
        return (options?.ssr ? ssr : csr).transform.call(this, code, id);
      } catch (e) {
        this.error(getError(e, id, code));
      }
    },
  };
}

function getError(error: unknown, id?: string, src?: string): Rollup.RollupError | string {
  if (typeof error === 'string') {
    return error;
  }

  if (typeof error !== 'object' || error === null) {
    return String(error);
  }

  const rollupError: Rollup.RollupError = {
    message: 'An unknown error occurred.',
  };

  addErrorCode(error, rollupError);
  addErrorMessage(error, rollupError);
  addErrorLocation(error, rollupError, src);
  addErrorId(id, rollupError);

  return rollupError;
}

function addErrorCode(error: object, rollupError: Rollup.RollupError) {
  if ('code' in error && typeof error.code === 'number') {
    rollupError.pluginCode = error.code;
  }
}

function addErrorMessage(error: object, rollupError: Rollup.RollupError) {
  if ('message' in error && typeof error.message === 'string') {
    rollupError.message = error.message;
  }
}

function addErrorLocation(error: object, rollupError: Rollup.RollupError, src?: string) {
  if ('filename' in error && typeof error.filename === 'string') {
    rollupError.loc = {
      file: error.filename,
      line: 1,
      column: 1,
    };
  }

  if ('location' in error && typeof error.location === 'object' && error.location !== null) {
    rollupError.loc = {
      ...rollupError.loc,
      line: 'line' in error.location && typeof error.location.line === 'number' ? error.location.line : 1,
      column: 'column' in error.location && typeof error.location.column === 'number' ? error.location.column : 1,
    };

    if ('start' in error.location && typeof error.location.start === 'number' && 'length' in error.location && typeof error.location.length === 'number') {
      rollupError.frame = src?.substring(error.location.start, error.location.start + error.location.length);
    }
  }
}

function addErrorId(id: string | undefined, rollupError: Rollup.RollupError) {
  if (typeof id === 'string') {
    rollupError.id = id;
  }
}
