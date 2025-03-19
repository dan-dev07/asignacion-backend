const TemplateText = (number) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {
        "code": "en_US"
      },
    }
  });
  return data;
};

const SampleText = (number, textResponse) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "text",
    "text": {
      "body": textResponse
    }
  });
  return data;
};

const ReplyText = (number, textResponse, id) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "context": {
      "message_id": id
    },
    "type": "text",
    "text": {
      "preview_url": false,
      "body": textResponse
    }
  });
  return data;
};

const SampleImage = (number, id) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "image",
    "image": {
      id,
    }
  });
  return data;
};

const ReplyImage = (number, id) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "context": {
      "message_id": id
    },
    "type": "image",
    "image": {
      "id": "<IMAGE_OBJECT_ID>"
    }
  });
  return data;
};

const SampleAudio = (number, id) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "audio",
    "audio": {
      id
    }
  });
  return data;
};

const SampleVideo = (number) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "audio",
    "video": {
      "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/video_whatsapp.mp4"
    }
  });
  return data;
};

const SampleDocument = (number, id, filename) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "document",
    "document": {
      id,
      filename
    }
  });
  return data;
};
const ReplyDocument = (number, id, filename) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "context": {
      "message_id": message_id
    },
    "type": "document",
    "document": {
      id,
      filename
    }
  });
  return data;
};
const MessageStatus = (id) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "status": "read",
    "message_id": id
  });
  return data;
}

const SampleButton = (number) => {
  const data = JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": number,
    "type": "interactive",
    "interactive": {
      "type": "button",
      "header": {
        "type": "text",
        "text": "Identificación de usuario"
      },
      "body": {
        "text": "¿Confirmas tu registro?"
      },
      "action": {
        "buttons": [
          {
            "type": "reply",
            "reply": {
              "id": "01",
              "title": "Si"
            }
          },
          {
            "type": "reply",
            "reply": {
              "id": "02",
              "title": "No"
            }
          }
        ]
      }
    }
  });
  return data;
};




module.exports = {
  MessageStatus,
  ReplyDocument,
  ReplyImage,
  ReplyText,
  SampleAudio,
  SampleButton,
  SampleDocument,
  SampleImage,
  SampleText,
  SampleVideo,
  TemplateText
};