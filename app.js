const express = require("express");
const moment = require("moment");
const { Client } = require("@notionhq/client");

const date = moment();

const app = express();
app.use(express.json());

app.use(express.static("public"));

const notion = new Client({
  auth: "secret_cNgYtrqsHJTbXWe8GXHN0jzbj1g2uvYLtnrk4VVu5qP",
});

async function checkTask(nameTaks) {
  const myPage = await notion.databases.query({
    database_id: "611be6247502429a86ddaaac97726ba1",
    filter: {
      property: "Name",
      rich_text: {
        contains: nameTaks,
      },
    },
  });

  const pageID = myPage.results[0].id;

  const response = await notion.pages.update({
    page_id: pageID,
    properties: {
      Чекбокс: {
        checkbox: true,
      },
    },
  });

  return response;
}

async function getAllTasks() {
  const myPage = await notion.databases.query({
    database_id: "611be6247502429a86ddaaac97726ba1",
    filter: {
      and: [
        {
          property: "Дата",
          date: {
            equals: date.format("YYYY-MM-DD"),
          },
        },
        {
          property: "Чекбокс",
          checkbox: {
            equals: false,
          },
        },
      ],
    },
  });

  const test = myPage.results.map(
    (item) => item.properties.Name.title[0].text.content
  );

  // const test = myPage.results.map((item) => {
  //   const allMonth = item.properties.Month.title[0].text.content;
  //   const allMonthLink = item.url;

  //   return {
  //     name: allMonth,
  //     link: allMonthLink,
  //   };
  // });

  // const currentMonth = urkMonth[date.getMonth()];

  // const foundMonth = test.find((month) => month.name === currentMonth).link;
  // const rewLink = foundMonth.split("/")[3];

  return test;
}

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.get("/api/tasks", async function (req, res) {
  const tasks = await getAllTasks();
  res.send(tasks);
});

app.post("/api/checkbox", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const nameTaks = req.body.nameTaks;

  const resp = await checkTask(nameTaks);

  res.send(resp);
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});

module.exports = app;
