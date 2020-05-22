(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["non-login-non-login-module"],{

/***/ "./src/app/non-login/non-login.module.ts":
/*!***********************************************!*\
  !*** ./src/app/non-login/non-login.module.ts ***!
  \***********************************************/
/*! exports provided: NonLoginModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NonLoginModule", function() { return NonLoginModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _non_login_page__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./non-login.page */ "./src/app/non-login/non-login.page.ts");







var NonLoginModule = /** @class */ (function () {
    function NonLoginModule() {
    }
    NonLoginModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_3__["NgModule"])({
            imports: [
                _ionic_angular__WEBPACK_IMPORTED_MODULE_1__["IonicModule"],
                _angular_common__WEBPACK_IMPORTED_MODULE_4__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_5__["FormsModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forChild([{ path: '', component: _non_login_page__WEBPACK_IMPORTED_MODULE_6__["NonLoginPage"] }])
            ],
            declarations: [_non_login_page__WEBPACK_IMPORTED_MODULE_6__["NonLoginPage"]]
        })
    ], NonLoginModule);
    return NonLoginModule;
}());



/***/ }),

/***/ "./src/app/non-login/non-login.page.html":
/*!***********************************************!*\
  !*** ./src/app/non-login/non-login.page.html ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-header>\n  <ion-tab-bar color=\"secondary\">\n    <ion-title>Mind<sup>2</sup> DEMO - Paciente</ion-title>\n  </ion-tab-bar>\n</ion-header>\n\n<ion-content padding>\n  <!-- <ion-card>\n    <ion-card-header color=\"primary\">\n      Non-login User can:\n    </ion-card-header>\n    <ion-card-content>\n      <ul>\n        <li>join a meeting</li>\n        <li>host a meeting with ZAK</li>\n      </ul>\n    </ion-card-content>\n  </ion-card> -->\n  <ion-img style=\"max-width: 35%; margin: auto;\"\n           src=\"https://mind2.me/wp-content/uploads/2020/01/cropped-logo-mind-2-large-copy.png\"></ion-img>\n  <ion-card>\n    <ion-card-header color=\"primary\">\n      INICIAR MI SESIÓN\n    </ion-card-header>\n    <ion-card-content padding>\n      <!-- <h3>Entrar a la sesión de Demo - Mind<sup>2</sup></h3> -->\n      <ion-list>\n        <ion-item>\n          <ion-label position=\"stacked\">ID de Sesión</ion-label>\n          <ion-input type=\"text\"\n                     [(ngModel)]=\"meetingNumber\"></ion-input>\n        </ion-item>\n        <ion-item>\n          <ion-label position=\"stacked\">Contraseña de Sesión</ion-label>\n          <ion-input type=\"password\"\n                     [(ngModel)]=\"meetingPassword\"></ion-input>\n        </ion-item>\n      </ion-list>\n      <div>\n        <ion-button expand=\"full\"\n                    (click)=\"joinMeeting()\"\n                    shape=\"round\">\n          <ion-icon slot=\"start\"\n                    name=\"videocam\"></ion-icon>\n          Iniciar mi sesión\n        </ion-button>\n\n        <hr>\n        <ion-button expand=\"full\"\n                    (click)=\"  callToKevin()\"\n                    shape=\"round\"\n                    color=\"dark\">\n          <ion-icon slot=\"start\"\n                    name=\"videocam\"></ion-icon>\n          Llamar a Kevin\n        </ion-button>\n      </div>\n      <!-- <div>\n        <ion-button expand=\"full\"\n                    (click)=\"startMeetingWithZAK()\">Start a Meeting with ZAK</ion-button>\n      </div> -->\n    </ion-card-content>\n  </ion-card>\n  <!-- <ion-card>\n    <ion-card-header color=\"primary\">\n      Change the meeting language\n    </ion-card-header>\n    <ion-card-content padding>\n      <ion-list>\n        <ion-item>\n          <ion-label position=\"stacked\">Languages</ion-label>\n          <ion-select [(ngModel)]=\"language\">\n            <ion-select-option value=\"en-US\">English</ion-select-option>\n            <ion-select-option value=\"zh-CN\">Simplified Chinese</ion-select-option>\n            <ion-select-option value=\"ja-JP\">Japanese</ion-select-option>\n            <ion-select-option value=\"de-DE\">German</ion-select-option>\n            <ion-select-option value=\"fr-FR\">French</ion-select-option>\n            <ion-select-option value=\"zh-TW\">Traditional Chinese</ion-select-option>\n            <ion-select-option value=\"es-419\">Spanish</ion-select-option>\n            <ion-select-option value=\"ru-RU\">Russian</ion-select-option>\n            <ion-select-option value=\"pt-PT\">Portuguese</ion-select-option>\n          </ion-select>\n        </ion-item>\n      </ion-list>\n      <div>\n        <ion-button expand=\"full\"\n                    (click)=\"setLanguage()\">\n          Change the Language\n        </ion-button>\n      </div>\n    </ion-card-content>\n  </ion-card> -->\n</ion-content>"

/***/ }),

/***/ "./src/app/non-login/non-login.page.scss":
/*!***********************************************!*\
  !*** ./src/app/non-login/non-login.page.scss ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL25vbi1sb2dpbi9ub24tbG9naW4ucGFnZS5zY3NzIn0= */"

