// JacksOrBetter poker game
// Copyright 2010 Kristopher Johnson

// This module defines the UI-independent model for a Jacks-or-Better
// poker game.

(function () {

    var log = kjUtil.log,
        newObjectWithPrototype = kjUtil.newObjectWithPrototype,
        findElement = kjUtil.findElement,
        colorRed = '#FF0000',
        colorBlack = '#000000';
    
    // A Suit has three attributes:
    // - name: 'clubs', 'hearts', 'diamonds', or 'spades'
    // - symbol: Unicode character for the suit
    // - color: colorRed or colorBlack
    function Suit(name, abbrev, symbol, color) {

        this.name = function () {
            return name;
        };

        this.abbrev = function () {
            return abbrev;
        };

        this.symbol = function () {
            return symbol;
        };

        this.color = function () {
            return color;
        };
    }
    Suit.clubs    = new Suit('clubs',    'c', '\u2663', colorBlack);
    Suit.hearts   = new Suit('hearts',   'h', '\u2665', colorRed);
    Suit.diamonds = new Suit('diamonds', 'd', '\u2666', colorRed);
    Suit.spades   = new Suit('spades',   's', '\u2660', colorBlack);
    Suit.values = [
        Suit.clubs,
        Suit.diamonds,
        Suit.hearts,
        Suit.spades
    ];
    Suit.prototype.toString = function () {
        return this.name();
    };
    Suit.withName = function (name) {
        return findElement(Suit.values, function (suit) {
            return suit.name() === name;
        });
    };
    Suit.withAbbrev = function (abbrev) {
        return findElement(Suit.values, function (suit) {
            return suit.abbrev() === abbrev;
        });
    };

    // A Rank has three attributes:
    // - name: 'ace', 'two', 'three', etc.
    // - abbrev: '2', '3', 'K', 'A', etc.
    // - value: numeric value. Ace has value 14 (not 1)
    function Rank(name, abbrev, value) {

        this.name = function () {
            return name;
        };

        this.abbrev = function () {
            return abbrev;
        };

        this.value = function () {
            return value;
        };
    }
    Rank.two   = new Rank('two',   '2', 2);
    Rank.three = new Rank('three', '3', 3);
    Rank.four  = new Rank('four',  '4', 4);
    Rank.five  = new Rank('five',  '5', 5);
    Rank.six   = new Rank('six',   '6', 6);
    Rank.seven = new Rank('seven', '7', 7);
    Rank.eight = new Rank('eight', '8', 8);
    Rank.nine  = new Rank('nine',  '9', 9);
    Rank.ten   = new Rank('ten',   't', 10);
    Rank.jack  = new Rank('jack',  'j', 11);
    Rank.queen = new Rank('queen', 'q', 12);
    Rank.king  = new Rank('king',  'k', 13);
    Rank.ace   = new Rank('ace',   'a', 14);

    // Rank.values are ordered from highest to lowest, because that's
    // the order we'll generally want to check them.
    Rank.values = [
        Rank.ace,
        Rank.king,
        Rank.queen,
        Rank.jack,
        Rank.ten,
        Rank.nine,
        Rank.eight,
        Rank.seven,
        Rank.six,
        Rank.five,
        Rank.four,
        Rank.three,
        Rank.two
    ];

    Rank.withName = function (name) {
        return findElement(Rank.values, function (rank) {
            return rank.name() === name;
        });
    };
    Rank.withValue = function (value) {
        return findElement(Rank.values, function (rank) {
            return rank.value() === value;
        });
    };
    Rank.prototype.toString = function () {
        return this.name();
    };

    // A Card has a rank and a suit
    function Card(rank, suit) {
        this.rank = function () {
            return rank;
        };
        this.suit = function () {
            return suit;
        };
    }
    Card.withNameAndSuit = function (name, suit) {
        return new Card(Rank.withName(name), suit);
    };
    Card.arrayFromNamesAndSuits = function (namesAndSuitsArray) {
        var cards = [],
            cardCount = namesAndSuitsArray.length / 2,
            name,
            suit,
            i;

        for (i = 0; i < cardCount; ++i) {
            name = namesAndSuitsArray[i * 2];
            suit = namesAndSuitsArray[(i * 2) + 1];
            cards.push(Card.withNameAndSuit(name, suit));
        }

        return cards;
    };
    Card.prototype.rankName = function () {
        return this.rank().name();
    };
    Card.prototype.rankAbbrev = function () {
        return this.rank().abbrev();
    };
    Card.prototype.rankValue = function () {
        return this.rank().value();
    };
    Card.prototype.suitName = function () {
        return this.suit().name();
    };
    Card.prototype.suitColor = function () {
        return this.suit().color();
    };
    Card.prototype.suitAbbrev = function () {
        return this.suit().abbrev();
    };
    Card.prototype.suitSymbol = function () {
        return this.suit().symbol();
    };
    Card.prototype.name = function () {
        return this.rankName() + ' of ' + this.suitName();
    };
    Card.prototype.toString = function () {
        return this.name();
    };
    Card.prototype.abbrev = function () {
        return this.rankAbbrev() + this.suitAbbrev();
    };
    Card.prototype.html = function () {
        return '<span style="color:' + 
            this.suitColor() +
            ';">' +
            this.abbrev() +
            '</span>';
    };
    Card.prototype.toData = function () {
        return [this.rankValue(), this.suitAbbrev()];
    };
    Card.fromData = function (data) {
        var rankValue = data[0],
            rank = Rank.withValue(rankValue);
            suitAbbrev = data[1];
            suit = Suit.withAbbrev(suitAbbrev);
        return new Card(rank, suit);
    };

    // A Deck is a collection of cards.
    //
    // If an array of cards is passed to the constructor, then those
    // cards will be placed in the deck.  Otherwise, a standard
    // 52-card deck is created.
    function Deck(initCards) {

        // Generate private cards array
        var cards = [];

        function copyInitCards() {
            // We go in reverse order so that the top of the deck
            // (which is at the end of the list) will have the first
            // card in the array.
            for (var i = initCards.length - 1; i >= 0; --i) {
                cards.push(initCards[i]);
            }
        }

        function makeDefaultDeck() {
            var suits = Suit.values,
            ranks = Rank.values,
            iSuit, iRank;
            for (iSuit = 0; iSuit < suits.length; ++iSuit) {
                for (iRank = 0; iRank < ranks.length; ++iRank) {
                    cards.push(new Card(ranks[iRank], suits[iSuit]));
                }
            }
        }

        if (initCards) {
            copyInitCards();
        }
        else {
            makeDefaultDeck();
        }

        // These methods have direct access to the private cards[] array

        this.cardCount = function (i) {
            return cards.length;
        };

        this.cardAtIndex = function (i) {
            return cards[i];
        };

        this.cardWithName = function (name) {
            return findElement(cards, function (card) {
                return card.name() === name;
            });
        };

        this.swapCardsAtIndices = function (i, j) {
            var temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
        };

        this.drawCard = function () {
            if (cards.length < 1) {
                throw new Error('Deck is empty');
            }
            return cards.pop();
        };

        this.toData = function () {
            var i, cardsData = [];
            for (i = 0; i < cards.length; ++i) {
                cardsData.push(cards[i].toData());
            }
            return cardsData;
        }
    }
    Deck.fromData = function (data) {
        var i, cards = [];
        for (i = 0; i < data.length; ++i) {
            cards.push(Card.fromData(data[i]));
        }
        return new Deck(cards);
    };
    Deck.fromNamesAndSuits = function (initCards) {
        var cards = Card.arrayFromNamesAndSuits(initCards);
        return new Deck(cards);
    };
    Deck.prototype.shuffle = function () {
        var i, pick;

        function random_number_less_than(n) {
            return Math.floor(Math.random() * n);
        }

        for (i = this.cardCount() - 1; i > 0; --i) {
            pick = random_number_less_than(i + 1);
            if (pick !== i) {
                this.swapCardsAtIndices(i, pick);
            }
        }
    };

    // A Hand is a collection of cards dealt from a deck
    function Hand(deck, initCards) {
        var cards,
            i;

        if (initCards) {
            cards = initCards;
        }
        else {
            // Deal cards from deck
            cards = [];
            for (i = 0; i < 5; ++i) {
                cards.push(deck.drawCard());
            }
        }

        this.toString = function () {
            return 'Hand: ' + cards.toString();
        };

        this.cardCount = function () {
            return cards.length;
        };

        this.cardAtIndex = function (index) {
            return cards[index];
        };

        this.discardAtIndex = function (index) {
            cards[index] = null;
        };

        this.draw = function () {
            for (i = 0; i < 5; ++i) {
                if (cards[i] == null) {
                    cards[i] = deck.drawCard();
                }
            }
        };

        this.toData = function () {
            var i, cardsData = [];
            for (i = 0; i < cards.length; ++i) {
                cardsData.push(cards[i].toData());
            }
            return {
                cards: cardsData,
                deck: deck.toData()
            }
        }
    };
    Hand.fromData = function (data) {
        var cardsData = data.cards,
            cards = [],
            deckData = data.deck,
            deck = Deck.fromData(deckData),
            i, card;
        for (i = 0; i < cardsData.length; ++i) {
            card = Card.fromData(cardsData[i]);
            cards.push(card);
        }
        return new Hand(deck, cards);
    };
    Hand.fromDeckWithNamesAndSuits = function (initCards) {
        var deck = Deck.fromNamesAndSuits(initCards);
        return new Hand(deck);
    };
    Hand.prototype.score = function () {
        return Score.forHand(this);
    };

    // A Score is the result of scoring a hand
    function Score(name, payouts) {

        this.name = function () {
            return name;
        };

        this.payoutForWager = function (wager) {
            return payouts[wager];
        }
    }

    // These objects are used as prototypes for the results of
    // Score.forHand
    Score.loss          = new Score('Loss',            {1:   0, 2:   0, 3:   0, 4:    0, 5:    0});
    Score.onePair       = new Score('One Pair',        {1:   1, 2:   2, 3:   3, 4:    4, 5:    5});
    Score.twoPair       = new Score('Two Pair',        {1:   2, 2:   4, 3:   6, 4:    8, 5:   10});
    Score.threeOfAKind  = new Score('Three of a Kind', {1:   3, 2:   6, 3:   9, 4:   12, 5:   15});
    Score.straight      = new Score('Straight',        {1:   4, 2:   8, 3:  12, 4:   16, 5:   20});
    Score.flush         = new Score('Flush',           {1:   6, 2:  12, 3:  18, 4:   24, 5:   30});
    Score.fullHouse     = new Score('Full House',      {1:   9, 2:  18, 3:  27, 4:   36, 5:   45});
    Score.fourOfAKind   = new Score('Four of a Kind',  {1:  25, 2:  50, 3:  75, 4:  100, 5:  125});
    Score.straightFlush = new Score('Straight Flush',  {1:  50, 2: 100, 3: 150, 4:  200, 5:  250});
    Score.royalFlush    = new Score('Royal Flush',     {1: 250, 2: 500, 3: 750, 4: 1000, 5: 4000});

    Score.values = [
        Score.loss,
        Score.onePair,
        Score.twoPair,
        Score.threeOfAKind,
        Score.straight,
        Score.flush,
        Score.fourOfAKind,
        Score.straightFlush,
        Score.royalFlush
    ];

    Score.withName = function (name) {
        return findElement(Score.values, function (score) {
            return score.name() === name;
        });
    };

    Score.forHand = function (hand) {
        var rankCounts, suitCounts,
            matchingRank,
            resultMajorRank, resultMinorRank, resultSuit, resultScoringCardIndexes,
            isStraight, isFlush, result;

        function initRankCounts() {
            var rankValues = Rank.values,
                i;
            rankCounts = {};
            for (i = 0; i < rankValues.length; ++i) {
                rankCounts[rankValues[i].name()] = 0;
            }
        }

        function incrementRankCount(rank) {
            var name = rank.name(),
            count = rankCounts[name];
            rankCounts[name] = count + 1;
        }

        function hasRankCount(count) {
            var rankValues = Rank.values,
                rank,
                i;
            for (i = 0; i < rankValues.length; ++i) {
                rank = rankValues[i];
                if (rankCounts[rank.name()] === count) {
                    matchingRank = rank; 
                    return true;
                }
            }
            return false;
        }

        function initSuitCounts() {
            var suitValues = Suit.values,
                i;
            suitCounts = {};
            for (i = 0; i < suitValues.length; ++i) {
                suitCounts[suitValues[i].name()] = 0;
            }
        }

        function incrementSuitCount(suit) {
            var name = suit.name(),
            count = suitCounts[name];
            suitCounts[name] = count + 1;
        }

        function countRanksAndSuits() {
            var cardCount = hand.cardCount(),
                card, i;
            initRankCounts();
            initSuitCounts();
            for (i = 0; i < cardCount; ++i) {
                card = hand.cardAtIndex(i);
                incrementRankCount(card.rank());
                incrementSuitCount(card.suit());
            }
        }

        function allIndexes() {
            return [0, 1, 2, 3, 4];
        }

        function indexesOfRank(rank) {
            var cardCount = hand.cardCount(),
                indexes = [],
                i, card;
            for (i = 0; i < cardCount; ++i) {
                card = hand.cardAtIndex(i);
                if (card.rank() === rank) {
                    indexes.push(i);
                }
            }
            return indexes;
        }

        function indexesOfRanks(rank0, rank1) {
            var cardCount = hand.cardCount(),
                indexes = [],
                i, card, rank;
            for (i = 0; i < cardCount; ++i) {
                card = hand.cardAtIndex(i);
                rank = card.rank();
                if (rank === rank0 || rank === rank1) {
                    indexes.push(i);
                }
            }
            return indexes;
        }

        function hasFourOfAKind() {
            if (hasRankCount(4)) {
                resultMajorRank = matchingRank;
                resultScoringCardIndexes = indexesOfRank(resultMajorRank);
                return true;
            }
            return false;
        }

        function hasThreeOfAKind() {
            if (hasRankCount(3)) {
                resultMajorRank = matchingRank;
                resultScoringCardIndexes = indexesOfRank(resultMajorRank);
                return true;
            }
            return false;
        }

        function hasTwoPair() {
            var rankValues = Rank.values,
                majorPairRank, i, rank;
            for (var i = 0; i < rankValues.length; ++i) {
                rank = rankValues[i];
                if (rankCounts[rank.name()] === 2) {
                    if (majorPairRank) {
                        // Found second pair
                        resultMajorRank = majorPairRank;
                        resultMinorRank = rank;
                        resultScoringCardIndexes = indexesOfRanks(resultMajorRank, resultMinorRank);
                        return true;
                    }
                    else {
                        // Found first pair; save rank and continue
                        majorPairRank = rank;
                    }
                }
            }
            return false;
        }

        function hasPair() {
            // Note: Pair only counts if rank is Jacks or higher
            if (hasRankCount(2) && (matchingRank.value() >= Rank.jack.value())) {
                resultMajorRank = matchingRank;
                resultScoringCardIndexes = indexesOfRank(resultMajorRank);
                return true;
            }
            return false;
        }

        function hasFullHouse() {
            var threeOfAKindRank;
            if (hasRankCount(3)) {
                threeOfAKindRank = matchingRank;
                if (hasRankCount(2)) {
                    resultMajorRank = threeOfAKindRank;
                    resultMinorRank = matchingRank;
                    resultScoringCardIndexes = allIndexes();
                    return true;
                }
            }
            return false;
        }

        function hasStraight() {

            function hasAceLowStraight() {
                return (rankCounts[Rank.ace.name()] > 0) &&
                    (rankCounts[Rank.two.name()] > 0) &&
                    (rankCounts[Rank.three.name()] > 0) &&
                    (rankCounts[Rank.four.name()] > 0) &&
                    (rankCounts[Rank.five.name()] > 0);
            }

            function hasStraightWithHighRankIndex(i) {
                for (var j = 0; j < 5; ++j) {
                    if (rankCounts[Rank.values[i+j].name()] === 0) {
                        return false;
                    }
                }
                return true;
            }

            for (var i = 0; i < 9; ++i) {
                if (hasStraightWithHighRankIndex(i)) {
                    resultMajorRank = Rank.values[i];
                    resultMinorRank = Rank.values[i+4];
                    resultScoringCardIndexes = allIndexes();
                    return true;
                }
            }

            if (hasAceLowStraight()) {
                resultMajorRank = Rank.five;
                resultMinorRank = Rank.ace;
                resultScoringCardIndexes = allIndexes();
                return true;
            }

            return false;
        }

        function hasFlush() {
            var suitValues = Suit.values,
                i, suit;
            for (i = 0; i < suitValues.length; ++i) {
                suit = suitValues[i];
                if (suitCounts[suit.name()] === 5) {
                    resultSuit = suit;
                    resultScoringCardIndexes = allIndexes();
                    return true;
                };
            }
            return false;
        }

        countRanksAndSuits();

        isStraight = hasStraight();
        isFlush = hasFlush();

        if (isStraight && isFlush) {
            if (resultMajorRank === Rank.ace) {
                result = newObjectWithPrototype(Score.royalFlush);
            }
            else {
                result = newObjectWithPrototype(Score.straightFlush);
            }
        }
        else if (hasFourOfAKind()) {
            result = newObjectWithPrototype(Score.fourOfAKind);
        }
        else if (hasFullHouse()) {
            result = newObjectWithPrototype(Score.fullHouse);
        }
        else if (isFlush) {
            result = newObjectWithPrototype(Score.flush);
        }
        else if (isStraight) {
            result = newObjectWithPrototype(Score.straight);
        }
        else if (hasThreeOfAKind()) {
            result = newObjectWithPrototype(Score.threeOfAKind);
        }
        else if (hasTwoPair()) {
            result = newObjectWithPrototype(Score.twoPair);
        }
        else if (hasPair()) {
            result = newObjectWithPrototype(Score.onePair);
        }
        else {
            result = newObjectWithPrototype(Score.loss);
            resultScoringCardIndexes = [];
        }

        result.majorRank = function () {
            return resultMajorRank;
        };
        result.rank = result.majorRank;

        result.minorRank = function () {
            return resultMinorRank;
        };
        
        result.suit = function () {
            return resultSuit;
        };

        result.scoringCardIndexes = function () {
            return resultScoringCardIndexes;
        };

        result.toData = function () {
            return {
                name:               result.name(),
                majorRank:          resultMajorRank? resultMajorRank.name() : null,
                minorRank:          resultMinorRank? resultMinorRank.name() : null,
                suit:               resultSuit? resultSuit.name() : null,
                scoringCardIndexes: resultScoringCardIndexes
            }
        };

        return result;
    };
    Score.fromData = function (data) {
        var scoreName = data.name,
            majorRankName = data.majorRank,
            minorRankName = data.minorRank,
            suitName = data.suit,
            scoringCardIndexes = data.scoringCardIndexes,
            scorePrototype = Score.withName(scoreName),
            majorRank = majorRankName? Rank.withName(majorRankName) : null,
            minorRank = minorRankName? Rank.withName(minorRankName) : null,
            suit = suitName? Suit.withName(suitName) : null,
            result = newObjectWithPrototype(scorePrototype);

        result.majorRank = function () {
            return majorRank;
        };
        result.rank = result.majorRank;

        result.minorRank = function () {
            return minorRank;
        };
        
        result.suit = function () {
            return suit;
        };

        result.scoringCardIndexes = function () {
            return scoringCardIndexes;
        };

        result.toData = function () {
            return {
                name:               result.name(),
                majorRank:          majorRank? majorRank.name() : null,
                minorRank:          minorRank? minorRank.name() : null,
                suit:               suit? suit.name() : null,
                scoringCardIndexes: scoringCardIndexes
            }
        };

        return result;
    };

    function PlayState(name) {
        this.name = function () {
            return name;
        };

        this.toString = this.name;
        
        this.toData = function () {
            return name;
        };
    };
    PlayState.gameIdle = new PlayState('game idle');
    PlayState.gameStarted = new PlayState('game started');
    PlayState.afterDraw = new PlayState('after draw');
    PlayState.gameEnded = new PlayState('game ended');
    PlayState.values = [
        PlayState.gameIdle,
        PlayState.gameStarted,
        PlayState.afterDraw,
        PlayState.gameEnded
    ];
    PlayState.withName = function (name) {
        return findElement(PlayState.values, function (playState) {
            return playState.name() === name;
        });
    };
    PlayState.fromData = function (data) {
        return PlayState.withName(data);
    };

    // A Session wraps up all the state of a player playing the game.
    // It is the model that is observed and manipulated by
    // user-interface objects.
    function Session(init) {
        var playState,
            hand,
            credits,
            wager,
            lastHandScore,
            lastHandPayout;

        if (init && init.playState) {
            playState = PlayState.fromData(init.playState);
        }
        else {
            playState = PlayState.gameIdle;
        }

        if (init && (typeof init.credits !== 'undefined')) {
            credits = init.credits;
        }
        else {
            credits = 100;
        }

        if (init && init.wager) {
            wager = init.wager;
        }
        else {
            wager = 5;
        }

        if (init && init.hand) {
            hand = Hand.fromData(init.hand);
        }

        if (init && init.lastHandScore) {
            lastHandScore = Score.fromData(init.lastHandScore);
        }
        
        if (init) {
            lastHandPayout = init.lastHandPayout;
        }

        // These callbacks are invoked when various events occur.
        this.onDealComplate = null;
        this.onDrawComplete = null;
        this.onGameEnded = null;
        
        this.playState = function () {
            return playState;
        };

        this.credits = function () {
            return credits;
        };

        this.wager = function () {
            return wager;
        };

        this.addCredits = function (numberOfCredits) {
            credits += numberOfCredits;
        };

        this.shuffleAndDeal = function () {
            var deck = new Deck();
            deck.shuffle();
            this.dealWithDeck(deck);
        };

        this.dealWithDeck = function (deck) {
            credits -= wager;
            hand = new Hand(deck);
            playState = PlayState.gameStarted;
            if (this.onDealComplete) {
                this.onDealComplete();
            };
        };

        this.cardAtIndex = function (i) {
            return hand.cardAtIndex(i);
        };

        this.discardAtIndex = function (i) {
            if (playState !== PlayState.gameStarted) {
                throw new Error('cannot discard unless playState is gameStarted');
            }
            hand.discardAtIndex(i);
        };

        this.draw = function () {
            if (playState !== PlayState.gameStarted) {
                throw new Error('cannot draw unless playState is gameStarted');
            }
            hand.draw();
            playState = PlayState.afterDraw;
            if (this.onDrawComplete) {
                this.onDrawComplete();
            }
        };

        this.scoreHand = function () {
            if (playState !== PlayState.afterDraw) {
                throw new Error('cannot score hand until after draw');
            }
            lastHandScore = hand.score();
            lastHandPayout = lastHandScore.payoutForWager(wager);
            credits += lastHandPayout;
            playState = PlayState.gameEnded;
            if (this.onGameEnded) {
                this.onGameEnded();
            }
        };

        this.lastHandScore = function () {
            return lastHandScore;
        };

        this.lastHandPayout = function () {
            return lastHandPayout;
        };

        this.toData = function () {
            var data = {
                playState:      playState.toData(),
                credits:        credits,
                wager:          wager,
                hand:           hand ? hand.toData() : null,
                lastHandScore:  lastHandScore? lastHandScore.toData() : null,
                lastHandPayout: lastHandPayout
            };
            return data;
        };

        this.storeTo = function (storage, key) {
            var data = this.toData(),
                stringifiedData = JSON.stringify(data);
            storage.setItem(key, stringifiedData);
        };
    };
    Session.fromData = function (data) {
        return new Session(data);
    };
    Session.restoreFrom = function (storage, key) {
        var stringifiedData = storage.getItem(key),
            data;
        if (!stringifiedData) {
            return null;
        }
        data = JSON.parse(stringifiedData);
        return Session.fromData(data);
    };

    // Export global 'kjPoker' object with references to this module's objects
    this.kjPoker = {
        colorRed:   colorRed,
        colorBlack: colorBlack,
        Card:       Card,
        Suit:       Suit,
        Rank:       Rank,
        Deck:       Deck,
        Hand:       Hand,
        Score:      Score,
        PlayState:  PlayState,
        Session:    Session
    };
}());
