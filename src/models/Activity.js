import util from '../utilities/util';
import Item from './Item';
export default class Activity {
  constructor() {
    this.ref = null;
  }

  getActivityBuilderData(initialActivityData) {
    return {
      name: initialActivityData.name || '',
      description: initialActivityData.description || '',
      preamble: initialActivityData.preamble || '',
      shuffleActivityOrder: initialActivityData.shuffle || false,
      isSkippable: initialActivityData.isSkippable || false,
      items: initialActivityData.items || [],
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
      editConditionalItemIndex: -1,
      conditionalRadioItems: [],
      conditionalSliderItems: [],
      ifConditionalAvailable: false,
      isConditionalEditMode: false,
      editConditionalItemDialog: false,
      conditionalItems: initialActivityData.conditionalItems || [],
      conditionalBuilderType: '',
      conditionalItemsForBuilder: [],
    };
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getItemVisibility() {
    const visibilityObj = {};
    this.ref.items.forEach(function(item) {
      visibilityObj[item.name] = true;
    });
    return visibilityObj;
  }

  getAddProperties() {
    const addProperties = [];
    this.ref.items.forEach((item) => {
      const conditionalItems = this.ref.conditionalItems.filter((cond) => {
        return cond.showValue === item.question;
      });

      let isVis = true;

      if (conditionalItems.length) {
        const visibleItems = conditionalItems.map((cond) => {
          if (cond.stateValue.val === 'within') {
            return `${cond.ifValue.name} > ${cond.minValue} && ${cond.ifValue.name} < ${cond.maxValue}`;
          } else if (cond.stateValue.val === 'outsideof') {
            return `${cond.ifValue.name} < ${cond.minValue} && ${cond.ifValue.name} > ${cond.maxValue}`;
          } else if (!cond.answerValue) {
            return `${cond.ifValue.name} ${cond.stateValue.val} ${cond.minValue}`;
          } else {
            return `${cond.ifValue.name} ${cond.stateValue.val} ${cond.answerValue.value}`;
          }
        });
        isVis = visibleItems.join(' && ');
      }

      const property = {
        variableName: item.name,
        isAbout: item.name,
        isVis: isVis,
      };
      addProperties.push(property);
    });
    return addProperties;
  }

  getItemOrder() {
    const itemNamesArray = this.ref.items.map((item) => item.name);
    return itemNamesArray;
  }

  getAllowed() {
    return this.ref.isSkippable ? ['skipped'] : [];
  }

  getCompressedSchema() {
    const addProperties = this.getAddProperties();
    const visibility = this.getItemVisibility();
    const itemOrder = this.getItemOrder();
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
      conditionalItems: conditionalItems
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
      preamble: {
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

      if (getDataUpdates) {
        updates.data = currentData;
      }
    }

    const itemLogs = [];

    if (itemChanges.inserted.length || itemChanges.removed.length) {
      versionUpgrade = '0.1.0';
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
