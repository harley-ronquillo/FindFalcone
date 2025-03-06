import { handleVehicleSelection } from "./process.js";
import { PLANETS_API_URL, VEHICLES_API_URL } from "./url.js";

export let planetsData = []; // To store planets data
export let vehiclesData = []; // To store vehicles data

// Fetch planets data from the API
export async function getPlanets() {
    fetch(PLANETS_API_URL)
        .then(response => response.json())
        .then(planets => {
            planetsData = planets; // Store planets data
            populatePlanetsDropdown(); // Populate the dropdowns with planets
        })
        .catch(error => console.error("Error fetching planets:", error));
}

// Fetch vehicles data from the API
export async function getVehicles() {
    fetch(VEHICLES_API_URL)
        .then(response => response.json())
        .then(vehicles => {
            vehiclesData = vehicles; // Store vehicles data
        })
        .catch(error => console.error("Error fetching vehicles:", error));
}

// Populate the planet dropdowns with options
export async function populatePlanetsDropdown() {
    const planetDropdowns = document.querySelectorAll(".planet-dropdown");

    planetDropdowns.forEach(dropdown => {
        // Clear existing options (except the first "Select a planet" option)
        dropdown.innerHTML = '<option value="">Select a planet</option>';

        // Add planets as options
        planetsData.forEach(planet => {
            const option = document.createElement("option");
            option.value = planet.name; // Set the value to the planet's name
            option.textContent = planet.name; // Set the display text to the planet's name
            dropdown.appendChild(option); // Add the option to the dropdown
        });
    });
}

// Show available vehicles for the selected planet
export async function showVehicles(planetName, vehicleContainerId) {
    const vehicleContainer = document.getElementById(vehicleContainerId);
    vehicleContainer.innerHTML = ""; // Clear previous vehicles

    vehiclesData.forEach(vehicle => {
        if (vehicle.total_no > 0) {
            const label = document.createElement("label");
            label.textContent = `${vehicle.name} (${vehicle.total_no} available)`;
            
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `vehicle-${planetName}`;
            radio.value = vehicle.name;
            radio.id = `${planetName}-${vehicle.name}`;
            radio.disabled = vehicle.total_no === 0;

            // Attach event listener here
            radio.addEventListener("change", (event) => handleVehicleSelection(event, planetName));

            label.setAttribute("for", radio.id);

            vehicleContainer.appendChild(radio);
            vehicleContainer.appendChild(label);
            vehicleContainer.appendChild(document.createElement("br"));
        }
    });
}


// Add event listeners to planet dropdowns
export async function addPlanetEventListeners() {
    const planetDropdowns = document.querySelectorAll(".planet-dropdown");

    planetDropdowns.forEach(dropdown => {
        dropdown.addEventListener("change", (event) => {
            const selectedPlanet = event.target.value; // Get the selected planet
            const vehicleContainerId = `vehicle${dropdown.id.replace("planet", "")}`; // Get the corresponding vehicle container ID
            showVehicles(selectedPlanet, vehicleContainerId); // Show vehicles for the selected planet
        });
    });
}


