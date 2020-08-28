const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const ObjectsToCsv = require("objects-to-csv");

// id = 96460
// https://dol.nebraska.gov/conreg/Contractor/Details/${id}20

const scrapeLic = async (id, page) => {
  const html = await page.content();
  const $ = cheerio.load(html);

  try {
    const bizName = $(
      "#printPage > div.usa-grid-full.contractor-search-details > div > table > tbody > tr:nth-child(1) > td"
    )
      .text()
      .trim();
    const address = $(
      "#printPage > div.usa-grid-full.contractor-search-details > div > table > tbody > tr:nth-child(4) > td"
    )
      .text()
      .trim();

    const phoneNumber = $(
      "#printPage > div.usa-grid-full.contractor-search-details > div > table > tbody > tr:nth-child(8) > td > span"
    )
      .text()
      .trim();

    const data = {
      lic_num: `${id}-20`,
      businessName: bizName || "N/A",
      address: address || "N/A",
      phoneNumber: phoneNumber || "N/A",
      url: page.url(),
    };

    console.log(`ID# ${id}-20: Found ${data.businessName}`);

    return data;
  } catch (e) {
    console.log("nothing found");
  }
};

const main = async (id, count, csvId) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const results = [];
  let newId = id;
  for (let i = 0; i < count; i++) {
    try {
      await page.goto(
        `https://dol.nebraska.gov/conreg/Contractor/Details/${newId}20`
      );

      const data = await scrapeLic(newId, page);

      results.push(data);
    } catch (e) {
      console.log(`not able to scrape ${newId}20`);
    }

    newId++;
  }

  const csv = new ObjectsToCsv(results);
  await csv.toDisk(`./output${csvId}.csv`);
};

main(00000, 10000, 1);
main(10000, 10000, 2);
main(20000, 10000, 3);
