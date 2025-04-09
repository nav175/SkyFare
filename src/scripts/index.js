// Function to swap the From and To locations
function swapLocations() {
  const fromInput = document.getElementById("from");
  const toInput = document.getElementById("to");
  const temp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = temp;
}

// Function to increment passenger count
function incrementCount(id) {
  const countElement = document.getElementById(id);
  let count = parseInt(countElement.textContent);
  countElement.textContent = count + 1;
}

// Function to decrement passenger count
function decrementCount(id) {
  const countElement = document.getElementById(id);
  let count = parseInt(countElement.textContent);

  if (id === "adult-count") {
    const childrenCount = parseInt(
      document.getElementById("children-count").textContent
    );

    // Prevent adults from going below 1 if children count is 0
    if (childrenCount === 0 && count <= 1) {
      return; // Do nothing if the condition is met
    }
  }

  if (count > 0) {
    countElement.textContent = count - 1;
  }
}

// Navigate to saved flights page when user profile is clicked
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    // Redirect to login page if not logged in
    window.location.href = "login.html";
  } else {
    // Update username in the header
    const usernameElement = document.querySelector(".username");
    if (usernameElement) {
      usernameElement.textContent = currentUser.username;
    }
  }

  // Add click event to user profile
  const userProfile = document.querySelector(".user-profile");
  if (userProfile) {
    userProfile.addEventListener("click", function () {
      window.location.href = "saved-flights.html";
    });
  }

  // Handle trip type selection
  const tripTypeSelect = document.getElementById("trip-type");
  const returnDateInput = document.getElementById("return");

  // Add event listener to trip type dropdown
  tripTypeSelect.addEventListener("change", function () {
    if (tripTypeSelect.value === "one-way") {
      // Clear and disable the return date input for one-way trips
      returnDateInput.value = ""; // Clear the return date
      returnDateInput.setAttribute("disabled", "true"); // Disable the input
    } else {
      // Enable the return date input for round trips
      returnDateInput.removeAttribute("disabled");
    }
  });

  // Handle flight search
  const searchButton = document.querySelector(".search-button"); // Search button in the form
  const loadingIndicator = document.getElementById("loading-indicator"); // Loading indicator element

  if (searchButton) {
    searchButton.addEventListener("click", async function (e) {
      e.preventDefault(); // Prevent form submission

      // Collect user inputs from the form
      const origin = document.getElementById("from").value.trim(); // Origin location
      const destination = document.getElementById("to").value.trim(); // Destination location
      const departureDate = document.getElementById("departure").value; // Departure date
      const returnDate = returnDateInput.value; // Return date (optional)
      const adults = parseInt(
        document.getElementById("adult-count").textContent,
        10,
      ); // Number of adults
      const children =
        parseInt(document.getElementById("children-count").textContent, 10) ||
        0; // Number of children
      const tripType = tripTypeSelect.value; // Trip type (One Way or Round Trip)

      // Validate inputs
      if (
        !validateInputs(
          origin,
          destination,
          departureDate,
          returnDate,
          adults,
          tripType,
        )
      ) {
        return; // Stop execution if validation fails
      }

      // Clear only previous search data, not the login info
      localStorage.removeItem("userChoices"); // Remove previous user choices
      localStorage.removeItem("flightOffers"); // Remove previous flight offers

      // Save user choices to localStorage
      const userChoices = {
        origin,
        destination,
        tripType, // Add trip type to user choices
        departureDate,
        returnDate,
        adults,
        children,
        travelClass: document.getElementById("class").value.toUpperCase(), // Travel class
      };
      localStorage.setItem("userChoices", JSON.stringify(userChoices));

      // Show the loading indicator
      loadingIndicator.classList.add("visible");
      try {
        // Get the access token
        const accessToken = await getAccessToken();

        // Construct the request body dynamically based on user inputs
        const requestBody = {
          currencyCode: "CAD", // Set currency to CAD
          originDestinations: [
            {
              id: "1",
              originLocationCode: origin,
              destinationLocationCode: destination,
              departureDateTimeRange: {
                date: departureDate,
              },
            },
          ],
          travelers: [
            { id: "1", travelerType: "ADULT" },
            ...Array(children)
              .fill()
              .map((_, index) => ({
                id: (index + 2).toString(),
                travelerType: "CHILD",
              })),
          ],
          sources: ["GDS"],
          searchCriteria: {
            maxFlightOffers: 50, // Increase the number of flight offers to display
            flightFilters: {
              cabinRestrictions: [
                {
                  cabin: userChoices.travelClass,
                  coverage: "MOST_SEGMENTS",
                  originDestinationIds: ["1"],
                },
              ],
            },
          },
        };

        // Add return date if provided
        if (returnDate) {
          requestBody.originDestinations.push({
            id: "2",
            originLocationCode: destination,
            destinationLocationCode: origin,
            departureDateTimeRange: {
              date: returnDate,
            },
          });
        }

        // Inside the search button click handler, update the traveler addition section:
        // Clear travelers array first
        requestBody.travelers = [];

        // Add adult travelers with correct IDs
        for (let i = 0; i < adults; i++) {
          requestBody.travelers.push({
            id: (i + 1).toString(),
            travelerType: "ADULT"
          });
        }

        // Add child travelers with sequential IDs after adults
        for (let i = 0; i < children; i++) {
          requestBody.travelers.push({
            id: (adults + i + 1).toString(),
            travelerType: "CHILD"
          });
        }

        // Make the API call
        const flightOffersUrl =
          "https://test.api.amadeus.com/v2/shopping/flight-offers";
        const response = await fetch(flightOffersUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.amadeus+json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch flight offers: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        // Save flight offers to localStorage
        localStorage.setItem("flightOffers", JSON.stringify(data));

        // Redirect to the search page
        window.location.href = "searchpage.html";
      } catch (error) {
        console.error("Error fetching flight offers:", error);
        alert("Failed to fetch flight offers. Please try again later.");
      } finally {
        // Hide the loading indicator
        loadingIndicator.classList.remove("visible");
      }
    });
  }

  addPassengerCountListeners();
});

