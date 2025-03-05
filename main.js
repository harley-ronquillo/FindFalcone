const PLANETS_API_URL = "https://findfalcone.geektrust.com/planets";
const VEHICLES_API_URL = "https://findfalcone.geektrust.com/vehicles";

let planetsData = []; // To store planets data
let vehiclesData = []; // To store vehicles data

// Fetch planets data
function getPlanets() {
    fetch(PLANETS_API_URL)
        .then(res => res.json())
        .then(planets => {
            planetsData = planets; // Store planets data
            populatePlanetsDropdown(); // Call function to populate dropdown
        })
        .catch(err => console.error("Error fetching planets:", err));
}

// Fetch vehicles data
function getVehicles() {
    fetch(VEHICLES_API_URL)
        .then(res => res.json())
        .then(vehicles => {
            vehiclesData = vehicles; // Store vehicles data
        })
        .catch(err => console.error("Error fetching vehicles:", err));
}

// Populate planet dropdowns
function populatePlanetsDropdown() {
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
function showVehicles(planetName, vehicleContainer) {
    // Find the selected planet's data
    const selectedPlanet = planetsData.find(planet => planet.name === planetName);
    if (!selectedPlanet) return;

    // Filter vehicles that can reach the selected planet
    const availableVehicles = vehiclesData.filter(vehicle => vehicle.max_distance >= selectedPlanet.distance);

    // Clear previous vehicle options
    vehicleContainer.innerHTML = "";

    // Display vehicles as radio buttons
    availableVehicles.forEach(vehicle => {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `vehicle-${vehicleContainer.id}`; // Unique name for each planet's vehicle group
        radio.value = vehicle.name;
        radio.id = `${vehicleContainer.id}-${vehicle.name}`;

        const label = document.createElement("label");
        label.htmlFor = `${vehicleContainer.id}-${vehicle.name}`;
        label.textContent = `${vehicle.name} (${vehicle.total_no} available)`;

        vehicleContainer.appendChild(radio);
        vehicleContainer.appendChild(label);
        vehicleContainer.appendChild(document.createElement("br"));
    });
}

// Add event listeners to planet dropdowns
function addPlanetEventListeners() {
    const planetDropdowns = document.querySelectorAll(".planet-dropdown");

    planetDropdowns.forEach(dropdown => {
        dropdown.addEventListener("change", (event) => {
            const selectedPlanet = event.target.value; // Get the selected planet
            const vehicleContainer = document.getElementById(`vehicle${dropdown.id.slice(-1)}`); // Find the corresponding vehicle container
            showVehicles(selectedPlanet, vehicleContainer); // Show vehicles for the selected planet
        });
    });
}

const TOKEN_API_URL = "https://findfalcone.geektrust.com/token";
const FIND_API_URL = "https://findfalcone.geektrust.com/find";


// Function to get a token
async function getToken() {
    try {
        const response = await fetch(TOKEN_API_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
        });
        const data = await response.json();
        return data.token; // Return the token
    } catch (error) {
        console.error("Error fetching token:", error);
        return null;
    }
}

// Function to calculate total time
function calculateTotalTime(selectedPlanets, selectedVehicles) {
    let totalTime = 0;
    selectedPlanets.forEach((planetName, index) => {
        const planet = planetsData.find(p => p.name === planetName);
        const vehicle = vehiclesData.find(v => v.name === selectedVehicles[index]);
        if (planet && vehicle) {
            totalTime += planet.distance / vehicle.speed; // Time = Distance / Speed
        }
    });
    return totalTime;
}

// Function to find Falcone
async function findFalcone() {
    // Get selected planets and vehicles
    const selectedPlanets = [];
    const selectedVehicles = [];
    const planetDropdowns = document.querySelectorAll(".planet-dropdown");
    const vehicleContainers = document.querySelectorAll(".vehicles");

    planetDropdowns.forEach((dropdown, index) => {
        const selectedPlanet = dropdown.value;
        if (selectedPlanet) {
            selectedPlanets.push(selectedPlanet);
            const selectedVehicle = vehicleContainers[index].querySelector("input[type='radio']:checked");
            if (selectedVehicle) {
                selectedVehicles.push(selectedVehicle.value);
            }
        }
    });

    // Calculate total time
    const totalTime = calculateTotalTime(selectedPlanets, selectedVehicles);
    document.getElementById("time").textContent = totalTime;

    // Get token
    const token = await getToken();
    if (!token) {
        document.getElementById("result").textContent = "Error: Failed to get token.";
        return;
    }

    // Send request to /find API
    try {
        const response = await fetch(FIND_API_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                planet_names: selectedPlanets,
                vehicle_names: selectedVehicles,
            }),
        });
        const result = await response.json();

        // Display result
        if (result.status === "success") {
            document.getElementById("result").textContent = `Success! Falcone found on planet ${result.planet_name}.`;
        } else {
            document.getElementById("result").textContent = `Failed. Status: ${result.status}`;
        }
    } catch (error) {
        console.error("Error finding Falcone:", error);
        document.getElementById("result").textContent = "Error: Failed to find Falcone.";
    }
}

// Add event listener to the button
document.getElementById("findFalcone").addEventListener("click", findFalcone);


// Initialize the app
function initializeApp() {
    getPlanets(); // Fetch planets
    getVehicles(); // Fetch vehicles
    addPlanetEventListeners(); // Add event listeners to dropdowns
}

// Start the app
initializeApp();