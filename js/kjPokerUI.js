// JacksOrBetter poker game
// Copyright 2010 Kristopher Johnson

// This module defines the user interface for the Jacks-or-Better
// poker game, using the model defined in kjPoker.js.

(function () {

    var log = kjUtil.log,
        Card = kjPoker.Card,
        Deck = kjPoker.Deck,
        Session = kjPoker.Session,
        PlayState = kjPoker.PlayState,
        Score = kjPoker.Score,
        session,
        creditsText, cardImage, cardHoldDisplay, isCardHeld,
        upperStatusLine, middleStatusLine, lowerStatusLine,
        dealDrawButton,
        previousCredits,
        emptyHtml = '&nbsp;',
        isMobileSafari,
        imageCache,
        haveLocalStorage = (typeof(localStorage) !== 'undefined'),
        savedSessionKey = 'kjPoker-Session',
        savedIsCardHeldKey = 'kjPoker-IsCardHeld';


    // Add methods to Card

    Card.prototype.imagePath = function () {
        return 'images/card/' + this.abbrev() + '.png';
    };
    Card.backImagePath = function () {
        return 'images/card/back.png';
    };


    // Add animation methods to jQuery

    jQuery.fn.animateImageChange = function (newSrc) {
        return this.each(function () {
            var img = $(this);
            img.fadeTo(50, 0.0, function () {
                img.attr('src', newSrc);
                window.setTimeout(function () {
                    img.fadeTo(100, 1.0);
                }, 200);
            });
        });
    }

    jQuery.fn.animateTextChange = function (newText) {
        return this.each(function () {
            var obj = $(this);
            obj.fadeTo(50, 0.0, function () {
                obj.text(newText);
                obj.fadeTo(200, 1.0);
            });
        });
    }

    jQuery.fn.animateHtmlChange = function (newHtml) {
        return this.each(function () {
            var obj = $(this);
            obj.fadeTo(50, 0.0, function () {
                obj.html(newHtml);
                obj.fadeTo(200, 1.0);
            });
        });
    }

    jQuery.fn.blink = function () {
        return this.each(function () {
            var obj = $(this);
            obj.fadeTo(50, 0.0, function () {
                obj.fadeTo(200, 1.0);
            });
        });
    }


    // Functions used by event handlers

    function updateCardImages(unheldCardsOnly, immediate) {
        $.each(cardImage, function (i, img) {
            var card, src;
            if (unheldCardsOnly && isCardHeld[i]) {
                return;
            }
            card = session.cardAtIndex(i);
            src = card.imagePath();
            if (immediate) {
                img.attr('src', src);
            }
            else {
                img.animateImageChange(src);
            }
        });
    }

    function dimNonScoringCards(immediate) {
        var scoringCardIndexes = session.lastHandScore().scoringCardIndexes();
        $.each(cardImage, function (i, img) {
            if ($.inArray(i, scoringCardIndexes) == -1) {
                if (immediate) {
                    img.css('opacity', 0.50);
                }
                else {
                    img.fadeTo('normal', 0.50);
                }
            }
        });
    }

    function updateCreditsDisplay(immediate) {
        var credits = session.credits();
        if (credits !== previousCredits) {
            if (immediate) {
                creditsText.text('' + credits);
            }
            else {
                creditsText.animateTextChange('' + credits);
            }
            previousCredits = credits;
        }
    }

    function clearHold() {
        $.each(cardHoldDisplay, function (i, hold) {
            isCardHeld[i] = false;
            hold.html(emptyHtml).attr('opacity', 1.0);
        });
        saveIsCardHeld();
    }

    function dimHold(immediate) {
        var dimmedOpacity = 0.6;
        $.each(cardHoldDisplay, function (i, hold) {
            if (immediate) {
                hold.css('opacity', dimmedOpacity);
            }
            else {
                hold.fadeTo('fast', dimmedOpacity);
            }
        });
    }

    function toggleHold(i) {
        if (isCardHeld[i]) {
            isCardHeld[i] = false;
            cardHoldDisplay[i].animateHtmlChange(emptyHtml);
        }
        else {
            isCardHeld[i] = true;
            cardHoldDisplay[i].animateHtmlChange('Hold');
        }
        saveIsCardHeld();
    }

    function updateStatusLines(immediate) {
        var playState = session.playState();
        
        function setStatusLines(upperHtml, middleHtml, lowerHtml) {
            upperHtml = upperHtml || emptyHtml;
            middleHtml = middleHtml || emptyHtml;
            lowerHtml = lowerHtml || emptyHtml;
            
            if (immediate) {
                upperStatusLine.html(upperHtml);
                middleStatusLine.html(middleHtml);
                lowerStatusLine.html(lowerHtml);
            }
            else {
                upperStatusLine.animateHtmlChange(upperHtml);
                middleStatusLine.animateHtmlChange(middleHtml);
                lowerStatusLine.animateHtmlChange(lowerHtml);
            }
        }

        if (playState === PlayState.gameIdle) {
            setStatusLines('Jacks or Better Poker',
                           'You start with 100 credits',
                           'Tap the Deal button to begin');
        }
        else if (playState === PlayState.gameStarted) {
            setStatusLines(null,
                           'Tap the cards you want to hold',
                           'Tap the Draw button to continue');
        }
        else if (playState === PlayState.afterDraw) {
            setStatusLines(null,
                           null,
                           null);
        }
        else if (playState === PlayState.gameEnded) {

            function scoreString() {
                var score = session.lastHandScore();
                if (score.name() === Score.loss.name()) {
                    return null;
                }
                else {
                    return score.name();
                }
            }

            function payoutString() {
                var payout = session.lastHandPayout();
                return payout ? 'You won <span class="payout">' + payout + '</span> credits!'
                              :'You did not win';
            }

            if (session.credits() > 0) {
                setStatusLines(scoreString(),
                               payoutString(),
                               'Tap the Deal button to play again');
            }
            else {
                setStatusLines('Out of credits',
                               payoutString(),
                               'Tap New Game to start over');
            }
        }
    }

    function updateDealDrawButton(immediate) {
        var playState = session.playState();
        
        if (playState === PlayState.gameIdle) {
            dealDrawButton.text('Deal');
        }
        else if (playState === PlayState.gameStarted) {
            dealDrawButton.text('Draw');
        }
        else if (playState === PlayState.gameEnded) {
            if (session.credits() > 0) {
                dealDrawButton.text('Deal');
            }
            else {
                dealDrawButton.text('New Game');
            }
        }
    }


    // Event handlers

    function dealDrawButtonTapped(e) {
        
        function discardUnheldCards() {
            $.each(isCardHeld, function (i, held) {
                if (!held) {
                    session.discardAtIndex(i);
                }
            });
        }

        if (session.playState() === PlayState.gameStarted) {
            dealDrawButton.blink();
            discardUnheldCards();
            session.draw();
        }
        else {
            if (session.credits() <= 0) {
                session.addCredits(100);
            }
            dealDrawButton.blink();
            session.shuffleAndDeal();
        }

        e.preventDefault();
    }

    function cardTapped(e) {
        var i = e.data;

        if (session.playState() === PlayState.gameStarted) {
            cardImage[i].blink();
            toggleHold(i);
        }

        e.preventDefault();
    }

    function dealComplete() {
        saveSession();

        updateCreditsDisplay();
        clearHold();
        updateCardImages();
        updateStatusLines();
        updateDealDrawButton();
    }

    function drawComplete() {
        saveSession();

        updateCreditsDisplay();
        dimHold();
        updateCardImages(true);
        updateStatusLines();

        // Finish the hand after the animations stop
        window.setTimeout(function () {
            session.scoreHand();
        }, 1000);
    }

    function gameEnded() {
        saveSession();

        updateCreditsDisplay();
        dimNonScoringCards();
        updateStatusLines();
        updateDealDrawButton();
    }


    // Save/restore session

    function bindSessionEvents() {
        session.onDealComplete = dealComplete;
        session.onDrawComplete = drawComplete;
        session.onGameEnded = gameEnded;
    }

    function saveIsCardHeld() {
        if (isCardHeld && haveLocalStorage) {
            localStorage.setItem(savedIsCardHeldKey, JSON.stringify(isCardHeld));
        }
    }

    function restoreIsCardHeld() {
        var stringifiedData, data;
        if (haveLocalStorage) {
            stringifiedData = localStorage.getItem(savedIsCardHeldKey);
            if (stringifiedData) {
                data = JSON.parse(stringifiedData);
                if (data) {
                    isCardHeld = data;

                    $.each(isCardHeld, function (i, held) {
                        cardHoldDisplay[i].html(held? 'Hold' : emptyHtml);
                    });

                    if (session.playState() === PlayState.gameEnded) {
                        dimHold(true);
                    }
                }
            }
        }
    }

    function saveSession() {
        if (session && haveLocalStorage) {
            session.storeTo(localStorage, savedSessionKey);
        }
    }

    function restoreSession() {
        var restoredSession;
        if (haveLocalStorage) {
            restoredSession = Session.restoreFrom(localStorage, savedSessionKey);
            if (restoredSession) {
                session = restoredSession;

                bindSessionEvents();

                updateCreditsDisplay(true);
                updateCardImages(false, true);
                if (session.playState() === PlayState.gameEnded) {
                    dimNonScoringCards(true);
                }
                updateStatusLines(true);
                updateDealDrawButton(true);

                return true;
            }
        }
        return false;
    }

    // Initialization

    function startUI() {

        function detectMobileSafari() {
            return navigator.userAgent.match(/iPhone/i) ||
                navigator.userAgent.match(/iPod/i);
        }

        function preloadImages() {
            var deck;

            function preloadRemainingImages() {
                var card, imagePath, cacheImage;

                // Preload next image
                card = deck.drawCard();
                imagePath = card.imagePath();
                cacheImage = document.createElement('img');
                cacheImage.src = imagePath;
                imageCache.push(cacheImage);

                // If more images to load, then continue after a brief pause
                if (deck.cardCount() > 0) {
                    window.setTimeout(preloadRemainingImages, 1);
                }
            }

            // For each card in deck, preload the image
            deck = new Deck();
            imageCache = [];
            preloadRemainingImages();
        };

        function initSession() {
            if (!restoreSession()) {
                session = new Session();
                bindSessionEvents();
            }
        }
        
        function initUIObjects() {
            var i, img, hold;

            creditsText = $('#credits');

            cardImage = [];
            cardHoldDisplay = [];
            isCardHeld = [];
            for (i = 0; i < 5; ++i) {
                img = $('#card' + i.toString());
                hold = $('#hold' + i.toString());

                cardImage.push(img);
                cardHoldDisplay.push(hold);
                isCardHeld.push(false);

                img.bind('mousedown', i, cardTapped);
            }

            upperStatusLine = $('#upperstatusline');
            middleStatusLine = $('#middlestatusline');
            lowerStatusLine = $('#lowerstatusline');
            
            dealDrawButton = $('#dealdrawbutton');
            dealDrawButton.mousedown(dealDrawButtonTapped);
        }

        function bindKeys() {
            $(document).keypress(function (e) {
                var keyCode = e.keyCode || e.which;

                switch (keyCode) {

                case 32:
                    // Space bar taps deal/draw button
                    dealDrawButtonTapped(e);
                    break;

                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                    // Numeric 1-5 tap corresponding card
                    e.data = keyCode - 49;
                    cardTapped(e);
                    break;
                }
            });
        }

        isMobileSafari = detectMobileSafari();

        initUIObjects();
        bindKeys();

        initSession();
        restoreIsCardHeld();

        if (isMobileSafari) {
            // Make the top toolbar disappear
            window.scrollTo(0, 1);
        }

        if (!isMobileSafari) {
            // For platforms that don't support cache manifest, preload images
            preloadImages();
        }
    };

    // Export the startUI function
    kjPoker.startUI = startUI;

}());

$(document).ready(function () {
    kjPoker.startUI();
});
