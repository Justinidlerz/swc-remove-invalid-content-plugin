import { describe, expect, it } from 'vitest';
import * as swc from '@swc/core';
import * as path from 'node:path';
import pkg from '../package.json';

const createTransform = async (content: string, matches: string[], replace_with?: string) => {
  const res = await swc.transform(content, {
    filename: 'input.js',
    sourceMaps: false,
    isModule: true,
    jsc: {
      parser: {
        syntax: 'ecmascript',
      },
      transform: {},
      experimental: {
        plugins: [
          [
            require.resolve(path.join(__dirname, '../', pkg.main)),
            {
              matches,
              replace_with
            },
          ],
        ],
      },
    },
  });

  return res.code;
};

describe('swc-remove-invalid-content-plugin', () => {
  it('Should remove chinese when add chinese charset', async () => {
    const code = await createTransform('const a = "source code中文中文"', [
      '[\u4E00-\u9FFF]',
    ]);

    expect(code).toMatchInlineSnapshot(`
        "var a = "source code";
        "
      `);
  });

  it('Should remove chinese on json properties', async () => {
    const json = {
      value: '中文中文',
      deps1: {
        value: '中文中文1',
      },
    };
    const code = await createTransform(
      `const a = "source code中文中文"; const b = ${JSON.stringify(json)}`,
      ['[\u4E00-\u9FFF]'],
    );

    expect(code).toMatchInlineSnapshot(`
      "var a = "source code";
      var b = {
          "value": "",
          "deps1": {
              "value": "1"
          }
      };
      "
    `);
  });

  it('Should remove url and chinese on json properties', async () => {
    const json = {
      value: '中文中文',
      deps1: {
        value: '中文中文1',
      },
      urls: {
        'baidu.com': 'https://baidu.com/',
        'google.com': 'https://google.com/abc',
      },
    };
    const code = await createTransform(
      `const a = "source code中文中文"; const b = ${JSON.stringify(json)}`,
      ['[\u4E00-\u9FFF]', 'baidu.com|google.com'],
    );

    expect(code).toMatchInlineSnapshot(`
      "function _define_property(obj, key, value) {
          if (key in obj) {
              Object.defineProperty(obj, key, {
                  value: value,
                  enumerable: true,
                  configurable: true,
                  writable: true
              });
          } else {
              obj[key] = value;
          }
          return obj;
      }
      var a = "source code";
      var b = {
          "value": "",
          "deps1": {
              "value": "1"
          },
          "urls": _define_property({
              "": "https:///"
          }, "", "https:///abc")
      };
      "
    `);
  });

  it('Should not remove from import syntax', async () => {
    const code = await createTransform('import * as A from "/中文中文"', [
      '[\u4E00-\u9FFF]',
    ]);

    expect(code).toMatchInlineSnapshot(`
      "import * as A from "/中文中文";
      "
    `);
  });

  it('Should replace with by passed char', async () => {
    const code = await createTransform('console.log("https://www.google.com/url")', [
      'google.com',
    ], "*");

    expect(code).toMatchInlineSnapshot(`
      "console.log("https://www.**********/url");
      "
    `);
  });
});
