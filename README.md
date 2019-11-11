# activity-set-builder

A Vue component that can be used to design and export standardized Activity Sets.

## Installation
```
npm install activity-set-builder
```

## Usage

The ```ActivitySetBuilder``` component emits a ```closeBuilder``` event when the activity set is downloaded.

### In template
```
<ActivitySetBuilder @closeBuilder="yourMethodHere"/>
```
or
```
<ActivitySetBuilder/>
```

### In script
```
import Components from 'activity-set-builder';

...

export default {

  components: {
    ...Components
  },

...
```
