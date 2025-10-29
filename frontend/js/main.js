// Wait until DOM is loaded
document.addEventListener("DOMContentLoaded", () => {

  // Customer Review Slider
  const testimonials = document.querySelectorAll(".testimonial-card");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");
  let index = 0;

  function showTestimonial(i) {
    testimonials.forEach((t, idx) => {
      t.classList.toggle("active", idx === i);
    });
  }

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % testimonials.length;
    showTestimonial(index);
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + testimonials.length) % testimonials.length;
    showTestimonial(index);
  });

  showTestimonial(index);

  // Example exercise cards (if you have exercise page later)
  const exercises = [
    { name: "Knee Flexion", img: "assets/gifs/knee-flexion.gif", difficulty: "Easy" },
    { name: "Shoulder Stretch", img: "assets/gifs/shoulder-stretch.gif", difficulty: "Medium" },
    { name: "Ankle Rotation", img: "assets/gifs/ankle-rotation.gif", difficulty: "Easy" },
  ];

  const exerciseGrid = document.getElementById("exerciseGrid");
  if (exerciseGrid) {
    exercises.forEach(ex => {
      const card = document.createElement("div");
      card.className = "exercise-card";
      card.innerHTML = `
        <img src="${ex.img}" alt="${ex.name}">
        <h3>${ex.name}</h3>
        <p>Difficulty: ${ex.difficulty}</p>
        <button>Add to Routine</button>
      `;
      exerciseGrid.appendChild(card);
    });
  }
  const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeIcon.classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    themeIcon.classList.replace('fa-moon', 'fa-sun');
    localStorage.setItem('theme', 'dark');
  } else {
    themeIcon.classList.replace('fa-sun', 'fa-moon');
    localStorage.setItem('theme', 'light');
  }
});

});
