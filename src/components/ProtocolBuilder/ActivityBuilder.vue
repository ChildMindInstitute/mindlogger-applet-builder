<template>
  <div>
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>
        <v-icon left>
          mdi-pencil
        </v-icon>
        Edit Activity
      </v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-text-field
            v-model="name"
            :rules="textRules"
            counter="50"
            maxlength="50"
            label="Activity Name"
            required
          />
          <v-text-field
            v-model="description"
            :rules="textRules"
            counter="100"
            maxlength="100"
            label="Activity Description"
            required
          />
          <v-text-field
            v-model="preamble"
            counter="20"
            maxlength="20"
            label="Preamble"
            required
          />
          <v-checkbox
            v-model="shuffleActivityOrder"
            label="Shuffle item order"
          />
          <v-checkbox v-model="isSkippable" label="Allow items to be skipped" />
          <v-tabs centered>
            <v-tab>
              Items
            </v-tab>
            <v-tab v-if="conditionalItems.length">
              Conditional logic items
            </v-tab>

            <v-tab-item>
              <v-card flat>
                <v-card-text>
                  <v-list>
                    <v-list-item v-for="(item, index) in items" :key="item.id">
                      <v-list-item-content>
                        <v-list-item-title v-text="item.name" />
                        <v-list-item-title v-text="item.inputType" />
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon @click="duplicateItem(index)">
                          <v-icon color="grey lighten-1">
                            content_copy
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-btn icon @click="editItem(index)">
                          <v-icon
                            v-if="item.isItemEditable"
                            color="grey lighten-1"
                          >
                            edit
                          </v-icon>
                          <v-icon v-else color="grey lighten-1">
                            mdi-eye
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-btn icon @click="deleteItem(index)">
                          <v-icon color="grey lighten-1">
                            mdi-delete
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item v-if="conditionalItems.length">
              <v-card flat>
                <v-card-text>
                  <conditional-item-list
                    :options="conditionalItems"
                    :deleteConditionalCallback="onDeleteConditionalCallback"
                    @editConditionalItem="onEditConditionalItem"
                    @dragConditionalItem="onDragConditionalItem"
                  />
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs>

          <v-row justify="space-around">
            <v-menu bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" v-bind="attrs" v-on="on">
                  Add item
                </v-btn>
              </template>

              <v-list>
                <v-list-item @click="createItem">
                  <v-list-item-title>Blank item</v-list-item-title>
                </v-list-item>
                <v-list-item @click="importItem">
                  <v-list-item-title>Upload from GitHub</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-menu v-if="ifConditionalAvailable" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" v-bind="attrs" v-on="on">
                  Add conditional logic
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  :disabled="!conditionalRadioItems.length"
                  @click="createConditionalItem('checkbox')"
                >
                  <v-list-item-title>Radio/Checkbox</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :disabled="!conditionalSliderItems.length"
                  @click="createConditionalItem('radio')"
                >
                  <v-list-item-title>Slider</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-row>
        </v-form>
        <v-alert v-if="error !== ''" type="error">
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-btn outlined color="primary" @click="onDiscardActivity">
          Discard Changes
        </v-btn>
        <v-spacer />
        <v-btn color="primary" @click="onClickSaveActivity">
          Save Activity
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="editItemDialog" persistent>
      <ItemBuilder
        :key="componentKey"
        :initial-item-data="initialItemData"
        :is-item-editable="isItemEditable"
        @closeItemModal="onCloseItemModal"
      />
    </v-dialog>

    <v-dialog v-model="editConditionalItemDialog" persistent>
      <ConditionalItemBuilder
        :key="componentKey"
        :initial-conditional-item-data="initialConditionalItemData"
        :items="items"
        :editMode="isConditionalEditMode"
        :editConditionalItemIndex="editConditionalItemIndex"
        :editConditionalCallback="onEditConditionalCallback"
        :type="conditionalBuilderType"
        @closeConditionalItemModal="onCloseConditionalItemModal"
      />
    </v-dialog>

    <v-dialog v-model="urlDialog" persistent>
      <UrlItemUploader :key="componentKey" @uploadItem="onUploadItem" />
    </v-dialog>
  </div>
