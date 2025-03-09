import { selectedVehicles } from "./process.js";
import { VEHICLES_API_URL, PLANETS_API_URL } from "./url.js";

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

async function handleVehicleSelection(event, planetName) {
    const selectedVehicleName = event.target.value;
    const previousVehicle = selectedVehicles[planetName];

    // Restore the previous vehicle's count if it was previously selected
    if (previousVehicle) {
        const prevVehicleObj = vehiclesData.find(v => v.name === previousVehicle);
        if (prevVehicleObj) prevVehicleObj.total_no++;
    }

    // Update the selected vehicle and decrement count
    selectedVehicles[planetName] = selectedVehicleName;
    const newVehicleObj = vehiclesData.find(v => v.name === selectedVehicleName);
    if (newVehicleObj) newVehicleObj.total_no--;

    // Refresh the UI to reflect changes
    updateVehicleUI();
}

function updateVehicleUI() {
    document.querySelectorAll(".vehicles").forEach(vehicleContainer => {
        const vehicleInputs = vehicleContainer.querySelectorAll("input[type='radio']");
        
        vehicleInputs.forEach(input => {
            const vehicleObj = vehiclesData.find(v => v.name === input.value);
            const label = vehicleContainer.querySelector(`label[for="${input.id}"]`);

            if (vehicleObj) {
                label.textContent = `${vehicleObj.name} (${vehicleObj.total_no} available)`;
                input.disabled = vehicleObj.total_no === 0; // Disable if no vehicles left
            }
        });
    });
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

export async function addPlanetEventListeners() {
    const planetDropdowns = document.querySelectorAll(".planet-dropdown");

    planetDropdowns.forEach(dropdown => {
        dropdown.addEventListener("change", (event) => {
            updatePlanetDropdowns(); // Ensure selected planets are disabled in other dropdowns
            const selectedPlanet = event.target.value;
            const vehicleContainerId = `vehicle${dropdown.id.replace("planet", "")}`;
            showVehicles(selectedPlanet, vehicleContainerId);
        });
    });
}

// Function to update dropdowns and disable already selected planets
function updatePlanetDropdowns() {
    const selectedPlanets = new Set(); // Store selected planets

    // Get selected planets
    document.querySelectorAll(".planet-dropdown").forEach(dropdown => {
        if (dropdown.value) {
            selectedPlanets.add(dropdown.value);
        }
    });

    // Disable selected planets in other dropdowns
    document.querySelectorAll(".planet-dropdown").forEach(dropdown => {
        const currentSelection = dropdown.value;
        dropdown.querySelectorAll("option").forEach(option => {
            if (option.value && option.value !== currentSelection) {
                option.disabled = selectedPlanets.has(option.value);
            }
        });
    });
}



