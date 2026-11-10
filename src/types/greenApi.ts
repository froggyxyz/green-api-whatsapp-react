export interface Credentials {
  idInstance: string
  apiTokenInstance: string
}

export interface Chat {
  phone: string
  chatId: string
  name?: string
}

export interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  timestamp: number
}

export interface GreenNotificationBody {
  typeWebhook: string
  idMessage?: string
  senderData?: {
    chatId?: string
    chatName?: string
    senderName?: string
  }
  messageData?: {
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
    }
    extendedTextMessageData?: {
      text?: string
    }
  }
}

export interface ReceiveNotificationResponse {
  receiptId: number
  body: GreenNotificationBody
}