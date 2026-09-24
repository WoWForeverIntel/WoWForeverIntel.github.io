(function () {
  var path = (window.location.pathname || "").split("/").pop() || "index.html";
  if (!path || path === "") path = "index.html";

  document.querySelectorAll(".nav-links a[data-nav]").forEach(function (link) {
    var target = link.getAttribute("data-nav");
    if (target === path) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();
