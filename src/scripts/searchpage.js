document.addEventListener("DOMContentLoaded", () => {
  // Retrieve flight offers and user choices from localStorage
  const flightOffers = JSON.parse(localStorage.getItem("flightOffers"));
  const userChoices = JSON.parse(localStorage.getItem("userChoices"));

  // Get the container where flight offers will be displayed
  const flightResultsContainer = document.querySelector(".result-area");
  const priceBar = document.querySelector(".price-bar"); // Price bar section

  // Update the search options with user choices
  document.querySelector('.search-input[placeholder="From"]').value =
    userChoices.origin;
  document.querySelector('.search-input[placeholder="To"]').value =
    userChoices.destination;
  document.querySelectorAll(".search-date")[0].value =
    userChoices.departureDate;
  document.querySelectorAll(".search-date")[1].value =
    userChoices.returnDate || "";
  document.getElementById("adult-count").textContent = userChoices.adults;
  document.getElementById("child-count").textContent = userChoices.children;

  // Check if there are any saved flight offers
  if (!flightOffers || !flightOffers.data || flightOffers.data.length === 0) {
    flightResultsContainer.innerHTML = "<p>No flight offers found.</p>";
    return;
  }

  // Find the cheapest and most expensive flight prices
  const prices = flightOffers.data.map((offer) =>
    Number.parseFloat(offer.price.total),
  );
  const cheapestPrice = Math.min(...prices);
  const mostExpensivePrice = Math.max(...prices);

  // Find the fastest flight (shortest duration)
  const fastestFlight = flightOffers.data.reduce((fastest, current) => {
    const fastestDuration = parseDuration(fastest.itineraries[0].duration);
    const currentDuration = parseDuration(current.itineraries[0].duration);
    return currentDuration < fastestDuration ? current : fastest;
  });

  const fastestPrice = Number.parseFloat(fastestFlight.price.total);

  // Determine the background color for the fastest flight price
  let fastestPriceBackgroundColor = "";
  if (fastestPrice <= cheapestPrice * 1.15) {
    fastestPriceBackgroundColor = "#00cc66"; // Green: <= 25% higher
  } else if (fastestPrice <= cheapestPrice * 1.6) {
    fastestPriceBackgroundColor = "#ffcc00"; // Yellow: > 25% to <= 60% higher
  } else {
    fastestPriceBackgroundColor = "#ff4444"; // Red: > 60% higher
  }

  // Update the price bar with the cheapest, fastest, and most expensive prices
  const priceRangeContainer = priceBar.querySelector(".price-range-inline");
  priceRangeContainer.innerHTML = `
          <div style="color: #00cc66; font-weight: bold;">C$${cheapestPrice.toFixed(2)}</div>
          <div> - </div>
          <div style="color: #ff444; font-weight: bold;">C$${mostExpensivePrice.toFixed(2)}</div>
      `;

  priceBar.querySelector(".best-price .green").textContent =
    `C$${cheapestPrice.toFixed(2)}`;
  const fastestPriceElement = priceBar.querySelector(".best-price .yellow");
  fastestPriceElement.textContent = `C$${fastestPrice.toFixed(2)}`;
  fastestPriceElement.style.backgroundColor = fastestPriceBackgroundColor; // Set background color
  fastestPriceElement.style.color = "#ffffff"; // Set text color to white
  fastestPriceElement.style.padding = "5px 10px"; // Optional: Add padding for better appearance
  fastestPriceElement.style.borderRadius = "5px"; // Optional: Add rounded corners

  // Render flight offers
  flightResultsContainer.innerHTML = ""; // Clear any existing content
  flightOffers.data.forEach((offer) => {
    const flightCard = document.createElement("div");
    flightCard.classList.add("flight-card");

    // Extract outbound itinerary details
    const outboundItinerary = offer.itineraries[0]; // Outbound itinerary
    const outboundSegments = outboundItinerary.segments;
    const outboundDeparture = outboundSegments[0].departure;
    const outboundArrival =
      outboundSegments[outboundSegments.length - 1].arrival;
    const outboundDuration = outboundItinerary.duration
      .replace("PT", "")
      .toLowerCase();
    const outboundStops = outboundSegments.length - 1;
    const outboundFlightNumber = `${outboundSegments[0].carrierCode}${outboundSegments[0].number}`; // Outbound flight number

    // Extract return itinerary details (if available)
    const returnItinerary = offer.itineraries[1]; // Return itinerary (if available)
    let returnDetails = "";
    if (returnItinerary) {
      const returnSegments = returnItinerary.segments;
      const returnDeparture = returnSegments[0].departure;
      const returnArrival = returnSegments[returnSegments.length - 1].arrival;
      const returnDuration = returnItinerary.duration
        .replace("PT", "")
        .toLowerCase();
      const returnStops = returnSegments.length - 1;
      const returnFlightNumber = `${returnSegments[0].carrierCode}${returnSegments[0].number}`; // Return flight number

      returnDetails = `
          <div class="flight-info return-flight">
              <h4>${returnFlightNumber}</h4> <!-- Display return flight number -->
              <div class="flight-time">
                  <strong>${formatDate(returnDeparture.at)}</strong><br />
                  <strong>${formatTime(returnDeparture.at)}</strong><br />${returnDeparture.iataCode}
              </div>
              <div class="flight-middle">
                  <span>Flight Hours: ${returnDuration}</span><br />
                  <span class="material-symbols-rounded">arrow_forward</span><br />
                  ${returnStops === 0 ? "Non-stop" : `${returnStops} Stop${returnStops > 1 ? "s" : ""}`}
              </div>
              <div class="flight-time">
                  <strong>${formatDate(returnArrival.at)}</strong><br />
                  <strong>${formatTime(returnArrival.at)}</strong><br />${returnArrival.iataCode}
              </div>
          </div>
        `;
    }

    // Extract price and airline details
    const price = Number.parseFloat(offer.price.total);
    // Reuse the existing currency variable
    const airlineCode = outboundSegments[0].carrierCode;
    const airlineName =
      flightOffers.dictionaries.carriers[airlineCode] || airlineCode;

    // Determine price color based on comparison with the cheapest price
    let priceColor = "";
    if (price <= cheapestPrice * 1.2) {
      priceColor = "#00cc66"; // Green: <= 20% higher
    } else if (price <= cheapestPrice * 1.6) {
      priceColor = "#ffcc00"; // Yellow: > 25% to <= 60% higher
    } else {
      priceColor = "#ff4444"; // Red for other prices
    }

    // Extract user choices for passenger counts
    const userChoices = JSON.parse(localStorage.getItem("userChoices"));
    const adultCount = userChoices.adults || 1;
    const childCount = userChoices.children || 0;

    // Extract price details
    const totalPrice = Number.parseFloat(offer.price.total);
    const perPersonPrice = calculatePerPersonPrice(totalPrice, adultCount, childCount);
    const currency = offer.price.currency;

    // Render the flight card
    flightCard.innerHTML = `
        <div style="width: 100%">
            <!-- Outbound Flight -->
            <div class="flight-info outbound-flight">
                <h4>${outboundFlightNumber}</h4> <!-- Display outbound flight number -->
                <div class="flight-time">
                    <strong>${formatDate(outboundDeparture.at)}</strong><br />
                    <strong>${formatTime(outboundDeparture.at)}</strong><br />${outboundDeparture.iataCode}
                </div>
                <div class="flight-middle">
                    <span>Flight Hours: ${outboundDuration}</span><br />
                    <span class="material-symbols-rounded">arrow_forward</span><br />
                    ${outboundStops === 0 ? "Non-stop" : `${outboundStops} Stop${outboundStops > 1 ? "s" : ""}`}
                </div>
                <div class="flight-time">
                    <strong>${formatDate(outboundArrival.at)}</strong><br />
                    <strong>${formatTime(outboundArrival.at)}</strong><br />${outboundArrival.iataCode}
                </div>
            </div>
  
            <!-- Return Flight -->
            ${returnDetails} <!-- Include return details if available -->
        </div>
        <div class="flight-price">
          <div class="price-content">
              <div class="main-price" style="color: ${priceColor};">${currency} ${totalPrice.toFixed(2)}<br>
              <span style="font-size: 14px; color: #666;">
                ${currency} ${perPersonPrice.toFixed(2)} per person
              </span></div>
              <div class="price-actions">
                  <button class="details-button">
                      <a href="detailpage.html">
                      <i class="fa-solid fa-circle-info"></i>
                      Details
                      </a>
                  </button>
                  <button class="favorite-button active">
                      <i class="fa-solid fa-heart"></i>
                      <span style = "color: black; font-size: 16px;">Save Flight</span>
                  </button>
              </div>
          </div>
      </div>
  `;

    flightResultsContainer.appendChild(flightCard);
  });

  // Store flight detail for flight offer if the user asks for detail
  // Add click event listeners to all Details buttons
  document.querySelectorAll(".details-button").forEach((button, index) => {
    button.addEventListener("click", () => {
      // Extract the selected flight offer
      const selectedFlight = flightOffers.data[index];
      const segments = selectedFlight.itineraries[0].segments;

      // Extract stop information
      const stops = segments.slice(1, -1).map((segment) => ({
        airport: segment.departure.iataCode,
        arrivalTime: segment.arrival.at,
        departureTime: segment.departure.at,
      }));

      // Add stop information to the selected flight object
      const flightWithStops = {
        ...selectedFlight,
        stops,
      };

      // Save the selected flight with stops to localStorage
      localStorage.setItem("selectedFlight", JSON.stringify(flightWithStops));

      // Navigate to the detail page
      window.location.href = "detailpage.html";
    });
  });

  // Retrieve saved flights from localStorage
  const savedFlights = JSON.parse(localStorage.getItem("savedFlights")) || [];

  // Add click event listeners to all favorite buttons
  document.querySelectorAll(".favorite-button").forEach((button, index) => {
    const flightOffer = flightOffers.data[index];

    // Check if the flight is already saved
    if (savedFlights.some((flight) => flight.id === flightOffer.id)) {
      button.classList.add("liked"); // Mark as liked
    }

    button.addEventListener("click", () => {
      const isLiked = button.classList.toggle("liked");

      if (isLiked) {
        // Add flight to saved flights
        savedFlights.push(flightOffer);
      } else {
        // Remove flight from saved flights
        const flightIndex = savedFlights.findIndex(
          (flight) => flight.id === flightOffer.id,
        );
        if (flightIndex !== -1) {
          savedFlights.splice(flightIndex, 1);
        }
      }

      // Update localStorage
      localStorage.setItem("savedFlights", JSON.stringify(savedFlights));
    });
  });
});

// Helper function to parse ISO 8601 duration (e.g., "PT14H25M")
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const hours = Number.parseInt(match[1] || "0", 10);
  const minutes = Number.parseInt(match[2] || "0", 10);
  return hours * 60 + minutes; // Return total duration in minutes
}

// Helper function to format time
function formatTime(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper function to format date
function formatDate(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper function to calculate flight duration
function calculateFlightDuration(departure, arrival) {
  const departureTime = new Date(departure);
  const arrivalTime = new Date(arrival);
  const duration = new Date(arrivalTime - departureTime);
  const hours = duration.getUTCHours();
  const minutes = duration.getUTCMinutes();
  return `${hours}h ${minutes}m`;
}

// Add a function to calculate per-person prices
function calculatePerPersonPrice(totalPrice, adults, children) {
  const totalPassengers = adults + children;
  return totalPrice / totalPassengers;
}