/***/ }),

/***/ "./src/app/non-login/non-login.page.ts":
/*!*********************************************!*\
  !*** ./src/app/non-login/non-login.page.ts ***!
  \*********************************************/
/*! exports provided: NonLoginPage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NonLoginPage", function() { return NonLoginPage; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var _ionic_native_zoom_ngx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ionic-native/zoom/ngx */ "./node_modules/@ionic-native/zoom/ngx/index.js");
/* harmony import */ var _cometchat_pro_cordova_ionic_chat__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @cometchat-pro/cordova-ionic-chat */ "./node_modules/@cometchat-pro/cordova-ionic-chat/CometChat.js");
/* harmony import */ var _cometchat_pro_cordova_ionic_chat__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_cometchat_pro_cordova_ionic_chat__WEBPACK_IMPORTED_MODULE_4__);





var NonLoginPage = /** @class */ (function () {
    function NonLoginPage(toastCtrl, zoomService) {
        this.toastCtrl = toastCtrl;
        this.zoomService = zoomService;
        // Token variables (Retrieve from Rest API)
        this.zoomToken = '';
        this.zoomAccessToken = '';
        this.userId = '';
        // Meeting variables
        this.meetingNumber = null;
        this.meetingPassword = '';
        this.displayName = 'Mind2 Demo';
        this.language = 'en-US';
    }
    NonLoginPage.prototype.presentToast = function (text) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var toast;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toastCtrl.create({
                            message: text,
                            duration: 3000,
                            position: 'top'
                        })];
                    case 1:
                        toast = _a.sent();
                        toast.present();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Join a meeting.
     */
    NonLoginPage.prototype.joinMeeting = function () {
        var _this = this;
        console.log('Going to join meeting');
        // Prepare meeting option
        var options = {
            no_driving_mode: true,
            no_invite: true,
            no_meeting_end_message: true,
            no_titlebar: false,
            no_bottom_toolbar: false,
            no_dial_in_via_phone: true,
            no_dial_out_to_phone: true,
            no_disconnect_audio: true,
            no_share: true,
            no_audio: true,
            no_video: true,
            no_meeting_error_message: true
        };
        // Call join meeting method.
        this.zoomService.joinMeeting(this.meetingNumber, this.meetingPassword, this.displayName, options)
            .then(function (success) {
            console.log(success);
            _this.presentToast(success);
            _this.meetingNumber = null;
            _this.meetingPassword = null;
        }).catch(function (error) {
            console.log(error);
            _this.presentToast(error);
        });
    };
    /**
     * Start an existing meeting with ZAK.
     */
    NonLoginPage.prototype.startMeetingWithZAK = function () {
        var _this = this;
        console.log('Going to start meeting with ZAK');
        // Prepare meeting option
        var options = {};
        // Call start meeting method
        this.zoomService.startMeetingWithZAK(this.meetingNumber, this.displayName, this.zoomToken, this.zoomAccessToken, this.userId, options).then(function (success) {
            console.log(success);
            _this.presentToast(success);
            _this.meetingNumber = null;
            _this.meetingPassword = null;
        }).catch(function (error) {
            console.log(error);
            _this.presentToast(error);
        });
    };
    /**
     * Change the in-meeting language.
     */
    NonLoginPage.prototype.setLanguage = function () {
        var _this = this;
        this.zoomService.setLocale(this.language).then(function (success) {
            console.log(success);
            _this.presentToast(success);
        }).catch(function (error) {
            console.log(error);
            _this.presentToast(error);
        });
    };
    /**
     * Init CometChat Call
    */
    NonLoginPage.prototype.callToKevin = function () {
        var receiverID = "user3";
        var callType = _cometchat_pro_cordova_ionic_chat__WEBPACK_IMPORTED_MODULE_4__["CometChat"].CALL_TYPE.VIDEO;
        var receiverType = _cometchat_pro_cordova_ionic_chat__WEBPACK_IMPORTED_MODULE_4__["CometChat"].RECEIVER_TYPE.USER;
        var call = new _cometchat_pro_cordova_ionic_chat__WEBPACK_IMPORTED_MODULE_4__["CometChat"].Call(receiverID, callType, receiverType);
        _cometchat_pro_cordova_ionic_chat__WEBPACK_IMPORTED_MODULE_4__["CometChat"].initiateCall(call).then(function (outGoingCall) {
            console.log("Call initiated successfully:", outGoingCall);
            // perform action on success. Like show your calling screen.
        }, function (error) {
            console.log("Call initialization failed with exception:", error);
        });
    };
    NonLoginPage = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'page-nonlogin',
            template: __webpack_require__(/*! ./non-login.page.html */ "./src/app/non-login/non-login.page.html"),
            styles: [__webpack_require__(/*! ./non-login.page.scss */ "./src/app/non-login/non-login.page.scss")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_ionic_angular__WEBPACK_IMPORTED_MODULE_2__["ToastController"],
            _ionic_native_zoom_ngx__WEBPACK_IMPORTED_MODULE_3__["Zoom"]])
    ], NonLoginPage);
    return NonLoginPage;
}());



/***/ })

}]);
//# sourceMappingURL=non-login-non-login-module.js.map