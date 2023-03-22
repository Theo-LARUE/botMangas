const puppeteer = require("puppeteer");

const SECOND = 60,
  MINUTE = 60,
  HOUR = 24,
  WAITING = 2000,
  DAY = 1000 * SECOND * MINUTE * HOUR,
  mangas_fav = ["", ""];

// setTimeout function
function waiting_times(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// function to bind Twilio Token
function send_notification(message) {
  const accountSid = "ACc05555f895555561ce1eb108407d6629";
  const authToken = "e047d9ebe175c836fffaec95afe3d3c1";
  const client = require("twilio")(accountSid, authToken);

  client.messages.create({
    body: message,
    from: "+33",
    to: "+330650806384",
  });
}

async function check_releases() {
  // launch Chrome webApp
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // go to the home page website
  await page.goto("https://www.mangacollec.com/");
  await waiting_times(WAITING);

  // go to the log in page
  await page.click('a[href="/users/sign_in"]');
  await waiting_times(WAITING);

  // insert input to log in
  await page.click('input[type="email"]');
  await page.type('input[type="email"]', "theo.larue@hotmail.com");

  await page.click('input[type="password"]');
  await page.type('input[type="password"]', "theoloan78");

  await page.click('div[data-testid="login-submit"]');
  await waiting_times(WAITING);

  // go to the planning page
  await page.goto("https://www.mangacollec.com/planning-perso");
  await waiting_times(WAITING);

  // await page.click("#new_release");
  // await waiting_times(WAITING);
  // await page.click("#next_release");
  // await waiting_times(WAITING);

  // let mangas_collection = [];
  // for (let manga_fav of mangas_fav) {
  //   if (await page.$eval(manga_fav, (el) => el.disabled === false)) {
  //     mangas_collection.push(manga_fav);
  //   }
  // }

  // if (mangas_collection.length > 0) {
  //   mangas_collection = mangas_collection.map((date) =>
  //     date.replace("DATE TOME", "").replace(/(\d{4})(\d{2})(\d{2})/, "$3/$2/$1")
  //   );
  //   await send_notification("TXT" + mangas_collection.join(", ") + "TXT");
  // } else {
  //   console.log("Aucune sortie de tome disponible");
  // }

  // await browser.close();
}

// check all day at the same time
check_releases();
setInterval(check_releases, DAY);
