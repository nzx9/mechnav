// @ts-nocheck
const userId: string = getCookie("userId");
if (userId === undefined || userId === "" || userId === null) {
  window.location.href = "login";
}

// +++++++++++++++++++ Main ++++++++++++++++++++++++++++++++++++

const cookie_accType = new Cookie("accType");
const cookie_userId = new Cookie("userId");
const userLocation = new UserLocation();
const socket: any = io.connect(window.location.href);

let accountType = null;
let map: google.maps.Map;
let directionsRenderer: google.maps.DirectionsRenderer;
let directionsService: google.maps.DirectionsService;
let userLocationMarker: google.maps.Marker = null;
let cmMarker: google.maps.Marker = null;
let follow_my_position: boolean = false;
let jobData: Array<any> = {
  isInJob: null,
  jobId: null,
  clientId: null,
  mechanicId: null,
  startPoint: null,
  endPoint: null
};
let showedOnce = false;
let currentPopover: any = null;

interface LatLng {
  lat: number | null;
  lng: number | null;
}

let userPos: LatLng = {
  lat: null,
  lng: null
};

initMap(); //initializing map

socket.on("locationdata_server", data => {
  if (jobData.isInJob && accountType === "mechanic") {
    if (jobData.clientId === data.userId) {
      clearCMMarker();
      setCMMarker(data.latlng.lat, data.latlng.lng, "client");
    }
  }
  if (jobData.isInJob && accountType === "client") {
    if (jobData.mechanicId === data.userId) {
      clearCMMarker();
      setCMMarker(data.latlng.lat, data.latlng.lng, "mechanic");
    }
  }
});

socket.on("requestfromclient_server", msg => {
  if (msg.mechanicId === userId) {
    get(
      `
      ${window.location.origin}/api/jobs/${userId}&mechanic&true`,
      (err, data) => {
        if (err) {
          socket.emit("responsefrommechanic", {
            success: false,
            msg: err.toString(),
            clientId: msg.clientId,
            mechanicId: msg.mechanicId
          });
        } else {
          if (data.data.size === 0) {
            createAlertMultipleBtns(
              "Client Request",
              `Client is ${
                msg.distance < 1
                  ? (msg.distance * 1000).toFixed(0) + "m"
                  : msg.distance.toFixed(2) + "km"
              } away from you`,
              "Accept",
              () => {
                socket.emit("responsefrommechanic", {
                  success: true,
                  msg: "Mechanic accepted your request",
                  clientId: msg.clientId,
                  mechanicId: msg.mechanicId,
                  clientPos: msg.clientPos,
                  mechanicPos: userPos
                });
              },
              "Decline",
              () => {
                socket.emit("responsefrommechanic", {
                  success: false,
                  msg: "Mechanic decline your request",
                  clientId: msg.clientId,
                  mechanicId: msg.mechanicId
                });
              }
            );
          } else {
            socket.emit("responsefrommechanic", {
              success: false,
              msg: "Mechanic is in another job already",
              clientId: msg.clientId,
              mechanicId: msg.mechanicId
            });
          }
        }
      }
    );
  }
});

socket.on("jobcreatedsuccess_server", data => {
  if (userId === data.mechanicId) {
    createToast("Setting directions...", 2000, "middle", true);
    fetchAndShowInfo();
  }
});

socket.on("canceljob_server", data => {
  if (data.clientId === userId && accountType === "client") {
    createAlert(
      "Job Canceled",
      "Sorry, Your Job has canceled by Mechanic",
      "OK",
      () => window.location.reload(),
      false
    );
  }
  if (data.mechanicId === userId && accountType === "mechanic") {
    createAlert(
      "Job Canceled",
      "Client canceled Job",
      "OK",
      () => window.location.reload(),
      false
    );
  }
});
// get information from server
fetchAndShowInfo();

