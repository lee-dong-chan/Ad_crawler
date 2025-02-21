import axios from "axios";
import puppeteer from "puppeteer";

const reviewCheck = async (id) => {
  const siteURL = `https://apps.apple.com/kr/app/${id}?see-all=reviews`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(siteURL, { waitUntil: "networkidle2", timeout: 60000 });

  const selector = ".see-all-header__link.link";

  await page.waitForSelector(selector, { timeout: 5000 });

  const Title = await page.$eval(selector, (el) => el.textContent.trim());

  await browser.close();

  // 앱스토어 이동 alert 문제로 오류 발생

  const reviews = [];
  for (let i = 1; i < 10; i++) {
    const reviewapi = await axios.get(
      `https://itunes.apple.com/kr/rss/customerreviews/page=${i}/id=${id}/json`
    );
    const data = reviewapi.data;

    if (!data.feed || !data.feed.entry) {
      console.log(`last Page ${i}`);
      break;
    }
    const Review = data.feed.entry.map((item) => {
      return item.content.label.replace(/[\n]+/g, " ");
    });
    reviews.push(...Review);
  }

  const filterWord = [
    "사기 게임",
    "구라",
    "낚시",
    "허위",
    "사기",
    "양산형",
    "중국산",
    "쓰레기 게임",
    "사기 광고",
    "과장 광고",
    "낚시 광고",
    "광고랑 다름",
    "가짜 게임",
    "가짜게임",
    "사기 게임",
    "광고랑 다른게임",
  ];

  let ADscore = 0;

  reviews.forEach((item) => {
    const match = filterWord.some((keyword) => item.includes(keyword));

    if (match) {
      ++ADscore;
    }
  });

  console.log(ADscore);
  if (ADscore < 5) {
    return { title: Title, Ad_result: true };
  } else {
    return { title: Title, Ad_result: false };
  }
};

export default reviewCheck;
