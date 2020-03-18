//@ts-nocheck

const userId: any = getCookie("userId");
const accountType: any = getCookie("accType");
if (
  userId === undefined ||
  userId === "" ||
  userId === null || accountType === "mechanic"
) {
  window.location.href = origin;
}
function goBack(page: any) {
  window.location.replace("/");
}

function getCookie(cookieName: string) {
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
