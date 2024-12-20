import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'

const posts = {
  ccc:[{id:0, title:'ccc1', body:'ccc1', created_at:new Date()}],
  ccc1:[]
};

const router = new Router();

router .get('/', userList) // 根據不同用戶顯示貼文列表
  .get('/:user/', list) // 根據不同用戶顯示貼文列表
  .get('/:user/post/new', add) // 顯示新增貼文的表單
  .get('/:user/post/:id', show) // 顯示特定 id 的貼文
  .post('/:user/post', create); // 提交新貼文

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

async function userList(ctx) {
  ctx.response.body = await render.userList(Object.keys(posts));
}

async function list(ctx) {
  const user = ctx.params.user;
  console.log('user=', user);
  console.log('posts[user]=', posts[user]);
  if(!posts[user]){
    posts[user] = [];
  }
  console.log('posts[user]=', posts[user]);
  ctx.response.body = await render.list(user, posts[user]);
}

async function add(ctx) {
  const user = ctx.params.user;
  console.log('add user=', user);
  ctx.response.body = await render.newPost(user);
}

async function show(ctx) {
  const user = ctx.params.user;
  const id = ctx.params.id;
  const userPost = posts[user];
  const post = userPosts ? userPosts[id] : null;
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(user, post);
}

async function create(ctx) {
  const user = ctx.request.user;
  const body = ctx.request.body;
  if (body.type() === "form") {
    const pairs = await body.form(); // body.value
    const post = {};
    for (const [key, value] of pairs) {
      post[key] = value;
    }
    console.log('post=', post);
    if(!posts[user]){
        posts[user] = [];
    }
    const id = posts[user].push(post) - 1;
    post.created_at = new Date();
    post.id = id;
    ctx.response.redirect('/${user}/');
  }
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });