//@ts-nocheck
const userId: any = getCookie("userId");
const accountType: any = getCookie("accType");
if (
  userId === undefined ||
  userId === "" ||
  userId === null ||
  accountType !== "admin"
) {
  window.location.href = origin;
}
let params = new URLSearchParams(location.search);
let k_userId = params.get("userId");

const view = document.querySelector("#view");
fetch(window.location.origin + "/api/users/" + k_userId)
  .then(JSONdata =>
    JSONdata.json().then(res => {
      if (res.success) {
        document.querySelector("#username input").value = res.data.username;
        document.querySelector("#email input").value = res.data.email;
        document.querySelector("#date-created").value = res.data.date_created;
        document.querySelector("#contact-no input").value =
          res.data.contactNumber;
        if (res.data.firstName !== undefined && res.data.firstName !== null)
          document.querySelector("#firstname input").value = res.data.firstName;
        if (res.data.lastName !== undefined && res.data.lastName !== null)
          document.querySelector("#lastname input").value = res.data.lastName;
        if (res.data.gender === "male") {
          document.querySelector("#male").selected = true;
        } else if (res.data.gender === "female") {
          document.querySelector("#female").selected = true;
        } else {
          document.querySelector("#none").selected = true;
        }
        if (res.data.accountType === "admin") {
          document.querySelector("#admin").selected = true;
        } else if (res.data.accountType === "mechanic") {
          document.querySelector("#mechanic").selected = true;
        } else {
          document.querySelector("#client").selected = true;
        }
      }
    })
  )
  .catch(err => {
    console.log(err);
    createAlert("Error", err.toString(), "OK", null, false);
  });

function updateUser() {
  createAlertMultipleBtns(
    "Update Information",
    "sure?",
    "OK",
    () => saveUser(),
    "Cancel",
    null
  );
}

function deleteUser() {
  createAlertMultipleBtns(
    "Delete User",
    "sure?",
    "OK",
    () => {
      userDelete(k_userId);
    },
    "Cancel",
    null
  );
}

function saveUser() {
  fetch(window.location.origin + "/api/users/profile/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: k_userId,
      username: document.querySelector("#username input").value,
      email: document.querySelector("#email input").value,
      firstName: document.querySelector("#firstname input").value,
      lastName: document.querySelector("#lastname input").value,
      contactNumber: document.querySelector("#contact-no input").value,
      gender: document.querySelector("#gender").value,
      accountType: document.querySelector("#acc-type").value
    })
  })
    .then(json => json.json())
    .then(() => {
      createAlert("Success", "Profile Updated", "Done", () =>
        window.location.reload(true)
      );
    })
    .catch(err => {
      createAlert("Error", err.toString(), "Retry", () => saveProfileInfo());
    });
}

function userDelete(id) {
  fetch(window.location.origin + "/api/users/delete/" + id)
    .then(JD =>
      JD.json().then(sucess => {
        if (sucess.success) {
          createAlert("Success", "User deleted", "Ok", () => goBack(), false);
        }
      })
    )
    .catch(err => createAlert("Error", err.toString(), "Ok", null, false));
}

function goBack(page: any) {
  window.location.replace("/admin");
}
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
