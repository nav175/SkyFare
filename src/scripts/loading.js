document.addEventListener("DOMContentLoaded", function () {
  const loadingIndicator = document.getElementById("loading-indicator");

  // Simulate a delay for demonstration purposes
  setTimeout(() => {
    loadingIndicator.classList.add("hidden"); // Hide the loading indicator
  }, 1500); // Adjust the delay as needed
});
