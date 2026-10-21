/* Gilyoş desenleri: sertifika ve banknotlardaki iç içe geçen ince çizgiler.
   Sayfadaki her <svg data-guilloche="..."> alanı yüklenince burada çizilir. */
(function () {
  var TAU = Math.PI * 2;
  var NS = "http://www.w3.org/2000/svg";

  function toPath(points, closed) {
    var d = "M" + points[0][0].toFixed(2) + " " + points[0][1].toFixed(2);
    for (var i = 1; i < points.length; i++) {
      d += "L" + points[i][0].toFixed(2) + " " + points[i][1].toFixed(2);
    }
    return closed ? d + "Z" : d;
  }

  // Halka: r(θ) = R + A·sin(kθ + φ) + B·sin(mθ); her çizgide φ kayar ve örgü oluşur.
  function ring(o) {
    var out = [];
    var steps = o.steps || 720;
    var cx = o.cx || 0;
    var cy = o.cy || 0;
    for (var i = 0; i < o.lines; i++) {
      var phi = (i / o.lines) * TAU;
      var pts = [];
      for (var s = 0; s < steps; s++) {
        var t = (s / steps) * TAU;
        var r = o.R + o.A * Math.sin(o.k * t + phi) + (o.B || 0) * Math.sin((o.m || 0) * t);
        pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
      }
      out.push(toPath(pts, true));
    }
    return out;
  }

  // Şerit: yatay dalgalar, y = A·sin(kx + φ).
  function band(o) {
    var out = [];
    var steps = o.steps || 300;
    for (var i = 0; i < o.lines; i++) {
      var phi = (i / o.lines) * TAU;
      var pts = [];
      for (var s = 0; s <= steps; s++) {
        var u = s / steps;
        pts.push([o.x + u * o.width, o.y + o.A * Math.sin(u * o.waves * TAU + phi)]);
      }
      out.push(toPath(pts, false));
    }
    return out;
  }

  // Yuvarlak köşeli dikdörtgen üzerinde s uzaklığındaki nokta ve dışa bakan normal.
  function rectPoint(o, s) {
    var rc = o.r;
    var a = o.w - 2 * rc;
    var b = o.h - 2 * rc;
    var q = (Math.PI * rc) / 2;
    var segs = [
      ["line", a, o.x + rc, o.y, 1, 0, 0, -1],
      ["arc", q, o.x + o.w - rc, o.y + rc, -Math.PI / 2],
      ["line", b, o.x + o.w, o.y + rc, 0, 1, 1, 0],
      ["arc", q, o.x + o.w - rc, o.y + o.h - rc, 0],
      ["line", a, o.x + o.w - rc, o.y + o.h, -1, 0, 0, 1],
      ["arc", q, o.x + rc, o.y + o.h - rc, Math.PI / 2],
      ["line", b, o.x, o.y + o.h - rc, 0, -1, -1, 0],
      ["arc", q, o.x + rc, o.y + rc, Math.PI]
    ];
    for (var i = 0; i < segs.length; i++) {
      var g = segs[i];
      if (s <= g[1] || i === segs.length - 1) {
        if (g[0] === "line") return [g[2] + g[4] * s, g[3] + g[5] * s, g[6], g[7]];
        var ang = g[4] + s / rc;
        return [g[2] + rc * Math.cos(ang), g[3] + rc * Math.sin(ang), Math.cos(ang), Math.sin(ang)];
      }
      s -= g[1];
    }
  }

  // Çerçeve: dikdörtgen boyunca dalgalanan, birbirine geçen çizgiler.
  function frame(o) {
    var per = 2 * (o.w - 2 * o.r) + 2 * (o.h - 2 * o.r) + TAU * o.r;
    var steps = Math.round(per / (o.step || 0.6));
    var out = [];
    for (var i = 0; i < o.lines; i++) {
      var phi = (i / o.lines) * TAU;
      var pts = [];
      for (var s = 0; s < steps; s++) {
        var d = (s / steps) * per;
        var p = rectPoint(o, d);
        var off = o.A * Math.sin(o.waves * (d / per) * TAU + phi);
        pts.push([p[0] + p[2] * off, p[1] + p[3] * off]);
      }
      out.push(toPath(pts, true));
    }
    return out;
  }

  function add(svg, paths, cls, start) {
    paths.forEach(function (d, i) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("class", cls);
      p.setAttribute("pathLength", "1");
      p.style.setProperty("--i", (start || 0) + i);
      svg.appendChild(p);
    });
    return (start || 0) + paths.length;
  }

  function el(svg, name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    svg.appendChild(n);
  }

  var designs = {
    rosette: function (svg) {
      svg.setAttribute("viewBox", "-160 -160 320 320");
      var i = add(svg, ring({ R: 128, A: 17, k: 30, B: 4, m: 10, lines: 14 }), "g-line");
      i = add(svg, ring({ R: 92, A: 11, k: 22, lines: 12 }), "g-line g-soft", i);
      add(svg, ring({ R: 64, A: 12, k: 16, lines: 10 }), "g-accent", i);
      el(svg, "text", { x: 0, y: 2, class: "monogram" }, "MA");
    },

    wave: function (svg) {
      svg.setAttribute("viewBox", "0 0 600 20");
      svg.setAttribute("preserveAspectRatio", "none");
      add(svg, band({ x: 0, y: 10, width: 600, A: 5, waves: 9, lines: 3 }), "g-line g-thin");
    },

    poster: function (svg) {
      svg.setAttribute("viewBox", "0 0 210 297");
      add(svg, frame({ x: 11, y: 11, w: 188, h: 275, r: 6, A: 2.2, waves: 130, lines: 4, step: 0.5 }), "g-line");
      add(svg, ring({ cx: 105, cy: 260, R: 14, A: 1.8, k: 26, lines: 6, steps: 360 }), "g-line");
      add(svg, ring({ cx: 105, cy: 260, R: 9.5, A: 1.6, k: 14, lines: 5, steps: 240 }), "g-accent");
      el(svg, "text", { x: 105, y: 260.4, class: "monogram" }, "MA");
    }
  };

  document.querySelectorAll("svg[data-guilloche]").forEach(function (svg) {
    var draw = designs[svg.getAttribute("data-guilloche")];
    if (draw) draw(svg);
  });
})();
