function makeChart(canvas_id, chart_title, chart_data, chart_labels, chart_colors) {
    var ctx = document.getElementById(canvas_id).getContext('2d');
    var data = {
        datasets: [{
            data: chart_data,
            backgroundColor: chart_colors,
        }],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: chart_labels
    };

    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            title: {
                display: true,
                text: chart_title
            }
        }
    });
}

function chartInit() {
    var colors = ['green', 'blue'];
    makeChart("market_coverture_count", "Market Coverture (Number of mandates)", stats.market_coverture_count_data, ["Oui", "Non"], colors);
    makeChart("market_coverture_amount", "Market Coverture (TTC Amount)", stats.market_coverture_amount_data, ["Oui", "Non"], colors);
    makeChart("juridic_safety_count", "Juridic Safety (Number of mandates)", stats.juridic_safety_count_data, ["Oui", "Non"], colors);
    makeChart("juridic_safety_amount", "Juridic Safety (TTC Amount)", stats.juridic_safety_amount_data, ["Oui", "Non"], colors);
}
chartInit();