</template>

<script>
import ItemBuilder from "./ItemBuilder.vue";
import ConditionalItemBuilder from "./ConditionalItemBuilder.vue";
import UrlItemUploader from "./UrlItemUploader.vue";
import ConditionalItemList from "./ConditionalItemList.vue";

export default {
  components: {
    ItemBuilder,
    ConditionalItemBuilder,
    UrlItemUploader,
    ConditionalItemList,
  },
  props: {
    initialActivityData: {
      type: Object,
      required: true,
    },
  },
  data: function() {
    return {
      name: this.initialActivityData.name || "",
      description: this.initialActivityData.description || "",
      preamble: this.initialActivityData.preamble || "",
      shuffleActivityOrder: this.initialActivityData.shuffle || false,
      isSkippable: this.initialActivityData.isSkippable || false,
      items: this.initialActivityData.items || [],
      textRules: [(v) => !!v || "This field is required"],
      editItemDialog: false,
      editConditionalItemDialog: false,
      urlDialog: false,
      error: "",
      componentKey: 0,
      initialItemData: {
        options: {},
      },
      initialConditionalItemData: {},
      editConditionalItemIndex: -1,
      isItemEditable: true,
      editIndex: -1,
      conditionalRadioItems: [],
      conditionalSliderItems: [],
      ifConditionalAvailable: false,
      isConditionalEditMode: false,
      conditionalItems: [],
      conditionalBuilderType: "",
    };
  },
  watch: {
    items() {
      this.conditionalRadioItems = this.collectConditionals("radio");
      this.conditionalSliderItems = this.collectConditionals("slider");

      this.checkIfConditionalAvailable();
    },
  },
  created() {
    this.checkIfConditionalAvailable();
  },
  methods: {
    checkIfConditionalAvailable() {
      this.ifConditionalAvailable =
        this.conditionalRadioItems.length >= 2 ||
        this.conditionalSliderItems.length >= 2 ||
        this.conditionalItems.length;

      if (this.conditionalRadioItems.length >= 2)
        this.conditionalBuilderType = "radio";
      else if (this.conditionalSliderItems.length >= 2)
        this.conditionalBuilderType = "slider";
      else this.conditionalBuilderType = "";
    },
    collectConditionals(type) {
      return this.items.filter((item) => {
        return item.ui.inputType === type;
      });
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
      }
    },
    forceUpdate() {
      this.componentKey += 1;
    },
    createItem() {
      this.isItemEditable = true;
      this.editIndex = -1;
      this.initialItemData = {
        options: {},
      };
      this.forceUpdate();
      this.editItemDialog = true;
    },
    createConditionalItem(type) {
      this.isConditionalEditMode = false;
      this.editConditionalItemIndex = -1;
      this.editConditionalItemDialog = true;
    },
    importItem() {
      this.editIndex = -1;
      this.initialItemData = {
        options: {},
      };
      this.forceUpdate();
      this.urlDialog = true;
    },
    onCloseItemModal(response) {
      this.editItemDialog = false;
      if (response) {
        this.onNewItem(response);
      }
    },
    onDragConditionalItem(items) {
      this.conditionalItems = items;
    },
    onCloseConditionalItemModal(response) {
      this.editConditionalItemDialog = false;
    },
    onEditConditionalCallback(payload, isForEdit) {
      if (isForEdit) {
        this.conditionalItems[payload.index] = payload.item;
      } else {
        this.conditionalItems = this.conditionalItems.concat(payload);
      }

      this.editConditionalItemDialog = false;
    },
    onDeleteConditionalCallback(index) {
      this.conditionalItems.splice(index, 1);
    },
    onEditConditionalItem(index) {
      this.editConditionalItemIndex = index;

      this.initialConditionalItemData = this.conditionalItems[index];
      this.forceUpdate();
      this.isConditionalEditMode = true;
      this.editConditionalItemDialog = true;
    },
    onUploadItem(response) {
      this.urlDialog = false;
      if (response) {
        this.onNewItem(response);
        const editIndex = this.items.length - 1;
        this.editItem(editIndex);
      }
    },
    onNewItem(item) {
      if (this.editIndex >= 0 && this.editIndex < this.items.length) {
        this.items[this.editIndex] = item;
      } else {
        this.items.push(item);
      }
    },
    duplicateItem(index) {
      this.items.push(this.items[index]);
    },
    editItem(index) {
      this.editIndex = index;
      this.initialItemData = this.items[index];
      this.isItemEditable = this.initialItemData.isItemEditable;
      this.forceUpdate();
      this.editItemDialog = true;
    },
    deleteItem(index) {
      this.items.splice(index, 1);
    },
    onClickSaveActivity() {
      if (this.isActivityValid()) {
        this.saveActivity();
      }
    },
    isActivityValid() {
      if (!this.name) {
        this.error = "Activity Name is required";
        return false;
      } else if (!this.description) {
        this.error = "Activity Description is required";
        return false;
      } else if (this.items.length == 0) {
        this.error = "Activities must contain at least one item";
        return false;
      } else {
        this.error = "";
      }
      return true;
    },
    getItemVisibility() {
      const visibilityObj = {};
      this.items.forEach(function(item) {
        visibilityObj[item.name] = true;
      });
      return visibilityObj;
    },
    getAddProperties() {
      const addProperties = [];
      this.items.forEach(function(item) {
        const property = {
          variableName: item.name,
          isAbout: item.name,
          isVis: true,
        };
        addProperties.push(property);
      });
      return addProperties;
    },
    getItemOrder() {
      const itemNamesArray = this.items.map((item) => item.name);
      return itemNamesArray;
    },
    getAllowed() {
      return this.isSkippable ? ["skipped"] : [];
    },
    getCompressedSchema() {
      const addProperties = this.getAddProperties();
      const visibility = this.getItemVisibility();
      const itemOrder = this.getItemOrder();
      const allowed = this.getAllowed();
      return {
        "@context": [
          "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json",
        ],
        "@type": "reproschema:Activity",
        "@id": this.name,
        "skos:prefLabel": this.name,
        "skos:altLabel": this.name,
        "schema:description": this.description,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        preamble: this.preamble,
        scoringLogic: {},
        "repronim:timeUnit": "yearmonthdate",
        ui: {
          order: itemOrder,
          shuffle: this.shuffleActivityOrder,
          addProperties: addProperties,
          allow: allowed,
        },
      };
    },
    getContext() {
      const activityName = this.name;
      const contextObj = {
        "@version": 1.1,
      };
      var isPrefixNeeded = false;
      this.items.forEach(function(item) {
        if ("iri" in item) {
          contextObj[item.name] = {
            "@id": item.iri,
            "@type": "@id",
          };
        } else {
          contextObj[item.name] = {
            "@id": `${activityName}:${item.name}`,
            "@type": "@id",
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
        "@context": contextObj,
      };
    },
    saveActivity() {
      const schema = this.getCompressedSchema();
      const context = this.getContext();
      const items = this.items;

      items.forEach((item) => {
        const conditionalItems = this.conditionalItems.filter((cond) => {
          return cond.ifValue === item.question;
        });

        if (conditionalItems.length) item.conditionalItems = conditionalItems;
      });

      this.$emit("closeModal", {
        name: this.name,
        description: this.description,
        preamble: this.preamble,
        shuffle: this.shuffleActivityOrder,
        isSkippable: this.isSkippable,
        schema: schema,
        context: context,
        items: items,
      });
    },
    onDiscardActivity() {
      this.$emit("closeModal", null);
    },
  },
};
</script>
