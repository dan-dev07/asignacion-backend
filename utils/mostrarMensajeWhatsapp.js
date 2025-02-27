const mostrarDatosEntradaWhatsapp = (data) => {
  // Arreglo para almacenar los datos extraídos
  const result = [];

  try {

    // Extraemos los datos principales
    data.entry.forEach(entry => {
      entry.changes.forEach(change => {
        const value = change.value;

        // Datos principales de la entrada
        result.push({
          object: data.object,
          entryId: entry.id,
          messagingProduct: value.messaging_product,
          displayPhoneNumber: value.metadata.display_phoneNumber,
          phoneNumberId: value.metadata.phone_number_Id
        });

        // Extraemos los contactos
        // value.contacts.forEach(contact => {
        //   result.push({
        //     contactName: contact.profile.name,
        //     waId: contact.wa_id
        //   });
        // });

        // Extraemos los mensajes
        value.messages.forEach(message => {
          result.push({
            from: message.from,
            messageId: message.id,
            timestamp: message.Timestamp,
            type: message.type,
            [message.type]: [message.type].id
          });
        });
      });
    });
  } catch (error) {
    console.log(error);
  }

  // Mostrar el arreglo en consola
  // console.log('mostrarDatosArreglo',result);
};

module.exports = {
  mostrarDatosEntradaWhatsapp,
};