# Applet Schema Builder

AccessKey

Visual user interface used to design, edit, and generate [ReproSchema](https://github.com/ReproNim/reproschema) protocols. Written in Vue, hosted on [GitHub](https://github.com/ChildMindInstitute/mindlogger-applet-builder), and distributed with [NPM](https://www.npmjs.com/package/applet-schema-builder).


## Usage

### Install dependency
```
npm install applet-schema-builder
```

```
<template>
  <AppletSchemaBuilder
    exportButton
    @uploadProtocol="onUploadApplet"
  />
</template>

<script>
import Components from 'applet-schema-builder';

export default {
  name: 'My-App',
  components: {
    ...Components,
  },
  methods: {
    onUploadApplet(newApplet) {
        console.log('new applet', newApplet);
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



## ReproSchema Documentation

All applets, activities, and items are specified text files in a JSON-LD format (JavaScript Object Notation for Linked Data) and each applet, activity, and item provides unique and persistent identifiers.

- At the item level, the elements of an individual assessment, like the questions in a questionnaire
- At the activity level, an individual assessment that contains a set of items, like for example a whole questionnaire with a several questions.
- At the applet level, a collection of activities performed by a participant, e.g a set of questionnaires used in a study.

### Applet

A representation of a study which comprises one or more assessments.

**Name**|**Description**|**URL**
-----|-----|-----
addProperties|An array of objects to describe the various properties added to an applet.|
landingPage|An element (by URL) to point to the applet readme or landing page.|
order|An ordered list to describe the order in which the items of an assessment or applet appear in the user interface.|
about|The subject matter of the applet.|
description|A description of the applet.|
image|An image of the item. This can be a URL or a fully described ImageObject.|
schemaVersion|Indicates (by URL or string) a particular version of a schema used in some CreativeWork. For example, a document could declare a schemaVersion using an URL such as http://schema.org/version/2.0/ if precise indication of schema version was required by some application.|
version|The version of the CreativeWork embodied by a specified resource.|
altLabel|The alternate label.|http://www.w3.org/2004/02/skos/core#altLabel
prefLabel|The preferred label.|http://www.w3.org/2004/02/skos/core#prefLabel

### Activity

An assessment in an applet.

**Name**|**Description**|**URL**
-----|-----|-----
addProperties|An array of objects to describe the various properties added to assessments.|
order|An ordered list to describe the order in which the items of an assessment or applet appear in the user interface.|
preamble|The preamble for an assessment|
about|The subject matter of the activity.|
description|A description of the activity.|
image|An image of the item. This can be a URL or a fully described ImageObject.|
schemaVersion|Indicates (by URL or string) a particular version of a schema used in some CreativeWork. For example, a document could declare a schemaVersion using an URL such as http://schema.org/version/2.0/ if precise indication of schema version was required by some application.|
version|The version of the CreativeWork embodied by a specified resource.|
altLabel|The alternate label.|http://www.w3.org/2004/02/skos/core#altLabel
prefLabel|The preferred label.|http://www.w3.org/2004/02/skos/core#prefLabel

### Item

An item in an assessment

**Name**|**Description**|**URL**
-----|-----|-----
inputType|An element to describe the input type of a item.|
responseOptions|An element (object or by URL)to describe the properties of response of the item.|
about|The subject matter of the item.|
description|A description of the item.|
image|An image of the item. This can be a URL or a fully described ImageObject.|
isPartOf|Indicates an item or CreativeWork that this item, or CreativeWork (in some sense), is part of.|
question|A sub property of object. A question.|
schemaVersion|Indicates (by URL or string) a particular version of a schema used in some CreativeWork. For example, a document could declare a schemaVersion using an URL such as http://schema.org/version/2.0/ if precise indication of schema version was required by some application.|
version|The version of the CreativeWork embodied by a specified resource.|
altLabel|The alternate label.|http://www.w3.org/2004/02/skos/core#altLabel
prefLabel|The preferred label.|http://www.w3.org/2004/02/skos/core#prefLabel

### AdditionalProperty

An object to describe the various properties added to assessments and fields

**Name**|**Description**|**URL**
-----|-----|-----
allow|An array of items indicating properties allowed on an activity or applet|
isAbout|A pointer to the node describing the item.|
isVis|An element to describe (by boolean or conditional statement) visibility conditions of items in an assessment.|
variableName|The name used to represent an item.|
valueRequired|Whether the property must be filled in to complete the action. Default is false.|
prefLabel|The preferred label.|http://www.w3.org/2004/02/skos/core#prefLabel

### ResponseOption

An element (object or by URL)to describe the properties of response of the Field item.

**Name**|**Description**|**URL**
-----|-----|-----
choices|An array to list the available options for response of the Field item.|
multipleChoice|Indicates (by bool) if response for the Field item has one or more answer.|
valueType|The type of the response of an item. For example, string, integer, etc.|http://schema.repronim.org/valueType
maxValue|The upper value of some characteristic or property.|
minValue|The lower value of some characteristic or property.|

### Choice

An object to describe a response option.

**Name**|**Description**|**URL**
-----|-----|-----
value|The value for each option in choices or in additionalNotesObj|
image|An image of the item. This can be a URL or a fully described ImageObject.|http://schema.repronim.org/image
name|The name of the item.|

### ComputeSpecification

An object to define computations in an activity or applet.

**Name**|**Description**|**URI**
-----|-----|-----
jsExpression|A JavaScript expression to compute a score from other variables.|http://schema.repronim.org/jsExpression
variableName|The name used to represent an item.|http://schema.repronim.org/variableName

### MessageSpecification

An object to define messages in an activity or applet.

**Name**|**Description**|**URI**
-----|-----|-----
jsExpression|A JavaScript expression to compute a score from other variables.|http://schema.repronim.org/jsExpression
message|The message to be conditionally displayed for an item.|

### SliderOption

**New** options for slider items.

**Name**|**Description**|**URI**
-----|-----|-----
continousSlider|Indicates (by bool) if a slider wiget (is smooth or) is not constrained to predetermined answers.|http://schema.repronim.org/continousSlider
showTickMarks|An option (boolean) to turn on/off the tick marks in a slider item.|

### CorrectAnswer

A given answer in a free text item.

**Name**|**Description**|**URI**
-----|-----|-----
correctAnswer| Indicates (by string) a correct answer in a free text item. In order to move to the next item, user should answer the question correctly|

### SubScaleScoring

Represents list of sub scales in an activity and applet

**Name**|**Description**|**URI**
-----|-----|-----
lookupTable| Array of objects which contains tScore, rawScore, age and sex. |http://schema.repronim.org/lookupTable
tScore| A score which replaces rawScore if a name and sex in table are the same with user's |
rawScore| A score that is calculated by adding scores for items within cumulative scoring |
age| Expected user's age in table |
sex| Expected user's sex in table |

### TokenPrize

**Name**|**Description**|**URI**
-----|-----|-----
isPrize| Indicates (by bool) if it is a TokenPrize Activity. |http://schema.repronim.org/isPrize
enableNegativeTokens| Indicates (by bool) if it is enabled to use negative tokens. |

### StackedItem


**Name**|**Description**|**URI**
-----|-----|-----
itemOptions| Represents the value, score and alert texts for stacked item. |http://schema.repronim.org/isPrize
itemList| A list of items (value, score, and alert) |
scores| An array which evaluates raw scores of each subscales |

### OptionalText

An optional text field in an item.

**Name**|**Description**|**URI**
-----|-----|-----
isOptionalText| An optional textbox (like a comment) that can be added in all types of items |http://schema.repronim.org/isOptionalText
isOptionalTextRequired| Indicates (by bool) if the optional textbox is required in an item |
