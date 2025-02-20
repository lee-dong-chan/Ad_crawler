import axios from "axios";
import puppeteer from "puppeteer";

const reviewCheck = async (id) => {
  const siteURL = `https://apps.apple.com/kr/app/${id}?`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(siteURL);

  // const reviews = await page.evaluate(() => {
  //   const textelements = document.querySelectorAll(
  //     ".we-truncate.we-truncate--multi-line.we-truncate--interactive.we-truncate--truncated.we-customer-review__body"
  //   );

  //   // // 필터링 보완 필요

  //   return Array.from(textelements).map((element, idx) => {
  //     let content = element.textContent
  //       .replace(/\s*더 보기\s*$/, "")
  //       .replace(/[\n\s]+/g, " ")
  //       .trim();

  //     //   let badScore = 0;
  //     //   const match = filterWord.test(content);
  //     //   if (match) {
  //     //     badScore += 1;
  //     //   }
  //     //   return badScore;
  //     return content;

  //   });
  // });
  await page.waitForSelector("h1");

  const Title = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (h1) {
      const data = h1.textContent.replace(/[\n\s]+/g, " ").trim();
      const endpoint = data.indexOf("+") - 2;
      return data.slice(0, endpoint);
    } else {
      console.log("not fount title");
    }
  });

  await browser.close();

  // const score = reviews.reduce((a, b) => a + b, 0);

  // if (score > 1) {
  //   return 0;
  // } else {
  //   return 1;
  // }

  const reviewapi = await axios.get(
    `https://itunes.apple.com/kr/rss/customerreviews/id=${id}/json`
  );

  const data = reviewapi.data;

  const reviews = data.feed.entry.map((item) => {
    return item.content.label.replace(/[\n]+/g, " ");
  });

  const filterWord = [
    "낚시",
    "허위",
    "사기 광고",
    "과장 광고",
    "낚시 광고",
    "광고랑 전혀 다름",
    "가짜 게임",
    "광고랑 다른 게임",
  ];

  let ADscore = 0;

  reviews.forEach((item) => {
    const match = filterWord.some((keyword) => item.includes(keyword));
    if (match) {
      ++ADscore;
    }
  });

  if (ADscore < 5) {
    return { title: Title, Ad_result: true };
  } else {
    return { title: Title, Ad_result: false };
  }
};

export default reviewCheck;
