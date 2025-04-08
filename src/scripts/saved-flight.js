document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    // Redirect to login page if not logged in
    window.location.href = "login.html";
    return;
  }

  // Update user profile information
  updateUserProfile(currentUser);

  // Load saved flights for this user
  loadSavedFlights(currentUser.id);

  // Retrieve saved flights from localStorage
  const savedFlights = JSON.parse(localStorage.getItem("savedFlights")) || [];

  // Get the container where saved flights will be displayed
  const flightsSection = document.querySelector(".flights-section");

  if (savedFlights.length === 0) {
    flightsSection.innerHTML =
      '<h2 class="section-title">Your Saved Flights</h2><p>No saved flights found.</p>';
    return;
  }

  // Render each saved flight
  savedFlights.forEach((flight) => {
    const flightCard = document.createElement("div");
    flightCard.classList.add("flight-card");

    // Extract outbound itinerary details
    const outboundItinerary = flight.itineraries[0];
    const outboundSegments = outboundItinerary.segments;
    const outboundDeparture = outboundSegments[0].departure;
    const outboundArrival =
      outboundSegments[outboundSegments.length - 1].arrival;
    const outboundDuration = outboundItinerary.duration
      .replace("PT", "")
      .toLowerCase();
    const outboundStops = outboundSegments.length - 1;
    const outboundFlightNumber = `${outboundSegments[0].carrierCode}${outboundSegments[0].number}`;

    // Extract return itinerary details (if available)
    const returnItinerary = flight.itineraries[1];
    let returnDetails = "";
    if (returnItinerary) {
      const returnSegments = returnItinerary.segments;
      const returnDeparture = returnSegments[0].departure;
      const returnArrival = returnSegments[returnSegments.length - 1].arrival;
      const returnDuration = returnItinerary.duration
        .replace("PT", "")
        .toLowerCase();
      const returnStops = returnSegments.length - 1;
      const returnFlightNumber = `${returnSegments[0].carrierCode}${returnSegments[0].number}`;

      returnDetails = `
                <div class="flight-leg return-flight">
                    <h4>${returnFlightNumber}</h4>
                    <div class="departure">
                        <div class="date">${new Date(returnDeparture.at).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}</div>
                        <div class="time">${new Date(returnDeparture.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                        <div class="city">${returnDeparture.iataCode}</div>
                    </div>
                    <div class="flight-path">
                        <div class="duration">Flight Hours: ${returnDuration}</div>
                        <div class="path-line"></div>
                        <div class="flight-type">${returnStops === 0 ? "Direct" : `${returnStops} Stop${returnStops > 1 ? "s" : ""}`}</div>
                    </div>
                    <div class="arrival">
                        <div class="date">${new Date(returnArrival.at).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}</div>
                        <div class="time">${new Date(returnArrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                        <div class="city">${returnArrival.iataCode}</div>
                    </div>
                </div>
            `;
    }

    // Render the flight card
    flightCard.innerHTML = `
            <div class="flight-details">
                <!-- Outbound Flight -->
                <div class="flight-leg outbound-flight">
                    <h4>${outboundFlightNumber}</h4>
                    <div class="departure">
                        <div class="date">${new Date(outboundDeparture.at).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}</div>
                        <div class="time">${new Date(outboundDeparture.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                        <div class="city">${outboundDeparture.iataCode}</div>
                    </div>
                    <div class="flight-path">
                        <div class="duration">Flight Hours: ${outboundDuration}</div>
                        <div class="path-line"></div>
                        <div class="flight-type">${outboundStops === 0 ? "Direct" : `${outboundStops} Stop${outboundStops > 1 ? "s" : ""}`}</div>
                    </div>
                    <div class="arrival">
                        <div class="date">${new Date(outboundArrival.at).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}</div>
                        <div class="time">${new Date(outboundArrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                        <div class="city">${outboundArrival.iataCode}</div>
                    </div>
                </div>
                <!-- Return Flight -->
                ${returnDetails}
                <!-- Flight Actions -->
                <div class="flight-actions">
                    <button class="details-button" data-id="${flight.id}">
                        <i class="fa-solid fa-circle-info"></i>
                        Details
                    </button>
                    <button class="favorite-button liked" data-id="${flight.id}">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="flight-price">
                <div class="price-tag">
                    <div class="price-value">C$${flight.price.total}</div>
                </div>
            </div>
        `;

    flightsSection.appendChild(flightCard);
  });

  // Add event listeners to all "Details" buttons
  document.querySelectorAll(".details-button").forEach((button) => {
    button.addEventListener("click", function () {
      const flightId = button.getAttribute("data-id");
      const selectedFlight = savedFlights.find(
        (flight) => flight.id === flightId,
      );

      if (selectedFlight) {
        // Save the selected flight to localStorage
        localStorage.setItem("selectedFlight", JSON.stringify(selectedFlight));

        // Redirect to the detail page
        window.location.href = "detailpage.html";
      }
    });
  });

  // Add event listeners to all favorite buttons
  document.querySelectorAll(".favorite-button").forEach((button) => {
    button.addEventListener("click", function () {
      const flightId = button.getAttribute("data-id");

      // Remove flight from saved flights
      const updatedFlights = savedFlights.filter(
        (flight) => flight.id !== flightId,
      );

      // Update localStorage
      localStorage.setItem("savedFlights", JSON.stringify(updatedFlights));

      // Reload the page to reflect changes
      window.location.reload();
    });
  });

  // Logout button functionality
  const logoutButton = document.getElementById("logout-button");
  const logoutModal = document.getElementById("logout-modal");
  const confirmLogoutButton = document.getElementById("confirm-logout");
  const cancelLogoutButton = document.getElementById("cancel-logout");
  const mainContentOverlay = document.getElementById("main-content-overlay");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      // Show the logout confirmation modal
      logoutModal.style.display = "flex";

      // Show the overlay on the main content
      mainContentOverlay.style.display = "block";
    });
  }

  // Confirm logout functionality
  if (confirmLogoutButton) {
    confirmLogoutButton.addEventListener("click", function () {
      handleLogout();
    });
  }

  // Cancel logout functionality
  if (cancelLogoutButton) {
    cancelLogoutButton.addEventListener("click", function () {
      // Hide the logout confirmation modal
      logoutModal.style.display = "none";

      // Hide the overlay on the main content
      mainContentOverlay.style.display = "none";
    });
  }
});

// Update user profile information
function updateUserProfile(user) {
  const usernameElement = document.getElementById("profile-username");
  const emailElement = document.getElementById("profile-email");
  const phoneElement = document.getElementById("profile-phone");

  if (usernameElement) usernameElement.textContent = user.username;
  if (emailElement) emailElement.textContent = user.email;
  if (phoneElement) phoneElement.textContent = user.phone || "N/A";
}

// Load saved flights for the current user
function loadSavedFlights(userId) {
  // Get saved flights from localStorage (or use empty array if none exist)
  const savedFlights =
    JSON.parse(localStorage.getItem(`savedFlights_${userId}`)) || [];

  // If there are no saved flights, you could display a message
  const flightsSection = document.querySelector(".flights-section");
  if (savedFlights.length === 0) {
    // Keep the existing flight cards as examples
    // In a real app, you might want to show a "No saved flights" message instead
  }
}

// Handle logout functionality
function handleLogout() {
  // Remove current user from localStorage
  localStorage.removeItem("currentUser");
  // Redirect to login page
  window.location.href = "login.html";
}
