(function ($) {
    'use strict';
    /*jshint curly: false */
    
    var chartDataId = 'mdw-chartdata';

    // n choose k
    function nck(n, k) {
        var result = 1;
        for (var i = 1; i <= k; i++) {
            result *= (n + 1 - i) / i;
        }
        //console.log(result);
        return result;
    }

    // Hypergeometric distribution, probability mass function
    function pmf(N, m, n, k) {
        return (nck(m, k) * nck(N - m, n - k)) / nck(N, n);
    }

    function isLand(card) {
        return $.inArray('Land', card.types) !== -1;
    }

    function addCalculatedFieldsToData(cardData) {
        cardData.forEach(function (card) {
            card.isLand = isLand(card);
            //if (!card.isLand)
            //    card.adjustedColor = adjustedColor(card.colors);
        });
        return cardData;
    }

    function getChartData() {
        var dataString = document.getElementById(chartDataId).getAttribute('data-chart');
        var cardData = JSON.parse(dataString);
        return addCalculatedFieldsToData(cardData);
    }

    function getCardTotals (cardData) {
        var totals = {
            numCards: 0,
            numLands: 0
        };
        for (var k = 0, l = cardData.length; k < l;  k++) {
            var card = cardData[k];
            totals.numCards += card.num;
            if (card.isLand)
                totals.numLands += card.num;
        }
        return totals;
    }

    var landStats = $('#mdw-land-stats');
    var html = landStats.html();
    var cardData = getChartData();
    var tot = getCardTotals(cardData);
    console.log('Total = ' + tot.numCards + ' Lands = ' + tot.numLands);
    $('#mdw-total-cards').html(tot.numCards);
    $('#mdw-total-lands').html(tot.numLands);
    var probTotal = 0;
    var percentTotal = 0;
    for (var k = 0; k <= 7; k++) {
        var prob = pmf(tot.numCards, 40/*tot.numLands*/, 7, k);
        probTotal += prob;
        var percent = (prob * 100).toFixed(1);
        percentTotal += parseFloat(percent);
        console.log(k + ' = ' + percent);
        html = html.replace('[' + k + ']', percent.toString());
    }
    console.log("Total probability " + probTotal);
    console.log("Total percent " + percentTotal);
    landStats.html(html);


})(jQuery);