//socket communication in between client and server && track user
userLocation.getRealTimeLocation(true, async (err: any, pos: any) => {
  if (!err) {
    if (userLocationMarker !== null) clearUserLocationMarker();
    setUserLocationMarker(pos.coords.latitude, pos.coords.longitude);
    socket.emit("userlocation", {
      userId: userId,
      accountType: accountType,
      latlng: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      heading: pos.coords.heading,
      timestamp: pos.timestamp
    });
    if (follow_my_position) {
      // follow user marker in  map
      map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      if (pos.coords.heading !== null && pos.coords.heading < 360) {
        map.setHeading(pos.coords.heading);
      }
    }
  }
});

userLocation.getLocationWithInterval(5, async (err, pos) => {
  if (!err) {
    if (jobData.endPoint !== null) {
      directionsService.route(
        {
          origin: new google.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude
          ),
          destination: new google.maps.LatLng(
            jobData.endPoint.lat,
            jobData.endPoint.lng
          ),
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status == "OK") {
            showDirectionDataBar(result);
          }
        }
      );
    }
  }
});
function fetchAndShowInfo() {
  get(window.location.href + "api/users/" + userId, (err: any, res: any) => {
    if (err) {
      createAlert("Network Error", "Can't fetch data.", "Retry", () =>
        fetchAndShowInfo()
      );
    } else {
      if (res.success !== 1) {
        accountType = res.data.accountType;
        //load routes if available
        getJobDataFromServer(userId, accountType, (data: any) => {
          if (data.success && data.data.size !== 0) {
            jobData = {
              isInJob: true,
              jobId: data.data._id,
              clientId: data.data.body.clientId,
              mechanicId: data.data.body.mechanicId,
              startPoint: data.data.body.startPoint,
              endPoint: data.data.body.endPoint
            };
            setRoute(
              data.data.body.startPoint,
              data.data.body.endPoint,
              mapdata => {
                if (accountType === "mechanic") {
                  get(
                    window.location.origin + "/api/users/" + jobData.clientId,
                    (err, clidata) => {
                      if (!err) {
                        if (clidata.success) {
                          JobCancelingToast(clidata, "client");
                        }
                      }
                    }
                  );
                  createToastPlain_2(
                    `${mapdata.steps[0].instructions}<b>ETA : ${mapdata.duration.text}(${mapdata.distance.text})</b>`,
                    null,
                    "bottom",
                    false,
                    "toast-up"
                  );
                } else if (accountType === "client") {
                  get(
                    window.location.origin + "/api/users/" + jobData.mechanicId,
                    (err, mechdata) => {
                      if (!err) {
                        if (mechdata.success) {
                          JobCancelingToast(mechdata, "mechanic");
                        }
                      }
                    }
                  );
                  createToastPlain_2(
                    `${mapdata.distance.text} away from you. ETA ${mapdata.duration.text}`,
                    null,
                    "bottom",
                    false,
                    "toast-up"
                  );
                }
              }
            );
          }
        });
        document.querySelector("#chip-username").innerText = res.data.username;
        document.querySelector(".btn_profile").id = userId;
        cookie_accType.set(res.data.accountType, 1);
        if (res.data.accountType === "client") {
          document.querySelector("#btn-mechanic-request").style.display =
            "unset";
        }
        if (
          res.data.accountType === "admin" ||
          res.data.accountType === "client"
        ) {
          document.querySelector("#btn-options").style.display = "unset";
        }
        document.querySelector("#img-avatar").src =
          res.data.profilePic !== null && res.data.profilePic !== undefined
            ? res.data.profilePic
            : "https://cdn.onlinewebfonts.com/svg/img_568656.png";
      } else {
        cookie_userId.remove();
        createAlert("Snap !", "Sorry! Something went wrong.", "OK", () => {
          window.location.href = origin;
        });
      }
    }
  });
}

async function getJobDataFromServer(Id: any, accountType: any, callback: any) {
  let _id = Id;
  let _accountType = accountType;
  fetch(`
      ${window.location.origin}/api/jobs/${Id}&${accountType}&true`)
    .then(JSONdata =>
      JSONdata.json().then(data => {
        callback(data);
      })
    )
    .catch(err =>
      createAlert(
        "Network error",
        "Can't fetch currently active job",
        "Retry",
        () => {
          console.log(err);
          getJobDataFromServer(_id, _accountType, data => callback(data));
        }
      )
    );
}

