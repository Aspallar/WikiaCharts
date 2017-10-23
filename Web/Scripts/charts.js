// Start: graphs
(function ($) {

    function getChartColor(dataColor) {
        var colors = {
            Red: '#f28f78',
            Green: '#7dcd98',
            Blue: '#92d4f7',
            White: '#ffffd9',
            Black: '#515151',
            Multicolored: '#ffd778',
            Colorless: '#abafb0',
        };
        return colors[dataColor];
    }

    function getCardTypeColor(type) {
        var colors = {
            Land: '#FFFFFF',
            Creature: '#F5F5F5',
            Artifact: '#606060',
            Enchantment: '696969',
            Instant: '808080',
            Sorcery: '#B0B0B0',
            Planeswalker: '#C8C8C8',
        };
        return colors[type];
    }

    var chartDataId = "mdw-chartdata";
    var colorPieChartId = "mdw-cardsbycolor-chart";
    var manaCurveChartId = "mdw-manacurve-chart";
    var typesPieChartId = "mdw-types-chart";

    var dataIndex = {
        color: 0,
        num: 1,
        cmc: 2,
        type: 0
    }

    var dataCache = {
        colorPie: {
            data: null,
            colors: null
        },
        manaCurve: {
            data: null,
            colors: null
        },
        typesPie: {
            data: null,
            colors: null
        }
    }

    function hasColorPieChart() {
        return document.getElementById(colorPieChartId) !== null;
    }

    function hasManaCurveChart() {
        return document.getElementById(manaCurveChartId) !== null;
    }

    function hasTypesPieChart() {
        return document.getElementById(typesPieChartId) !== null;
    }

    function hasCharts() {
        if (document.getElementById(chartDataId) === null)
            return false;
        return hasColorPieChart()
            || hasManaCurveChart()
            || hasTypesPieChart();
    }

    function isLand(card) {
        return $.inArray("Land", card.types) !== -1;
    }

    function adjustedColor(colors) {
        if (colors === undefined || colors.length === 0)
            return "Colorless";
        if (colors.length > 1)
            return "Multicolored";
        return colors[0];
    }

    function addCalculatedFieldsToData(cardData) {
        cardData.forEach(function (card) {
            card.isLand = isLand(card);
            if (!card.isLand)
                card.adjustedColor = adjustedColor(card.colors);
        });
        return cardData;
    }

    function getChartData() {
        var dataString = document.getElementById(chartDataId).getAttribute("data-chart");
        var cardData = JSON.parse(dataString);
        return addCalculatedFieldsToData(cardData);
    }

    function getColorOnlyData(cardData) {
        var colorData = [];
        cardData.forEach(function (card) {
            if (!card.isLand)
                colorData.push([card.adjustedColor, card.num]);
        });
        colorData.sort(function (a, b) {
            return a[dataIndex.color].localeCompare(b[dataIndex.color]);
        });
        return colorData;
    }

    function getCardTypeData(cardData) {
        var typeData = [];
        cardData.forEach(function (card) {
            card.types.forEach(function (type) {
                typeData.push([type, card.num]);
            });
        });
        typeData.sort(function (a, b) {
            return a[dataIndex.type].localeCompare(b[dataIndex.type]);
        });
        return typeData;
    }

    function sumByType(data) {
        var summedData = [];
        if (data.length === 0)
            return summedData;
        summedData.push(data[0]);
        for (var k = 1; k < data.length; k++) {
            var lastIndex = summedData.length - 1;
            if (data[k][dataIndex.type] === summedData[lastIndex][dataIndex.type])
                summedData[lastIndex][dataIndex.num] += data[k][dataIndex.num];
            else
                summedData.push(data[k]);
        }
        return summedData;
    }

    function getColorWithCostData(cardData) {
        var colorData = [];
        cardData.forEach(function (card) {
            if (!card.isLand)
                colorData.push([card.adjustedColor, card.num, card.cmc]);
        });
        // order by color then by cmc
        colorData.sort(function (a, b) {
            var colorCompare = a[dataIndex.color].localeCompare(b[dataIndex.color]);
            if (colorCompare != 0)
                return colorCompare;
            var aCmc = a[dataIndex.cmc];
            var bCmc = b[dataIndex.cmc];
            if (aCmc < bCmc)
                return -1;
            if (aCmc > bCmc)
                return 1;
            return 0;
        });
        return colorData;
    }

    function sumByColor(data) {
        var summedData = [];
        if (data.length === 0)
            return summedData;
        summedData.push(data[0]);
        for (var k = 1; k < data.length; k++) {
            var lastIndex = summedData.length - 1;
            if (data[k][dataIndex.color] === summedData[lastIndex][dataIndex.color])
                summedData[lastIndex][dataIndex.num] += data[k][dataIndex.num];
            else
                summedData.push(data[k]);
        }
        return summedData;
    }

    function sumByColorAndCost(data) {
        var summedData = [];
        if (data.length === 0)
            return summedData;
        summedData.push(data[0]);
        for (var k = 1; k < data.length; k++) {
            var lastIndex = summedData.length - 1;
            if (data[k][dataIndex.color] === summedData[lastIndex][dataIndex.color]
                    && data[k][dataIndex.cmc] === summedData[lastIndex][dataIndex.cmc])
                summedData[lastIndex][1] += data[k][1];
            else
                summedData.push(data[k]);
        }
        return summedData;
    }

    function cacheColorPieData(cardData) {
        var rawData = getColorOnlyData(cardData);
        var summedData = sumByColor(rawData);

        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Color');
        dataTable.addColumn('number', 'Number');
        dataTable.addRows(summedData);

        var sliceColors = [];
        summedData.forEach(function (e) {
            sliceColors.push(getChartColor(e[dataIndex.color]));
        });

        dataCache.colorPie.data = dataTable;
        dataCache.colorPie.colors = sliceColors;
    }

    function drawColorPieChart() {
        var options = {
            height: 240,
            colors: dataCache.colorPie.colors,
            pieSliceText: 'value',
            pieSliceBorderColor: "black",
            pieSliceTextStyle: {
                color: 'black',
                bold: true
            },
            backgroundColor: {
                fill: 'transparent'
            },
            legend: {
                textStyle: {
                    color: 'black'
                }
            },
        };
        var chart = new google.visualization.PieChart(document.getElementById(colorPieChartId));
        chart.draw(dataCache.colorPie.data, options);
    }

    function MakeLabelsForManaCurve(chartData) {
        var labels = ['Cost'];
        var k = 0;
        while (k < chartData.length) {
            var color = chartData[k++][dataIndex.color];
            labels.push(color);
            while (k < chartData.length && chartData[k][dataIndex.color] === color)
                ++k;
        }
        return labels;
    }

    function formatDataForManaCurveChart(chartData) {
        var labels = MakeLabelsForManaCurve(chartData);
        var numColumns = labels.length;

        var data = [labels];
        for (var k = 0; k < 7; k++) {
            var dataline = new Array(numColumns);
            dataline[0] = k.toString();
            for (var k2 = 1; k2 < numColumns; k2++)
                dataline[k2] = 0;
            data.push(dataline);
        }
        data[7][0] = "6+";

        var index = 1;
        var color = chartData[0][dataIndex.color];
        chartData.forEach(function (row) {
            if (color != row[dataIndex.color]) {
                ++index;
                color = row[dataIndex.color];
            }
            var cmc = Math.min(row[dataIndex.cmc], 6);
            data[cmc + 1][index] += row[dataIndex.num];
        });

        for (var seriesIndex = 1; seriesIndex < data.length; seriesIndex++) {
            series = data[seriesIndex];
            for (var itemIndex = 1; itemIndex < series.length; itemIndex++) {
                if (series[itemIndex] === 0)
                    series[itemIndex] = null;
            }
        }

        return data;
    }

    function cacheManaCurveData(data) {
        var rawData = getColorWithCostData(data);
        var summedData = sumByColorAndCost(rawData);
        var formattedData = formatDataForManaCurveChart(summedData);

        var sectionColors = [];
        for (var k = 1; k < formattedData[0].length; k++)
            sectionColors.push(getChartColor(formattedData[0][k]));

        dataCache.manaCurve.data = google.visualization.arrayToDataTable(formattedData);
        dataCache.manaCurve.colors = sectionColors;
    }

    function drawManaCurveChart() {
        var options = {
            height: 240,
            legend: {
                position: 'top',
                maxLines: 3
            },
            bar: {
                groupWidth: '80%'
            },
            isStacked: true,
            backgroundColor: {
                fill: 'transparent'
            },
            vAxis: { ticks: [5,10,15,20] },
            //vAxis: {
            //    gridlines: {
            //        count: 4
            //    }
            //},
            colors: dataCache.manaCurve.colors
        };
        var chart = new google.visualization.ColumnChart(document.getElementById(manaCurveChartId));
        chart.draw(dataCache.manaCurve.data, options);
    }

    function cacheTypesPieData(cardData) {
        var rawData = getCardTypeData(cardData);
        var summedData = sumByType(rawData);

        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Color');
        dataTable.addColumn('number', 'Number');
        dataTable.addRows(summedData);

        var sliceColors = [];
        summedData.forEach(function (e) {
            sliceColors.push(getCardTypeColor(e[dataIndex.type]));
        });

        dataCache.typesPie.data = dataTable;
        dataCache.typesPie.colors = sliceColors;
    }

    function drawTypesPieChart() {
        var options = {
            height: 340,
            colors: dataCache.typesPie.colors,
            pieSliceText: 'value',
            pieSliceBorderColor: "black",
            pieSliceTextStyle: {
                color: 'black',
                bold: true
            },
            backgroundColor: {
                fill: 'transparent'
            },
            legend: {
                textStyle: {
                    color: 'black'
                },
                position: 'labeled'
            },
        };
        var chart = new google.visualization.PieChart(document.getElementById(typesPieChartId));
        chart.draw(dataCache.typesPie.data, options);

    }

    function drawAllCharts() {
        if (hasColorPieChart())
            drawColorPieChart();
        if (hasManaCurveChart())
            drawManaCurveChart();
        if (hasTypesPieChart())
            drawTypesPieChart();
    }

    function chartLibraryLoaded() {
        var chartData = getChartData();
        cacheColorPieData(chartData);
        cacheManaCurveData(chartData);
        cacheTypesPieData(chartData);
        drawAllCharts();
        $(window).resize(drawAllCharts);
    }

    // do nothing for a page with no charts
    if (!hasCharts())
        return;

    $.getScript('https://www.gstatic.com/charts/loader.js', function () {
       google.charts.load('current', { 'packages': ['corechart'] });
       google.charts.setOnLoadCallback(chartLibraryLoaded);
    });

})(jQuery);
// End: graphs
