document.addEventListener('DOMContentLoaded', function() {
  const campaignSelect = document.getElementById('campaignSelect');
  const campaignStats = document.getElementById('campaignStats');
  const ctx = document.getElementById('campaignChart').getContext('2d');

  let campaignChart;

  campaignSelect.addEventListener('change', async function() {
    const campaignId = this.value;
    if (!campaignId || campaignId === "Select a Campaign") return;

    console.log(`Fetching statistics for campaignId: ${campaignId}`);
    try {
      const response = await fetch(`/campaigns/${campaignId}/analytics`);
      if (!response.ok) {
        console.error('Failed to fetch campaign statistics', response.statusText);
        alert('Failed to fetch campaign statistics');
        return;
      }
      const campaignData = await response.json();
      console.log("Fetched campaign data:", campaignData);

      // Handle potential absence of campaign_lead_stats with default values
      const { sent_count, reply_count, total_count, campaign_lead_stats } = campaignData;
      const { total = 0, blocked = 0, stopped = 0, completed = 0, inprogress = 0, interested = 0, notStarted = 0 } = campaign_lead_stats || {};

      // Update table with statistics
      campaignStats.innerHTML = buildStatsTable({ sent_count, reply_count, total_count, total, notStarted, blocked, stopped, completed, inprogress, interested });
      console.log("Campaign statistics updated successfully.");

      // Update or reinstantiate chart with new data
      if (campaignChart) campaignChart.destroy();
      campaignChart = new Chart(ctx, {
        type: 'bar', // Bar chart for displaying the statistics
        data: {
          labels: ['Sent Count', 'Reply Count', 'Total Count', 'Total Leads', 'Not Started', 'Blocked', 'Stopped', 'Completed', 'In Progress', 'Interested'],
          datasets: [{
            label: 'Campaign Data',
            data: [sent_count, reply_count, total_count, total, notStarted, blocked, stopped, completed, inprogress, interested],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      console.log("Campaign chart updated successfully.");
    } catch (error) {
      console.error('Error fetching campaign statistics:', error.message, error.stack);
      alert('Error fetching campaign statistics. Please try again later.');
    }
  });

  function buildStatsTable({ sent_count, reply_count, total_count, total, notStarted, blocked, stopped, completed, inprogress, interested }) {
    let table = '<h4>Emails</h4>';
    table += '<table class="table"><thead><tr><th>Sent Count</th><th>Reply Count</th><th>Total Count</th></tr></thead><tbody>';
    table += `<tr><td>${sent_count}</td><td>${reply_count}</td><td>${total_count}</td></tr>`;
    table += '</tbody></table>';
  
    table += '<h4>Leads</h4>';
    table += '<table class="table"><thead><tr><th>Total</th><th>Not Started</th><th>Blocked</th><th>Stopped</th><th>Completed</th><th>In Progress</th><th>Interested</th></tr></thead><tbody>';
    table += `<tr><td>${total}</td><td>${notStarted}</td><td>${blocked}</td><td>${stopped}</td><td>${completed}</td><td>${inprogress}</td><td>${interested}</td></tr>`;
    table += '</tbody></table>';
  
    return table;
  }
});