/* Created by THANANSAN.
 * Copyright (C) 2020 THANANSAN
 */

import {Injectable} from '@angular/core';

const WS_URL = 'URL'


@Injectable()

export class websocket {


  private subject: WebSocket;
  private subscribers = new Map();

  public isWebsocketOpen = false;

  constructor() {
    console.log("MESSAGE : websocket ");
  }

  private listener(message) {
    console.log("MESSAGE : websocket | listener | new message : " + message);

    let len = message.length;
    let i = 0;
    while (i < len) {
      let n = (message.substring(i)).indexOf("{");
      let l = Number(message.substring(i, i + n));
      let msg = message.substring(i + n, i + n + l);
      let jsonMsg = JSON.parse(msg);
      i = i + n + l;
      this.subscribers.get(jsonMsg['10'])(jsonMsg);
    }
  }

  private onError() {
    console.log("ERROR : websocket | onError | Something went wrong in connection");
  }

  private onClose() {
    console.log("MESSAGE : websocket | onClose | connection closed");
  }

  private onOpen() {
    console.log("MESSAGE : websocket | onOpen | Successfully connected to : ", WS_URL);
  }

  send(data) {

    if (!this.isWebsocketOpen)
      return;

    data = JSON.stringify(data);
    let len = data.length;
    data = len.toString() + data;
 
    if (this.subject.readyState === WebSocket.OPEN) {
      this.subject.send(data);
      console.log("MESSAGE : websocket | send | sent : ", data);
    }
    else {
      console.log("ERROR : websocket | send | not connected");
    }
  }

  subscribe(ID, callbackFunction) {
    if (this.subscribers.has(ID)) { // If already subscribed, remove it from the map
      this.subscribers.delete(ID);
    }
    this.subscribers.set(ID, callbackFunction);
  }

  private create(url) {
    try {
      if (!this.subject) {

        let wss = new WebSocket(url);
        let self = this;
        wss.onmessage = function (event) {
          self.listener(event.data);
        };
        wss.onerror = this.onError;
        wss.onclose = this.onClose;
        wss.onopen = this.onOpen;
        wss.addEventListener('close', (event) => this.whenConnectionClosed(), true);
        wss.addEventListener('open', (event) => this.whenConnectionEstablished(), true);
        this.subject = wss;
      }

      else {
        this.forceCloseSocket();

        let wss = new WebSocket(WS_URL);
        let self = this;
        wss.onmessage = function (event) {
          self.listener(event.data);
        };
        wss.onerror = this.onError;
        wss.onclose = this.onClose;
        wss.onopen = this.onOpen;
        wss.addEventListener('close', (event) => this.whenConnectionClosed(), true);
        wss.addEventListener('open', (event) => this.whenConnectionEstablished(), true);
        this.subject = wss;
      }
    }

    catch (e) {
      console.log('ERROR : Websocket | create | ', e);
    }

  }

  protected createWebSocket(){
    this.create(WS_URL)
  }

  setWebsocketStatus(isOpen: boolean){
    /*If
    Websocket open connection=> isOpen = true
    Websocket close / destroyed => isOpen = false
    * */
    this.isWebsocketOpen = isOpen;
    console.log("MESSAGE : websocket | setWebsocketStatus | isWebsocketOpen : ",this.isWebsocketOpen);
  }

  reconnectTryWebSocket() {
    console.log("MESSAGE : websocket | reconnectTryWebSocket");
  }

  whenConnectionEstablished() {
    this.setWebsocketStatus(true);
    console.log("MESSAGE : websocket | whenConnectionEstablished");
  }

  whenConnectionClosed() {
    this.setWebsocketStatus(false);
    console.log("MESSAGE : websocket | whenConnectionClosed");
  }

  forceCloseSocket() {
    console.log("MESSAGE : websocket | forceCloseSocket");
    if (this.subject != null || this.subject != undefined){
      this.subject.close();
      this.subject = undefined;
    }

    this.setWebsocketStatus(false);
  }



}
