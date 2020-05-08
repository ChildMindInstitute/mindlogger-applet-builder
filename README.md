# Protocol Builder

Visual user interface used to design, edit, and generate [ReproSchema](https://github.com/ReproNim/reproschema) protocols. Written in Vue, hosted on [GitHub](https://github.com/henryrossiter/Protocol-Builder), and distributed with [NPM](https://www.npmjs.com/package/activity-set-builder).


## Usage

### Install dependency
```
npm install protocol-builder
```

```
<template>
  <ProtocolBuilder
    exportButton
    @uploadProtocol="onUploadProtocol"
  />
</template>

<script>
import Components from 'protocol-builder';

export default {
  name: 'My-App',
  components: {
    ...Components,
  },
  methods: {
    onUploadProtocol(newProtocol) {
        console.log('new protocol', newProtocol);
    }
  },
}
</script>
```



## Project Development setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for distribution
```
npm run build-bundle
```

### Publish to npm (requires authentication)
```
npm run publish
```

### Lint files
```
npm run lint
```