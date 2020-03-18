"use strict";
//main
//@ts-nocheck
const cookie_userId = new Cookie("userId");
const cookie_accType = new Cookie("accType");
const userId = getCookie("userId");
const accType = getCookie("accType");
if (userId === undefined || userId === "" || userId === null) {
    window.location.href = origin;
}
fetch(window.location.origin + "/api/users/" + userId)
    .then(result => result.json().then(res => {
    if (res.success) {
        document.querySelector("#username input").value = res.data.username;
        document.querySelector("#email input").value = res.data.email;
        document.querySelector("#date-created").value = res.data.date_created;
        document.querySelector("#contact-no input").value =
            res.data.contactNumber;
        document.querySelector("#acc-type input").value = res.data.accountType;
        if (res.data.firstName !== undefined && res.data.firstName !== null)
            document.querySelector("#firstname input").value = res.data.firstName;
        if (res.data.lastName !== undefined && res.data.lastName !== null)
            document.querySelector("#lastname input").value = res.data.lastName;
        if (res.data.profilePic !== undefined && res.data.profilePic !== null)
            document.querySelector("#avatar").src = res.data.profilePic;
        if (res.data.gender === "male") {
            document.querySelector("#male").selected = true;
        }
        else if (res.data.gender === "female") {
            document.querySelector("#female").selected = true;
        }
        else {
            document.querySelector("#none").selected = true;
        }
    }
}))
    .catch((err) => {
    createAlert("Error", err, "BACK", () => {
        window.location.href = origin;
    });
});
let btn_save = document.querySelector("#btn-save");
btn_save.addEventListener("click", () => saveProfileInfo());
function saveProfileInfo() {
    fetch(window.location.origin + "/api/users/profile/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: userId,
            firstName: document.querySelector("#firstname input").value,
            lastName: document.querySelector("#lastname input").value,
            contactNumber: document.querySelector("#contact-no input").value,
            gender: document.querySelector("#gender").value
        })
    })
        .then(json => json.json())
        .then(() => {
        createAlert("Success", "Profile Updated", "Done", () => window.location.reload(true));
    })
        .catch(err => {
        createAlert("Error", err.toString(), "Retry", () => saveProfileInfo());
    });
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
function logout() {
    cookie_userId.remove();
    cookie_accType.remove();
    window.location.href = origin;
}
function navigate(page) {
    window.location.href = page;
}
