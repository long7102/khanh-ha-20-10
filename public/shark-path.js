// Scrapbook flight path: the shark rests beside each block of the page and swims, dives and banks to the next one as you scroll.
// x/y are viewport units (-1..1), yaw 0 faces right, 180 faces left, 90 faces the camera; spin is one corkscrew roll on the way in.
(() => {
  // One stop per block, listed in document order. d = desktop pose, m = phone pose.
  const stops = [
    ['#intro .hero-copy',            { x: .0, y: -.82, s: 1.1, yaw: 150, pitch: 6, roll: -4 },           { x: .15, y: -.7, s: 1, yaw: 150, pitch: 6, roll: -4 }],
    ['#intro .hero-art',             { x: .66, y: -.12, s: 1.4, yaw: 42, pitch: -4, roll: 6 },     { x: .45, y: .0, s: 1.1, yaw: 40, pitch: -4, roll: 6 }],
    ['#letter .section-heading',     { x: -.74, y: .24, s: 1.4, yaw: 125, pitch: 8, roll: 6 },            { x: -.4, y: .4, s: 1, yaw: 125, pitch: 8, roll: 6 }],
    ['#letter .letter-layout',       { x: .76, y: -.22, s: 1.4, yaw: 38, pitch: -6, roll: -8, spin: 360 }, { x: .5, y: -.35, s: 1.05, yaw: 38, pitch: -6, roll: -8 }],
    ['#album .section-heading',      { x: .72, y: .26, s: 1.4, yaw: 160, pitch: 8, roll: 4 },             { x: .45, y: .35, s: 1, yaw: 160, pitch: 8, roll: 4 }],
    ['#album .album-grid',           { x: -.8, y: -.02, s: 1.4, yaw: 22, pitch: 8, roll: -4 },     { x: -.5, y: -.1, s: 1.1, yaw: 22, pitch: 8, roll: -4 }],
    ['#album .book-section',         { x: .8, y: -.36, s: 1.4, yaw: 145, pitch: 6, roll: 4 },             { x: .5, y: -.5, s: 1, yaw: 145, pitch: 6, roll: 4 }],
    ['#story .section-heading',      { x: -.72, y: .3, s: 1.4, yaw: 128, pitch: 4, roll: 0 },             { x: -.4, y: .4, s: 1, yaw: 128, pitch: 4, roll: 0 }],
    ['#story .journey-stop:nth-of-type(1)', { x: .8, y: -.08, s: 1.4, yaw: 160, pitch: 8, roll: 4 },       { x: .5, y: .1, s: 1, yaw: 160, pitch: 8, roll: 4 }],
    ['#story .journey-stop:nth-of-type(3)', { x: -.8, y: .02, s: 1.4, yaw: 30, pitch: 6, roll: -6, spin: -360 }, { x: -.5, y: -.1, s: 1, yaw: 30, pitch: 6, roll: -6 }],
    ['#story .journey-stop:nth-of-type(5)', { x: .8, y: .12, s: 1.4, yaw: 165, pitch: 4, roll: 4 },        { x: .5, y: .2, s: 1, yaw: 165, pitch: 4, roll: 4 }],
    ['#story .journey-stop:nth-of-type(7)', { x: -.8, y: -.1, s: 1.4, yaw: 25, pitch: 8, roll: -4 },       { x: -.5, y: -.2, s: 1, yaw: 25, pitch: 8, roll: -4 }],
    ['#music',                       { x: .72, y: .36, s: 1.4, yaw: 140, pitch: -6, roll: 6 },     { x: .45, y: .45, s: 1, yaw: 140, pitch: -6, roll: 6 }],
    ['#counter .section-heading',    { x: -.72, y: .4, s: 1.4, yaw: 35, pitch: 6, roll: -4 },             { x: -.4, y: .45, s: 1, yaw: 35, pitch: 6, roll: -4 }],
    ['#counter .counter-box',        { x: .86, y: -.5, s: 1.4, yaw: 172, pitch: 4, roll: 2, spin: 360 },  { x: .0, y: -.7, s: 1.1, yaw: 172, pitch: 4, roll: 2 }],
    ['#surprise',                    { x: .76, y: -.1, s: 1.4, yaw: 40, pitch: -6, roll: -8 },     { x: .45, y: -.3, s: 1.1, yaw: 40, pitch: -6, roll: -8 }],
    ['#closing .closing-stars',      { x: -.76, y: .3, s: 1.4, yaw: 30, pitch: 6, roll: -4 },             { x: -.4, y: .45, s: 1, yaw: 30, pitch: 6, roll: -4 }],
    ['#closing .game',               { x: .82, y: -.2, s: 1.4, yaw: 155, pitch: 6, roll: 4 },             { x: .5, y: -.5, s: 1, yaw: 155, pitch: 6, roll: 4 }],
    ['#closing .ocean-finale',       { x: -.86, y: -.1, s: 1.4, yaw: 30, pitch: 4, roll: 0, spin: 360 }, { x: .0, y: -.2, s: 1.3, yaw: 132, pitch: 4, roll: 0 }]
  ];
  window.FISH_PATH = {
    sections: stops.map(stop => stop[0]).join(','),
    desktop: stops.map(stop => stop[1]),
    mobile: stops.map(stop => stop[2])
  };
})();
