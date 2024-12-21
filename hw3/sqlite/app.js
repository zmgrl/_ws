import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT)");


const router = new Router();

router .get('/', userList) 
  .get('/:user/', list) 
  .get('/:user/post/new', add)
  .get('/:user/post/:id', show)
  .post('/:user/post', create); 

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

function query(sql, args=[]) {
  let list = []
  for (const [id, user, title, body] of db.query(sql, args)) {
    list.push({id, user, title, body})
  }
  return list
}

async function userList(ctx) {
  ctx.response.body = await render.userList(Object.keys(posts));
  ctx.response.body = await render.userList(posts);
}

async function list(ctx) {
  let posts = query("SELECT id, title, body FROM posts WHERE user = ?", [user])
  console.log('list:posts=', posts)
  ctx.response.body = await render.list(user,posts);
}

async function add(ctx) {
  const user =ctx.param.user
  console.log("add:user=", user)
  ctx.response.body = await render.newPost();
}

async function show(ctx) {
  const user =ctx.param.user
  const pid = ctx.params.id
  let posts = query(`SELECT id, title, body FROM posts WHERE id=${pid}`)
  let post = posts[0]
  console.log('show:post=', post)
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(post);
}

async function create(ctx) {
  const user =ctx.paaram.user
  const body = ctx.request.body
  if (body.type() === "form") {
    const pairs = await body.form()
    const post = {}
    for (const [key, value] of pairs) {
      post[key] = value
    }
    let posts = query(`SELECT id, title, body FROM posts WHERE user=?`, [user])
    if (!posts[user]) {
      posts[user] = []
    }
    console.log('create:post=', post)
    db.query("INSERT INTO posts (user, title, body) VALUES (?, ?, ?)", [user, post.title, post.body]);
    ctx.response.redirect(`/${user}`);
  }
}

let port = parseInt(Deno.args[0])
console.log(`Server run at http://127.0.0.1:8000`)
await app.listen({ port : 8000});