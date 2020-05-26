import { Injectable } from '@angular/core';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { COMETCHAT } from "./keys";

@Injectable({
  providedIn: 'root'
})
export class CometChatService {

  apiKey = COMETCHAT.APIKEY;
  constructor() { }

  public

  public createCCUser(user, role) {
    let userData = new CometChat.User(user.cometChatId)
    userData.setName(`${user.name} ${user.last_name}`)
    userData.setRole(role)
    return CometChat.createUser(userData, this.apiKey)
  }
}
