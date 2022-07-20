import util from '../utilities/util';
import Item from './Item';

export const ACTIVITY_TYPES = [
  "NORMAL",
  "CST_GYRO",
  "CST_TOUCH",
  "FLANKER",
  "TRAILS_IPAD",
  "TRAILS_MOBILE"
];

export default class Activity {
  constructor() {
    this.ref = null;
  }

  getActivityBuilderData(initialActivityData) {
    const name = initialActivityData.name;
    const description = initialActivityData.description;
    const valid = initialActivityData.valid;
    const items = (initialActivityData.items || []).map(item => item);

    if (initialActivityData.visibilities && initialActivityData.visibilities.length) {
      initialActivityData.conditionalItems = this.getConditionalItems(initialActivityData, initialActivityData.items);
    }

    if (initialActivityData.subScales && initialActivityData.subScales.length) {
      const subScales = initialActivityData.subScales;

      for (const subScale of subScales) {
        const names = subScale.jsExpression.split('+').map(name => name.trim()).filter(name => name.length);

        subScale.items = items.filter(item => names.includes(item.name));
        subScale.items = subScale.items.concat(
          subScales.filter(subScale => names.includes(`(${subScale.variableName})`))
        );
      }
    }

    return {
      name: name || '',
      description: description || '',
      splash: initialActivityData.splash || '',
      image: initialActivityData.image || '',
      preamble: initialActivityData.preamble || '',
      shuffleActivityOrder: initialActivityData.shuffle || false,
      isSkippable: initialActivityData.isSkippable || false,
      isVis: initialActivityData.isVis || false,
      items: items || [],
      disableBack: initialActivityData.disableBack || false,
      allowSummary: initialActivityData.allowSummary !== undefined ? initialActivityData.allowSummary : false,
      exportAvailable: initialActivityData.exportAvailable || false,
      isReviewerActivity: initialActivityData.isReviewerActivity || false,
      isOnePageAssessment: initialActivityData.isOnePageAssessment || false,
      id: initialActivityData._id || null,
      textRules: [(v) => !!v || 'This field is required'],
      error: '',
      componentKey: 0,
      activityType: initialActivityData.activityType,
      initialItemData: initialActivityData.isPrize && initialActivityData.items ? initialActivityData.items[0] : {},
      isItemEditable: true,
      editIndex: -1,
      visibilities: initialActivityData.visibilities || [],
      conditionalItems: initialActivityData.conditionalItems && initialActivityData.conditionalItems.map(conditional => ({
        ...conditional,
        valid: true,
      })) || [],
      subScales: initialActivityData.subScales && initialActivityData.subScales.map(subScale => ({
        ...subScale,
        valid: true
      })) || [],
      reports: this.parseReportConditionals((initialActivityData.reports || []).map(report => ({
        ...report,
        valid: true
      })), items),
      finalSubScale: initialActivityData.finalSubScale || {
        lookupTable: null,
        variableName: '',
        isAverageScore: null
      },
      reportIncludeItem: initialActivityData.reportIncludeItem || '',
      allowEdit: true,
      isPrize: initialActivityData.isPrize || false,
      scoreOverview: initialActivityData.scoreOverview || '',
      valid: valid !== undefined ? valid : true,
      timestamp: Date.now()
    };
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  parseReportConditionals (reports, items) {
    const conditionals = [];

    for (const report of reports) {
      if (report.dataType == 'score') {
        for (const conditional of report.conditionals) {
          conditional.conditionalItem = this.parseConditionalExpression({
            showValue: null,
            conditions: [],
            operation: "ALL",
            valid: true,
          }, conditional.isVis.replace(/\s/g, ''), [report]);

          conditional.conditionalItem.conditions.forEach(condition => condition.ifValue = null);
          conditional.isConditional = true;

          conditionals.push(conditional);
        }
      }
    }

    for (const report of reports) {
      if (report.dataType == 'section') {
        report.conditionalItem = this.parseConditionalExpression({
          showValue: null,
          conditions: [],
          operation: "ALL",
          valid: true,
        }, report.isVis.replace(/\s/g, ''), [...reports, ...conditionals,...items]);
      }
    }

    return reports;
  }

  getConditionalItems(activity, items) {
    const visibilities = activity.visibilities || [];
    const conditionalItems = [];

    visibilities.forEach((property) => {
      if (typeof property.isVis === 'boolean') return;

      let isVis = property.isVis.split(' ').join('');

      const conditionalItem = {
        showValue: items.find(item => item.name == property.variableName),
        conditions: [],
        operation: "ALL",
        id: Math.round(Date.now() * Math.random()),
      };

      conditionalItems.push(this.parseConditionalExpression(conditionalItem, isVis, items));
    });

    return conditionalItems;
  }

  getReports (reports) {
    return reports.map(report => {
      const schema = {
        'prefLabel': report.prefLabel,
        '@id': report.id,
        'dataType': report.dataType,
        'message': report.showMessage ? report.message : '',
        'printItems': report.showItems ? report.printItems : [],
      };

      if (report.dataType == 'section') {
        schema.isVis = this.compressConditional(report.conditionalItem);
      } else {
        Object.assign(schema, {
          outputType: report.outputType,
          jsExpression: report.jsExpression,
          conditionals: report.conditionals.map((conditional, index) => ({
            'prefLabel': conditional.prefLabel,
            '@id': conditional.id,
            'message': conditional.showMessage ? conditional.message : '',
            'printItems': conditional.showItems ? conditional.printItems : [],
            'flagScore': conditional.flagScore,
            'isVis': this.compressConditional({
              ...conditional.conditionalItem,
              conditions: conditional.conditionalItem.conditions.map(condition => ({
                ...condition,
                ifValue: report
              }))
            }),
          }))
        });
      }

      return schema;
    })
  }

  parseConditionalExpression (conditionalItem, isVis, items) {
    const findItemIndex = (name) => items.findIndex(item => item.name == name || item.id == name);

    const itemChoices = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].inputType) {
        const itemModel = new Item();
        itemModel.updateReferenceObject(items[i]);

        const options = itemModel.getResponseOptions();
        itemChoices.push(options.choices);
      } else {
        itemChoices.push([]);
      }
    }

    while (isVis) {
      const outsideRegExp = /(\w+)<(\d+)\|\|(\w+)>(\d+)/;
      const outsideValues = isVis.match(outsideRegExp);
      const insideRegExp = /(\w+)>(\d+)\&\&(\w+)<(\d+)/;
      const withinValues = isVis.match(insideRegExp);
      const includeRegExp = /(\w+)\.includes\((\w+)\)/;
      const includeValues = isVis.match(includeRegExp);
      const excludeRegExp = /!(\w+)\.includes\((\w+)\)/;
      const excludeValues = isVis.match(excludeRegExp);
      const lessThanRegExp = /(\w+)<(\d+)/;
      const lessThanValues = isVis.match(lessThanRegExp);
      const greaterThanRegExp = /(\w+)>(\d+)/;
      const greaterThanValues = isVis.match(greaterThanRegExp);
      const equalToRegExp = /(\w+)==(\d+|true|false)/;
      const equalToValues = isVis.match(equalToRegExp);
      const notEqualToRegExp = /(\w+)!=(\d+|true|false)/;
      const notEqualToValues = isVis.match(notEqualToRegExp);
      const activityRegExp = /(\!?)isActivityShownFirstTime\("(.*?)"\)/;
      const activityValues = isVis.match(activityRegExp);

      const minIndex = Math.min(
        outsideValues ? outsideValues.index : isVis.length,
        withinValues ? withinValues.index : isVis.length,
        includeValues ? includeValues.index : isVis.length,
        excludeValues ? excludeValues.index : isVis.length,
        lessThanValues ? lessThanValues.index : isVis.length,
        greaterThanValues ? greaterThanValues.index : isVis.length,
        equalToValues ? equalToValues.index : isVis.length,
        notEqualToValues ? notEqualToValues.index : isVis.length,
        activityValues ? activityValues.index : isVis.length,
      );

      if (outsideValues && minIndex === outsideValues.index && outsideValues[1] === outsideValues[3]) {
        isVis = isVis.replace(outsideRegExp, '');
        const itemIndex = findItemIndex(outsideValues[1]);

        if (itemIndex !== -1) {
          conditionalItem.conditions.push({
            ifValue: items[itemIndex],
            maxValue: outsideValues[4],
            minValue: outsideValues[2],
            stateValue: {
              name: "OUTSIDE OF",
              val: "outsideof"
            }
          });
        }
      } else if (withinValues && minIndex === withinValues.index && withinValues[1] === withinValues[3]) {
        isVis = isVis.replace(insideRegExp, '');
        const itemIndex = findItemIndex(withinValues[1]);

        if (itemIndex !== -1) {
          conditionalItem.conditions.push({
            ifValue: items[itemIndex],
            maxValue: withinValues[4],
            minValue: withinValues[2],
            stateValue: {
              name: "BETWEEN",
              val: "between"
            }
          });
        }
      } else if (excludeValues && minIndex === excludeValues.index) {
        isVis = isVis.replace(excludeRegExp, '');
        const itemIndex = findItemIndex(excludeValues[1]);

        if (itemIndex !== -1) {
          const option = itemChoices[itemIndex].find(choice => choice['schema:value'] == excludeValues[2]);

          if (option) {
            conditionalItem.conditions.push({
              ifValue: items[itemIndex],
              answerValue: {
                name: option['schema:name'],
                value: option['schema:value']
              },
              stateValue: {
                name: "Doesn't include",
                val: "!includes",
              }
            })
          }
        }
      } else if (includeValues && minIndex === includeValues.index) {
        isVis = isVis.replace(includeRegExp, '');
        const itemIndex = findItemIndex(includeValues[1]);

        if (itemIndex !== -1) {
          const option = itemChoices[itemIndex].find(choice => choice['schema:value'] == includeValues[2]);

          if (option) {
            conditionalItem.conditions.push({
              ifValue: items[itemIndex],
              answerValue: {
                name: option['schema:name'],
                value: option['schema:value']
              },
              stateValue: {
                name: "Includes",
                val: "includes",
              }
            })
          }
        }
      } else if (lessThanValues && isVis[lessThanValues.index - 1] !== "(" && minIndex === lessThanValues.index) {
        isVis = isVis.replace(lessThanRegExp, '');
        const itemIndex = findItemIndex(lessThanValues[1]);

        if (itemIndex !== -1) {
          conditionalItem.conditions.push({
            ifValue: items[itemIndex],
            minValue: lessThanValues[2],
            stateValue: {
              name: 'LESS THAN',
              val: '<',
            }
          });
        }
      } else if (greaterThanValues && isVis[greaterThanValues.index - 1] !== "(" && minIndex === greaterThanValues.index) {
        isVis = isVis.replace(greaterThanRegExp, '');
        const itemIndex = findItemIndex(greaterThanValues[1]);

        if (itemIndex !== -1) {
          conditionalItem.conditions.push({
            ifValue: items[itemIndex],
            minValue: greaterThanValues[2],
            stateValue: {
              name: 'GREATER THAN',
              val: '>',
            }
          });
        }
      } else if (notEqualToValues && minIndex === notEqualToValues.index) {
        isVis = isVis.replace(notEqualToRegExp, '');
        const itemIndex = findItemIndex(notEqualToValues[1]);

        if (itemIndex !== -1) {
          const option = itemChoices[itemIndex].find(choice => choice['schema:value'] == notEqualToValues[2]);


          if (option) {
            conditionalItem.conditions.push({
              ifValue: items[itemIndex],
              answerValue: {
                name: option['schema:name'],
                value: option['schema:value']
              },
              stateValue: {
                name: 'IS NOT EQUAL TO',
                val: '!=',
              }
            });
          } else if (item.isConditional) {
            conditionalItem.conditions.push({
              ifValue: items[itemIndex],
              answerValue: notEqualToValues[2] == 'true' ? 'True' : 'False',
              stateValue: {
                name: 'IS NOT EQUAL TO',
                val: '!=',
              }
            });
          } else {
            conditionalItem.conditions.push({
              ifValue: items[itemIndex],
              minValue: notEqualToValues[2],
              stateValue: {
                name: 'IS NOT EQUAL TO',
                val: '!=',
              }
            });
          }
        }
      } else if (equalToValues && minIndex === equalToValues.index) {
        isVis = isVis.replace(equalToRegExp, '');
        const itemIndex = findItemIndex(equalToValues[1]);

        if (itemIndex !== -1) {
          const item = items[itemIndex];

          if (item.inputType === 'radio') {
            const option = itemChoices[itemIndex].find(choice => choice['schema:value'] == equalToValues[2]);

            if (option) {
              conditionalItem.conditions.push({
                ifValue: item,
                answerValue: {
                  name: option['schema:name'],
                  value: option['schema:value']
                },
                stateValue: {
                  name: 'IS EQUAL TO',
                  val: '==',
                }
              });
            }
          } else if (item.isConditional) {
            conditionalItem.conditions.push({
              ifValue: item,
              answerValue: equalToValues[2] == 'true' ? 'True' : 'False',
              stateValue: {
                name: 'IS EQUAL TO',
                val: '==',
              }
            });
          } else {
            conditionalItem.conditions.push({
              ifValue: item,
              minValue: equalToValues[2],
              stateValue: {
                name: 'EQUAL TO',
                val: '==',
              }
            });
          }
        }
      } else if (activityValues && minIndex == activityValues.index) {
        isVis = isVis.replace(activityRegExp, '');

        if (activityValues[1]) {
          conditionalItem.conditions.push({
            ifValue: activityValues[2],
            stateValue: {
              name: "is not shown for the first time",
              val: "!isActivityShownFirstTime"
            },
            activityCondition: true
          })
        } else {
          conditionalItem.conditions.push({
            ifValue: activityValues[2],
            stateValue: {
              name: "is shown for the first time",
              val: "isActivityShownFirstTime"
            },
            activityCondition: true
          })
        }
      } else {
        isVis = isVis.split('()').join('');

        if (isVis[0] === '|') {
          conditionalItem.operation = 'ANY';
        }
        break;
      }
    }

    return conditionalItem;
  }

  compressConditional (conditionalItem) {
    if (!conditionalItem) {
      return true;
    }

    const operation = conditionalItem.operation === 'ANY' ? ' || ' : ' && ';
    const visibleItems = conditionalItem.conditions.map((cond) => {
      const ifValue = typeof cond.ifValue == 'object' ? (cond.ifValue.name || cond.ifValue.id) : cond.ifValue;

      if (cond.activityCondition) {
        return `${cond.stateValue.val}("${ifValue}")`;
      } else if (cond.stateValue.val === 'between') {
        return `(${ifValue} > ${cond.minValue} && ${ifValue} < ${cond.maxValue})`;
      } else if (cond.stateValue.val === 'outsideof') {
        return `(${ifValue} < ${cond.minValue} || ${ifValue} > ${cond.maxValue})`;
      } else if (cond.stateValue.val === 'includes') {
        return `${ifValue}.${cond.stateValue.val}(${cond.answerValue.value})`
      } else if (cond.stateValue.val === '!includes') {
        return `!${ifValue}.includes(${cond.answerValue.value})`
      } else if (cond.stateValue.val === '=') {
        return `${ifValue} ${cond.stateValue.val}${cond.stateValue.val} ${cond.minValue}`;
      } else if (!cond.answerValue) {
        return `${ifValue} ${cond.stateValue.val} ${cond.minValue}`;
      } else {
        const answer = cond.answerValue.value || cond.answerValue;
        return `${ifValue} ${cond.stateValue.val} ${answer.toLowerCase()}`;
      }
    });

    return visibleItems.join(operation);
  }

  getItemVisibility() {
    const visibilityObj = {};

    this.ref.items.forEach(function (item) {
      visibilityObj[item.name] = true;
    });
    return visibilityObj;
  }

  getAddProperties(itemOrder) {
    const addProperties = [];

    if (this.ref.isPrize) {
      const prizeItem = this.ref.items[0];
      const propertiesArr = [{
        "variableName": prizeItem.name,
        "isAbout": prizeItem.name,
        "isVis": true
      }];

      if (!prizeItem.options.options) {
        return propertiesArr;
      }

      prizeItem.options.options.forEach((option, index) => {
        const confirmItem = this.ref.items[index + 1];

        propertiesArr.push({
          "variableName": confirmItem.name,
          "isAbout": confirmItem.name,
          "isVis": `${prizeItem.name} == ${option.value}`
        });
      });

      return propertiesArr;
    }

    itemOrder.forEach((item) => {
      const conditionalItem = this.ref.conditionalItems.find((cond) => cond.showValue && cond.showValue.name === item);

      addProperties.push({
        variableName: item,
        isAbout: item,
        isVis: this.compressConditional(conditionalItem),
      })
    });

    return addProperties;
  }

  getItemOrder() {
    const { items, conditionalItems } = this.ref;

    if (!items.length) return [];
    return items.map(({ name }) => name);
  }

  getCompressedSchema() {
    const itemOrder = this.getItemOrder();
    const addProperties = this.getAddProperties(itemOrder);
    const reports = this.getReports(this.ref.reports);
    const allowed = [];
    this.ref.isSkippable && allowed.push('skipped');
    this.ref.disableBack && allowed.push('disableBack');
    !this.ref.allowSummary && allowed.push('disableSummary');
    this.ref.exportAvailable && allowed.push('allowExport');

    return {
      '@context': [
        'https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json',
      ],
      _id: this.ref.id,
      '@id': this.ref.name,
      '@type': 'reproschema:Activity',
      'activityType': this.ref.activityType,
      'skos:prefLabel': this.ref.name,
      'skos:altLabel': this.ref.name,
      'schema:description': this.ref.description,
      'schema:splash': this.ref.splash,
      'schema:image': this.ref.image,
      'schema:schemaVersion': '0.0.1',
      'schema:version': '0.0.1',
      preamble: this.ref.preamble,
      isReviewerActivity: this.ref.isReviewerActivity,
      isOnePageAssessment: this.ref.isOnePageAssessment,
      reportIncludeItem: this.ref.reportIncludeItem,
      scoringLogic: {},
      'repronim:timeUnit': 'yearmonthdate',
      isPrize: this.ref.isPrize,
      isVis: this.ref.isVis,
      baseAppletId: this.ref.baseAppletId,
      baseActivityId: this.ref.baseActivityId,
      ui: {
        order: itemOrder,
        shuffle: this.ref.shuffleActivityOrder,
        addProperties: addProperties,
        allow: allowed,
      },
      subScales: this.ref.subScales,
      reports,
      finalSubScale: (this.ref.finalSubScale.variableName ? [this.ref.finalSubScale] : []),
      hasResponseIdentifier: !!this.ref.items.find(item => item.options.isResponseIdentifier),
    };
  }

  getContext(activityName = this.ref.name, items = this.ref.items) {
    const contextObj = {
      '@version': 1.1,
    };
    var isPrefixNeeded = false;
    items.forEach(function (item) {
      if ('iri' in item) {
        contextObj[item.name] = {
          '@id': item.iri,
          '@type': '@id',
        };
      } else {
        contextObj[item.name] = {
          '@id': `${activityName}:${item.name}`,
          '@type': '@id',
        };
        isPrefixNeeded = true;
      }
    });
    if (isPrefixNeeded) {
      contextObj[
        activityName
      ] = `https://raw.githubusercontent.com/YOUR-PATH-TO-ITEM-FOLDER`;
    }

    return {
      '@context': contextObj,
    };
  }

  getActivityData() {
    const schema = this.getCompressedSchema();
    const context = this.getContext();
    const conditionalItems = this.ref.conditionalItems;

    return {
      _id: this.ref.id,
      name: this.ref.name,
      description: this.ref.description,
      isVis: this.ref.isVis,
      splash: this.ref.splash,
      image: this.ref.image,
      preamble: this.ref.preamble,
      isReviewerActivity: this.ref.isReviewerActivity,
      isOnePageAssessment: this.ref.isOnePageAssessment,
      reportIncludeItem: this.ref.reportIncludeItem,
      shuffle: this.ref.shuffleActivityOrder,
      isSkippable: this.ref.isSkippable,
      disableBack: this.ref.disableBack,
      allowSummary: this.ref.allowSummary,
      schema: schema,
      context: context,
      items: [...this.ref.items],
      conditionalItems: conditionalItems,
      subScales: this.ref.subScales,
      isPrize: this.ref.isPrize,
    };
  }

  static getHistoryTemplate(oldValue, newValue) {
    return {
      'skos:prefLabel': {
        updated: (field) =>
          `Activity name was changed to ${_.get(newValue, field)}`,
        inserted: (field) => `Activity name set to ${_.get(newValue, field)}`,
      },
      'schema:description': {
        updated: (field) =>
          `Activity description was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Activity description was removed`,
        inserted: (field) =>
          `Activity description was added (${_.get(newValue, field)})`,
      },
      'schema:splash': {
        updated: (field) =>
          `Activity splash screen was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Activity splash screen was removed`,
        inserted: (field) =>
          `Activity splash screen was added (${_.get(newValue, field)})`,
      },
      'isVis': {
        updated: (field) =>
          `Activity visibility is ${_.get(newValue, field, false) ? 'disabled' : 'enabled'}`
      },
      'schema:image': {
        updated: (field) =>
          `Activity image was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Activity image was removed`,
        inserted: (field) =>
          `Activity image was added (${_.get(newValue, field)})`
      },
      'ui.shuffle': {
        updated: (field) =>
          `shuffle item order was ${
            _.get(newValue, field, false) ? 'enabled' : 'disabled'
          }`,
      },
      'ui.addProperties': {
        updated: (field) => {
          const oldOptions = _.get(oldValue, field, []);
          const newOptions = _.get(newValue, field, []);
          const addedOptions = [];
          const removedOptions = [];
          const insertedOptions = [];
          const updatedOptions = [];

          oldOptions.forEach(option => {
            const property = newOptions.find(newOption => newOption.variableName === option.variableName);

            if (!property) {
              removedOptions.push(option);
            } else if (typeof property.isVis === 'boolean' && typeof option.isVis !== 'boolean') {
              removedOptions.push(option);
            } else if (typeof property.isVis !== 'boolean' && typeof option.isVis === 'boolean') {
              insertedOptions.push(option);
            } else if (typeof property.isVis !== 'boolean' && typeof option.isVis !== 'boolean' && option.isVis !== property.isVis) {
              updatedOptions.push(option);
            }
          });

          newOptions.forEach(option => {
            const property = oldOptions.find(oldOption => oldOption.variableName === option.variableName);

            if (!property) {
              addedOptions.push(option);
            }
          });

          return [
            ...addedOptions.map(option => `conditional logic for ${option.variableName} was added`),
            ...removedOptions.map(option => `conditional logic for ${option.variableName} was removed`),
            ...insertedOptions.map(option => `conditional logic for ${option.variableName} was set to ${option.isVis.toString()}`),
            ...updatedOptions.map(option => `conditional logic for ${option.variableName} was updated to ${option.isVis.toString()}`)
          ];
        }
      },
      'ui.order': {
        updated: (field) => {
          const oldOrder = _.get(oldValue, field, []);
          const newOrder = _.get(newValue, field, []);

          if (oldOrder.length == newOrder.length && JSON.stringify(oldOrder) != JSON.stringify(newOrder)) {
            return ['order of items has been updated']
          }

          return [];
        }
      },
      'preamble': {
        updated: (field) => `preamble was updated to ${_.get(newValue, field)}`,
        inserted: (field) => `preamble was set to ${_.get(newValue, field)}`,
      },
      'ui.allow': {
        updated: (field) => {
          const oldOptions = _.get(oldValue, field, []);
          const newOptions = _.get(newValue, field, []);

          const removedOptions = oldOptions.filter(
            (option) => newOptions.indexOf(option) < 0
          );
          const insertedOptions = newOptions.filter(
            (option) => oldOptions.indexOf(option) < 0
          );

          return [
            ...removedOptions.map((option) => `${option} option was disabled`),
            ...insertedOptions.map((option) => `${option} option was enabled`),
          ];
        },
      },
      'isReviewerActivity': {
        updated: (field) =>
          `Reviewer activity option was ${_.get(newValue, field) ? 'enabled' : 'disabled'}`,
      },
      'isOnePageAssessment': {
        updated: (field) =>
          `Show all questions at once option was ${_.get(newValue, field) ? 'enabled' : 'disabled'}`
      },
      'reportIncludeItem': {
        updated: (field) =>
          `Item value option is updated in activity report`
      },
      'subScales': {
        updated: (field) => {
          const updates = [];
          let newSubScales = _.get(newValue, field, []);
          let oldSubScales = _.get(oldValue, field, []);

          newSubScales.forEach(newSubScale => {
            let oldSubScale = oldSubScales.find(old => old.subScaleId == newSubScale.subScaleId);

            if (newSubScale.subScaleId === undefined || !oldSubScale) {
              updates.push(`subscale (${newSubScale.variableName} | ${newSubScale.jsExpression.replaceAll(' + ', ', ')}) was added`)

              if (newSubScale.lookupTable) {
                updates.push(`lookup table for subscale (${newSubScale.variableName}) was set`);
              }
            } else {
              if (
                oldSubScale.variableName != newSubScale.variableName ||
                oldSubScale.jsExpression != newSubScale.jsExpression
              ) {
                updates.push(`subscale (${oldSubScale.variableName} | ${oldSubScale.jsExpression.replaceAll(' + ', ', ')}) was updated to ${newSubScale.variableName} | ${newSubScale.jsExpression.replaceAll(' + ', ', ')}`);
              }

              if (
                oldSubScale.isAverageScore != newSubScale.isAverageScore
              ) {
                updates.push(`subscale scoring for ${oldSubScale.variableName} was updated to ${newSubScale.isAverageScore ? 'average' : 'sum'}`);
              }

              if (
                JSON.stringify(oldSubScale.lookupTable) !== JSON.stringify(newSubScale.lookupTable)
              ) {
                updates.push(`lookup table for subscale (${oldSubScale.variableName}) was updated`);
              }
            }
          })

          oldSubScales.forEach(oldSubScale => {
            if (!newSubScales.find(newSubScale => newSubScale.subScaleId == oldSubScale.subScaleId)) {
              updates.push(`subscale (${oldSubScale.variableName} | ${oldSubScale.jsExpression.replaceAll(' + ', ', ')}) was removed`)
            }
          })

          return updates;
        }
      },
      'reports': {
        updated: (field) => {
          const updates = [];
          let newReports = _.get(newValue, field, []);
          let oldReports = _.get(oldValue, field, []);

          newReports.forEach(newReport => {
            const oldReport = oldReports.find(report => report.dataType == newReport.dataType && report.prefLabel == newReport.prefLabel);

            if (!oldReport) {
              updates.push(`The ${newReport.dataType} ${newReport.prefLabel} was added.`);
            } else if (JSON.stringify(oldReport) != JSON.stringify(newReport)) {
              updates.push(`The ${newReport.dataType} ${newReport.prefLabel} was updated.`);
            }
          })

          oldReports.forEach(oldReport => {
            const newReport = newReports.find(report => report.dataType == oldReport.dataType && report.prefLabel == oldReport.prefLabel)
            if (!newReport) {
              updates.push(`The ${oldReport.dataType} ${oldReport.prefLabel} was removed.`);
            }
          })

          return updates;
        }
      },
      'finalSubScale': {
        updated: (field) => {
          const newSubScale = _.get(newValue, field, []);
          const oldSubScale = _.get(oldValue, field, []);

          if (newSubScale.length && !oldSubScale.length) {
            return ['Final SubScale was added'];
          }

          if (!newSubScale.length && oldSubScale.length) {
            return ['Final SubScale was deleted'];
          }

          if (JSON.stringify(newSubScale) != JSON.stringify(oldSubScale)) {
            return ['Final SubScale was updated'];
          }

          return [];
        }
      }
    };
  }

  static getChangeInfo(old, current, getDataUpdates = false) {
    const { data: oldData, items: oldItems } = old;

    const { data: currentData, items: currentItems } = current;

    const logTemplates = Activity.getHistoryTemplate(oldData, currentData);
    let versionUpgrade = '0.0.0';

    const metaInfoChanges = util.compareValues(
      oldData,
      currentData,
      Object.keys(logTemplates)
    );
    const itemChanges = util.compareIDs(oldItems, currentItems, '_id');
    let updates = { items: {} };
    let removed = [];

    const changeLog = [];

    Object.keys(metaInfoChanges).forEach((key) => {
      const changeType = metaInfoChanges[key];
      let logs = [];

      if (logTemplates[key][changeType]) {
        logs = logTemplates[key][changeType](key);
      } else {
        logs = logTemplates[key]['updated'](key);
      }

      if (!Array.isArray(logs)) {
        logs = [logs];
      }

      logs.forEach((log) => {
        changeLog.push({
          name: log,
          type: metaInfoChanges[key],
        });
      });
    });

    const result = [];

    /** log activity metadata changes */

    if (changeLog.length) {
      result.push({
        name: 'activity metadata',
        children: changeLog,
      });

      versionUpgrade = '0.0.1';
    }

    const itemLogs = [];

    if (itemChanges.inserted.length || itemChanges.removed.length) {
      versionUpgrade = '0.1.0';
    }

    if (versionUpgrade !== '0.0.0' && getDataUpdates) {
      updates.data = currentData;
    }

    /** display log for updated activities */
    Object.entries(itemChanges.keyReferences).forEach((entry) => {
      const changeLog = Item.getChangeInfo(
        oldItems[entry[0]],
        currentItems[entry[1]]
      );

      if (versionUpgrade < changeLog.upgrade) {
        versionUpgrade = changeLog.upgrade;
      }

      if (changeLog.upgrade !== '0.0.0') {
        itemLogs.push({
          name: `item ${currentItems[entry[1]]['skos:prefLabel']} was updated`,
          type: 'updated',
          itemId: currentItems[entry[1]] && currentItems[entry[1]]._id,
          children: changeLog.log,
        });

        if (getDataUpdates) {
          updates.items[entry[1]] = currentItems[entry[1]];
          updates.data = currentData;
        }
      }
    });

    /** display log for new items */
    itemChanges.inserted.forEach((id) => {
      const changeLog = Item.getChangeInfo({}, currentItems[id]);

      itemLogs.push({
        name: `item ${currentItems[id]['skos:prefLabel']} was added`,
        type: 'inserted',
        itemId: currentItems[id] && currentItems[id]._id,
        children: changeLog.log,
      });

      if (getDataUpdates) {
        updates.items[id] = currentItems[id];
        updates.data = currentData;
      }
    });

    /** display log for removed items */
    itemChanges.removed.forEach((id) => {
      itemLogs.push({
        name: `item ${oldItems[id]['skos:prefLabel']} was removed`,
        type: 'removed',
        children: [],
      });

      if (getDataUpdates) {
        removed.push(oldItems[id]._id);
      }
    });

    /** log activity changes */
    if (itemLogs.length) {
      result.push({
        name: 'items',
        children: itemLogs,
      });
    }

    return {
      log: result,
      upgrade: versionUpgrade,
      updates,
      removed,
    };
  }

  static parseJSONLD(act) {
    const activitiesObj = act;
    const {
      ['http://www.w3.org/2004/02/skos/core#prefLabel']: name,
      ['schema:description']: description,
      ['reprolib:terms/isVis']: visibility,
      ['schema:splash']: splash,
      ['schema:image']: image,
      ['reprolib:terms/preamble']: activityPreamble,
      ['reprolib:terms/isReviewerActivity']: isReviewerActivity,
      ['reprolib:terms/isOnePageAssessment']: isOnePageAssessment,
      ['reprolib:terms/shuffle']: shuffle,
      ['reprolib:terms/allow']: allow,
      ['reprolib:terms/addProperties']: addProperties,
      ['reprolib:terms/subScales']: subScales,
      ['reprolib:terms/finalSubScale']: finalSubScale,
      ['reprolib:terms/scoreOverview']: scoreOverview,
      ['reprolib:terms/isPrize']: isPrize,
      ['reprolib:terms/order']: orders,
      ['reprolib:terms/activityType']: activityType,
      ['reprolib:terms/reportIncludeItem']: reportIncludeItem,
      ['_id']: id,
    } = activitiesObj;

    const visibilities = addProperties.map((property) => {
      const isAbout = _.get(
        property,
        'reprolib:terms/isAbout.0.@id',
        ""
      );
      const isVis = _.get(
        property,
        'reprolib:terms/isVis.0.@value',
        ""
      );
      const variableName = _.get(
        property,
        'reprolib:terms/variableName.0.@value',
        ""
      );
      return {
        isAbout,
        isVis,
        variableName,
      }
    });

    const parseLookupTable = (isFinalSubScale, lookupTable) => (Array.isArray(lookupTable) && lookupTable.map(row => {
      const age = row['reprolib:terms/age'];
      const rawScore = row['reprolib:terms/rawScore'];
      const sex = row['reprolib:terms/sex'];
      const tScore = row['reprolib:terms/tScore'];
      const outputText = row['reprolib:terms/outputText'];

      let data = {
        rawScore: rawScore && rawScore[0] && rawScore[0]['@value'] || '',
        outputText: outputText && outputText[0] && outputText[0]['@value']
      }

      if (!isFinalSubScale) {
        Object.assign(data, {
          age: age && age[0] && age[0]['@value'] || '',
          sex: sex && sex[0] && sex[0]['@value'] || '',
          tScore: tScore && tScore[0] && tScore[0]['@value'] || ''
        })
      }

      return data;
    }) || null);

    const activityInfo = {
      _id: id && id.split('/')[1],
      name:
        name && name[0] && name[0]['@value'],
      description:
        description && description[0] && description[0]['@value'],
      isVis:
        visibility && visibility[0] && visibility[0]['@value'],
      splash:
        splash && splash[0] && splash[0]['@value'],
      image:
        image || '',
      isPrize:
        isPrize && isPrize[0] && isPrize[0]['@value'],
      preamble:
        activityPreamble &&
        activityPreamble[0] &&
        activityPreamble[0]['@value'],
      activityType:
        activityType &&
        activityType[0] &&
        activityType[0]['@value'] || 'NORMAL',
      isReviewerActivity:
        isReviewerActivity &&
        isReviewerActivity[0] &&
        isReviewerActivity[0]['@value'],
      isOnePageAssessment:
        isOnePageAssessment &&
        isOnePageAssessment[0] &&
        isOnePageAssessment[0]['@value'],
      shuffle: shuffle && shuffle[0] && shuffle[0]['@value'],
      reportIncludeItem: _.get(reportIncludeItem, [0, '@value'], ''),
      visibilities,
      subScales: Array.isArray(subScales) && subScales.map((subScale, index) => {
        const jsExpression = subScale['reprolib:terms/jsExpression'];
        const variableName = subScale['reprolib:terms/variableName'];
        const lookupTable = subScale['reprolib:terms/lookupTable'];
        const isAverageScore = subScale['reprolib:terms/isAverageScore'];

        let subScaleData = {
          isAverageScore: _.get(isAverageScore, [0, '@value'], false),
          jsExpression: _.get(jsExpression, [0, '@value']),
          variableName: _.get(variableName, [0, '@value']),
          subScaleId: index + 1,
        };

        if (lookupTable && Array.isArray(lookupTable)) {
          subScaleData.lookupTable = parseLookupTable(false, lookupTable);
        }

        return subScaleData;
      }),
      reports: _.get(activitiesObj, ['reprolib:terms/reports', 0, '@list'], []).map((report, index) => {
        const dataType = _.get(report, ['schema:DataType', 0, '@id']);
        const message = _.get(report, ['reprolib:terms/message', 0, '@value']);
        const printItems = _.get(report, ['reprolib:terms/printItems', 0, '@list'], []).map(item => item['@value']);

        const data = {
          id: report['@id'],
          prefLabel: _.get(report, ['http://www.w3.org/2004/02/skos/core#prefLabel', 0, '@value']),
          showMessage: message.length > 0,
          message,
          showItems: printItems.length > 0,
          printItems,
          dataType,
          timestamp: Date.now() - index * 10
        }

        if (dataType == 'score') {
          Object.assign(data, {
            initialized: true,
            outputType: _.get(report, ['reprolib:terms/outputType', 0, '@value']),
            jsExpression: _.get(report, ['reprolib:terms/jsExpression', 0, '@value']),
            conditionals: _.get(report, ['reprolib:terms/conditionals', 0, '@list'], []).map((conditional, index) => {
              const message = _.get(conditional, ['reprolib:terms/message', 0, '@value']);
              const printItems = _.get(conditional, ['reprolib:terms/printItems', 0, '@list'], []).map(item => item['@value']);

              return {
                prefLabel: _.get(conditional, ['http://www.w3.org/2004/02/skos/core#prefLabel', 0, '@value']),
                id: conditional['@id'],
                showMessage: message.length > 0,
                message,
                showItems: printItems.length > 0,
                printItems,
                isVis: _.get(conditional, ['reprolib:terms/isVis', 0, '@value']),
                flagScore: _.get(conditional, ['reprolib:terms/flagScore', 0, '@value']),
                expanded: false,
                timestamp: Date.now() - index * 10,
                valid: true
              }
            })
          })
        } else {
          data.isVis = _.get(report, ['reprolib:terms/isVis', 0, '@value']);
        }

        return data;
      }),
      finalSubScale: finalSubScale && finalSubScale[0] && {
        isAverageScore: _.get(finalSubScale, [0, 'reprolib:terms/isAverageScore', 0, '@value'], false),
        lookupTable: parseLookupTable(true, _.get(finalSubScale, [0, 'reprolib:terms/lookupTable'], null)),
        variableName: _.get(finalSubScale, [0, 'reprolib:terms/variableName', 0, '@value'])
      },
      scoreOverview: _.get(scoreOverview, [0, '@value']),
      orderList: _.get(orders, '0.@list', []).map(order => order['@id'])
    };

    let allowList = _.get(allow, [0, '@list'], [])
      .map(item => item["@id"]);

    if (allowList.some((item) => item.includes('refused_to_answer') || item.includes('dontKnow'))) {
      activityInfo.isSkippable = true;
    }
    if (allowList.some((item) => item.includes('disable_back'))) {
      activityInfo.disableBack = true;
    }
    activityInfo.allowSummary = allowList.length ? !allowList.some((item) => item.includes('disable_summary')) : false;
    activityInfo.exportAvailable = allowList.some(item => item.includes('allow_export'))

    activityInfo.valid = true;

    return activityInfo;
  }

  static checkValidation(act) {
    if (!act.name) {
      return false;
    }

    return true;
  }

  static checkReportValidation (report, allReports) {
    if (!report.prefLabel || !report.prefLabel.match(/^[a-zA-Z_]+$/)) {
      return false;
    }

    if (allReports.find(section => section.dataType == report.dataType && section.prefLabel == report.prefLabel && section != report)) {
      return false;
    }

    if (report.showItems && !report.printItems.length || report.showMessage && !report.message) {
      return false;
    }

    if (report.dataType == 'score') {
      // validation on score
      for (const conditional of report.conditionals) {
        if (!conditional.conditionalItem.valid) {
          return false;
        }
      }

      if (!report.jsExpression) {
        return false;
      }
    } else {
      // validation on section
      if (!report.showItems && !report.showMessage) {
        return false;
      }

      if (!report.conditionalItem.valid) {
        return false;
      }
    }

    return true;
  }
}
