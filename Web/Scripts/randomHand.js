// ==========================================================================
// Start: Random Hand
// Implements random hand generation for deck articles
// Version 1.0.0
// Author: Aspallar
//
// ** Please dont edit this code directly in the wikia.
// ** Instead clone the git repository https://github.com/Aspallar/WikiaCharts
// ** and modify that, then copy your changes to the wikia.
// ** this file is the randomHand.js file in the Web\scripts folder.
// ** don't forget to push your changes to github.
//
// NOTE TO FANDOM CODE REVIEWERS
// This script inserts image tags into the page, but all of the images are internal to 
// the wikia, no external images are used.
// The only function that sets the src attribute of the img tags is setCardImage()
// which sets the image source from a cache if its already known and if not makes an
// ajax call to the MediaWiki API to parse a [[File:cardname.png|size=160px|link=]], and
// extracts the src from the returned json.
(function ($) {
    'use strict';
    /*global alert*/
    /*jshint curly: false, maxlen: 200 */

    var randomHandButtonId = 'mdw-random-hand-button';
    var randomHandResultsId = 'mdw-random-hand';
    var imageSizeButtonId = 'mdw-random-hand-image-size';
    var drawCardButtonId = 'mdw-random-hand-draw-card';
    var clearButtonId = 'mdw-random-hand-clear';

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

    function cardArticle(cardName) {
        var article = encodeURIComponent(cardName.replace(' ', '_')); 
        return "/wiki/" + article;
    }

    function setMainButtonText(haveHand) {
        var text = haveHand ? 'New Hand' : 'Draw Sample Hand';
        $('#' + randomHandButtonId).html(text);
    }

    function setImageSizeButtonText() {
        var text = cardImage.small ? 'Large Images' : 'Small Images';
        $('#' + imageSizeButtonId).html(text);
    }

    function setCardImageEvents(img) {
        if (cardImage.small) {
            img.mousemove(function (event) {
                var spaceOnRight = window.innerWidth - event.pageX;
                var xdelta = (spaceOnRight > cardImage.fullWidth + 5 ? 20 : -cardImage.fullWidth - 20);
                var left = event.pageX + xdelta;
                var top = event.pageY - 240;
                $('#mdw-card-hover').css({ top: top, left: left }).show();
            }).mouseout(function () {
                $('#mdw-card-hover').hide();
            }).mouseenter(function () {
                $('#mdw-card-hover').attr('src', $(this).attr('src'));
            });
        } else {
            img.off('mousemove mouseout mouseenter');
        }
    }

    function updateCardImages() {
        var images = $('#' + randomHandResultsId).find('img');
        images.each(function () {
            var $this = $(this);
            $this.attr('width', cardImage.width).attr('height', cardImage.height);
            setCardImageEvents($this);
        });
    }

    function showOtherButtons(show) {
        if (show) {
            $('#' + imageSizeButtonId).removeClass('mdw-hidden');
            $('#' + drawCardButtonId).removeClass('mdw-hidden');
            $('#' + clearButtonId).removeClass('mdw-hidden');
        } else {
            $('#' + imageSizeButtonId).addClass('mdw-hidden');
            $('#' + drawCardButtonId).addClass('mdw-hidden');
            $('#' + clearButtonId).addClass('mdw-hidden');
        }
    }

    function imageSizeButtonClick() {
        cardImage.small = !cardImage.small;
        cardImage.scale(cardImage.small ? 50 : 100);
        setImageSizeButtonText();
        updateCardImages();
    }

    function createCard(cardName) {
        var link = $('<a href="' + cardArticle(cardName) + '" target="_blank"><img /></a>');
        var img = link.find('img').attr('width', cardImage.width).attr('height', cardImage.height);
        setCardImageEvents(img);
        setCardImage(img, cardName);
        return link;
    }

    function setCardImage(img, cardName) {
        var imageSource = cardImageSources[cardName];
        if (imageSource !== undefined) {
            img.attr('src', imageSource);
            return;
        }
        var template = 'http://magicduels.wikia.com/api.php?format=json&action=parse&disablepp=true&prop=text&text=%5B%5BFile%3A[[cardname]].png%7Csize%3D160px%7Clink%3D%5D%5D';
        var url = template.replace('[[cardname]]', encodeURIComponent(cardName));
        $.getJSON(url, function (data) {
            var text = data.parse.text['*'];
            var sourceMatch = /src\s*=\s*"([^"]+)"/.exec(text);  
            cardImageSources[cardName] = sourceMatch[1];
            img.attr('src', sourceMatch[1]);
        });
    }

    function renderRandomHand(target, hand) {
        var cardElements = document.createDocumentFragment();
        hand.forEach(function (card) {
            var img = createCard(card.name);
            cardElements.appendChild(img.get(0));
        });
        target.html(cardElements);
    }

    function drawCardClick() {
        if (deck.cardsLeft === 0) {
            alert('The deck is empty. There are no cards left to draw');
            return;
        }
        var card = deck.drawCard();
        var img = createCard(card.name);
        var images = $('#' + randomHandResultsId).prepend(img);
    }

    function clearClick() {
        var images = $('#' + randomHandResultsId).html('');
        showOtherButtons(false);
        setMainButtonText(false);
    }

    function generateRandomHand() {
        var randomHandDiv = $('#' + randomHandResultsId);
        if (deck.cards.length < 7) {
            randomHandDiv.html('<p>There must be at least seven cards in a deck for a random hand.</p>');
            return;
        }
        showOtherButtons(true);
        deck.shuffle();
        var hand = deck.drawCards(7);
        renderRandomHand(randomHandDiv, hand);
        setImageSizeButtonText();
        setMainButtonText(true);
    }

    function wireButtonEvents() {
        $('#' + randomHandButtonId).click(generateRandomHand);
        $('#' + imageSizeButtonId).click(imageSizeButtonClick);
        $('#' + drawCardButtonId).click(drawCardClick);
        $('#' + clearButtonId).click(clearClick);
    }

    function insertHoverOverImage() {
        $('body').prepend('<img id="mdw-card-hover" class="mdw-card-hover" />');
    }

    $(document).ready(function () {
        deck = new Deck();
        deck.scrapeFromPage();
        insertHoverOverImage();
        setMainButtonText(false);
        wireButtonEvents();
    });
})(jQuery);
// End: Random Hand
// ==========================================================================
