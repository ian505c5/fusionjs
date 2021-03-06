/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import tape from 'tape-cup';

import App, {consumeSanitizedHTML} from 'fusion-core';

import {getSimulator} from 'fusion-test-utils';

import {getFontConfig} from './fixtures/static/font-config';

import FontLoaderReactPlugin from '../index';
import {FontLoaderReactToken, FontLoaderReactConfigToken} from '../tokens';

import {
  atomicFontFaces as expectedAtomicFontFaces,
  styledFontFaces as expectedStyledFontFaces,
  preloadLinks as expectedPreloadLinks,
} from './fixtures/expected';

tape('exported as expected', t => {
  t.ok(FontLoaderReactPlugin, 'plugin defined as expected');
  t.equal(typeof FontLoaderReactPlugin, 'object', 'plugin is an object');
  t.end();
});

const atomicConfig = getFontConfig(false, {'Lato-Regular': true});
testFontLoader(atomicConfig, testAtomicFontLoad, 'atomic');
const styledConfig = getFontConfig(true);
testFontLoader(styledConfig, testStyledFontLoad, 'styled');

function testFontLoader(config, styleHeaderTest, type) {
  tape(`plugin - middleware adds ${type} font faces`, t => {
    const app = new App('content', el => el);
    app.middleware(async (ctx, next) => {
      await next();
      styleHeaderTest(
        t,
        ctx.template.head.map(e => consumeSanitizedHTML(e)).join('')
      );
    });
    app.register(FontLoaderReactToken, FontLoaderReactPlugin);
    app.register(FontLoaderReactConfigToken, config);
    app.middleware((ctx, next) => {
      ctx.body = {
        head: [],
      };
      return next();
    });
    getSimulator(app).render('/');
    t.end();
  });
}

function testAtomicFontLoad(t, headerElement) {
  equalWithoutSpaces(
    t,
    headerElement,
    `<style>${expectedAtomicFontFaces}</style>${expectedPreloadLinks}`,
    'atomic font face generated by plugin'
  );
}

function testStyledFontLoad(t, headerElement) {
  equalWithoutSpaces(
    t,
    headerElement,
    `<style>${expectedStyledFontFaces}</style>`,
    'styled font face generated by plugin'
  );
}

function equalWithoutSpaces(t, str1, str2, description) {
  t.equal(str1.replace(/\s/g, ''), str2.replace(/\s/g, ''), description);
}
