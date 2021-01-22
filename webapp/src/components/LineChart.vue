<script>
import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: ['labels', 'borderColor', 'backgroundColor', 'data', 'label'],
  data () {
    return {
      chartData: {
        labels: this.labels,
        datasets: [
          {
            label: this.label,
            data: this.data,
            fill: false,
            borderColor: this.borderColor,
            backgroundColor: this.backgroundColor,
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: true
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ]
        },
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
