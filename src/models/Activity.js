import util from '../utilities/util';
import Item from './Item';
export default class Activity {
  constructor() {
    this.ref = null;
  }

  getActivityBuilderData(initialActivityData) {
    if (initialActivityData.visibilities && initialActivityData.visibilities.length) {
      initialActivityData.conditionalItems = this.getConditionalItems(initialActivityData, initialActivityData.items);
    }

    const items = (initialActivityData.items || []).map(item => item);

    if (initialActivityData.compute && initialActivityData.compute.length) {
      const itemModel = new Item();

      const cumulative = itemModel.getItemBuilderData({
        name: 'cumulatives',
        ui: {
          inputType: 'cumulativeScore'
        },
        cumulativeScores: initialActivityData.compute.map(compute => {
          return {
            compute,
            messages: initialActivityData.messages.filter(message => message.jsExpression.split(/[<>]=*\s/g)[0].trim() == compute.variableName.trim()),
            valid: true,
          }
        }).filter(cumulative => cumulative.messages.length === 2),
        valid: true,
      });

      items.push(cumulative);
    }

    return {
      name: initialActivityData.name || '',
      description: initialActivityData.description || '',
      preamble: initialActivityData.preamble || '',
      shuffleActivityOrder: initialActivityData.shuffle || false,
      isSkippable: initialActivityData.isSkippable || false,
      items,
      disableBack: initialActivityData.disableBack || false,
      items: initialActivityData.items && initialActivityData.items.map(item => item) || [],
      id: initialActivityData._id || null,
      textRules: [(v) => !!v || 'This field is required'],
      error: '',
      componentKey: 0,
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
      allowEdit: true,
      isPrize: initialActivityData.isPrize || false,
      valid: initialActivityData.valid !== undefined ? initialActivityData.valid : true,
    };
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getConditionalItems(activity, items) {
    const visibilities = activity.visibilities || [];
    const conditionalItems = [];

    const itemChoices = [];

    for (let i = 0; i < items.length; i++) {
      const itemModel = new Item();
      itemModel.updateReferenceObject(items[i]);

      const options = itemModel.getResponseOptions();
      itemChoices.push(options.choices);
    }

    console.log('visibility -------------->', this.visibilities);

    visibilities.forEach((property) => {
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
        const itemIndex = items.findIndex(({ name }) => name === excludeValues[1]);
        const option = itemChoices[itemIndex].find(choice => choice['schema:value'] == excludeValues[2]);

        conditionalItems.push({
          ifValue: items[itemIndex],
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
        const itemIndex = items.findIndex(({ name }) => name === includeValues[1]);
        const option = itemChoices[itemIndex].find(choice => choice['schema:value'] == includeValues[2]);

        conditionalItems.push({
          ifValue: items[itemIndex],
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
        if (isVis.includes('!=')) {
          values = isVis.includes('!==') ? isVis.split('!==') : isVis.split('!=');
          stateValue = {
            name: 'IS NOT EQUAL TO',
            val: '!=',
          };
          const itemIndex = items.findIndex(({ name }) => name === values[0]);
          
          const option = itemChoices[itemIndex].find(choice => choice['schema:value'] == values[1]);
          ifValue = items[itemIndex];
          answerValue = {
            name: option['schema:name'],
            value: option['schema:value']
          };
        } else if (isVis.includes('==')) {
          values = isVis.split('==');
          stateValue = {
            name: 'IS EQUAL TO',
            val: '==',
          };

          const itemIndex = items.findIndex(({ name }) => name === values[0]);
          if (itemIndex < 0) {
            return;
          }

          const option = itemChoices[itemIndex].find(choice => choice['schema:value'] == values[1]);

          if (!option) {
            return;
          }

          ifValue = items[itemIndex];
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

    if (this.ref.isPrize) {
      const prizeItem = this.ref.items[0];
      const propertiesArr = [{
        "variableName": prizeItem.name,
        "isAbout": prizeItem.name,
        "isVis": true
      }];

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

    if (this.ref.isPrize) {
      const prizeItem = items[0];

      itemNamesArray.push(prizeItem.name);

      prizeItem.options.options.forEach((option, index) => {
        const confirmItem = items[index + 1];
        itemNamesArray.push(confirmItem.name);
      });

      return itemNamesArray;
    }

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

  getCompressedSchema() {
    const visibility = this.getItemVisibility();
    const itemOrder = this.getItemOrder();
    const addProperties = this.getAddProperties(itemOrder);
    const allowed = [];
    this.ref.isSkippable && allowed.push('skipped');
    this.ref.disableBack && allowed.push('disableBack');

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
      isPrize: this.ref.isPrize,
      ui: {
        order: itemOrder,
        shuffle: this.ref.shuffleActivityOrder,
        addProperties: addProperties,
        allow: allowed,
      },
      subScales: this.ref.subScales,
      ...this.parseCumulative(),
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

  parseCumulative () {
    const item = this.ref.items.find(item => item.ui.inputType === 'cumulativeScore');

    let compute = [], messages = [];

    if (item) {
      item.cumulativeScores.forEach(cumulative => {
        compute.push(cumulative.compute);
        messages.push(...cumulative.messages);
      })
    }

    return {
      compute,
      messages,
    }
  }

  getActivityData() {
    const schema = this.getCompressedSchema();
    const context = this.getContext();
    const conditionalItems = this.ref.conditionalItems;
    return {
      _id: this.ref.id,
      name: this.ref.name,
      description: this.ref.description,
      preamble: this.ref.preamble,
      shuffle: this.ref.shuffleActivityOrder,
      isSkippable: this.ref.isSkippable,
      disableBack: this.ref.disableBack,
      schema: schema,
      context: context,
      items: this.ref.items.filter(item => item.ui.inputType !== 'cumulativeScore'),
      conditionalItems: conditionalItems,
      subScales: this.ref.subScales,
      ...this.parseCumulative(),
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

  static parseJSONLD(act) {
    const activitiesObj = act;
    const {
      ['http://www.w3.org/2004/02/skos/core#prefLabel']: name,
      ['schema:description']: description,
      ['reprolib:terms/preamble']: activityPreamble,
      ['reprolib:terms/shuffle']: shuffle,
      ['reprolib:terms/allow']: allow,
      ['reprolib:terms/addProperties']: addProperties,
      ['reprolib:terms/subScales']: subScales,
      ['reprolib:terms/compute']: compute,
      ['reprolib:terms/messages']: messages,
      ['reprolib:terms/isPrize']: isPrize,
      ['reprolib:terms/order']: orders,
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

    const activityInfo = {
      _id: id && id.split('/')[1],
      name:
        name && name[0] && name[0]['@value'],
      description:
        description && description[0] && description[0]['@value'],
      isPrize:
        isPrize && isPrize[0] && isPrize[0]['@value'],
      preamble:
        activityPreamble &&
        activityPreamble[0] &&
        activityPreamble[0]['@value'],
      shuffle: shuffle && shuffle[0] && shuffle[0]['@value'],
      visibilities,
      subScales: Array.isArray(subScales) && subScales.map((subScale, index) => {
        const jsExpression = subScale['reprolib:terms/jsExpression'];
        const variableName = subScale['reprolib:terms/variableName'];
        const lookupTable = subScale['reprolib:terms/lookupTable'];

        let subScaleData = {
          jsExpression: jsExpression[0] && jsExpression[0]['@value'],
          variableName: variableName[0] && variableName[0]['@value'],
          subScaleId: index + 1,
        };

        if (lookupTable && Array.isArray(lookupTable)) {
          subScaleData['lookupTable'] = lookupTable.map(row => {
            const age = row['reprolib:terms/age'];
            const rawScore = row['reprolib:terms/rawScore'];
            const sex = row['reprolib:terms/sex'];
            const tScore = row['reprolib:terms/tScore'];

            return {
              age: age && age[0] && age[0]['@value'] || '',
              rawScore: rawScore && rawScore[0] && rawScore[0]['@value'] || '',
              sex: sex && sex[0] && sex[0]['@value'] || '',
              tScore: tScore && tScore[0] && tScore[0]['@value'] || '',
            }
          })
        }

        return subScaleData;
      }),
      compute: Array.isArray(compute) && compute.map((exp) => {
        const jsExpression = exp['reprolib:terms/jsExpression'];
        const variableName = exp['reprolib:terms/variableName'];

        return {
          jsExpression: jsExpression && jsExpression[0] && jsExpression[0]['@value'],
          variableName: variableName && variableName[0] && variableName[0]['@value'],
        }
      }),
      messages: Array.isArray(messages) && messages.map((msg) => {
        const jsExpression = msg['reprolib:terms/jsExpression'];
        const message = msg['reprolib:terms/message'];
        const outputType = msg['reprolib:terms/outputType']

        return {
          jsExpression: _.get(jsExpression, [0, '@value']),
          message: _.get(message, [0, '@value']),
          outputType: _.get(outputType, [0, '@value'], 'cumulative'),
        }
      }),
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

    activityInfo.valid = true;

    return activityInfo;
  }

  static checkValidation (act) {
    if (!act.name || !act.description) {
      return false;
    }

    return true;
  }
}
