var test = require('tape');
var postcss = require('postcss');
var plugin = require('./');

var tests = [{
    message: 'should trim spaces in simple selectors',
    fixture: 'h1,  h2,  h3{color:blue}',
    expected: 'h1,h2,h3{color:blue}'
}, {
    message: 'should trim spaces around combinators',
    fixture: 'h1 + p, h1 > p, h1 ~ p{color:blue}',
    expected: 'h1+p,h1>p,h1~p{color:blue}'
}, {
    message: 'should not trim meaningful spaces',
    fixture: 'h1 p,h2 p{color:blue}',
    expected: 'h1 p,h2 p{color:blue}'
}, {
    message: 'should reduce meaningful spaces',
    fixture: 'h1    p,h2     p{color:blue}',
    expected: 'h1 p,h2 p{color:blue}'
}, {
    message: 'should remove qualified universal selectors',
    fixture: '*#id,*.test,*:not(.green),*[href]{color:blue}',
    expected: '#id,.test,:not(.green),[href]{color:blue}'
}, {
    message: 'should remove complex qualified universal selectors',
    fixture: '[class] + *[href] *:not(*.green){color:blue}',
    expected: '[class]+[href] :not(.green){color:blue}'
}, {
    message: 'should remove complex qualified universal selectors (2)',
    fixture: '*:not(*.green) ~ *{color:blue}',
    expected: ':not(.green)~*{color:blue}'
}, {
    message: 'should not remove meaningful universal selectors',
    fixture: '* + *, * > *, * h1, * ~ *{color:blue}',
    expected: '*+*,*>*,* h1,*~*{color:blue}'
}, {
    message: 'should preserve the universal selector between comments',
    fixture: '/*comment*/*/*comment*/{color:blue}',
    expected: '/*comment*/*/*comment*/{color:blue}'
}, {
    message: 'should preserve escaped zero plus sequences',
    fixture: '.\31 0\+,.\31 5\+,.\32 0\+{color:blue}',
    expected: '.\31 0\+,.\31 5\+,.\32 0\+{color:blue}'
}, {
    message: 'should handle deep combinators',
    fixture: 'body /deep/ .theme-element{color:blue}',
    expected: 'body /deep/ .theme-element{color:blue}'
}, {
    message: 'should sort using natural sort',
    fixture: '.item1, .item10, .item11, .item2{color:blue}',
    expected: '.item1,.item2,.item10,.item11{color:blue}'
}, {
    message: 'should dedupe selectors',
    fixture: 'h1,h2,h3,h4,h5,h5,h6{color:blue}',
    expected: 'h1,h2,h3,h4,h5,h6{color:blue}'
}, {
    message: 'should trim spaces in :not()',
    fixture: 'h1:not(.article, .comments){color:blue}',
    expected: 'h1:not(.article,.comments){color:blue}'
}, {
    message: 'should trim spaces in :not() (2)',
    fixture: 'h1:not(.article, .comments), h2:not(.lead, .recommendation){color:blue}',
    expected: 'h1:not(.article,.comments),h2:not(.lead,.recommendation){color:blue}'
}, {
    message: 'should dedupe simple selectors inside :not()',
    fixture: 'h1:not(h2, h3, h4, h5, h5, h6){color:blue}',
    expected: 'h1:not(h2,h3,h4,h5,h6){color:blue}'
}, {
    message: 'should normalise attribute selectors',
    fixture: 'a[   color=   "blue"    ]{color:blue}',
    expected:'a[color=blue]{color:blue}'
}, {
    message: 'should normalise attribute selectors (2)',
    fixture: 'a[class^="options["]:after{color:blue}',
    expected: 'a[class^="options["]:after{color:blue}'
}, {
    message: 'should normalise attribute selectors (3)',
    fixture: 'a[class="woop_woop_woop"]{color:blue}',
    expected: 'a[class=woop_woop_woop]{color:blue}'
}, {
    message: 'should normalise attribute selectors (4)',
    fixture: 'a[class="woop \\\nwoop woop"]{color:blue}',
    expected: 'a[class="woop woop woop"]{color:blue}'
}, {
    message: 'should normalise @media queries',
    fixture: '@media screen,print{h1{color:red}}@media print,screen{h2{color:blue}}',
    expected: '@media print,screen{h1{color:red}}@media print,screen{h2{color:blue}}'
}, {
    message: 'should normalise @media queries (2)',
    fixture: '@media only screen and (min-width: 400px; min-height: 500px){h1{color:blue}}',
    expected: '@media only screen and (min-width:400px;min-height:500px){h1{color:blue}}'
}, {
    message: 'should not be responsible for normalising comments',
    fixture: 'h1 /*!test comment*/, h2{color:blue}',
    expected: 'h1 /*!test comment*/,h2{color:blue}'
}, {
    message: 'should not be responsible for normalising coments (2)',
    fixture: '/*!test   comment*/h1, h2{color:blue}',
    expected: '/*!test   comment*/h1,h2{color:blue}'
}];

function process (css, options) {
    return postcss(plugin(options)).process(css).css;
}

test(require('./package.json').name, function (t) {
    t.plan(tests.length);

    tests.forEach(function (test) {
        var options = test.options || {};
        t.equal(process(test.fixture, options), test.expected, test.message);
    });
});
