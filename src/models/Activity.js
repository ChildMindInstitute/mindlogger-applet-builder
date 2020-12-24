import util from '../utilities/util';
import Item from './Item';
export default class Activity {
  constructor() {
    this.ref = null;
  }

  getActivityBuilderData(initialActivityData) {
    if (initialActivityData.schema) {
      initialActivityData.conditionalItems = this.getConditionalItems(initialActivityData.schema, initialActivityData.items);
    }
    return {
      name: initialActivityData.name || '',
      description: initialActivityData.description || '',
      preamble: initialActivityData.preamble || '',
      shuffleActivityOrder: initialActivityData.shuffle || false,
      isSkippable: initialActivityData.isSkippable || false,
      items: initialActivityData.items && initialActivityData.items.map(item => item) || [],
      id: initialActivityData._id || null,
      textRules: [(v) => !!v || 'This field is required'],
      editItemDialog: false,
      urlDialog: false,
      error: '',
      componentKey: 0,
      initialItemData: {
        options: {},
      },
      isItemEditable: true,
      editIndex: -1,
      initialConditionalItemData: {},
      visibilities: initialActivityData.visibilities || [],
      editConditionalItemIndex: -1,
      conditionalRadioItems: [],
      conditionalSliderItems: [],
      ifConditionalAvailable: false,
      isConditionalEditMode: false,
      editConditionalItemDialog: false,
      conditionalItems: initialActivityData.conditionalItems || [],
      conditionalBuilderType: '',
      conditionalItemsForBuilder: [],
      subScales: initialActivityData.subScales && initialActivityData.subScales.map(subScale => subScale) || [],
      compute: initialActivityData.compute && initialActivityData.compute.map(compute => compute) || [],
      messages: initialActivityData.messages && initialActivityData.messages.map(message => message) || [],
      allowEdit: true,
    };
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getConditionalItems(schema, items) {
    const addProperties = schema.ui.addProperties;
    const conditionalItems = [];

    addProperties.forEach((property) => {
      let ifValue, stateValue, answerValue;
      const showValue = property.variableName;
      if (typeof property.isVis === 'boolean') return;

      const isVis = property.isVis.split(' ').join('');
      const outsideRegExp = /(\w+)<(\d+)\|\|(\w+)>(\d+)/;
      const outsideValues = isVis.match(outsideRegExp);
      const insideRegExp = /(\w+)>(\d+)\&\&(\w+)<(\d+)/;
      const withinValues = isVis.match(insideRegExp);

      const includeRegExp = /(\w+)\.includes\((\w+)\)/;
      const includeValues = isVis.match(includeRegExp);
      const excludeRegExp = /!(\w+)\.includes\((\w+)\)/;
      const excludeValues = isVis.match(excludeRegExp);
  
      if (outsideValues) {
        conditionalItems.push({
          ifValue: items.find(({ name }) => name === outsideValues[1]),
          maxValue: outsideValues[4],
          minValue: outsideValues[2],
          showValue,
          stateValue: {
            name: "OUTSIDE OF",
            val: "outsideof"
          }
        });
      } else if (withinValues) {
        conditionalItems.push({
          ifValue: items.find(({ name }) => name === withinValues[1]),
          maxValue: withinValues[4],
          minValue: withinValues[2],
          showValue,
          stateValue: {
            name: "WITHIN",
            val: "within"
          }
        });
      } else if (excludeValues) {
        const itemValue = items.find(({ name }) => name === excludeValues[1]);
        const option = itemValue.responseOptions.choices.find(choice => choice['schema:value'] == excludeValues[2]);

        conditionalItems.push({
          ifValue: itemValue,
          showValue,
          answerValue: {
            name: option['schema:name'],
            value: option['schema:value']
          },
          stateValue: {
            name: "Doesn't include",
            val: "!includes",
          }
        })
      } else if (includeValues) { 
        const itemValue = items.find(({ name }) => name === includeValues[1]);
        const option = itemValue.responseOptions.choices.find(choice => choice['schema:value'] == includeValues[2]);

        conditionalItems.push({
          ifValue: itemValue,
          showValue,
          answerValue: {
            name: option['schema:name'],
            value: option['schema:value']
          },
          stateValue: {
            name: "Includes",
            val: "includes",
          }
        })
      } else {
        let values = [], minValue;
        if (isVis.includes('==')) {
          values = isVis.split('==');
          stateValue = {
            name: 'IS EQUAL TO',
            val: '==',
          };
          ifValue = items.find(({ name }) => name === values[0]);

          const option = ifValue.responseOptions.choices.find(choice => choice['schema:value'] == values[1]);
          answerValue = {
            name: option['schema:name'],
            value: option['schema:value']
          };
        } else if (isVis.includes('!=')) {
          values = isVis.split('!=');
          stateValue = {
            name: 'IS NOT EQUAL TO',
            val: '!=',
          };
          ifValue = items.find(({ name }) => name === values[0]);
          
          const option = ifValue.responseOptions.choices.find(choice => choice['schema:value'] == values[1]);
          answerValue = {
            name: option['schema:name'],
            value: option['schema:value']
          };
        } else if (isVis.includes('>')) {
          values = isVis.split('>');
          stateValue = {
            name: 'GREATER THEN',
            val: '>',
          };
          ifValue = items.find(({ name }) => name === values[0]);
          minValue = values[1];
        } else if (isVis.includes('<')) {
          values = isVis.split('<');
          stateValue = {
            name: 'LESS THEN',
            val: '<',
          };
          ifValue = items.find(({ name }) => name === values[0]);
          minValue = values[1];
        } else if (isVis.includes('=')) {
          values = isVis.split('=');
          stateValue = {
            name: 'EQUAL TO',
            val: '=',
          };
          ifValue = items.find(({ name }) => name === values[0]);
          minValue = values[1];
        }

        conditionalItems.push({
          ifValue,
          stateValue,
          answerValue,
          minValue,
          showValue,
        });
      }
    });

    return conditionalItems;
  }

  getItemVisibility() {
    const visibilityObj = {};
    this.ref.items.forEach(function(item) {
      visibilityObj[item.name] = true;
    });
    return visibilityObj;
  }

  getAddProperties(itemOrder) {
    const addProperties = [];
    itemOrder.forEach((item) => {
      const conditionalItems = this.ref.conditionalItems.filter((cond) => {
        return cond.showValue === item;
      });
      
      let isVis = true;
      if (conditionalItems.length) {
        const visibleItems = conditionalItems.map((cond) => {
          if (cond.stateValue.val === 'within') {
            return `${cond.ifValue.name} > ${cond.minValue} && ${cond.ifValue.name} < ${cond.maxValue}`;
          } else if (cond.stateValue.val === 'outsideof') {
            return `${cond.ifValue.name} < ${cond.minValue} || ${cond.ifValue.name} > ${cond.maxValue}`;
          } else if (cond.stateValue.val === 'includes') { 
            return `${cond.ifValue.name}.${cond.stateValue.val}(${cond.answerValue.value})`
          } else if (cond.stateValue.val === '!includes') {
            return `!${cond.ifValue.name}.includes(${cond.answerValue.value})`
          } else if (!cond.answerValue) {
            return `${cond.ifValue.name} ${cond.stateValue.val} ${cond.minValue}`;
          } else {
            return `${cond.ifValue.name} ${cond.stateValue.val} ${cond.answerValue.value}`;
          }
        });
        isVis = visibleItems.join(' && ');
      }
      if (this.ref.visibilities && this.ref.visibilities.length) {
        const visibility = this.ref.visibilities.find(({ variableName }) => variableName === item);
        isVis = visibility ? visibility.isVis : isVis;
      }

      const property = {
        variableName: item,
        isAbout: item,
        isVis,
      };
      addProperties.push(property);
    });
    return addProperties;
  }

  getItemOrder() {
    const { items, conditionalItems } = this.ref;
    const itemNamesArray = [];

    if (!items.length) return itemNamesArray;

    itemNamesArray.push(items[0].name);
    for (let i = 0; i != itemNamesArray.length;) {
      i = itemNamesArray.length;
      itemNamesArray.forEach(name => {
        conditionalItems.forEach(item => {
          if (item.ifValue.name === name && !itemNamesArray.includes(item.showValue)) {
            itemNamesArray.push(item.showValue);
          }
        })
      })

      if (i === itemNamesArray.length) {
        items.forEach(({ name }) => {
          const endedItems = conditionalItems.filter(item => item.showValue === name);
          if (!itemNamesArray.includes(name) && !endedItems.length) {
            itemNamesArray.push(name);
          }
        })
      }
    }

    return itemNamesArray;
  }

  getAllowed() {
    return this.ref.isSkippable ? ['skipped'] : [];
  }

  getCompressedSchema() {
    const visibility = this.getItemVisibility();
    const itemOrder = this.getItemOrder();
    const addProperties = this.getAddProperties(itemOrder);
    const allowed = this.getAllowed();
    return {
      '@context': [
        'https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json',
      ],
      '@type': 'reproschema:Activity',
      _id: this.ref.id,
      '@id': this.ref.name,
      'skos:prefLabel': this.ref.name,
      'skos:altLabel': this.ref.name,
      'schema:description': this.ref.description,
      'schema:schemaVersion': '0.0.1',
      'schema:version': '0.0.1',
      preamble: this.ref.preamble,
      scoringLogic: {},
      'repronim:timeUnit': 'yearmonthdate',
      ui: {
        order: itemOrder,
        shuffle: this.ref.shuffleActivityOrder,
        addProperties: addProperties,
        allow: allowed,
      },
      subScales: this.ref.subScales,
      compute: this.ref.compute,
      messages: this.ref.messages,
    };
  }

  getContext() {
    const activityName = this.ref.name;
    const contextObj = {
      '@version': 1.1,
    };
    var isPrefixNeeded = false;
    this.ref.items.forEach(function(item) {
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
    const items = this.ref.items;
    const conditionalItems = this.ref.conditionalItems;
    return {
      _id: this.ref.id,
      name: this.ref.name,
      description: this.ref.description,
      preamble: this.ref.preamble,
      shuffle: this.ref.shuffleActivityOrder,
      isSkippable: this.ref.isSkippable,
      schema: schema,
      context: context,
      items: items,
      conditionalItems: conditionalItems,
      subScales: this.ref.subScales,
      compute: this.ref.compute,
      messages: this.ref.messages,
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
    
          const removedOptions = oldOptions.filter(option => !newOptions.some(newOption => newOption.variableName == option.variableName));
          const insertedOptions = newOptions.filter(option => !oldOptions.some(oldOption => oldOption.variableName == option.variableName));
          const updatedOptions = newOptions.filter(option => !oldOptions.some(oldOption => oldOption.variableName == option.variableName && oldOption.isVis == option.isVis))

          return [
            ...removedOptions.map(option => `conditional logic for ${option.variableName} was removed`),
            ...insertedOptions.map(option => `conditional logic for ${option.variableName} was set to ${option.isVis.toString()}`),
            ...updatedOptions.map(option => `conditional logic for ${option.variableName} was updated to ${option.isVis.toString()}`)
          ];
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
      'subScales': {
        updated: (field) => {
          const updates = [];
          let newSubScales = _.get(newValue, field, []);
          let oldSubScales = _.get(oldValue, field, []);

          newSubScales.forEach(newSubScale => {
            if (newSubScale.subScaleId === undefined) {
              updates.push(`subscale (${newSubScale.variableName} | ${newSubScale.jsExpression.replaceAll(' + ', ', ')}) was added`)

              if (newSubScale.lookupTable) {
                updates.push(`lookup table for subscale (${newSubScale.variableName}) was set`);
              }
            } else {
              let oldSubScale = oldSubScales.find(old => old.subScaleId == newSubScale.subScaleId);

              if (
                oldSubScale.variableName != newSubScale.variableName || 
                oldSubScale.jsExpression != newSubScale.jsExpression
              ) {
                updates.push(`subscale (${oldSubScale.variableName} | ${oldSubScale.jsExpression.replaceAll(' + ', ', ')}) was updated to ${newSubScale.variableName} | ${newSubScale.jsExpression.replaceAll(' + ', ', ')}`);
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
      'compute': {
        updated: (field) => {
          const newCumulatives = _.get(newValue, field, []);
          const oldCumulatives = _.get(oldValue, field, []);
          const updates = [];

          oldCumulatives.forEach(oldCumulative => {
            const newCumulative = newCumulatives.find(newCumulative => oldCumulative.variableName === newCumulative.variableName);
            if (newCumulative) {
              const newMessages = _.get(newValue, 'messages', []).filter(
                message => message.jsExpression.split(/[<>]=*\s/g)[0].trim() == newCumulative.variableName.trim()
              );

              const oldMessages = _.get(oldValue, 'messages', []).filter(
                message => message.jsExpression.split(/[<>]=*\s/g)[0].trim() == oldCumulative.variableName.trim()
              );

              if (newCumulative.jsExpression !== oldCumulative.jsExpression || JSON.stringify(oldMessages) !== JSON.stringify(newMessages)) {
                updates.push(`cumulative ${oldCumulative.variableName} was updated`);
              }
            } else {
              updates.push(`cumulative ${oldCumulative.variableName} was removed`);
            }
          });

          newCumulatives.forEach(newCumulative => {
            const oldCumulative = oldCumulatives.find(oldCumulative => oldCumulative.variableName === newCumulative.variableName);

            if (!oldCumulative) {
              updates.push(`cumulative ${newCumulative.variableName} was added`);
            }
          });

          return updates;
        }
      },
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
        name: `item ${currentItems[id]['skos:prefLabel']} was inserted`,
        type: 'inserted',
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
}
