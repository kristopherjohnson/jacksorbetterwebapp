// Copyright 2010 Kristopher Johnson

(function () {

    function log(message) {
        if (console && console.log) {
            console.log(message);
        }
    }

    function newObjectWithPrototype(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    }

    // Return first element of array where predicate(element) returns true.
    // Return notFoundResult if there is no matching element
    function findElement(array, predicate, notFoundResult) {
        var length = array.length,
             i, element;
        if (typeof notFoundResult === 'undefined') {
            notFoundResult = null;
        }
        for (i = 0; i < length; ++i) {
            element = array[i];
            if (predicate(element)) {
                return element;
            }
        }
        return notFoundResult;
    }

    // Export functions to kjUtil namespace
    this.kjUtil = {
        log:                    log,
        newObjectWithPrototype: newObjectWithPrototype,
        findElement:            findElement
    };
}());
