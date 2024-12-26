import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS leaderboard (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, score INTEGER, player TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, player TEXT)");

const router = new Router();

router.get('/', list)
  .get('/signup', signupUi) 
  .post('/signup', signup)
  .get('/login', loginUi)
  .post('/login', login)
  .get('/logout', logout)
  .get('/scoreboard/new', addScore) 
  .get('/scoreboard/:game', listScores)
  .post('/scoreboard', submitScore)
  .get('/mole', async (ctx) => {
    ctx.response.body = render.Mole();
  }); 

const app = new Application()
app.use(Session.initMiddleware())
app.use(router.routes());
app.use(router.allowedMethods());

function sqlcmd(sql, arg1) {
  console.log('sql:', sql)
  try {
    var results = db.query(sql, arg1)
    console.log('sqlcmd: results=', results)
    return results
  } catch (error) {
    console.log('sqlcmd error: ', error)
    throw error
  }
}

function userQuery(sql) {
  let list = []
  for (const [id, username, password, player] of sqlcmd(sql)) {
    list.push({id, username, password, player})
  }
  console.log('userQuery: list=', list)
  return list
}

function leaderboardQuery(sql, args) {
  try {
    const results = db.query(sql, args);
    return results.map(([username, player, score]) => ({ username, player, score }));
  } catch (error) {
    console.log('leaderboardQuery error:', error);
    throw error;
  }
}


async function listScores(ctx) {
  const game = ctx.params.game;
  const leaderboard = leaderboardQuery(`
    SELECT username, player, MAX(score) AS score
    FROM leaderboard
    WHERE player = ?
    GROUP BY username
    ORDER BY score DESC;
  `, [game]);

  if (leaderboard.length === 0) {
    ctx.response.body = render.fail(); // 當查詢無結果時，顯示錯誤
  } else {
    ctx.response.body = await render.listScoresByGame(leaderboard, await ctx.state.session.get('user'), game);
  }
}


async function parseFormBody(body) {
  const pairs = await body.form()
  const obj = {}
  for (const [key, value] of pairs) {
    obj[key] = value
  }
  return obj
}

async function list(ctx) {
  let leaderboard = leaderboardQuery("SELECT id, username, score, player FROM leaderboard", []);
  ctx.response.body = await render.list(leaderboard, await ctx.state.session.get('user'));
}

async function signupUi(ctx) {
  ctx.response.body = await render.signupUi();
}

async function signup(ctx) {
  const body = ctx.request.body; 
  if (body.type === "form") { 
    const user = await parseFormBody(body);
    console.log('user=', user);
    const dbUsers = userQuery(`SELECT id, username, password, player FROM users WHERE username='${user.username}'`);
    console.log('dbUsers=', dbUsers);
    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users (username, password, player) VALUES (?, ?, ?)", [user.username, user.password, user.player]);
      ctx.response.body = render.success();
    } else {
      ctx.response.body = render.fail();
    }
  }
}


async function loginUi(ctx) {
  ctx.response.body = await render.loginUi();
}

async function login(ctx) {
  const body = ctx.request.body;
  if (body.type() === "form") {
    var user = await parseFormBody(body);
    var dbUsers = userQuery(`SELECT id, username, password, player FROM users WHERE username='${user.username}'`);
    var dbUser = dbUsers[0];
    if (dbUser && dbUser.password === user.password) {
      ctx.state.session.set('user', user);
      console.log('session.user=', await ctx.state.session.get('user'));
      ctx.response.redirect('/');
    } else {
      ctx.response.body = render.fail();
    }
  }
}


async function logout(ctx) {
   ctx.state.session.set('user', null)
   ctx.response.redirect('/')
}

async function addScore(ctx) {
  const user = await ctx.state.session.get('user'); // 獲取用戶會話數據
  if (!user) {
    ctx.response.body = render.fail("User not logged in.");
    return;
  }

  const body = ctx.request.body(); 
  if (body.type !== "form") {
    ctx.response.body = render.fail("Invalid request format.");
    return;
  }

  const formData = await body.value; 
  const score = parseInt(formData.get('grade'), 10); 
  const player = formData.get('player'); 

  if (isNaN(score) || !player) {
    ctx.response.body = render.fail("Invalid score or player.");
    return;
  }

  // 將分數存入資料庫
  sqlcmd("INSERT INTO leaderboard (username, score, player) VALUES (?, ?, ?)", [user.username, score, player]);

  // 獲取並返回最新排行榜
  const leaderboard = leaderboardQuery(`
    SELECT username, player, MAX(score) AS score
    FROM leaderboard
    WHERE player = ?
    GROUP BY username
    ORDER BY score DESC;
  `, [player]);

  ctx.response.body = await render.listScoresByGame(leaderboard, user, player);
}

async function submitScore(ctx) {
  const body = ctx.request.body;
  if (body.type === "form") {
    const formData = await body.value;
    const score = parseInt(formData.get('score'), 10);
    const player = formData.get('player');
    const user = await ctx.state.session.get('user');
    if (user) {
      sqlcmd("INSERT INTO leaderboard (username, score, player) VALUES (?, ?, ?)", [user.username, score, player]);
      ctx.response.redirect(`/scoreboard/${player}`);
    } else {
      ctx.response.body = render.fail("User not logged in.");
    }
  }
}




console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });