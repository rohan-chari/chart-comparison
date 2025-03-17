<template>
  <div>
    <div class="q-mt-sm">
      <q-input
        v-model="timeframeString"
        label="Enter a timeframe"
        clearable
        rounded
        outlined
        class="add-stock-input q-ml-md"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                v-model="timeframeDates"
                mask="MM/DD/YYYY"
                range
                @update:model-value="updateFormattedTimeframe"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <p v-if="errorMessage" class="q-mt-md text-negative">{{ errorMessage }}</p>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useChartStore } from 'src/stores/chart-store'

const chartStore = useChartStore()

const timeframeDates = ref(null)
const timeframeString = ref('')

const updateFormattedTimeframe = async () => {
  if (timeframeDates.value.from && timeframeDates.value.to) {
    timeframeString.value = `${timeframeDates.value.from} - ${timeframeDates.value.to}`
    chartStore.timeframe.from = timeframeDates.value.from
    chartStore.timeframe.to = timeframeDates.value.to
  } else {
    timeframeString.value = ''
  }
}
</script>
