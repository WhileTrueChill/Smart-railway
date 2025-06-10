const auth = firebase.auth();

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      document.getElementById("authMessage").innerText = "Signup successful! You can now login.";
    })
    .catch(error => {
      document.getElementById("authMessage").innerText = error.message;
    });
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      document.getElementById("authMessage").innerText = "";
      showApp(userCredential.user);
    })
    .catch(error => {
      document.getElementById("authMessage").innerText = error.message;
    });
}

function logout() {
  auth.signOut().then(() => {
    document.getElementById("appDiv").style.display = "none";
    document.getElementById("authDiv").style.display = "block";
  });
}

function showApp(user) {
  document.getElementById("authDiv").style.display = "none";
  document.getElementById("appDiv").style.display = "block";
  document.getElementById("userEmail").innerText = user.email;
}

// Automatically check if user is logged in or not
auth.onAuthStateChanged(user => {
  if (user) {
    showApp(user);
  } else {
    document.getElementById("appDiv").style.display = "none";
    document.getElementById("authDiv").style.display = "block";
  }
});

async function bookByClass() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to book a seat!");
    return;
  }
  const cls = document.getElementById("coachClass").value;
  const seat = document.getElementById("seatByClass").value;

  try {
    await db.collection("bookings").add({
      userId: user.uid,
      email: user.email,
      class: cls,
      seat: seat,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("bookedClassInfo").innerHTML = `
      <h3>🎫 Ticket Confirmed</h3>
      <p>Class: <b>${cls}</b></p>
      <p>Seat: <b>${seat}</b></p>
      <p style="color:green;">Booking saved successfully!</p>
    `;
  } catch (error) {
    document.getElementById("bookedClassInfo").innerHTML = `
      <p style="color:red;">Error saving booking: ${error.message}</p>
    `;
  }
}

function showApp(user) {
  document.getElementById("authDiv").style.display = "none";
  document.getElementById("appDiv").style.display = "block";
  document.getElementById("userEmail").innerText = user.email;
  loadUserBookings(user);  // <-- add this line
}


async function submitComplaint() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to submit complaint.");
    return;
  }
  const text = document.getElementById("complaintText").value.trim();
  if (!text) {
    alert("Please enter your complaint.");
    return;
  }

  try {
    await db.collection("complaints").add({
      userId: user.uid,
      email: user.email,
      complaint: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("complaintMsg").innerText = "Complaint submitted successfully!";
    document.getElementById("complaintText").value = "";
  } catch (error) {
    document.getElementById("complaintMsg").innerText = "Error submitting complaint: " + error.message;
  }
}
document.getElementById("complaintMsg").innerText = 
  "Complaint submitted! Suggestion: " + getSuggestion(text);
function getSuggestion(complaint) {
  complaint = complaint.toLowerCase();
  if (complaint.includes("delay")) {
    return "We are sorry for the delay. Please check live train status for updates.";
  } else if (complaint.includes("seat") || complaint.includes("booking")) {
    return "For seat-related issues, please check availability or try booking again.";
  } else if (complaint.includes("food")) {
    return "You can order food through our app's food section.";
  } else {
    return "Thank you for your feedback. We will get back to you soon.";
  }
}

const trainListSelect = document.getElementById("trainList");
const routeDisplay = document.getElementById("routeDisplay");
const classDisplay = document.getElementById("classDisplay");

// Populate trains in dropdown
function populateTrains() {
  trains.forEach(train => {
    const option = document.createElement("option");
    option.value = train.trainNumber;
    option.textContent = `${train.name} (${train.trainNumber})`;
    trainListSelect.appendChild(option);
  });
}

// Show route & classes on train selection
function updateRoute() {
  const selectedTrainNum = trainListSelect.value;
  const train = trains.find(t => t.trainNumber === selectedTrainNum);

  if (train) {
    routeDisplay.textContent = train.route.join(" → ");
    classDisplay.textContent = train.classes.join(", ");

    // You can also update class dropdown dynamically based on train.classes
    updateClassDropdown(train.classes);
  } else {
    routeDisplay.textContent = "";
    classDisplay.textContent = "";
  }
}

function updateClassDropdown(classes) {
  const coachClass = document.getElementById("coachClass");
  coachClass.innerHTML = ""; // Clear previous options
  classes.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    coachClass.appendChild(option);
  });
}

// Call populateTrains on page load
populateTrains();

function populateTrainBookingList() {
  const trainBookingSelect = document.getElementById("trainListForBooking");
  trainBookingSelect.innerHTML = `<option value="">Select Train</option>`;
  trains.forEach(train => {
    const option = document.createElement("option");
    option.value = train.trainNumber;
    option.textContent = `${train.name} (${train.trainNumber})`;
    trainBookingSelect.appendChild(option);
  });
}
populateTrainBookingList();

