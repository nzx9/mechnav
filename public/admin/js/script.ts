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
const user_list: any = document.querySelector("#user-data");
let items = null;

createToast("fetching...", 2000, "middle", true);
fetch(window.location.origin + "/api/users/all")
  .then(JSONdata =>
    JSONdata.json().then(data => {
      if (data.success) {
        let len = data.data.length;
        let table = "";
        for (let i = 0; i < len; i++) {
          table += `<ion-item onclick="viewUser(this.id)" id="${data.data[i]._ref._path.segments[1]}">${data.data[i]._fieldsProto.username.stringValue}<ion-note slot="end">${data.data[i]._ref._path.segments[1]}</ion-note>
            <br>${data.data[i]._fieldsProto.email.stringValue}
            </ion-item>`;
          if (i === len - 1) {
            user_list.innerHTML = table;
            items = Array.from(document.querySelector("ion-list").children);
          }
        }
      }
    })
  )
  .catch(err => {
    createAlert("Error", err.toString(), "OK");
  });

const searchbar = document.querySelector("ion-searchbar");
searchbar.addEventListener("ionInput", async event => {
  const query = event.target.value.toLowerCase();
  requestAnimationFrame(() => {
    items.forEach(item => {
      const shouldShow = item.textContent.toLowerCase().indexOf(query) > -1;
      item.style.display = shouldShow ? "block" : "none";
    });
  });
});

function viewUser(id: string) {
  window.location.href = "view?userId=" + id;
}

function goBack(page: any) {
  window.location.replace("/");
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
