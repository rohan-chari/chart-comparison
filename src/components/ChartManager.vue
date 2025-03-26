<template>
  <div>
    <div class="q-mb-sm">
      <q-input
        v-model="timeframeString"
        label="Enter a timeframe"
        clearable
        dense
        rounded
        outlined
        class="add-stock-input q-ml-md"
        @clear="clearTimeframe"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                v-model="localTimeframe"
                mask="MM/DD/YYYY"
                range
                @update:model-value="updateFormattedTimeframe"
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Clear"
                    color="negative"
                    flat
                    @click="clearTimeframe"
                  />
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
import { ref, watch } from 'vue'
import { useChartStore } from 'src/stores/chart-store'
import { useUserStore } from 'src/stores/user-store'
import { usePortfolioStore } from 'src/stores/portfolio-store'

const chartStore = useChartStore()
const userStore = useUserStore()
const portfolioStore = usePortfolioStore()

const localTimeframe = ref({ from: '', to: '' })
const timeframeString = ref('')
const errorMessage = ref('')

watch(
  () => chartStore.getTimeFrame,
  (newTimeframe) => {
    if (newTimeframe && newTimeframe.from && newTimeframe.to) {
      localTimeframe.value = { ...newTimeframe }
      timeframeString.value = `${newTimeframe.from} - ${newTimeframe.to}`
    } else {
      localTimeframe.value = { from: '', to: '' }
      timeframeString.value = ''
    }
  },
  { immediate: true },
)

const updateFormattedTimeframe = async () => {
  timeframeString.value = `${localTimeframe.value.from} - ${localTimeframe.value.to}`
  if (userStore.getUser) {
    await portfolioStore.saveTimeframePortfolio(
      localTimeframe.value.from,
      localTimeframe.value.to,
      userStore.getUser.uid,
      userStore.getToken,
    )
    chartStore.setTimeFrame(localTimeframe.value)
    const portStats = await portfolioStore.performPortfolioCalculations(localTimeframe)
    portfolioStore.setPorfolioStatistics(portStats)
  }
}

const clearTimeframe = () => {
  localTimeframe.value = { from: '', to: '' }
  timeframeString.value = ''
  chartStore.setTimeFrame({ from: '', to: '' })
  updateFormattedTimeframe()
}
</script>