async function bookByClass() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to book a seat!");
    return;
  }

  const selectedTrainNum = document.getElementById("trainListForBooking").value;
  const train = trains.find(t => t.trainNumber === selectedTrainNum);
  if (!train) {
    alert("Please select a train.");
    return;
  }

  const cls = document.getElementById("coachClass").value;
  const seat = document.getElementById("seatByClass").value;

  try {
    await db.collection("bookings").add({
      userId: user.uid,
      email: user.email,
      trainNumber: train.trainNumber,
      trainName: train.name,
      class: cls,
      seat: seat,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("bookedClassInfo").innerHTML = `
      <h3>🎫 Ticket Confirmed</h3>
      <p>Train: <b>${train.name}</b> (${train.trainNumber})</p>
      <p>Class: <b>${cls}</b></p>
      <p>Seat: <b>${seat}</b></p>
      <p style="color:green;">Booking saved successfully!</p>
    `;
  } catch (error) {
    document.getElementById("bookedClassInfo").innerHTML = `
      <p style="color:red;">Error saving booking: ${error.message}</p>
    `;
  }
}
function populateStations(train) {
  const boardingSelect = document.getElementById("boardingStation");
  const destinationSelect = document.getElementById("destinationStation");

  boardingSelect.innerHTML = "";
  destinationSelect.innerHTML = "";

  train.route.forEach((station, index) => {
    const option1 = document.createElement("option");
    option1.value = station;
    option1.textContent = station;
    boardingSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = station;
    option2.textContent = station;
    destinationSelect.appendChild(option2);
  });

  // Set default selection
  boardingSelect.selectedIndex = 0;
  destinationSelect.selectedIndex = train.route.length - 1;

  // Optional: Ensure destination is always after boarding
  boardingSelect.onchange = () => {
    const boardingIndex = train.route.indexOf(boardingSelect.value);
    destinationSelect.innerHTML = "";
    train.route.forEach((station, index) => {
      if (index > boardingIndex) {
        const option = document.createElement("option");
        option.value = station;
        option.textContent = station;
        destinationSelect.appendChild(option);
      }
    });
  };
}

const boardingStation = document.getElementById("boardingStation").value;
const destinationStation = document.getElementById("destinationStation").value;

await db.collection("bookings").add({
  userId: user.uid,
  trainNumber: train.trainNumber,
  trainName: train.name,
  class: cls,
  seat: seat,
  boardingStation: boardingStation,
  destinationStation: destinationStation,
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
});

async function checkSeatAvailability(trainNumber, seat, boarding, destination) {
  // Fetch all bookings for this train and seat
  const snapshot = await db.collection("bookings")
    .where("trainNumber", "==", trainNumber)
    .where("seat", "==", seat)
    .get();

  const train = trains.find(t => t.trainNumber === trainNumber);
  const boardingIndex = train.route.indexOf(boarding);
  const destinationIndex = train.route.indexOf(destination);

  for (const doc of snapshot.docs) {
    const b = doc.data().boardingStation;
    const d = doc.data().destinationStation;
    const bIndex = train.route.indexOf(b);
    const dIndex = train.route.indexOf(d);

    // Check for overlap
    if (!(destinationIndex <= bIndex || boardingIndex >= dIndex)) {
      return false; // seat is occupied in overlapping segment
    }
  }
  return true; // seat available
}

const isAvailable = await checkSeatAvailability(train.trainNumber, seat, boardingStation, destinationStation);
if (!isAvailable) {
  alert("Seat is not available for selected route segment.");
  return;
}


function predictTrainTime() {
  const trainNumber = document.getElementById("trainNumberInput").value;
  const result = document.getElementById("timingResult");

  // Mock AI logic based on time of day (can later add weather, live delay data)
  const now = new Date();
  const hour = now.getHours();
  let prediction = "";

  if (hour >= 6 && hour <= 9) {
    prediction = "Train might be delayed by 15-30 minutes due to morning traffic.";
  } else if (hour >= 17 && hour <= 20) {
    prediction = "Expected delay: 30-45 minutes (peak evening hours).";
  } else {
    prediction = "Train is likely to be on time.";
  }

  result.innerText = `Prediction for Train ${trainNumber}: ${prediction}`;
}


function analyzeComplaint() {
  const text = document.getElementById("complaintText").value.toLowerCase();
  const result = document.getElementById("complaintResult");
  let category = "General";

  if (text.includes("late") || text.includes("delay")) {
    category = "Train Delay";
  } else if (text.includes("dirty") || text.includes("clean")) {
    category = "Coach Cleanliness";
  } else if (text.includes("seat") || text.includes("reservation")) {
    category = "Seat Issue";
  } else if (text.includes("food") || text.includes("catering")) {
    category = "Catering Problem";
  }

  result.innerHTML = `Complaint Category Detected: <b>${category}</b><br>✅ Submitted!`;
  
  // You can also save to Firestore:
  // db.collection("complaints").add({userId, text, category, timestamp})
}



