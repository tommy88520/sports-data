import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import * as dayjs from 'dayjs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getSportData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    const date: any = dayjs().format('YYYY/MM/DD');
    const dateRegex = /\d+/g;
    const dateMatch = date.match(dateRegex);
    const newDate = dateMatch[0] + dateMatch[1] + dateMatch[2];
    const url = `https://www.playsport.cc/livescore.php?aid=3&gamedate=${newDate}&mode=11`;
    const response = await page.goto(url);
    const data = [];
    if (response.status() === 404) {
      console.error('Page not found (404)');
    } else {
      const html = await page.content();
      const $ = cheerio.load(html);
      const individualTeams = [];
      $('.spc_games > .outer-gamebox').map((i, el) => {
        const aTeam = $(el).find('.teamname_highlight').text();
        const flatBet = $(el).find('.game_result span:eq(1)').text();
        const aTeamResultTitle = $(el).find('.st .scorebox tr:eq(1) th').text();

        const hTeamResultTitle = $(el).find('.st .scorebox tr:eq(2) th').text();

        const aTeamResultScore = [];
        const hTeamResultScore = [];
        for (let i = 1; i < 6; i++) {
          aTeamResultScore.push(
            $(el).find(`.st .scorebox tr:eq(1) td:eq(${i})`).text(),
          );
          hTeamResultScore.push(
            $(el).find(`.st .scorebox tr:eq(2) td:eq(${i})`).text(),
          );
        }
        const scoreGap = $(el).find(`.st .scorebox tr:eq(1) td:eq(7)`).text();
        const regex = /[\u4e00-\u9fa5\d]+/g;
        const matches = scoreGap.match(regex);
        if (matches) {
          data.push({
            aTeam,
            flatBet,
            aTeamInfo: {
              team: aTeamResultTitle,
              resultScore: $(el).find(`.st .scorebox tr:eq(1) td:eq(0)`).text(),
              score: aTeamResultScore,
            },
            hTeamInfo: {
              team: hTeamResultTitle,
              resultScore: $(el).find(`.st .scorebox tr:eq(2) td:eq(0)`).text(),
              score: hTeamResultScore,
            },

            allTeamScore: $(el).find(`.st .scorebox tr:eq(1) td:eq(6)`).text(),
            scoreGap: matches[0],
          });

          individualTeams.push({
            team: aTeamResultTitle,
            hTeam: hTeamResultTitle,
            resultScore: $(el).find(`.st .scorebox tr:eq(1) td:eq(0)`).text(),
            score: aTeamResultScore,
          });

          individualTeams.push({
            team: hTeamResultTitle,
            hTeam: hTeamResultTitle,
            resultScore: $(el).find(`.st .scorebox tr:eq(2) td:eq(0)`).text(),
            score: hTeamResultScore,
          });
        }
      });
      console.log(data);
      individualTeams.forEach((e) => {
        e.home = e.team == e.hTeam ? true : false;
      });
      console.log(individualTeams);
    }
    await browser.close();
    return data;
  }

  async updateSportOdds() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    const date: any = dayjs().format('YYYY/MM/DD');
    const dateRegex = /\d+/g;
    const dateMatch = date.match(dateRegex);
    const newDate = dateMatch[0] + dateMatch[1] + dateMatch[2];
    const url = `https://www.playsport.cc/livescore.php?aid=3&gamedate=${newDate}&mode=11`;
    const response = await page.goto(url);
    const data = [];
    if (response.status() === 404) {
      console.error('Page not found (404)');
    }
  }
}
