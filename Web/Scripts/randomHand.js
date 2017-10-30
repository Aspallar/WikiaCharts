(function ($) {
    'use strict';
    /*jshint curly: false */

    var cardImageParseTemplate = 'http://magicduels.wikia.com/api.php?format=json&action=parse&disablepp=true&prop=text&text=%5B%5BFile%3A[[cardname]]%7Csize%3D160px%7Clink%3D%5D%5D';
    var deck;

    function DeckEntry(name, amount) {
        this.name = name;
        this.amount = amount;
        this.available = true;
        this.imageSource = null;
    }

    DeckEntry.prototype = {
        constructor: DeckEntry,
        encodedName: function () {
            return encodeURIComponent(this.name);
        }
    }

    function Deck() {
        this.cards = []; // array of DeckEntry
    }

    Deck.prototype = {
        constructor: Deck,
        shuffle: function () {
            this.cards.forEach(function (card) {
                card.available = card.amount;
            });
        },
        drawCard: function () {
            var card, index;
            do {
                index = Math.floor(Math.random() * this.cards.length);
                card = this.cards[index];
            } while (card.available <= 0);
            --card.available;
            return card;
        },
        scrapeFromPage: function () {
            var deck = [];
            var cardElements = $('div.div-col.columns.column-count.column-count-2 span.card-image-tooltip');
            cardElements.each(function () {
                var name = $(this).text();
                var amount = parseInt($.trim(this.previousSibling.textContent), 10);
                if (isNaN(amount))
                    amount = 0;
                deck.push(new DeckEntry(name, amount));
            });
            this.cards = deck;
         }
    };

    function setCardImage(img, card) {
        if (card.imageSource !== null) {
            img.attr('src', card.imageSource);
            return;
        }
        var url = cardImageParseTemplate.replace("[[cardname]]", encodeURIComponent(card.name) + '.png');
        $.getJSON(url, function (data) {
            var text = data.parse.text['*'];
            var match = /src\s*=\s*"([^"]+)"/.exec(text);
            card.imageSource = match[1];
            img.attr('src', match[1]);
        })
    }

    $(document).ready(function () {
        deck = new Deck();
        deck.scrapeFromPage();
        $('#mdw-random-hand-button').click(function () {
            var randomHandDiv = $('#mdw-random-hand');
            randomHandDiv.html('');
            deck.shuffle();
            var hand = [];
            for (var k = 0; k < 7; k++) {
                var card = deck.drawCard();
                var img = $("<img></img>");
                randomHandDiv.append(img);
                setCardImage(img, card);
            }
        });
    });
})(jQuery);

