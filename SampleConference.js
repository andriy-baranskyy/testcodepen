"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("./Client");
const SessionInviteRejectReason_1 = require("../Interfaces/SessionInviteRejectReason");
const ISession_1 = require("../Interfaces/ISession");
class SampleConference {
    async register() {
        if (this.client != null) {
            throw new Error("Client is already registered");
        }
        this.client = new Client_1.Client("sample_token");
        this.client.onConferenceInvite = (_client, conferenceInvite) => {
            var accept = false;
            if (this.activeConference) {
                accept = confirm('You have been invited to join conference ' + conferenceInvite.id + '. Place current conference on hold?');
                if (accept) {
                    this.activeConference.hold();
                }
            }
            else {
                conferenceInvite.playDeviceStreams({ camera: true, microphone: false });
                accept = confirm('You have been invited to join conference ' + conferenceInvite.id + '. Place current conference on hold?');
            }
            if (accept) {
                var video = false;
                var remoteVideo = conferenceInvite.hasVideo;
                if (remoteVideo) {
                    video = confirm('Enable video for this conference?');
                }
                this.activeConference = conferenceInvite.acceptWithDeviceStream({ camera: video });
            }
            else {
                conferenceInvite.reject();
            }
        };
        return this.client.connect();
    }
    async joinConference() {
        var join = false;
        if (this.activeConference) {
            if (confirm('Place current conference on hold?')) {
                this.activeConference.hold();
                join = true;
            }
        }
        if (join) {
            var id = prompt("Enter conference ID:");
            if (id) {
                var newConference = await this.client.join(id);
                this.setActiveConference(newConference);
                if (this.activeConference.state == ISession_1.SessionState.Connected) {
                    alert("Connected to conference " + id);
                }
                else {
                    if (this.activeConference.error) {
                        alert("Could not connect to conference: " + this.activeConference.error.message);
                    }
                    else {
                        alert("Could not connect to conference. ");
                    }
                }
            }
        }
    }
    setActiveConference(newConference) {
        newConference.onIncomingMessage = (_conference, message) => {
            alert(message.senderId + ": " + message.stringMessage);
        };
        this.activeConference = newConference;
    }
    leave() {
        if (this.activeConference) {
            this.activeConference.leave();
        }
    }
    toggleScreenshare() {
        var _a, _b, _c;
        if (this.activeConference) {
            var display = (_a = this.activeConference.me) === null || _a === void 0 ? void 0 : _a.screenStream.display;
            if ((_b = display) === null || _b === void 0 ? void 0 : _b.isEnabled) {
                display.disable();
            }
            else {
                (_c = display) === null || _c === void 0 ? void 0 : _c.enable();
            }
        }
    }
    toggleCamera() {
        var _a, _b, _c;
        if (this.activeConference) {
            var camera = (_a = this.activeConference.me) === null || _a === void 0 ? void 0 : _a.deviceStream.camera;
            if ((_b = camera) === null || _b === void 0 ? void 0 : _b.isEnabled) {
                camera.disable();
            }
            else {
                (_c = camera) === null || _c === void 0 ? void 0 : _c.enable();
            }
        }
    }
    message() {
        if (this.activeConference) {
            var msg = prompt("Enter your message: ");
            if (msg) {
                this.activeConference.sendMessage({ stringMessage: msg });
            }
        }
    }
    inviteToConference() {
        if (this.activeConference) {
            var user = prompt("Enter the ID of the user you would like to call");
            if (user) {
                var invite = this.activeConference.inviteUser(user);
                invite.startDeviceStream();
                invite.autoplayDeviceCameraStreams = true;
                invite.autoplayDeviceMicrophoneStreams = true;
                invite.accepted().then((_session) => {
                    alert(user + " joined conference.");
                }).catch(() => {
                    var reason = invite.rejectReason;
                    if (reason == SessionInviteRejectReason_1.SessionInviteRejectReason.Busy) {
                        alert("Invite to " + user + " rejected. User busy.");
                    }
                    else if (reason == SessionInviteRejectReason_1.SessionInviteRejectReason.Incompatible) {
                        alert("Invite to " + user + " rejected. Incompatible setup.");
                    }
                    else {
                        alert("Invite to " + user + " rejected.");
                    }
                });
            }
        }
    }
}
exports.SampleConference = SampleConference;
;
