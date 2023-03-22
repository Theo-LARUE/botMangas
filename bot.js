require("dotenv").config();
const axios = require("axios");
const moment = require("moment");
const cron = require("node-cron");

// fucntion to get the access token from Mangacollec
const getToken = () => {
  return axios
    .post(
      "https://api.mangacollec.com/oauth/token",
      {
        client_id: process.env["MANGACOLLEC_CLIENT_ID"],
        client_secret: process.env["MANGACOLLEC_CLIENT_SECRET"],
        grant_type: "password",
        username: process.env["MANGACOLLEC_USERNAME"],
        password: process.env["MANGACOLLEC_PASSWORD"],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then(function (rsp) {
      return rsp.data.access_token;
    })
    .catch(function (err) {
      console.log("TOKEN ERROR " + err);
    });
};

// function to get my personal collection mangas from Mangacollec
const getCollection = (token) => {
  return axios
    .get("https://api.mangacollec.com/v2/users/me/collection", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then(function (rsp) {
      return rsp.data;
    })
    .catch(function (err) {
      console.log("COLLECTION ERROR " + err);
    });
};

// function to bind Twilio's Token
function send_notification(message) {
  const accountSid = process.env["TWILIO_ACCOUNT_SID"];
  const authToken = process.env["TWILIO_AUTH_TOKEN"];
  const client = require("twilio")(accountSid, authToken);

  client.messages.create({
    body: message,
    from: process.env["TWILIO_PHONE_NUMBER"],
    to: process.env["PERSONNAL_PHONE_NUMBER"],
  });
}

// function to check if the user has a collection
async function check_releases() {
  let token = await getToken();
  let collection = await getCollection(token);

  let currentDate = moment().format("YYYY-MM-DD");
  // let currentDate = "2023-04-05";

  const releasedMangas = collection.volumes.filter(
    (item) => item.release_date === currentDate
  );
  for (let releasedManga of releasedMangas) {
    const edition = collection.editions.find(
      (item) => item.id === releasedManga.edition_id
    );
    const serie = collection.series.find(
      (item) => item.id === edition.series_id
    );
    releasedManga.title = serie.title;
  }

  //send notifaction if there are any mangas released
  (await releasedMangas.length) > 0
    ? send_notification(
        `\n Vous avez ${
          releasedMangas.length
        } tome(s) de disponible dès aujourd'hui :\n\n${releasedMangas
          .map((item) => item.title + " - Tome " + item.number)
          .join("\n")}`
      )
    : console.log("Aucune sortie de tome disponible aujourd'hui");
}

// console.log(releasedMangas);
check_releases();

// execute the function every day at 11:00 am
cron.schedule("0 11 * * *", () => {
  check_releases();
});
