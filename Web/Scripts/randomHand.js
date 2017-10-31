(function ($) {
    'use strict';
    /*jshint curly: false, maxlen: 200 */

    var randomHandButtonId = 'mdw-random-hand-button';
    var randomHandResultsId = 'mdw-random-hand';
    var imageSizeButtonId = 'mdw-random-hand-image-size';
    var drawCardButtonId = "mdw-random-hand-draw-card";

    // do nothing on articles with no random hand
    if (document.getElementById(randomHandButtonId) === null ||
            document.getElementById(randomHandResultsId) === null) {
        return;
    }

    var cardImage = {
        small: true,
        fullWidth: 223,
        fullHeight: 311,
        width: Math.floor(223 * 0.5),
        height: Math.floor(311 * 0.5),
        scale: function (percent) {
            if (percent === 100) {
                this.width = this.fullWidth;
                this.height = this.fullHeight;
            } else {
                var factor = percent / 100;
                this.width = Math.floor(this.fullWidth * factor);
                this.height = Math.floor(this.fullHeight * factor);
            }
        }
    };

    var deck;
    var cardImageSources = {};

    function DeckEntry(name) {
        this.name = name;
        this.available = true;
    }

    function Deck() {
        this.cards = []; // array of DeckEntry
        this.cardsLeft = 0;
    }

    Deck.prototype = {
        constructor: Deck,
        shuffle: function () {
            this.cards.forEach(function (card) {
                card.available = true;
            });
            this.cardsLeft = this.cards.length;
        },
        drawCard: function () {
            var card, index;
            do {
                index = Math.floor(Math.random() * this.cards.length);
                card = this.cards[index];
            } while (!card.available);
            card.available = false;
            this.cardsLeft--;
            return card;
        },
        drawCards: function (numCards) {
            var cards = [];
            for (var k = 0; k < numCards; k++)
                cards.push(this.drawCard());
            cards.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            return cards;
        },
        scrapeFromPage: function () {
            var deck = [];
            var cardElements = $('div.div-col.columns.column-count.column-count-2 span.card-image-tooltip');
            cardElements.each(function () {
                var name = $(this).text();
                var amount = parseInt($.trim(this.previousSibling.textContent), 10);
                if (!isNaN(amount)) {
                    for (var k = 0; k < amount; k++)
                        deck.push(new DeckEntry(name));
                }
            });
            this.cards = deck;
            this.cardsLeft = deck.length;
        }
    };

    function setImageSizeButtonText() {
        var text = cardImage.small ? 'Large Images' : 'Small Images';
        $('#' + imageSizeButtonId)
            .removeClass('mdw-hidden')
            .html(text);
    }

    function setImageSizes() {
        var images = $('#' + randomHandResultsId).find('img');
        images.each(function () {
            $(this)
                .attr('width', cardImage.width)
                .attr('height', cardImage.height);
        });
    }

    function showOtherButtons() {
        $('#' + imageSizeButtonId).removeClass('mdw-hidden')
        $('#' + drawCardButtonId).removeClass('mdw-hidden')
    }

    function imageSizeButtonClick() {
        cardImage.small = !cardImage.small;
        if (cardImage.small)
            cardImage.scale(50);
        else
            cardImage.scale(100);
        setImageSizeButtonText();
        setImageSizes();
    }

    function setCardImage(img, card) {
        var imageSource = cardImageSources[card.name];
        if (imageSource !== undefined) {
            img.attr('src', imageSource);
            return;
        }
        var template = 'http://magicduels.wikia.com/api.php?format=json&action=parse&disablepp=true&prop=text&text=%5B%5BFile%3A[[cardname]].png%7Csize%3D160px%7Clink%3D%5D%5D';
        var url = template.replace('[[cardname]]', encodeURIComponent(card.name));
        $.getJSON(url, function (data) {
            var text = data.parse.text['*'];
            var sourceMatch = /src\s*=\s*"([^"]+)"/.exec(text);  
            cardImageSources[card.name] = sourceMatch[1];
            img.attr('src', sourceMatch[1]);
        });
    }

    function renderRandomHand(target, hand) {
        var cardElements = document.createDocumentFragment();
        hand.forEach(function (card) {
            var img = $('<img></img>').attr('width', cardImage.width).attr('height', cardImage.height);
            cardElements.appendChild(img.get(0));
            setCardImage(img, card);
        });
        target.html(cardElements);
    }

    function drawCardClick() {
        if (deck.cardsLeft === 0) {
            alert('The deck is empty. There are no cards left to draw');
            return;
        }
        var card = deck.drawCard();
        var img = $('<img></img>').attr('width', cardImage.width).attr('height', cardImage.height);
        var images = $('#' + randomHandResultsId).prepend(img);
        setCardImage(img, card);
    }

    function generateRandomHand() {
        var randomHandDiv = $('#' + randomHandResultsId);
        if (deck.cards.length < 7) {
            randomHandDiv.html('<p>There must be at least seven cards in a deck for a random hand.</p>');
            return;
        }
        showOtherButtons();
        deck.shuffle();
        var hand = deck.drawCards(7);
        renderRandomHand(randomHandDiv, hand);
        setImageSizeButtonText();
    }

    $(document).ready(function () {
        deck = new Deck();
        deck.scrapeFromPage();
        $('#' + randomHandButtonId).click(generateRandomHand);
        $('#' + imageSizeButtonId).click(imageSizeButtonClick);
        $('#' + drawCardButtonId).click(drawCardClick);
    });
})(jQuery);

