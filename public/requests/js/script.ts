//@ts-nocheck
const userId = getCookie("userId");
const accountType = getCookie("accType");

let userPos: Array<any> = {
  lat: null,
  lng: null
};

if (
  userId === undefined ||
  userId === "" ||
  userId === null ||
  accountType !== "client"
) {
  window.location.href = origin;
}

const socket = io.connect(window.location.origin);

const userLocation = new UserLocation();
let timeout_1 = null;

userLocation.getRealTimeLocation(true, (err: any, pos: any) => {
  if (!err) {
    socket.emit("userlocation", {
      userId: userId,
      accountType: accountType,
      latlng: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      heading: pos.coords.heading,
      timestamp: pos.timestamp
    });
  }
});

let mechanic_list = document.querySelector("#mechanic_list");
mechanic_list.innerHTML = `
              <ion-list>
        <ion-list-header>
          <ion-skeleton-text animated style="width: 80px"></ion-skeleton-text>
        </ion-list-header>
        <ion-item>
          <ion-avatar slot="start">
            <ion-skeleton-text></ion-skeleton-text>
          </ion-avatar>
          <ion-label>
            <h3>
              <ion-skeleton-text animated style="width: 30%"></ion-skeleton-text>
            </h3>
            <p>
              <ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
            </p>
            <p>
              <ion-skeleton-text animated style="width: 50%"></ion-skeleton-text>
            </p>
          </ion-label>
        </ion-item>
      </ion-list>`;
showMecanicsNearby();

function getCookie(cookieName) {
  let array_cookies = document.cookie.split(";");
  for (let i = 0; i < array_cookies.length; i++) {
    let cookie = array_cookies[i];
    while (cookie.charAt(0) == " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName + "=") == 0) {
      return cookie.substring(cookieName.length + 1, cookie.length);
    }
  }
  return "";
}

function get(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(result => {
        result.json().then(res => {
          resolve(res);
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

function showMecanicsNearby() {
  userLocation.getLocation((err, pos) => {
    if (err)
      createAlert("Error", err.message, () => {
        window.location.reload = origin;
      });
    else {
      userPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      let dispData = `<ion-list>`;
      get(
        window.location.origin +
          `/api/mechanics/request/${userId}&${pos.coords.latitude}&${pos.coords.longitude}`
      )
        .then(res => {
          dispData += `<ion-list-header style="font-weight:500">${res.msg}</ion-list-header>`;
          if (res.data.length === 0)
            createAlert(
              "Sorry",
              "No mecahnics nearby.",
              "Retry",
              () => showMecanicsNearby(),
              "OK",
              () => {
                window.location.href = origin;
              }
            );
          else {
            res.data.forEach(async (element, idx, array) => {
              await get(
                window.location.origin + `/api/users/${element.mechanicId}`
              )
                .then(_res => {
                  if (_res.success) {
                    dispData += `<ion-item>
                      <ion-avatar slot="start">
                        <ion-img src="${
                          _res.data.profilePic === null
                            ? "https://cdn.onlinewebfonts.com/svg/img_568656.png"
                            : _res.data.profilePic
                        }"/>
                      </ion-avatar>
                      <ion-label>
                        <h2>${_res.data.username}</h2>
                        <p>${
                          element.distance < 1
                            ? (element.distance * 1000).toFixed(0) + "m"
                            : element.distance.toFixed(2) + "km"
                        } away from you</p>
                        <p>Tel: ${_res.data.contactNumber} </p>
                      </ion-label>
                      <ion-button id="${element.mechanicId} ${
                      element.distance
                    }" onclick="requestMechanic(this.id)" color="warning">Request</ion-button>
                    </ion-item>`;
                  }
                  if (idx === array.length - 1) {
                    setTimeout(() => {
                      dispData += "</ion-list>";
                      mechanic_list.innerHTML = dispData;
                    }, 70);
                  }
                })
                .catch(err => {
                  createAlert("Error", err.toString(), "OK", () => {
                    window.location.href = origin;
                  });
                });
            });
          }
        })
        .catch(err => {
          createAlert("Error", err.toString(), "OK", () => {
            window.location.replace = origin;
          });
        });
    }
  });
}

function requestMechanic(id) {
  let iddist = id.split(" ");
  let mId = iddist[0];
  let dist = iddist[1];
  createLoading("Waiting for response...");
  get(`
      ${window.location.origin}/api/jobs/${userId}&client&true`)
    .then(result => {
      console.log(result);
      if (result.success === true && result.data.size === 0) {
        socket.emit("requestfromclient", {
          mechanicId: mId,
          clientId: userId,
          clientPos: userPos,
          distance: dist
        });
        timeout_1 = setTimeout(() => {
          dismissLoading();
          createAlert(
            "Response error",
            "Sorry, No response from Mechanic.",
            "Ok"
          );
        }, 10000);
      } else {
        dismissLoading();
        createAlert(
          "Error",
          "You have ongoing Job.Please cancel or finish it before request new one",
          "OK"
        );
      }
    })
    .catch(err => {
      dismissLoading();
      console.log(err);
      createAlert("Error", err.toString(), "OK");
    });
}

socket.on("responsefrommechanic_server", (res: any) => {
  if (res.data.clientId === userId) {
    clearTimeout(timeout_1);
    if (res.data.success) {
      dismissLoading();
      createAlert("Accepted", "Mechanic accepted your request", "OK", () => {
        createLoading("Wait a second...");
        fetch(window.location.origin + "/api/jobs/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            clientId: res.data.clientId,
            mechanicId: res.data.mechanicId,
            startPoint: res.data.clientPos,
            endPoint: res.data.mechanicPos,
            startTime: Date().toString(),
            endTime: null,
            isActivated: true
          })
        })
          .then(JSONdata =>
            JSONdata.json().then(data => {
              dismissLoading();
              socket.emit("jobcreatedsuccess", {
                clientId: res.data.clientId,
                mechanicId: res.data.mechanicId
              });
              window.location.href = origin;
            })
          )
          .catch(err => {
            dismissLoading();
            createAlert("Error", err.toString(), "OK");
          });
      });
    } else {
      dismissLoading();
      console.log(res);
      createAlert("Sorry", res.data.msg, "OK", () => {
        console.log("OK");
      });
    }
  }
});

function goBack() {
  window.location.href = origin;
}
