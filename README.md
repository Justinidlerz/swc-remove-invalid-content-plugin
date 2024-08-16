# swc-remove-invalid-content-plugin

This is only for swc javascript API plugin.  
It can help you to remove invalid content via regexp rules from string literal of your code.

For more remove expected, you can see `tests/index.spec.ts`.

## Usage

### Installation

```shell
pnpm i -D swc-remove-invalid-content-plugin
```

### Configuration

```ts
const plugin = [
  'swc-remove-invalid-content-plugin',
  {
    matches: ['[\u4E00-\u9FFF]', 'baidu.com|google.com'],
  },
];

const swcOptions = {
  jsc: {
    experimental: {
      plugins: [plugin],
    },
  },
};
```

## License

---
For a detailed explanation on how things work, checkout the [swc](https://swc.rs/docs/configuration/bundling) doc

Copyright (c) 2024-present, Idler.zhu