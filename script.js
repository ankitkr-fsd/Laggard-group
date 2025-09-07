const video = document.getElementById('video');
const faceStatus = document.getElementById('faceStatus');
const bioStatus = document.getElementById('bioStatus');
const attendanceMessage = document.getElementById('attendanceMessage');
const markBtn = document.getElementById('markBtn');
const tableBody = document.querySelector("#attendanceTable tbody");

// Simulated student data
const student = {
    name: "Rahul Kumar",
    imgUrl: "https://i.pravatar.cc/150?img=1"
};

let faceVerified = false;
let fingerprintVerified = false;
let attendance = [];

// Load models and start webcam
async function loadFaceAPI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights/');
    await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights/');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights/');
    faceStatus.textContent = "Models loaded. Please verify your face.";
    startVideo();
}

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            faceStatus.textContent = "Cannot access webcam.";
        });
}

async function startFaceVerification() {
    faceStatus.textContent = "Scanning...";
    const img = await faceapi.fetchImage(student.imgUrl);
    const labeledDescriptor = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!labeledDescriptor) {
        faceStatus.textContent = "Error loading student face.";
        return;
    }
    const faceMatcher = new faceapi.FaceMatcher([new faceapi.LabeledFaceDescriptors(student.name, [labeledDescriptor.descriptor])], 0.6);

    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
        faceStatus.textContent = "No face detected.";
        return;
    }

    const match = faceMatcher.findBestMatch(detection.descriptor);
    if (match.label === student.name) {
        faceStatus.textContent = "Face verified!";
        faceVerified = true;
        checkReady();
    } else {
        faceStatus.textContent = "Face not recognized.";
        faceVerified = false;
        markBtn.disabled = true;
    }
}

function startFingerprintScan() {
    bioStatus.textContent = "Scanning fingerprint...";
    setTimeout(() => {
        const success = Math.random() > 0.2;
        if (success) {
            bioStatus.textContent = "Fingerprint verified!";
            fingerprintVerified = true;
            checkReady();
        } else {
            bioStatus.textContent = "Fingerprint scan failed!";
            fingerprintVerified = false;
            markBtn.disabled = true;
        }
    }, 1500);
}

function checkReady() {
    if (faceVerified && fingerprintVerified) {
        markBtn.disabled = false;
        attendanceMessage.textContent = "You can now mark attendance.";
    }
}

function markAttendance() {
    const time = new Date().toLocaleTimeString();
    attendance.push({
        name: student.name,
        status: "Present",
        time: time
    });

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${student.name}</td>
        <td>Present</td>
        <td>${time}</td>
    `;
    tableBody.appendChild(row);
    attendanceMessage.textContent = "Attendance marked!";
    markBtn.disabled = true;
}

// Initialize on load
window.onload = loadFaceAPI;
