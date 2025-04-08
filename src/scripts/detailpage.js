document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the selected flight data from localStorage
  const selectedFlight = JSON.parse(localStorage.getItem("selectedFlight"));
  const savedFlights = JSON.parse(localStorage.getItem("savedFlights")) || [];

  if (!selectedFlight) {
    // Redirect back to the search page if no flight data is found
    window.location.href = "searchpage.html";
    return;
  }

  // Check if this is a round trip (has more than one itinerary)
  const isRoundTrip = selectedFlight.itineraries.length > 1;

  // Extract outbound flight details
  const outboundSegments = selectedFlight.itineraries[0].segments;
  const outboundStops = outboundSegments.length - 1; // Calculate the number of stops
  const outboundCarrierCode = outboundSegments[0].carrierCode; // Extract carrier code
  const outboundFlightNumber = outboundSegments[0].number; // Extract flight number
  const outboundFlightCode = `${outboundCarrierCode}${outboundFlightNumber}`; // Combine airline code and flight number

  // Extract return flight details if it's a round trip
  let returnSegments, returnStops, returnFlightCode;
  if (isRoundTrip) {
    returnSegments = selectedFlight.itineraries[1].segments;
    returnStops = returnSegments.length - 1;
    const returnCarrierCode = returnSegments[0].carrierCode;
    const returnFlightNumber = returnSegments[0].number;
    returnFlightCode = `${returnCarrierCode}${returnFlightNumber}`;
  }

  // Populate the flight details in the header card
  const flightRouteElement = document.querySelector(".flight-route");
  const flightDateElement = document.querySelector(".flight-date");
  const timeNoteElement = document.querySelector(".time-note");

  if (isRoundTrip) {
    flightRouteElement.innerHTML = `
          <strong>${outboundSegments[0].departure.iataCode}</strong>
          <div class="route-line-arrow"></div>
          <strong>${outboundSegments.slice(-1)[0].arrival.iataCode}</strong>
          <div class="route-line-arrow"></div>
          <strong>${outboundSegments[0].departure.iataCode}</strong>
      `;
    flightDateElement.innerHTML = `
          Departure: ${new Date(outboundSegments[0].departure.at).toDateString()}<br>
          Return: ${new Date(returnSegments[0].departure.at).toDateString()}
      `;
  } else {
    flightRouteElement.innerHTML = `
          <strong>${outboundSegments[0].departure.iataCode}</strong>
          <div class="route-line-arrow"></div>
          <strong>${outboundSegments.slice(-1)[0].arrival.iataCode}</strong>
      `;
    flightDateElement.textContent = new Date(
      outboundSegments[0].departure.at,
    ).toDateString();
  }
  timeNoteElement.textContent = "All times are local";

  // Populate the flight details in the main card
  const flightDetailsContainer = document.querySelector(".card:nth-child(2)");
  flightDetailsContainer.innerHTML = `
      <div class="flight-card">
          <div style="width: 100px; text-align: center;">
              <h3>${isRoundTrip ? "Departure" : "Flight Details"}</h3>
              <div style="font-weight: bold; font-size: 18px; margin-top: 10px;">${outboundFlightCode}</div>
          </div>
          <div style="display: flex; flex: 1; justify-content: space-between; align-items: center; margin: 0 20px;">
              <div style="text-align: center;">
                  <div style="font-weight: bold;">${new Date(outboundSegments[0].departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                  <div>${outboundSegments[0].departure.iataCode}</div>
                  <div>${new Date(outboundSegments[0].departure.at).toDateString().split(" ").slice(1, 3).join(" ")}</div>
              </div>
              <div style="text-align: center;">
                  <div>Flight Hours: ${selectedFlight.itineraries[0].duration.replace("PT", "").toLowerCase()}</div>
                  <div style="display: flex; align-items: center; margin: 5px 0;">
                      <hr style="width: 200px; height: 2px; background: black; border: none; position: relative;">
                      <div style="margin-left: -5px; width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid black;"></div>
                  </div>
                  <div>${outboundStops === 0 ? "Direct" : `${outboundStops} Stop${outboundStops > 1 ? "s" : ""}`}</div>
              </div>
              <div style="text-align: center;">
                  <div style="font-weight: bold;">${new Date(outboundSegments.slice(-1)[0].arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                  <div>${outboundSegments.slice(-1)[0].arrival.iataCode}</div>
                  <div>${new Date(outboundSegments.slice(-1)[0].arrival.at).toDateString().split(" ").slice(1, 3).join(" ")}</div>
              </div>
          </div>
      </div>
  `;

  // Add return flight card if it's a round trip
  if (isRoundTrip) {
    const returnFlightCard = document.createElement("div");
    returnFlightCard.className = "flight-card";
    returnFlightCard.style.marginTop = "20px";
    returnFlightCard.innerHTML = `
          <div style="width: 100px; text-align: center;">
              <h3>Return</h3>
              <div style="font-weight: bold; font-size: 18px; margin-top: 10px;">${returnFlightCode}</div>
          </div>
          <div style="display: flex; flex: 1; justify-content: space-between; align-items: center; margin: 0 20px;">
              <div style="text-align: center;">
                  <div style="font-weight: bold;">${new Date(returnSegments[0].departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                  <div>${returnSegments[0].departure.iataCode}</div>
                  <div>${new Date(returnSegments[0].departure.at).toDateString().split(" ").slice(1, 3).join(" ")}</div>
              </div>
              <div style="text-align: center;">
                  <div>Flight Hours: ${selectedFlight.itineraries[1].duration.replace("PT", "").toLowerCase()}</div>
                  <div style="display: flex; align-items: center; margin: 5px 0;">
                      <hr style="width: 200px; height: 2px; background: black; border: none; position: relative;">
                      <div style="margin-left: -5px; width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid black;"></div>
                  </div>
                  <div>${returnStops === 0 ? "Direct" : `${returnStops} Stop${returnStops > 1 ? "s" : ""}`}</div>
              </div>
              <div style="text-align: center;">
                  <div style="font-weight: bold;">${new Date(returnSegments.slice(-1)[0].arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                  <div>${returnSegments.slice(-1)[0].arrival.iataCode}</div>
                  <div>${new Date(returnSegments.slice(-1)[0].arrival.at).toDateString().split(" ").slice(1, 3).join(" ")}</div>
              </div>
          </div>
      `;
    flightDetailsContainer.appendChild(returnFlightCard);
  }

  // Populate the flight details in the side panel
  const sidePanelElement = document.querySelector(".side-panel");
  sidePanelElement.innerHTML = `
      <div class="price">C$${selectedFlight.price.total}</div>
      <button class="favorite-button">
          <i class="fa-solid fa-heart"></i>
          <div style="font-weight: bold; margin-top: 0%; padding: 9px;">Add to saved flights</div>
      </button>     
  `;

  // Handle the favorite button
  const favoriteButton = document.querySelector(".favorite-button");

  // Check if the flight is already saved
  if (savedFlights.some((flight) => flight.id === selectedFlight.id)) {
    favoriteButton.classList.add("liked"); // Mark as liked
    favoriteButton.querySelector("i").style.color = "red"; // Change heart color to red
  }

  favoriteButton.addEventListener("click", () => {
    const isLiked = favoriteButton.classList.toggle("liked");

    if (isLiked) {
      // Add flight to saved flights
      savedFlights.push(selectedFlight);
      favoriteButton.querySelector("i").style.color = "red"; // Change heart color to red
    } else {
      // Remove flight from saved flights
      const flightIndex = savedFlights.findIndex(
        (flight) => flight.id === selectedFlight.id,
      );
      if (flightIndex !== -1) {
        savedFlights.splice(flightIndex, 1);
      }
      favoriteButton.querySelector("i").style.color = ""; // Reset heart color
    }

    // Update localStorage
    localStorage.setItem("savedFlights", JSON.stringify(savedFlights));
  });

  // Populate the flight details in the itinerary section
  const itineraryCard = document.querySelector(".card:nth-child(3)");

  if (isRoundTrip) {
    itineraryCard.innerHTML = `
              <div class="flight-title">Flight Itinerary</div>
              
              <div style="display: flex; margin-top: 20px;">
                  <div style="flex: 1; padding-right: 20px;">
                      <h3>Departure</h3>
                      <div style="display: flex; margin-top: 20px;">
                          <div style="display: flex; flex-direction: column; align-items: center; margin-right: 20px;">
                              <div>${new Date(outboundSegments[0].departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                              <div style="width: 2px; height: 30px; background-color: black; margin: 5px 0; position: relative;">
                                  <div style="position: absolute; bottom: -8px; left: -4px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid black;"></div>
                              </div>
                              <div>${new Date(outboundSegments.slice(-1)[0].arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                          </div>
                          
                          <div style="flex: 1;">
                              <div>${outboundSegments[0].departure.iataCode} International Airport</div>
                              <div style="margin-top: 30px;">${outboundSegments.slice(-1)[0].arrival.iataCode} International Airport</div>
                          </div>
                          
                          <div style="width: 200px; text-align: right;">
                              <div>Arrives: <strong>Thu Apr 10 2025</strong></div>
                              <div>Flight hours: ${selectedFlight.itineraries[0].duration.replace("PT", "").toLowerCase()}</div>
                              <div>${outboundStops === 0 ? "Direct Flight" : `${outboundStops} Stop${outboundStops > 1 ? "s" : ""}`}</div>
                          </div>
                      </div>
                  </div>
                  
                  <div style="flex: 1; padding-left: 20px; border-left: 1px solid #eee;">
                      <h3>Return</h3>
                      <div style="display: flex; margin-top: 20px;">
                          <div style="display: flex; flex-direction: column; align-items: center; margin-right: 20px;">
                              <div>${new Date(returnSegments[0].departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                              <div style="width: 2px; height: 30px; background-color: black; margin: 5px 0; position: relative;">
                                  <div style="position: absolute; bottom: -8px; left: -4px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid black;"></div>
                              </div>
                              <div>${new Date(returnSegments.slice(-1)[0].arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                          </div>
                          
                          <div style="flex: 1;">
                              <div>${returnSegments[0].departure.iataCode} International Airport</div>
                              <div style="margin-top: 30px;">${returnSegments.slice(-1)[0].arrival.iataCode} International Airport</div>
                          </div>
                          
                          <div style="width: 200px; text-align: right;">
                              <div>Arrives: <strong>Fri Apr 18 2025</strong></div>
                              <div>Flight hours: ${selectedFlight.itineraries[1].duration.replace("PT", "").toLowerCase()}</div>
                              <div>${returnStops === 0 ? "Direct Flight" : `${returnStops} Stop${returnStops > 1 ? "s" : ""}`}</div>
                          </div>
                      </div>
                  </div>
              </div>
          `;
  } else {
    itineraryCard.innerHTML = `
              <div class="flight-title">${outboundFlightCode}</div>
              
              <div style="display: flex; margin-top: 20px;">
                  <div style="display: flex; flex-direction: column; align-items: center; margin-right: 20px;">
                      <div>${new Date(outboundSegments[0].departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                      <div style="width: 2px; height: 30px; background-color: black; margin: 5px 0; position: relative;">
                          <div style="position: absolute; bottom: -8px; left: -4px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid black;"></div>
                      </div>
                      <div>${new Date(outboundSegments.slice(-1)[0].arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                  </div>
                  
                  <div style="flex: 1;">
                      <div>${outboundSegments[0].departure.iataCode} International Airport</div>
                      <div style="margin-top: 30px;">${outboundSegments.slice(-1)[0].arrival.iataCode} International Airport</div>
                  </div>
                  
                  <div style="width: 200px; text-align: right;">
                      <div>Arrives: <strong>${new Date(outboundSegments.slice(-1)[0].arrival.at).toDateString()}</strong></div>
                      <div>Flight hours: ${selectedFlight.itineraries[0].duration.replace("PT", "").toLowerCase()}</div>
                      <div>${outboundStops === 0 ? "Direct Flight" : `${outboundStops} Stop${outboundStops > 1 ? "s" : ""}`}</div>
                  </div>
              </div>
          `;
  }

  // Add event listener for the back button
  document.querySelector(".back-button").addEventListener("click", () => {
    localStorage.removeItem("selectedFlight");
    window.location.href = "searchpage.html";
  });
});
