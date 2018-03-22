var ctx = document.getElementById("myChart").getContext('2d');
var data = {
    datasets: [{
        data: [10, 20],
        backgroundColor: [
            'blue',
            'green'
        ],
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'Non Couvert',
        'Couvert'
    ]
};

var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data
});