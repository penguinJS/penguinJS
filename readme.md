PenguinJS
==========

PenguinJS is a lightweight and easy to use template solution for JavaScript applications.

Write markup as external HTML files then either preload or load asynchronously at runtime.

##Usage

Include penguin.js in your application and set Penguin.segmentsPath to the directory that holds your external html

###Simple replace

html (saved in foo.html):
```
<div>[~foo~]</div>
```

javascript: 
```
Penguin.getMarkup('foo.html', {foo:'bar'}, function(markup){
   $('body').append(markup);
});
```

result:
```
<div>bar</div>
```

###Conditional (if)

html (saved in if.html):
```
<div>
  I'm [~not:if~]not [/~not:if~]very happy
</div>
```

javascript:
```
Penguin.getMarkup('if.html', {not:false}, function(markup){
  $('body').append(markup);
});
```

result:
```
<div>
 I'm very happy
</div>
```

###Repeater

html (saved in repeat.html):
```
<ul>
  [~hop:repeater~]
    <li>[~hop~name~] - [~hop~aau~]</li>
  [/~hop:repeater~]
</ul>
```

javascript:
```
var hopList = [
 {name: 'Cascade', aau:7},
 {name: 'Centennial', aau:7.8},
 {name: 'Challenger', aau:8.5}
];

Penguin.getMarkup('if.html', {hop: hopList}, function(markup){
  $('body').append(markup);
});
```

result:
```
<ul>
  <li>Cascade - 7</li>
  <li>Centennial - 7.8</li>
  <li>Challenger - 8.5</li>
</ul>
```

##Development

###Testing
Testing requires Mocha
npm install -d mocha

to run the tests use
mocha -u tdd
