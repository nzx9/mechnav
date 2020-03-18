"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//@ts-nocheck
const alertController = document.querySelector("ion-alert-controller");
const loadingController = document.querySelector("ion-loading-controller");
//alerts
function createAlert(header, message, btn_text, callback = null, dismissable = true) {
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
        .then((alert) => alert.present());
}
function createAlertMultipleBtns(header, message, btn_text1, callback1 = null, btn_text2, callback2 = null) {
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
        .then((alert) => alert.present());
}
//loading widget
function createLoading(msg) {
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
function createToast(msg, duration, position = "bottom", closeBtn = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const toast = yield document.createElement("ion-toast");
        toast.message = msg;
        toast.duration = duration;
        toast.position = position;
        toast.showCloseButton = closeBtn;
        document.body.appendChild(toast);
        return toast.present();
    });
}
function dismissToast() {
    toast.dismiss();
}
function createToastPlain_1(msg, duration, position = "bottom", closeBtn = true, css = null) {
    return __awaiter(this, void 0, void 0, function* () {
        toast1.message = msg;
        toast1.duration = duration;
        toast1.position = position;
        toast1.showCloseButton = closeBtn;
        toast1.cssClass = css;
        yield document.body.appendChild(toast1);
        toast1Exist = true;
        return toast1.present();
    });
}
function dismissToast() {
    if (toast1Exist) {
        toast1.dismiss();
        toast1Exist = false;
    }
}
function createToastPlain_2(msg, duration, position = "bottom", closeBtn = true, css = null) {
    return __awaiter(this, void 0, void 0, function* () {
        toast2.message = msg;
        toast2.duration = duration;
        toast2.position = position;
        toast2.showCloseButton = closeBtn;
        toast2.cssClass = css;
        yield document.body.appendChild(toast2);
        toast2Exist = true;
        return toast2.present();
    });
}
function dismissToast_2() {
    if (toast2Exist) {
        toast2.dismiss();
        toast2Exist = false;
    }
}
//cookie -
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
// page navigation
function navigate(page) {
    window.location.href = page;
}
