<template>
  <v-dialog
    max-width="1250"
    :value="value"
    persistent
  >
    <v-card class="pb-2 config-card">
      <div class="d-flex justify-end pt-4 px-2">
        <v-btn icon @click="$emit('input', false)">
          <v-icon color="grey lighten-1">
            mdi-close
          </v-icon>
        </v-btn>
      </div>

      <div :class="editingChildLevel ? 'pa-4' : 'px-4 pb-8'">
        <div
          v-if="!editingChildLevel"
        >
          <div class="config-title">
            <v-icon class="mr-2" color="primary">mdi-security</v-icon>
            Security Configuration
          </div>

          <div
            class="server-config my-4"
            :class="serverConfigured ? 'valid' : 'invalid'"
          >
            <div class="status-text">
              Server status: {{ serverConfigured ? 'Connected' : 'Not configured' }}
            </div>

            <div class="config-description my-4">
              <v-icon class="mr-1" small>
                mdi-lock-plus
              </v-icon>

              For security, you must configure the IP address and public encryption key to generate and email reports (<a href="https://github.com/ChildMindInstitute/mindlogger-report-server" target="_blank">see here for directions</a>):
            </div>

            <div class="px-2">
              <v-text-field
                class="config-input"
                v-model="serverIp"
                label="IP Address"
                placeholder="Encryption server IP address (example: 127.0.0.1)"
              />

              <v-textarea
                class="config-input"
                v-model="publicEncryptionKey"
                :rows="4"
                label="Public Encryption Key"
                placeholder="Encryption server-generated public key"
              />
            </div>
          </div>
        </div>

        <div :class="editingChildLevel ? '' : 'mt-8'">
          <div
            class="config-title"
            v-if="!editingChildLevel"
          >
            <v-icon class="mr-2" color="primary">mdi-email</v-icon>
            Email Configuration
          </div>

          <div class="email-config my-4">
            <div v-if="!editingChildLevel">
              Send report(s) to:
            </div>
            <div v-else>
              Report(s) will be sent to:
            </div>

            <div style="position: relative;">
              <v-combobox
                class="mt-2"
                v-model="emailRecipients"
                multiple
                outlined
                required
                append-icon=""
                :search-input.sync="emailInput"
                hide-details
                :disabled="editingChildLevel"
              >
                <template v-slot:selection="{ attrs, item, parent, selected }">
                  <v-chip
                    v-bind="attrs"
                    :input-value="selected"
                    class="mx-2 my-0 py-0"
                    color="indigo lighten-5"
                    close
                    @click:close="parent.selectItem(item)"
                    :disabled="editingChildLevel"
                  >
                    {{ item }}
                  </v-chip>
                </template>
              </v-combobox>

              <div
                v-if="!emailInput && !emailRecipients.length"
                class="email-list-placeholder"
              >
                <v-icon class="mr-1">mdi-email-outline</v-icon>
                Add recipients
              </div>
            </div>

            <div class="my-2 d-flex">
              <div class="mt-3">In the Subject and Attachment filename(s) for the email, include:</div>

              <div
                class="mx-2"
                v-if="editingChildLevel"
              >
                <v-checkbox
                  v-model="includeItem"
                  class="my-0 py-0"
                  label="Item value (advanced option)"
                  hide-details
                />

                <div
                  v-if="includeItem"
                  class="d-flex"
                >
                  <v-combobox
                    v-if="currentActivityFlow"
                    v-model="activityValue"
                    :items="flowActivities"
                    @change="itemValue = ''"
                    class="my-0 mr-2"
                    label="Select activity"
                    hide-details
                  />

                  <v-combobox
                    v-model="itemValue"
                    :items="items"
                    class="my-0"
                    placeholder="Select item"
                    hide-details
                    :disabled="!activityValue"
                  />
                </div>
              </div>

              <v-checkbox
                class="mx-2 my-0 py-0"
                v-model="includeUserId"
                label="User ID"
                hide-details
                :disabled="editingChildLevel"
              />

              <v-checkbox
                class="mx-4 my-0 py-0"
                v-model="includeCaseId"
                label="Case ID(if available)"
                hide-details
                :disabled="editingChildLevel"
              />
            </div>

            <div class="my-2">
              <div class="my-2">Subject:</div>
              <div class="email-subject pa-2">
                {{ emailSubject }}
              </div>
            </div>

            <div class="my-4">
              <div class="my-2">Attachment(s):</div>
              <div
                v-for="(activity, index) in activityList"
                :key="index"
                class="email-attachment"
              >
                <img
                  class="mr-2"
                  height="25"
                  alt=""
                  :src="baseImageURL + 'attachments.png'"
                >

                <img
                  class="mr-1"
                  height="25"
                  alt=""
                  :src="baseImageURL + 'pdf-icon.png'"
                >
                <span>{{ getAttachmentName(activity) }}</span>
              </div>
            </div>

            <div class="my-4">
              <div class="my-1">Body:</div>

              <div
                class="email-editor"
                :class="editingChildLevel ? 'disabled' : ''"
              >
                <MarkDownEditor
                  v-model="emailBody"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          rounded
          class="px-8"
          small
          @click="onSaveReport"
        >
          Save
        </v-btn>
        <v-spacer />
      </v-card-actions>

      <v-dialog
        v-model="reportAlert"
        width="700"
      >
        <v-card>
          <v-card-text class="pt-4">
            Report will not be generated unless the IP address and public encryption key are entered.
          </v-card-text>

          <v-card-actions class="justify-center mt-8">
            <v-btn
              class="mx-4"
              color="red lighten-1"
              dark
              small
              rounded
              @click="saveReport"
            >
              Save Anyway
            </v-btn>

            <v-btn
              class="mx-4"
              color="primary"
              small
              outlined
              rounded
              @click="reportAlert = false"
            >
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="pdfServerError"
        width="600"
      >
        <v-card>
          <v-card-text class="pt-4">
            Sorry, we were not able to verify server. please double check server ip and public key.
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn @click="pdfServerError = false">
              OK
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.config-card {
  max-height: 600px;
  overflow: auto;
}
.config-title {
  display: flex;
  align-items: center;
  color: #757575;
  font-weight: 500;
}

