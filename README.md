# activity-set-builder

A Vue component that can be used to design and export standardized Activity Sets.

## Source Code

[https://github.com/henryrossiter/Activity-Set-Builder](https://github.com/henryrossiter/Activity-Set-Builder "Source Code")

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

Supported Item Types:
- Radio - single choice
- Radio - multiple choice
- Text
- Slider
