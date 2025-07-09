## Public types for Wippy web-components and iframe proxy

### Web Component Proxy

```
  // package.json
  "devDependencies": {
    "@types/wippy-web-component-proxy": "https://gitpkg.vercel.app/wippyai/frontend-types/packages/web-component-proxy?main",
  },
  "peerDependencies": {
    "@wippy/proxy": "*",
  },
```

```
  // tsconfig.json
  {
    "compilerOptions": {
      "types": ["wippy-web-component-proxy"]
    },
  }
```

### Iframe Proxy

```
  // package.json
  "devDependencies": {
    "@types/wippy-iframe-proxy": "https://gitpkg.vercel.app/wippyai/frontend-types/packages/iframe-proxy?main",
  },
```

```
  // tsconfig.json
  {
    "compilerOptions": {
      "types": ["wippy-iframe-proxy"]
    },
  }
``` 