.server-config {
  padding: 24px;
  border: 1px solid #1B78CF;
  border-radius: 5px;
}

.server-config .status-text {
  color: #1B78CF;
  font-size: 14px;
}

.server-config.invalid {
  border-color: #FF0000;
}
.server-config.invalid .status-text {
  color: #FF0000;
}

.config-description {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #757575;
}

.config-input {
  width: 50%;
  font-size: 14px;
}
.email-config {
  color: #666666;
  font-weight: 500;
  font-size: 15px;
}

.email-config /deep/ .v-input__slot {
  min-height: 48px;
}

.email-list-placeholder {
  position: absolute;
  left: 15px;
  top: 12px;
  user-select: none;
}

.email-subject {
  background: #F8F8F8;
  border: 1px solid #E0E0E0;
}

.email-editor {
  position: relative;
}
.email-editor.disabled::after {
  position: absolute;
  left: 0px;
  top: 0px;
  content: '_';
  background-color: grey;
  opacity: 0.05;
  width: 100%;
  height: 100%;
}

a {
  text-decoration: none;
}
</style>

<script>
import config from '../../config';
import { mapGetters } from 'vuex';
import MarkDownEditor from './MarkDownEditor.vue';
import api from '../../utilities/api';

export default {
  components: {
    MarkDownEditor,
  },

  props: {
    value: {
      type: Boolean,
      required: true
    },
    reportConfigs: {
      type: Object,
      required: true
    },
    currentActivity: {
      type: Object,
      required: false,
      default: () => null
    },
    currentActivityFlow: {
      type: Object,
      required: false,
      default: () => null
    }
  },

  data () {
    const itemValue = this.currentActivity && this.currentActivity.reportIncludeItem ||
            this.currentActivityFlow && this.currentActivityFlow.reportIncludeItem ||
            '';
    return {
      serverIp: this.reportConfigs.serverIp || '',
      publicEncryptionKey: this.reportConfigs.publicEncryptionKey || '',
      emailRecipients: this.reportConfigs.emailRecipients || [],
      includeUserId: this.reportConfigs.includeUserId || false,
      includeCaseId: this.reportConfigs.includeCaseId || false,
      emailBody: this.reportConfigs.emailBody || 'Please see the report attached to this email.',
      emailInput: '',
      reportAlert: false,
      itemValue: itemValue.split('/').pop() || '',
      activityValue: this.currentActivity ? this.currentActivity.name : itemValue.split('/').shift() || '',
      includeItem: itemValue ? true : false,
      pdfServerError: false,
      serverConfigured: this.reportConfigs.serverIp && this.reportConfigs.publicEncryptionKey ? true : false
    }
  },

  methods: {
    onSaveReport () {
      if (this.currentActivity) {
        this.$emit('updateItemValue', this.includeItem ? this.itemValue : '');
        this.$emit('input', false);
      } else if (this.currentActivityFlow) {
        this.$emit('updateItemValue', this.includeItem ? `${this.activityValue}/${this.itemValue}` : '');
        this.$emit('input', false);
      } else {
        if (this.serverIp && this.publicEncryptionKey) {
          let token = this.pdfToken;
          api.verifyPDFServer(this.serverIp, this.publicEncryptionKey, token).then(() => {
            this.saveReport();
          }).catch(e => {
            this.pdfServerError = true;
          });
        } else {
          this.reportAlert = true;
        }
      }
    },

    saveReport () {
      if (!this.publicEncryptionKey || !this.serverIp) {
        this.serverConfigured = false;
      }

      this.$emit('updateConfig', {
        serverIp: this.serverIp,
        publicEncryptionKey: this.publicEncryptionKey,
        includeUserId: this.includeUserId,
        includeCaseId: this.includeCaseId,
        emailBody: this.emailBody,
        emailRecipients: this.emailRecipients,
      })

      this.$emit('input', false)
    },

    getAttachmentName (activity) {
      let title = `REPORT_${this.name || 'Example Applet'}_`;

      if (activity) {
        if (this.currentActivityFlow && this.currentActivityFlow.combineReports) {
          title += this.currentActivityFlow.name;
        } else {
          title += activity.name;
        }
      } else {
        title += 'activity123 or activityflow123';
      }

      if (this.includeItem && this.itemValue) {
        title += ` [${this.itemValue}]`;
      }

      title += '_2022-05-13-134405.pdf';

      return title;
    }
  },

  computed: {
    ...mapGetters(config.MODULE_NAME,
    [
      'protocol',
      'baseImageURL',
      'pdfToken',
    ]),

    config () {
      return config;
    },

    emailSubject () {
      let subject = 'REPORT';

      if (this.includeUserId) {
        subject += ' by user123';
      }

      if (this.includeCaseId) {
        subject += ' about case123';
      }
      subject += `: ${this.name || 'Example applet'} /`

      if (this.currentActivity) {
        subject += this.currentActivity.name;
      } else if (this.currentActivityFlow) {
        subject += this.currentActivityFlow.name;
      } else {
        subject += 'activity123 or activityflow123';
      }

      if (this.includeItem && this.itemValue) {
        subject += ` [${this.itemValue}]`;
      }

      return subject;
    },

    editingChildLevel () {
      return this.currentActivity || this.currentActivityFlow ? true : false;
    },

    activityList () {
      if (this.currentActivity) {
        return [this.currentActivity]
      }

      if (this.currentActivityFlow) {
        const activities = this.flowActivities
          .map(name => this.protocol.activities.find(activity => activity.name == name))
          .filter(activity => activity)

        if (this.currentActivityFlow.combineReports && activities.length) {
          return [null];
        }

        return activities;
      }

      return [null];
    },

    flowActivities () {
      if (!this.currentActivityFlow) {
        return [];
      }

      return this.currentActivityFlow.order;
    },

    items () {
      let items = [];
      if (this.currentActivity) {
        items = this.currentActivity.items;
      }

      const activity = this.protocol.activities.find(activity => activity.name === this.activityValue);
      if (activity) {
        items = activity.items;
      }

      return items.map(item => item.name);
    },

    name () {
      return this.protocol.name;
    },
  }
}
</script>