//google - maps
function createMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 10,
    mapTypeId: "roadmap",
    styles: JSON.parse(map_style),
    zoomControl: false,
    mapTypeControl: false,
    rotationControl: true,
    scaleControl: false,
    streetViewControl: false,
    fullscreenControl: false
  });
}

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    preserveViewport: true
  });
  createMap();
  directionsRenderer.setMap(map);
  locateMe(true);
}

function setRoute(
  start: google.maps.LatLng,
  end: google.maps.LatLng,
  callback: any
) {
  let request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, (result: any, status: any) => {
    if (status == "OK") {
      callback(result.routes[0].legs[0]);
      directionsRenderer.setDirections(result);
    }
  });
}

function clearRoute() {
  directionsRenderer.setMap(null);
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
}

function setUserLocationMarker(lat: number, lng: number) {
  userLocationMarker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    title: "I'm here",
    icon: "../assets/img/user-location-32px.png"
  });
  userLocationMarker.setMap(map);
}

function clearUserLocationMarker() {
  userLocationMarker.setMap(null);
  userLocationMarker = new google.maps.Marker();
  userLocationMarker.setMap(map);
}

function setCMMarker(lat: number, lng: number, accType: string) {
  if (accType === "mechanic") {
    cmMarker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      title: "Mechainc",
      icon: "../assets/img/tow-truck-20px.png"
    });
    cmMarker.setMap(map);
  }
  if (accType === "client") {
    cmMarker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      title: "Client",
      icon: "../assets/img/car-20px.png"
    });
    cmMarker.setMap(map);
  }
}

function clearCMMarker() {
  if (cmMarker !== null) cmMarker.setMap(null);
  cmMarker = new google.maps.Marker();
  cmMarker.setMap(map);
}

async function locateMe(marke: boolean) {
  userLocation.getLocation((err: any, pos: any) => {
    if (err) {
      createAlert("Error", err.message, "Retry", () => locateMe(false));
      map.setZoom(5);
    } else {
      userPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      if (marke) {
        setUserLocationMarker(pos.coords.latitude, pos.coords.longitude);
      }
      map.setCenter({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      map.setZoom(17);
    }
  });
}

const btn_locate_me_follow_icon: any = document.querySelector(
  "#btn-locate-me-follow-icon"
);

function btn_locate_me_follow() {
  if (follow_my_position) {
    follow_my_position = false;
    btn_locate_me_follow_icon.color = "dark";
    createToast("Location locking service turned off", 2000, "middle");
  } else {
    follow_my_position = true;
    btn_locate_me_follow_icon.color = "warning";
    createToast("Location locking service turned on", 2000, "middle");
  }
}

//pop-overs
const popoverController: Element = document.querySelector(
  "ion-popover-controller"
);

const btn_options: Element = document.querySelector("#btn-options");
btn_options.addEventListener("click", event => {
  if (jobData.isInJob !== null) {
    dismissToast_2();
  }
  if (accountType === "admin") {
    showPopOver(event, "options-layout-admin");
  } else {
    showPopOver(event, "options-layout-client");
  }
});

async function showPopOver(event, layout) {
  let popover = await popoverController.create({
    component: layout,
    event: event,
    translucent: true
  });
  currentPopover = popover;
  return popover.present();
}

function dismissPopover() {
  if (currentPopover) {
    currentPopover.dismiss().then(() => {
      currentPopover = null;
    });
  }
}

const btn_mechanic_request = document.querySelector("#btn-mechanic-request");
btn_mechanic_request.addEventListener("click", () => {
  window.location.href = "requests/";
});

// pop over
customElements.define(
  "options-layout-client",
  class ModalContent extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
            <ion-list style="z-index : 1 !important">
            <ion-list-header>Options</ion-list-header>
            <ion-item button onclick="navigate('service')">Services</ion-item>
            </ion-list>
            <ion-button expand="block" onClick="dismissPopover()" color="danger">Close</ion-button>
        `;
    }
  }
);
customElements.define(
  "options-layout-admin",
  class ModalContent extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
            <ion-list style="z-index : 1 !important">
            <ion-list-header>Options</ion-list-header>
            <ion-item button onclick="navigate('admin')">Admin</ion-item>
            </ion-list>
            <ion-button expand="block" onClick="dismissPopover()" color="danger">Close</ion-button>
        `;
    }
  }
);

