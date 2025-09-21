document.addEventListener("DOMContentLoaded", function() {
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 100, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#4cafef" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.8, "random": true },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#4cafef", "opacity": 0.5, "width": 1 },
            "move": { "enable": true, "speed": 2, "direction": "none", "out_mode": "out" }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": { "enable": true, "mode": "grab" },
                "onclick": { "enable": true, "mode": "push" },
                "resize": true
            },
            "modes": {
                "grab": { "distance": 150, "line_linked": { "opacity": 0.6 } },
                "push": { "particles_nb": 4 }
            }
        },
        "retina_detect": true
    });
});
