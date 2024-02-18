// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;

// choose your teams https://www.fotmob.com
const firstTeamId = REPLACE_ME;
const secondTeamId = REPLACE_ME;

function formatNumber(value) {
  return value < 10 ? '0' + value : value;
}

function formatDate(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();

  const daysAbbrev = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

  return `${daysAbbrev[date.getDay()]} ${formatNumber(day)}.${formatNumber(month)} ${formatNumber(hour)}:${formatNumber(minute)}`;
}

async function fetchData(teamId) {
  const request = new Request(`https://www.fotmob.com/api/teams?id=${teamId}&timeZone=Europe/Berlin`);
  const response = await request.loadJSON();
  const nextMatch = response?.overview?.nextMatch;
  if(nextMatch) { 
    return { home: nextMatch.home.name, away: nextMatch.away.name, tournament: nextMatch.tournament.name, utcTime: nextMatch.status.utcTime }
  }
  return null
}

const nextMatchTeamOne = await fetchData(firstTeamId);
const nextMatchTeamTwo = await fetchData(secondTeamId);

const textColor = Color.dynamic(Color.black(), Color.white());
const secondColor = Color.lightGray();

let widget = new ListWidget();

function addMatch(widget, match) {
  let horizontalStack = widget.addStack();

  let lineStack = horizontalStack.addStack();
  lineStack.layoutVertically();
  let lineHeight = 65;
  let lineWidth = 3;
  lineStack.size = new Size(lineWidth, lineHeight);
  lineStack.backgroundColor = secondColor;

  horizontalStack.addSpacer(8);

  let textStack = horizontalStack.addStack();
  textStack.layoutVertically();

  const font = Font.regularSystemFont(13);
  const fontBold = Font.boldSystemFont(13);
  
  if(match && match.home && match.away && match.utcTime && match.tournament) {
    let homeText = textStack.addText(match.home);
    homeText.font = font;
    homeText.lineLimit = 1;

    let awayText = textStack.addText(match.away);
    awayText.font = font;
    awayText.lineLimit = 1;

    let matchDate = formatDate(new Date(match.utcTime))

    let dateText = textStack.addText(`${matchDate}`);
    dateText.font = fontBold;
    dateText.lineLimit = 1;

    let tournamentText = textStack.addText(`${match.tournament}`);
    tournamentText.font = Font.systemFont(11);
    tournamentText.lineLimit = 1;
  }
  else {
    let homeText = textStack.addText("No data");
    homeText.font = font;
  }
}

addMatch(widget, nextMatchTeamTwo)
widget.addSpacer(8);
addMatch(widget, nextMatchTeamOne)

let nextUpdate = Date.now() + 1000 * 60 * 60 * 6; // 6 hours
widget.refreshAfterDate = new Date(nextUpdate);

Script.setWidget(widget);
Script.complete();

widget.presentSmall();
