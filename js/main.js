/**
 * ElevateLabs Creatives
 * Renders the page from window.SITE (config.js).
 * DOM APIs and textContent only (no innerHTML).
 * Animation is handled separately by motion.js and scene.js.
 */
(function () {
  "use strict";

  var S = window.SITE;

  if (!S) {
    console.error("config.js failed to load: window.SITE is missing.");
    return;
  }

  // ---------- Helpers ----------
  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, props, kids) {
    var node = document.createElement(tag);

    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") {
        node.textContent = props[k];
      } else if (k === "class") {
        node.className = props[k];
      } else {
        node.setAttribute(k, props[k]);
      }
    });

    (kids || []).forEach(function (c) {
      if (c) node.appendChild(c);
    });

    return node;
  }

  function setText(id, value) {
    var n = $(id);
    if (n) n.textContent = value || "";
  }

  function fill(id, nodes) {
    var parent = $(id);
    if (!parent) return;

    parent.textContent = "";

    nodes.forEach(function (n) {
      parent.appendChild(n);
    });
  }

  // Image, short video file, or gradient placeholder.
  function media(src, label) {
    if (!src) {
      return el("div", {
        class: "placeholder",
        text: label
      });
    }

    if (/\.(mp4|webm)$/i.test(src)) {
      var v = el("video", {
        src: src,
        loop: "",
        playsinline: ""
      });

      v.muted = true;
      v.autoplay = true;

      return v;
    }

    return el("img", {
      src: src,
      alt: label,
      loading: "lazy"
    });
  }

  function validId(id) {
    return /^[A-Za-z0-9_-]{11}$/.test(id || "");
  }

  // ---------- Logo ----------
  function logoInto(node) {
    if (!node) return;

    // Preserve the animated text logo in the preloader.
    if (node.id === "loader-logo") {
      node.textContent = S.logoMain;
      node.appendChild(
        el("b", {
          text: S.logoAccent
        })
      );
      return;
    }

    // Display the image logo in the header and footer.
    node.textContent = "";

    var img = el("img", {
      src: "./assets/ElevatelabsLogo.png",
      alt: "ElevateLabs Creatives",
      class: "site-logo-img"
    });

    node.appendChild(img);
  }

  // ---------- Header ----------
  function renderHeader() {
    document.title = S.name + " | Esports Media Production";

    logoInto($("logo"));
    logoInto($("loader-logo"));

    setText("header-cta", S.headerCta);

    fill(
      "nav",
      S.nav.map(function (l) {
        return el("a", {
          href: l.href,
          text: l.label
        });
      })
    );

    var btn = $("menu-btn");
    var nav = $("nav");

    if (btn && nav) {
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");

        btn.setAttribute("aria-expanded", String(open));
      });

      nav.addEventListener("click", function () {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    }
  }

  // ---------- Hero + ticker ----------
  function renderHero() {
    var h = S.hero;

    setText("hero-badge", h.badge);
    setText("hero-l1", h.titleLine1);
    setText("hero-l2", h.titleLine2);
    setText("hero-text", h.text);
    setText("hero-meta", h.meta);

    fill(
      "hero-buttons",
      h.buttons.map(function (b) {
        return el("a", {
          class: "btn" +
            (b.style === "ghost" ? " btn-ghost" : ""),
          href: b.href,
          text: b.label
        });
      })
    );

    // Duplicate ticker items for seamless scrolling.
    var items = S.ticker.concat(S.ticker);

    fill(
      "ticker",
      items.map(function (t) {
        return el("span", {
          text: t
        });
      })
    );
  }

  // ---------- 01 Services ----------
  function renderServices() {
    var c = S.capabilities;

    setText("cap-label", c.label);
    setText("cap-title", c.title);
    setText("cap-lead", c.lead);

    fill(
      "cap-rows",
      c.items.map(function (item, i) {
        var num = el("div", {
          class: "row-num",
          text: ("0" + (i + 1)).slice(-2)
        });

        var text = el("div", {}, [
          el("p", {
            class: "row-tag",
            text: item.tag
          }),
          el("h3", {
            text: item.title
          }),
          el("p", {
            text: item.text
          })
        ]);

        var m = el("div", {
          class: "media"
        }, [
          media(item.media, item.title)
        ]);

        return el("article", {
          class: "row cut reveal-item"
        }, [
          num,
          text,
          m
        ]);
      })
    );
  }

  // ---------- 02 Packages ----------
  function renderPackages() {
    var p = S.packages;

    setText("pkg-label", p.label);
    setText("pkg-title", p.title);
    setText("pkg-lead", p.lead);
    setText("pkg-note", p.note);

    fill(
      "pkg-grid",
      p.items.map(function (item) {
        var kids = [];

        if (item.featured) {
          kids.push(
            el("span", {
              class: "flag",
              text: p.featuredLabel
            })
          );
        }

        kids.push(
          el("p", {
            class: "pkg-tag",
            text: item.tag
          }),
          el("h3", {
            text: item.name
          }),
          el("div", {
            class: "price"
          }, [
            el("strong", {
              text: item.price
            }),
            el("span", {
              text: item.period
            })
          ]),
          el("p", {
            class: "pkg-desc",
            text: item.text
          }),
          el("ul", {
            class: "feats"
          }, item.features.map(function (f) {
            return el("li", {
              text: f
            });
          })),
          el("a", {
            class: "btn" +
              (item.featured ? "" : " btn-ghost"),
            href: "#contact",
            "data-package": item.name,
            text: item.cta
          })
        );

        return el("article", {
          class: "pkg cut reveal-item" +
            (item.featured ? " featured" : "")
        }, kids);
      })
    );

    var c = p.custom;

    fill("pkg-custom", [
      el("div", {}, [
        el("h3", {
          text: c.title
        }),
        el("p", {
          text: c.text
        })
      ]),
      el("a", {
        class: "btn",
        href: "#contact",
        "data-package": c.name,
        text: c.cta
      })
    ]);
  }

  // ---------- 03 Work ----------
  function playVideo(box, id, title) {
    box.textContent = "";

    box.appendChild(
      el("iframe", {
        src:
          "https://www.youtube-nocookie.com/embed/" +
          id +
          "?autoplay=1&rel=0",
        title: title,
        allow:
          "autoplay; encrypted-media; picture-in-picture",
        allowfullscreen: ""
      })
    );
  }

  function renderWork() {
    var w = S.work;

    setText("work-label", w.label);
    setText("work-title", w.title);

    fill(
      "work-track",
      w.items.map(function (item) {
        var box = el("div", {
          class: "media"
        });

        if (validId(item.youtubeId)) {
          box.appendChild(
            el("img", {
              src:
                "https://i.ytimg.com/vi/" +
                item.youtubeId +
                "/hqdefault.jpg",
              alt: item.title,
              loading: "lazy"
            })
          );

          var play = el("button", {
            class: "play",
            type: "button",
            "aria-label": "Play " + item.title,
            "data-cursor-label": "PLAY",
            text: "▶"
          });

          play.addEventListener("click", function () {
            playVideo(box, item.youtubeId, item.title);
          });

          box.appendChild(play);
        } else {
          box.appendChild(media(item.image, item.title));
        }

        var meta = el("div", {
          class: "video-meta"
        }, [
          el("small", {
            text: item.tag
          }),
          el("h3", {
            text: item.title
          })
        ]);

        return el("article", {
          class: "hcard cut"
        }, [
          box,
          meta
        ]);
      })
    );
  }

  // ---------- 04 Process ----------
  function renderProcess() {
    var p = S.process;

    setText("process-label", p.label);
    setText("process-title", p.title);

    fill(
      "process-steps",
      p.steps.map(function (s, i) {
        return el("li", {
          class: "step cut reveal-item"
        }, [
          el("span", {
            class: "step-n",
            text: ("0" + (i + 1)).slice(-2)
          }),
          el("h3", {
            text: s.title
          }),
          el("p", {
            text: s.text
          })
        ]);
      })
    );
  }

  // ---------- Contact ----------
  function setupContact() {
    var c = S.cta;

    setText("cta-pill", c.pill);
    setText("cta-title", c.title);
    setText("cta-text", c.text);
    setText("form-submit", c.button);

    // Package dropdown: every package + custom.
    var select = $("package");

    var names = S.packages.items
      .map(function (i) {
        return i.name;
      })
      .concat([S.packages.custom.name]);

    fill(
      "package",
      names.map(function (n) {
        return el("option", {
          value: n,
          text: n
        });
      })
    );

    // Package buttons preselect the dropdown.
    document.addEventListener("click", function (e) {
      var target = e.target;

      if (!target || !target.closest) return;

      var btn = target.closest("[data-package]");

      if (btn && select) {
        select.value = btn.getAttribute("data-package");
      }
    });

    var form = $("contact-form");
    var status = $("form-status");

    if (!form || !status) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var d = new FormData(form);

      var name = String(d.get("name") || "").trim();
      var email = String(d.get("email") || "").trim();
      var pkg = String(d.get("package") || "").trim();
      var message = String(d.get("message") || "").trim();

      if (
        !name ||
        !message ||
        !/^\S+@\S+\.\S+$/.test(email)
      ) {
        status.textContent =
          "Please fill in every field with a valid email.";
        return;
      }

      var subject = encodeURIComponent(
        "New enquiry (" + pkg + ") from " + name
      );

      var body = encodeURIComponent(
        "Package: " + pkg +
        "\n\n" + message +
        "\n\nReply to: " + email
      );

      window.location.href =
        "mailto:" + S.email +
        "?subject=" + subject +
        "&body=" + body;

      status.textContent = "Opening your email app…";
    });
  }

  // ---------- Footer ----------
  function renderFooter() {
    var f = S.footer;

    var about = el("div", {
      class: "about"
    }, [
      (function () {
        var l = el("a", {
          class: "logo",
          href: "#top",
          "aria-label": "ElevateLabs Creatives home"
        });

        logoInto(l);

        return l;
      })(),

      el("p", {
        text: f.about
      }),

      el("a", {
        href: "mailto:" + S.email,
        text: S.email
      })
    ]);

    var cols = f.columns.map(function (col) {
      var list = el("ul", {}, col.links.map(function (l) {
        var props = {
          href: l.href,
          text: l.label
        };

        if (/^https?:/.test(l.href)) {
          props.target = "_blank";
          props.rel = "noopener noreferrer";
        }

        return el("li", {}, [
          el("a", props)
        ]);
      }));

      return el("div", {}, [
        el("h4", {
          text: col.title
        }),
        list
      ]);
    });

    var bottom = el("div", {
      class: "footer-bottom"
    }, [
      el("span", {
        text:
          "© " +
          new Date().getFullYear() +
          " " +
          S.name +
          (f.location ? " · " + f.location : "")
      }),
      el("span", {
        text: f.tagline
      })
    ]);

    fill("footer", [about].concat(cols, [bottom]));
  }

  // ---------- Boot ----------
  renderHeader();
  renderHero();
  renderServices();
  renderPackages();
  renderWork();
  renderProcess();
  setupContact();
  renderFooter();

})();