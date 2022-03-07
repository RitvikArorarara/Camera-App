let videoPlayer = document.querySelector("video");
let recordBtn = document.querySelector("#record");
let captureBtn = document.querySelector("#capture");
let body = document.querySelector("body");
let mediaRecorder;
let chunks = [];
let isRecording = false;
let filter = "";
let currZoom = 1; // min = 1 and max = 3

let zoomIn = document.querySelector(".in");
let zoomOut = document.querySelector(".out");
let galleryBtn = document.querySelector("#gallery");

galleryBtn.addEventListener("click", function () {
  location.assign("gallery.html");
});

zoomIn.addEventListener("click", function () {
  currZoom = currZoom + 0.1;
  if (currZoom > 3) currZoom = 3;
  console.log(currZoom);
  videoPlayer.style.transform = `scale(${currZoom})`;
});

zoomOut.addEventListener("click", function () {
  currZoom = currZoom - 0.1;
  if (currZoom < 1) currZoom = 1;
  console.log(currZoom);
  videoPlayer.style.transform = `scale(${currZoom})`;
});

let allFilters = document.querySelectorAll(".filter");

for (let i = 0; i < allFilters.length; i++) {
  allFilters[i].addEventListener("click", function (e) {
    let previousFilter = document.querySelector(".filter-div");

    if (previousFilter) previousFilter.remove();

    let color = e.currentTarget.style.backgroundColor;
    filter = color;
    let div = document.createElement("div");
    div.classList.add("filter-div");
    div.style.backgroundColor = color;
    body.append(div);
  });
}

captureBtn.addEventListener("click", function () {
  let innerSpan = captureBtn.querySelector("span");

  innerSpan.classList.add("capture-animation");
  setTimeout(function () {
    innerSpan.classList.remove("capture-animation");
  }, 1000);

  let canvas = document.createElement("canvas");
  canvas.width = videoPlayer.videoWidth; //1280x720
  canvas.height = videoPlayer.videoHeight;

  let tool = canvas.getContext("2d");

  //top left to center
  tool.translate(canvas.width / 2, canvas.height / 2);
  tool.scale(currZoom, currZoom);
  tool.translate(-canvas.width / 2, -canvas.height / 2);

  tool.drawImage(videoPlayer, 0, 0);

  if (filter != "") {
    tool.fillStyle = filter;
    tool.fillRect(0, 0, canvas.width, canvas.height);
  }

  let url = canvas.toDataURL();
  canvas.remove();

  saveMedia(url);
});

recordBtn.addEventListener("click", function () {
  let innerSpan = recordBtn.querySelector("span");

  let previousFilter = document.querySelector(".filter-div");

  if (previousFilter) previousFilter.remove();

  filter = "";

  if (isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    innerSpan.classList.remove("record-animation");
  } else {
    mediaRecorder.start();
    currZoom = 1;
    videoPlayer.style.transform = `scale(${currZoom})`;

    isRecording = true;
    innerSpan.classList.add("record-animation");
  }
});

let promiseToUseCamera = navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

promiseToUseCamera
  .then(function (mediaStream) {
    videoPlayer.srcObject = mediaStream;

    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener("dataavailable", function (e) {
      chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", function (e) {
      let blob = new Blob(chunks, { type: "video/mp4" });
      chunks = [];

      saveMedia(blob);
    });
  })
  .catch(function () {
    console.log("user has denied the access of camera");
  });
