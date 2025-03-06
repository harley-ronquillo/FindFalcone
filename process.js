import { addPlanetEventListeners, getPlanets, getVehicles, planetsData, vehiclesData } from "./main.js";
import { FIND_API_URL, TOKEN_API_URL } from "./url.js";

let selectedVehicles = {}; // Track selected vehicles per planet

// Function to get a token
async function getToken() {
    try {
        const response = await fetch(TOKEN_API_URL, {
            method: "POST",
            headers: { "Accept": "application/json" },
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

export async function handleVehicleSelection(event, planetName) {
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


// Function to find Falcone
async function findFalcone() {
    const selectedPlanets = [];
    const selectedVehiclesList = [];
    const planetDropdowns = document.querySelectorAll(".planet-dropdown");
    
    planetDropdowns.forEach(dropdown => {
        const planetName = dropdown.value;
        if (planetName && selectedVehicles[planetName]) {
            selectedPlanets.push(planetName);
            selectedVehiclesList.push(selectedVehicles[planetName]);
        }
    });

    // Calculate total time
    const totalTime = calculateTotalTime(selectedPlanets, selectedVehiclesList);
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
                vehicle_names: selectedVehiclesList,
            }),
        });
        const result = await response.json();

        // Display result
        document.getElementById("result").textContent = result.status === "success"
            ? `Success! Falcone found on planet ${result.planet_name}.`
            : `Failed. Status: ${result.status}`;
    } catch (error) {
        console.error("Error finding Falcone:", error);
        document.getElementById("result").textContent = "Error: Failed to find Falcone.";
    }
}

// Add event listener to the button
document.getElementById("findFalcone").addEventListener("click", findFalcone);

// Initialize the app
function initializeApp() {
    getPlanets();
    getVehicles();
    addPlanetEventListeners();
}

// Start the app
initializeApp();
