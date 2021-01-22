<script>
import { Doughnut } from 'vue-chartjs'

export default {
  extends: Doughnut,
  props: ['labels', 'borderColor', 'backgroundColor', 'data'],
  data () {
    return {
      chartData: {
        labels: this.labels,
        datasets: [
          {
            borderWidth: 1,
            borderColor: this.borderColor,
            backgroundColor: this.backgroundColor,
            data: this.data
          }
        ]
      },
      options: {
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>