// Function to validate inputs
function validateInputs(
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  children,
  tripType,
) {
  let isValid = true;

  // Clear previous error messages
  document
    .querySelectorAll(".error-message")
    .forEach((error) => (error.textContent = ""));

  // Validate "From" field
  if (!origin) {
    showError("from", "This field is required.");
    isValid = false;
  }

  // Validate "To" field
  if (!destination) {
    showError("to", "This field is required.");
    isValid = false;
  }

  // Validate "Departure Date" field
  if (!departureDate) {
    showError("departure", "This field is required.");
    isValid = false;
  }

  // Validate "Return Date" field if round trip is selected
  if (!returnDate) {
    showError("return", "Return date is required for round trips.");
  }
  // Validate "Adults" field
  if (adults + children < 1) {
    isValid = false;
  }
  return isValid;
}

// Function to show error message
function showError(inputId, message) {
  const inputElement = document.getElementById(inputId);
  const errorMessage =
    inputElement.nextElementSibling || document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.textContent = message;
  errorMessage.style.color = "red";
  errorMessage.style.fontSize = "12px";
  errorMessage.style.marginTop = "5px";
  inputElement.parentElement.appendChild(errorMessage);
}

// Function to get the access token
async function getAccessToken() {
  const response = await fetch("/.netlify/functions/getAccessToken");
  const data = await response.json();
  return data.access_token; // Return the token for further API calls
}

// Add event listeners to passenger count buttons to update prices dynamically
function addPassengerCountListeners() {
  const adultPlusBtn = document.querySelector('.increment[onclick="incrementCount(\'adult-count\')"]');
  const adultMinusBtn = document.querySelector('.decrement[onclick="decrementCount(\'adult-count\')"]');
  const childrenPlusBtn = document.querySelector('.increment[onclick="incrementCount(\'children-count\')"]');
  const childrenMinusBtn = document.querySelector('.decrement[onclick="decrementCount(\'children-count\')"]');
  
  // Add click event listeners to update localStorage when counts change
  [adultPlusBtn, adultMinusBtn, childrenPlusBtn, childrenMinusBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', updatePassengerCounts);
    }
  });
}

// Update passenger counts in localStorage for price calculations
function updatePassengerCounts() {
  // Get the current counts
  const adultCount = parseInt(document.getElementById("adult-count").textContent);
  const childrenCount = parseInt(document.getElementById("children-count").textContent);
  
  // If there's an existing userChoices object, update its passenger counts
  const userChoices = JSON.parse(localStorage.getItem("userChoices")) || {};
  
  // Update the counts
  userChoices.adults = adultCount;
  userChoices.children = childrenCount;
  
  // Save back to localStorage
  localStorage.setItem("userChoices", JSON.stringify(userChoices));
}
