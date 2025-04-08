document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("flight-status-form");
  const resultsContainer = document.getElementById("flight-status-results");

  // Function to get the access token
  async function getAccessToken() {
    const response = await fetch("/.netlify/functions/getAccessToken");
    const data = await response.json();
    return data.access_token; // Return the token for further API calls
  }

  // Function to fetch flight status data
  const fetchFlightStatus = async (
    carrierCode,
    flightNumber,
    departureDate,
  ) => {
    const apiUrl = `https://test.api.amadeus.com/v2/schedule/flights?carrierCode=${carrierCode}&flightNumber=${flightNumber}&scheduledDepartureDate=${departureDate}`;
    const accessToken = await getAccessToken();

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flight status");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching flight status:", error);
      return [];
    }
  };

  // Function to display flight status results
  const displayResults = (flights) => {
    resultsContainer.innerHTML = ""; // Clear previous results

    if (flights.length === 0) {
      resultsContainer.innerHTML = "<p>No flight status found.</p>";
      return;
    }

    flights.forEach((flight) => {
      const flightItem = document.createElement("div");
      flightItem.classList.add("result-item");

      const departure = flight.flightPoints[0];
      const arrival = flight.flightPoints[1];
      const duration = flight.legs[0].scheduledLegDuration
        .replace("PT", "")
        .toLowerCase();

      // Determine flight status
      let flightStatus = "On Time";
      let statusColor = "green"; // Default to green for "On Time"

      if (
        departure.departure.timings[0].delays &&
        departure.departure.timings[0].delays.length > 0
      ) {
        flightStatus = "Delayed";
        statusColor = "yellow";
      }

      if (flight.flightStatus && flight.flightStatus === "CANCELLED") {
        flightStatus = "Cancelled";
        statusColor = "red";
      }

      flightItem.innerHTML = `
                <h3>Flight ${flight.flightDesignator.carrierCode} ${flight.flightDesignator.flightNumber}</h3>
                <p><strong>Departure:</strong> ${departure.iataCode} at ${new Date(departure.departure.timings[0].value).toLocaleTimeString()}</p>
                <p><strong>Arrival:</strong> ${arrival.iataCode} at ${new Date(arrival.arrival.timings[0].value).toLocaleTimeString()}</p>
                <p><strong>Duration:</strong> ${duration}</p>
                <p><strong>Aircraft:</strong> ${flight.legs[0].aircraftEquipment.aircraftType}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${flightStatus}</span></p>
            `;

      resultsContainer.appendChild(flightItem);
    });
  };

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const carrierCode = document.getElementById("carrier-code").value.trim();
    const flightNumber = document.getElementById("flight-number").value.trim();
    const departureDate = document.getElementById("departure-date").value;

    if (!carrierCode || !flightNumber || !departureDate) {
      alert("Please fill in all fields.");
      return;
    }

    resultsContainer.innerHTML = "<p>Loading...</p>";

    const flights = await fetchFlightStatus(
      carrierCode,
      flightNumber,
      departureDate,
    );
    displayResults(flights);
  });
});
