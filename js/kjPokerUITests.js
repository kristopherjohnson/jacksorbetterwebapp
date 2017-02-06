this.kjPoker.runUITests = function () {

    var Card = kjPoker.Card,
        Rank = kjPoker.Rank,
        Suit = kjPoker.Suit;

    module('kjPokerUI');

    test("Card image paths", function () {
        var c = new Card(Rank.ace, Suit.diamonds);
        equals('images/card/ad.png', c.imagePath(), 'image path');

        c = new Card(Rank.jack, Suit.hearts);
        equals('images/card/jh.png', c.imagePath(), 'image path');

        c = new Card(Rank.two, Suit.clubs);
        equals('images/card/2c.png', c.imagePath(), 'image path');
    });
};
