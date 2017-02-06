// Unit tests for poker.js
//
// Open poker_tests.html to run these tests.

this.kjPoker.runTests = function () {

    var Suit = kjPoker.Suit,
        Rank = kjPoker.Rank,
        Card = kjPoker.Card,
        Deck = kjPoker.Deck,
        Hand = kjPoker.Hand,
        Session = kjPoker.Session,
        log = kjUtil.log;

    function notNull(obj, message) {
        ok(obj != null, message);
    }

    function notEquals(actual, expected, message) {
        ok(actual !== expected, message);
    }

    function isUndefined(obj, message) {
        ok(typeof obj === 'undefined', message);
    }

    module('kjPoker');

    test('Create deck', function() {
        var deck = new Deck();
        notNull(deck, 'non-null deck reference');

        equals(deck.cardCount(), 52, 'deck has 52 cards');

        // We won't test every one of the 52 cards, but will test the first few, last few
        // and a few in the middle.
        equals(deck.cardAtIndex(0).name(), 'ace of clubs', 'initial position');
        equals(deck.cardAtIndex(1).name(), 'king of clubs', 'initial position');
        equals(deck.cardAtIndex(2).name(), 'queen of clubs', 'initial position');

        equals(deck.cardAtIndex(16).name(), 'jack of diamonds', 'initial position');
        equals(deck.cardAtIndex(17).name(), 'ten of diamonds', 'initial position');
        equals(deck.cardAtIndex(18).name(), 'nine of diamonds', 'initial position');

        equals(deck.cardAtIndex(32).name(), 'eight of hearts', 'initial position');
        equals(deck.cardAtIndex(33).name(), 'seven of hearts', 'initial position');
        equals(deck.cardAtIndex(34).name(), 'six of hearts', 'initial position');

        equals(deck.cardAtIndex(48).name(), 'five of spades', 'initial position');
        equals(deck.cardAtIndex(49).name(), 'four of spades', 'initial position');
        equals(deck.cardAtIndex(50).name(), 'three of spades', 'initial position');
        equals(deck.cardAtIndex(51).name(), 'two of spades', 'initial position');

        var fiveOfDiamonds = deck.cardWithName('five of diamonds');
        notNull(fiveOfDiamonds, 'retrieve five of diamonds');
        equals(fiveOfDiamonds.name(), 'five of diamonds', 'check name');
        equals(fiveOfDiamonds.suitColor(), kjPoker.colorRed, 'check color');

        var jackOfClubs = deck.cardWithName('jack of clubs');
        notNull(jackOfClubs, 'retrieve jack of clubs');
        equals(jackOfClubs.name(), 'jack of clubs', 'check name');
        equals(jackOfClubs.suitColor(), kjPoker.colorBlack, 'check color');
    });

    test('Shuffle deck', function () {
        var deck = new Deck();
        deck.shuffle();

        // Note: These tests may 'fail' once in a while, as it is possible for a card
        //       to end up in the same place it started after a shuffle.
        notEquals(deck.cardAtIndex(0).name(), 'two of clubs', 'card should have moved');
        notEquals(deck.cardAtIndex(1).name(), 'three of clubs', 'card should have moved');
        notEquals(deck.cardAtIndex(50).name(), 'king of spades', 'card should have moved');
        notEquals(deck.cardAtIndex(51).name(), 'ace of spades', 'card should have moved');
    });

    test('Deal hand', function () {
        var deck, hand;
        deck = new Deck();
        deck.shuffle();
        hand = new Hand(deck);
        equals(hand.cardCount(), 5, 'hand size');
    });

    test('Create deck with no cards', function () {
        var cards = [],
            deck = new Deck(cards);
        notNull(deck, 'deck not null');
        equals(deck.cardCount(), 0, 'card count');
    });

    test('Create deck with cards', function () {
        var cards, deck;

        cards = Card.arrayFromNamesAndSuits([
            'two',  Suit.hearts,
            'five', Suit.diamonds,
            'six',  Suit.spades,
            'king', Suit.clubs,
            'ace',  Suit.hearts
        ]);
        notNull(cards, 'cards not null');
        equals(cards.length, 5, 'cards.length');

        deck = new Deck(cards);
        notNull(deck, 'deck not null');
        equals(deck.cardCount(), 5, 'card count');

        equals(deck.cardAtIndex(4).name(), 'two of hearts', 'initial position');
        equals(deck.cardAtIndex(4).rankValue(), 2, 'rank value');

        equals(deck.cardAtIndex(3).name(), 'five of diamonds', 'initial position');
        equals(deck.cardAtIndex(3).rankValue(), 5, 'rank value');

        equals(deck.cardAtIndex(2).name(), 'six of spades', 'initial position');
        equals(deck.cardAtIndex(2).rankValue(), 6, 'rank value');

        equals(deck.cardAtIndex(1).name(), 'king of clubs', 'initial position');
        equals(deck.cardAtIndex(1).rankValue(), 13, 'rank value');

        equals(deck.cardAtIndex(0).name(), 'ace of hearts', 'initial position');
        equals(deck.cardAtIndex(0).rankValue(), 14, 'rank value');
    });

    test('Score loss', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',   Suit.spades,
            'three', Suit.hearts,
            'two',   Suit.clubs,
            'four',  Suit.diamonds,
            'seven', Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Loss', 'Loss test #1');
        isUndefined(score.majorRank(), 'major rank undefined');
        isUndefined(score.minorRank(), 'minor rank undefined');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [], 'Loss #1 scoring card indexes');

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'king', Suit.hearts,
            'two',  Suit.clubs,
            'four', Suit.diamonds,
            'six',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Loss', 'Loss test #2');
        isUndefined(score.majorRank(), 'major rank undefined');
        isUndefined(score.minorRank(), 'minor rank undefined');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [], 'Loss #2 scoring card indexes');
    });

    test('Score one pair', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'ace',  Suit.hearts,
            'two',  Suit.clubs,
            'four', Suit.diamonds,
            'six',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'One Pair', 'One pair test #1');
        equals(score.rank().name(), 'ace', 'Pair rank #1');
        equals(score.majorRank().name(), 'ace', 'Pair #1 major rank');
        isUndefined(score.minorRank(), 'minor rank undefined');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1], 'Pair #1 scoring card indexes');

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',   Suit.spades,
            'three', Suit.hearts,
            'jack',  Suit.clubs,
            'four',  Suit.diamonds,
            'jack',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'One Pair', 'One pair test #2');
        equals(score.rank().name(), 'jack', 'Pair rank #2');
        equals(score.majorRank().name(), 'jack', 'Pair #2 major rank');
        isUndefined(score.minorRank(), 'minor rank undefined');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [2, 4], 'Pair #2 scoring card indexes');

        // Pair of tens doesn't count in Jacks or Better
        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'ten',  Suit.hearts,
            'ten',  Suit.clubs,
            'four', Suit.diamonds,
            'six',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Loss', 'Pair of tens test');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [], 'Pair of tens scoring card indexes');

        // Pair of twos doesn't count in Jacks or Better
        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'ten',  Suit.hearts,
            'two',  Suit.clubs,
            'four', Suit.diamonds,
            'two',  Suit.spades
        ]);
        score = hand.score();
        equals(score.name(), 'Loss', 'Pair of twos test');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [], 'Pair of twos scoring card indexes');
    });

    test('Score three of a kind', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'ace',  Suit.hearts,
            'ace',  Suit.clubs,
            'four', Suit.diamonds,
            'six',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Three of a Kind', 'Three of a kind test #1');
        equals(score.rank().name(), 'ace', 'Three of a kind rank #1');
        equals(score.majorRank().name(), 'ace', 'Three of a kind #1 major rank');
        isUndefined(score.minorRank(), 'minor rank undefined');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1, 2], 'Three of a kind test #1 scoring cards');

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'two',  Suit.hearts,
            'two',  Suit.clubs,
            'two',  Suit.diamonds,
            'six',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Three of a Kind', 'Three of a kind test #2');
        equals(score.rank().name(), 'two', 'Three of a kind rank #2');
        equals(score.majorRank().name(), 'two', 'Three of a kind #2 major rank');
        isUndefined(score.minorRank(), 'minor rank undefined');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [1, 2, 3], 'Three of a kind test #2 scoring cards');
    });

    test('Score four of a kind', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'ace',  Suit.hearts,
            'ace',  Suit.clubs,
            'ace',  Suit.diamonds,
            'six',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Four of a Kind', 'Four of a kind test #1');
        equals(score.rank().name(), 'ace', 'Four of a kind rank #1');
        equals(score.majorRank().name(), 'ace', 'Four of a kind #1 major rank');
        isUndefined(score.minorRank(), 'minor rank undefined');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1, 2, 3], 'Four of a kind test #1 scoring cards');

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'two',  Suit.hearts,
            'two',  Suit.clubs,
            'two',  Suit.diamonds,
            'two',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Four of a Kind', 'Four of a kind test #2');
        equals(score.rank().name(), 'two', 'Four of a kind rank #2');
        equals(score.majorRank().name(), 'two', 'Four of a kind #2 major rank');
        isUndefined(score.minorRank(), 'minor rank undefined');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [1, 2, 3, 4], 'Four of a kind test #2 scoring cards');
    });

    test('Score two pair', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',   Suit.spades,
            'ace',   Suit.hearts,
            'three', Suit.clubs,
            'three', Suit.diamonds,
            'six',   Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Two Pair', 'Two pair test #1');
        equals(score.majorRank().name(), 'ace', 'Two pair rank #1 high');
        equals(score.minorRank().name(), 'three', 'Two pair rank #1 low');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1, 2, 3], 'Two pair test #1 scoring cards');

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',  Suit.spades,
            'two',  Suit.hearts,
            'two',  Suit.clubs,
            'five', Suit.diamonds,
            'five', Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Two Pair', 'Two pair test #2');
        equals(score.majorRank().name(), 'five', 'Two pair rank #2 high');
        equals(score.minorRank().name(), 'two', 'Two pair rank #2 low');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [1, 2, 3, 4], 'Two pair test #2 scoring cards');
    });

    test('Score full house', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',   Suit.spades,
            'ace',   Suit.hearts,
            'three', Suit.clubs,
            'three', Suit.diamonds,
            'three', Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Full House', 'Full house test #1');
        equals(score.majorRank().name(), 'three', 'Full house rank #1 major');
        equals(score.minorRank().name(), 'ace', 'Full house rank #1 minor');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);

        hand = Hand.fromDeckWithNamesAndSuits([
            'five', Suit.spades,
            'two',  Suit.hearts,
            'two',  Suit.clubs,
            'five', Suit.diamonds,
            'five', Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Full House', 'Full house test #2');
        equals(score.majorRank().name(), 'five', 'Full house rank #2 major');
        equals(score.minorRank().name(), 'two', 'Full house rank #2 minor');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);
    });

    test('Score straight', function () {
        var hand, score;

        // ace-high straight
        hand = Hand.fromDeckWithNamesAndSuits([
            'king',  Suit.spades,
            'jack',  Suit.hearts,
            'queen', Suit.clubs,
            'ten',   Suit.diamonds,
            'ace',   Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Straight', 'Straight test #1');
        equals(score.majorRank().name(), 'ace', 'Straight rank #1 major');
        equals(score.minorRank().name(), 'ten', 'Straight rank #1 minor');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);

        // six-high straight
        hand = Hand.fromDeckWithNamesAndSuits([
            'three', Suit.spades,
            'two',   Suit.hearts,
            'five',  Suit.clubs,
            'six',   Suit.diamonds,
            'four',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Straight', 'Straight test #2');
        equals(score.majorRank().name(), 'six', 'Straight rank #2 major');
        equals(score.minorRank().name(), 'two', 'Straight rank #2 minor');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);

        // ace-low straight
        hand = Hand.fromDeckWithNamesAndSuits([
            'three', Suit.spades,
            'two',   Suit.hearts,
            'five',  Suit.clubs,
            'ace',   Suit.diamonds,
            'four',  Suit.clubs
        ]);
        score = hand.score();
        equals(score.name(), 'Straight', 'Ace-low straight test');
        equals(score.majorRank().name(), 'five', 'Ace-low straight major');
        equals(score.minorRank().name(), 'ace', 'Ace-low straight minor');
        isUndefined(score.suit(), 'suit undefined');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);
    });

    test('Score flush', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'two',  Suit.spades,
            'six',  Suit.spades,
            'four', Suit.spades,
            'ten',  Suit.spades,
            'ace',  Suit.spades
        ]);
        score = hand.score();
        equals(score.name(), 'Flush', 'Flush test #1');
        isUndefined(score.majorRank(), 'Flush #1 major rank');
        isUndefined(score.minorRank(), 'Flush #1 minor rank');
        equals(score.suit().name(), 'spades');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);

        hand = Hand.fromDeckWithNamesAndSuits([
            'two',  Suit.hearts,
            'six',  Suit.hearts,
            'four', Suit.hearts,
            'ten',  Suit.hearts,
            'ace',  Suit.hearts
        ]);
        score = hand.score();
        equals(score.name(), 'Flush', 'Flush test #2');
        isUndefined(score.majorRank(), 'Flush #2 major rank');
        isUndefined(score.minorRank(), 'Flush #2 minor rank');
        equals(score.suit().name(), 'hearts');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);
    });

    test('Score straight flush', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'six',   Suit.spades,
            'three', Suit.spades,
            'four',  Suit.spades,
            'five',  Suit.spades,
            'two',   Suit.spades
        ]);
        score = hand.score();
        equals(score.name(), 'Straight Flush', 'Straight flush test #1');
        equals(score.majorRank().name(), 'six', 'Straight flush #1 major rank');
        equals(score.minorRank().name(), 'two', 'Straight flush #1 minor rank');
        equals(score.suit().name(), 'spades');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);

        hand = Hand.fromDeckWithNamesAndSuits([
            'nine',  Suit.hearts,
            'queen', Suit.hearts,
            'king',  Suit.hearts,
            'ten',   Suit.hearts,
            'jack',  Suit.hearts
        ]);
        score = hand.score();
        equals(score.name(), 'Straight Flush', 'Straight flush test #2');
        equals(score.majorRank().name(), 'king', 'Straight flush #1 major rank');
        equals(score.minorRank().name(), 'nine', 'Straight flush #1 minor rank');
        equals(score.suit().name(), 'hearts');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);
    });

    test('Score royal flush', function () {
        var hand, score;

        hand = Hand.fromDeckWithNamesAndSuits([
            'ace',   Suit.spades,
            'queen', Suit.spades,
            'king',  Suit.spades,
            'ten',   Suit.spades,
            'jack',  Suit.spades
        ]);
        score = hand.score();
        equals(score.name(), 'Royal Flush', 'Royal flush test #1');
        equals(score.majorRank().name(), 'ace', 'Royal flush #1 major rank');
        equals(score.minorRank().name(), 'ten', 'Royal flush #1 minor rank');
        equals(score.suit().name(), 'spades');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);

        hand = Hand.fromDeckWithNamesAndSuits([
            'ten',   Suit.hearts,
            'queen', Suit.hearts,
            'king',  Suit.hearts,
            'ace',   Suit.hearts,
            'jack',  Suit.hearts
        ]);
        score = hand.score();
        equals(score.name(), 'Royal Flush', 'Royal flush test #2');
        equals(score.majorRank().name(), 'ace', 'Royal flush #1 major rank');
        equals(score.minorRank().name(), 'ten', 'Royal flush #1 minor rank');
        equals(score.suit().name(), 'hearts');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);
    });

    test('Play game session', function () {
        var deck, hand, session, score;

        session = new Session();
        equals(session.credits(), 100, 'session initial credits');

        deck = Deck.fromNamesAndSuits([
            'four',  Suit.hearts,
            'king',  Suit.spades,
            'six',   Suit.hearts,
            'five',  Suit.clubs,
            'three', Suit.diamonds,
            'two',   Suit.hearts
        ]);
        session.dealWithDeck(deck);
        equals(session.credits(), 95, 'credits after deal');
        session.discardAtIndex(1);
        session.draw();
        session.scoreHand();
        score = session.lastHandScore();
        equals(score.name(), 'Straight', 'first hand score');
        same(score.scoringCardIndexes(), [0, 1, 2, 3, 4]);
        equals(session.lastHandPayout(), 20, 'payout');
        equals(session.credits(), 115, 'credits after first hand');
    });

    test('localStorage', function () {
        ok(typeof(localStorage) !== 'undefined', 'localStorage must be supported');

        localStorage.testInt = 678;
        equals(localStorage.testInt, 678);

        localStorage.testString = 'foobar';
        equals(localStorage.testString, 'foobar');

        var testArray = ['one', 'two', 'three'];
        localStorage.testArray = testArray;
        var retrievedArray = localStorage.testArray;
        equals(testArray.length, 3);
        equals(testArray[0], 'one');
        equals(testArray[1], 'two');
        equals(testArray[2], 'three');

        // To store and retrieve objects, need to stringify using JSON
        ok(typeof(JSON) !== 'undefined', 'JSON must be supported');
        equals(typeof(JSON.stringify), 'function', 'JSON.stringify');
        equals(typeof(JSON.parse), 'function', 'JSON.parse');
        var testObject = { 'one': 1, 'two': 2, 'three': 3 };
        localStorage.setItem('testObject', JSON.stringify(testObject));
        var retrievedObject = localStorage.getItem('testObject');
        equals(typeof retrievedObject, 'string');
        retrievedObject = JSON.parse(retrievedObject);
        equals(typeof retrievedObject, 'object');
        same(retrievedObject, testObject);
    });

    test('Store game session', function () {
        var deck, hand, session, restoredSession, score;

        session = new Session();

        session.storeTo(localStorage, 'TestStorage');
        restoredSession = Session.restoreFrom(localStorage, 'TestStorage');

        equals(restoredSession.playState().name(), 'game idle');
        equals(restoredSession.credits(), 100, 'restoreSession credits');
        equals(restoredSession.wager(), 5, 'restoreSession wager');
        ok(!restoredSession.lastHandScore());
        ok(!restoredSession.lastHandPayout());

        deck = Deck.fromNamesAndSuits([
            'four',  Suit.hearts,
            'king',  Suit.spades,
            'six',   Suit.hearts,
            'five',  Suit.clubs,
            'three', Suit.diamonds,
            'two',   Suit.hearts,
            'ace',   Suit.hearts,
            'seven', Suit.hearts,
            'eight', Suit.hearts,
            'three', Suit.hearts
        ]);
        session.dealWithDeck(deck);

        session.storeTo(localStorage, 'TestStorage');
        restoredSession = Session.restoreFrom(localStorage, 'TestStorage');

        equals(restoredSession.playState().name(), 'game started');
        equals(restoredSession.credits(), 95, 'restoreSession credits');
        equals(restoredSession.wager(), 5, 'restoreSession wager');
        equals(restoredSession.cardAtIndex(0).name(), 'four of hearts');
        equals(restoredSession.cardAtIndex(4).name(), 'three of diamonds');
        ok(!restoredSession.lastHandScore());
        ok(!restoredSession.lastHandPayout());

        session.discardAtIndex(0);
        session.discardAtIndex(1);
        session.discardAtIndex(2);
        session.discardAtIndex(3);
        session.discardAtIndex(4);
        session.draw();

        session.storeTo(localStorage, 'TestStorage');
        restoredSession = Session.restoreFrom(localStorage, 'TestStorage');

        equals(restoredSession.playState().name(), 'after draw');
        equals(restoredSession.credits(), 95, 'restoreSession credits');
        equals(restoredSession.wager(), 5, 'restoreSession wager');
        equals(restoredSession.cardAtIndex(0).name(), 'two of hearts');
        equals(restoredSession.cardAtIndex(4).name(), 'three of hearts');
        ok(!restoredSession.lastHandScore());
        ok(!restoredSession.lastHandPayout());
        
        session.scoreHand();

        session.storeTo(localStorage, 'TestStorage');
        restoredSession = Session.restoreFrom(localStorage, 'TestStorage');

        equals(restoredSession.playState().name(), 'game ended');
        score = restoredSession.lastHandScore();
        equals(score.name(), 'Flush', 'first hand score');
        equals(session.lastHandPayout(), 30, 'payout');
        equals(session.credits(), 125, 'credits after first hand');
    });

};
