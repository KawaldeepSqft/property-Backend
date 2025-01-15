export const SendSMS = (contact, message, DltTempId) => {
  const url = "https://lsq.pinnacle.in/api/v1/smsjsonmessage";

  const payload = {
    sender: process.env.PINNACLE_SENDER, // Ensure this is your APPROVED sender ID
    message: [
      {
        number: contact, // Ensure this is a valid phone number
        text: message, // Your SMS content
      },
    ],
    messagetype: "TXT", // Use 'TXT' for text messages
    dltentityid: process.env.DLT_ENTITY_ID,
    dlttempid: DltTempId,

    dltheaderid: process.env.DLT_HEADER_ID,

    tmid: process.env.DLT_HEADER_ID,
  };
  return fetch(url, {
    method: "POST",
    headers: {
      apikey: process.env.PINNACLE_API_KEY, // Ensure the API key is valid
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