function get(url: any, callback: any) {
  fetch(url)
    .then(JD => JD.json().then(data => callback(null, data)))
    .catch(err => callback(err, null));
}

async function JobCancelingToast(details: string, accType: string) {
  const toast = document.createElement("ion-toast");
  toast.message = `${
    accType === "client" ? "Client: " : "mechanic" ? "Mechanic: " : null
  } ${details.data.username}\nTel: ${details.data.contactNumber}`;
  toast.position = "top";
  toast.classList = "toast-down";
  toast.buttons = [
    {
      text: "Cancel Job",
      handler: () => {
        createAlertMultipleBtns(
          "Conformation?",
          "Do you want to cancel this job?",
          "No",
          () => fetchAndShowInfo(),
          "Yes",
          () => {
            if (jobData.jobId !== null) {
              finishJob(jobData.jobId, (err, res) => {
                if (err) {
                  createAlert(
                    "Error",
                    err.toString(),
                    "Retry",
                    () =>
                      finishJob(jobData.jobId, (err, res_) => {
                        if (err) {
                          createAlert(
                            "Error",
                            err.toString(),
                            "OK",
                            null,
                            false
                          );
                          fetchAndShowInfo();
                        } else {
                          if (res_.success) {
                            socket.emit("canceljob", {
                              clientId: jobData.clientId,
                              mechanicId: jobData.mechanicId,
                              jobId: jobData.jobId
                            });
                            window.location.reload();
                          }
                        }
                      }),
                    false
                  );
                } else {
                  if (res.success) {
                    socket.emit("canceljob", {
                      clientId: jobData.clientId,
                      mechanicId: jobData.mechanicId,
                      jobId: jobData.jobId
                    });
                    window.location.reload();
                  } else {
                    fetchAndShowInfo();
                  }
                }
              });
            }
          }
        );
      }
    }
  ];

  document.body.appendChild(toast);
  return toast.present();
}

function showDirectionDataBar(dirdata) {
  let mapdata = dirdata.routes[0].legs[0];
  if (mapdata.distance.value >= 10) {
    directionsRenderer.setDirections(dirdata);
    if (accountType === "client" && currentPopover === null) {
      createToastPlain_2(
        `${mapdata.distance.text} away from you. ETA ${mapdata.duration.text}`,
        null,
        "bottom",
        false,
        "toast-up"
      );
    }
    if (accountType === "mechanic" && currentPopover === null) {
      createToastPlain_2(
        `${mapdata.steps[0].instructions}<b>ETA : ${mapdata.duration.text}(${mapdata.distance.text})</b>`,
        null,
        "bottom",
        false,
        "toast-up"
      );
    }
  } else {
    if (accountType === "mechanic" && !showedOnce) {
      showedOnce = true;
      createAlert(
        "Confirmation",
        "Did you arrive at the destination?",
        "Yes",
        () => {
          finishJob(jobData.jobId, (err, res) => {
            if (err) {
              createAlert("Error", err.toString, "OK", null, false);
              fetchAndShowInfo();
            } else {
              if (res.success) {
                socket.emit("canceljob", {
                  clientId: jobData.clientId,
                  mechanicId: jobData.mechanicId,
                  jobId: jobData.jobId
                });
                window.location.reload();
              } else {
                createAlert("Error", "Something went wrong", "OK", null, false);
                fetchAndShowInfo();
              }
            }
          });
        },
        false
      );
    }
  }
}

function finishJob(jobId, callback) {
  fetch(window.location.origin + "/api/jobs/finish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jobId: jobId,
      endTime: Date.toString(),
      isActivated: false
    })
  })
    .then(JD =>
      JD.json().then(data => {
        callback(null, data);
      })
    )
    .catch(err => callback(err, null));
}
