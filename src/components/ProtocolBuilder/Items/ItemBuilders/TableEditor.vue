<template>
  <v-card>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left"></th>
            <th 
              v-for="(option) in options"
              class="text-left"
              :key="option.name"
            >
              {{ option.name }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, i) in items"
            :key="i"
          >
            <td>
              {{ item.name }}
            </td>
            <td
              v-for="(option, j) in options"
              :key="j"
            >
              <v-text-field
                v-model="values[i][j]"
                type="number"
              />
            </td>
          </tr>
        </tbody>
        
      </template>
    </v-simple-table>

    <v-card-actions class="d-flex justify-space-around">
      <v-btn
        @click="saveValues"
        color="primary"
      >
        Save
      </v-btn>

      <v-btn
        @click="resetValues"
      >
        Reset
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    initial: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    const values = [];
    for (let i = 0; i < this.items.length; i++) {
      values.push([]);
      for (let j = 0; j < this.options.length; j++) {
        if (i < this.initial.length && j < this.initial[i].length) {
          values[i].push(this.initial[i][j]);
        } else {
          values[i].push(0);
        }
      }
    }

    return {
      values
    }
  },
  methods: {
    saveValues() {
      this.$emit('update', this.values);
    },
    resetValues() {
      this.$emit('update', null);
    }
  }
}
</script>
