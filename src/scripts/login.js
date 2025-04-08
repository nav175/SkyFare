// Tab switching functionality
document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-button");
  const authForms = document.querySelectorAll(".auth-form");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons and forms
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      authForms.forEach((form) => form.classList.remove("active"));

      // Add active class to clicked button and corresponding form
      this.classList.add("active");
      const formToShow = document.querySelector(`.${this.dataset.tab}-form`);
      formToShow.classList.add("active");
    });
  });

  // Check if user is already logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    // Redirect to index.html if already logged in
    window.location.href = "index.html";
  }

  // Login form submission
  const loginButton = document.getElementById("login-button");
  loginButton.addEventListener("click", handleLogin);

  // Sign up form submission
  const signupButton = document.getElementById("signup-button");
  signupButton.addEventListener("click", handleSignup);
});

// Handle login form submission
function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorElement = document.getElementById("login-error");

  // Basic validation
  if (!email || !password) {
    errorElement.textContent = "Please enter both email and password";
    return;
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Find user with matching email
  const user = users.find((u) => u.email === email);

  // Check if user exists and password matches
  if (!user) {
    errorElement.textContent =
      "User not found. Please check your email or sign up";
    return;
  }

  if (user.password !== password) {
    errorElement.textContent = "Incorrect password. Please try again";
    return;
  }

  // Login successful
  // Store current user in localStorage (without password for security)
  const currentUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Redirect to index.html
  window.location.href = "index.html";
}

// Handle signup form submission
function handleSignup() {
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const phone = document.getElementById("signup-phone").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm").value; // Retrieve confirm password value
  const errorElement = document.getElementById("signup-error");

  // Basic validation
  if (!username || !email || !phone || !password || !confirmPassword) {
    errorElement.textContent = "Please fill in all fields";
    return;
  }

  if (password !== confirmPassword) {
    errorElement.textContent = "Passwords do not match";
    return;
  }

  // Get existing users from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if email already exists
  if (users.some((user) => user.email === email)) {
    errorElement.textContent =
      "Email already in use. Please use a different email or login";
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(), // Simple unique ID
    username,
    email,
    phone,
    password, // In a real app, you would hash this password
  };

  // Add user to users array
  users.push(newUser);

  // Save updated users array to localStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Store current user in localStorage (without password for security)
  const currentUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    phone: newUser.phone,
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Create empty saved flights array for this user
  const savedFlights = [];
  localStorage.setItem(
    `savedFlights_${newUser.id}`,
    JSON.stringify(savedFlights),
  );

  // Redirect to index.html
  window.location.href = "index.html";
}
