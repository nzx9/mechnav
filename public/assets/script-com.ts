//@ts-nocheck
const alertController: any = document.querySelector("ion-alert-controller");
const loadingController = document.querySelector("ion-loading-controller");

//alerts
function createAlert(
  header: any,
  message: any,
  btn_text: string | null,
  callback: any = null,
  dismissable: boolean = true
) {
  alertController
    .create({
      header: header,
      message: message,
      backdropDismiss: dismissable,
      buttons: [
        {
          text: btn_text,
          handler: callback
        }
      ]
    })
    .then((alert: any) => alert.present());
}
function createAlertMultipleBtns(
  header: any,
  message: any,
  btn_text1: string | null,
  callback1: any = null,
  btn_text2: string | null,
  callback2: any = null
) {
  alertController
    .create({
      header: header,
      message: message,
      backdropDismiss: false,
      buttons: [
        {
          text: btn_text1,
          handler: callback1
        },
        {
          text: btn_text2,
          handler: callback2
        }
      ]
    })
    .then((alert: any) => alert.present());
}

//loading widget
function createLoading(msg: any) {
  loadingController
    .create({
      message: msg
    })
    .then(loading => loading.present());
}

function dismissLoading() {
  loadingController.dismiss();
}

//toast

const toast1 = document.createElement("ion-toast");
const toast2 = document.createElement("ion-toast");
let toast1Exist = false;
let toast2Exist = false;
async function createToast(
  msg,
  duration,
  position = "bottom",
  closeBtn = true
) {
  const toast = await document.createElement("ion-toast");
  toast.message = msg;
  toast.duration = duration;
  toast.position = position;
  toast.showCloseButton = closeBtn;
  document.body.appendChild(toast);
  return toast.present();
}

function dismissToast() {
  toast.dismiss();
}

async function createToastPlain_1(
  msg,
  duration,
  position = "bottom",
  closeBtn = true,
  css = null
) {
  toast1.message = msg;
  toast1.duration = duration;
  toast1.position = position;
  toast1.showCloseButton = closeBtn;
  toast1.cssClass = css;
  await document.body.appendChild(toast1);
  toast1Exist = true;
  return toast1.present();
}

function dismissToast() {
  if (toast1Exist) {
    toast1.dismiss();
    toast1Exist = false;
  }
}

async function createToastPlain_2(
  msg,
  duration,
  position = "bottom",
  closeBtn = true,
  css = null
) {
  toast2.message = msg;
  toast2.duration = duration;
  toast2.position = position;
  toast2.showCloseButton = closeBtn;
  toast2.cssClass = css;
  await document.body.appendChild(toast2);
  toast2Exist = true;
  return toast2.present();
}

function dismissToast_2() {
  if (toast2Exist) {
    toast2.dismiss();
    toast2Exist = false;
  }
}

//cookie
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

// page navigation
function navigate(page: string) {
  window.location.href = page;
}
