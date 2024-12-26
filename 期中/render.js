export function layout(title, content) {
    return `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          padding: 80px;
          font: 16px Helvetica, Arial;
        }
  
        h1 {
          font-size: 2em;
        }
  
        h2 {
          font-size: 1.2em;
        }
  
        #leaderboard {
          margin: 0;
          padding: 0;
        }
  
        #leaderboard li {
          margin: 40px 0;
          padding: 0;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
          list-style: none;
        }
  
        #leaderboard li:last-child {
          border-bottom: none;
        }
  
        input[type=text], input[type=password], textarea {
          border: 1px solid #eee;
          border-top-color: #ddd;
          border-left-color: #ddd;
          border-radius: 2px;
          padding: 15px;
          font-size: .8em;
        }
  
        input[type=text], input[type=password] {
          width: 500px;
        }
      </style>
    </head>
    <body>
      <section id="content">
        ${content}
      </section>
    </body>
    </html>
    `;
  }
  
  export function loginUi() {
    return layout('Login', `
    <h1>Login</h1>
    <form action="/login" method="post">
      <p><input type="text" placeholder="username" name="username"></p>
      <p><input type="password" placeholder="password" name="password"></p>
      <p><input type="submit" value="Login"></p>
      <p>New user? <a href="/signup">Create an account</p>
    </form>
    `)
  }
  
  export function signupUi() {
    return layout('Signup', `
    <h1>Signup</h1>
    <form action="/signup" method="post">
      <p><input type="text" placeholder="username" name="username"></p>
      <p><input type="password" placeholder="password" name="password"></p>
      <p><input type="text" placeholder="player" name="player"></p>
      <p><input type="submit" value="Signup"></p>
    </form>
    `)
  }
  
  export function success() {
    return layout('Success', `
    <h1>Success!</h1>
    You may <a href="/">play the game</a> / <a href="/login">login</a> again !
    `)
  }
  
  export function fail() {
    return layout('Fail', `
    <h1>Fail!</h1>
    You may <a href="/scoreboard">leaderboard</a> or <a href="JavaScript:window.history.back()">go back</a> !
    `)
    }
    
  export function list(leaderboard, user) {
      console.log('list: user=', user)
      let list = []
      for (let player of leaderboard) {
        list.push(`
        <li>
          <h2>${ player.username } -- by ${player.score}</h2>
        </li>
        `)
      }
      let content = `
      <h1>打地鼠</h1>
      <p>${(user==null)?'<a href="/login">Login</a> ':'Welcome '+user.username+', You may <a href="/mole">play the game</a> or <a href="/logout">Logout</a> !'}</p>
      <p>There are <strong>${leaderboard.length}</strong> posts!</p>
      <ul id="leaderboard">
        ${list.join('\n')}
      </ul>
      `
      return layout('Leaderboard', content)
    }

  export function listScoresByGame(leaderboard, game) {
    return layout('Leaderboard', `
      <h1>Leaderboard for ${game}</h1> 
      <table id="leaderboard"> <tr> 
      <th>Rank</th> 
      <th>Username</th> 
      <th>Score</th> </tr> 
      ${leaderboard.map((player, index) => `
        <tr> 
        <td>${index + 1}</td> 
        <td>${player.username}</td> 
        <td>${player.score}</td> 
        </tr> 
        `).join('')}
         </table> `
        );
  }
  
  export function scoreboard() {
    return layout('Submit Score', `
      <h1>Submit Your Score</h1>
      <p>Enter your score to be added to the leaderboard.</p>
      <form action="/scoreboard" method="post">
        <p><input type="text" placeholder="Score" name="score" required></p>
        <p><input type="text" placeholder="Player/Game" name="player" required></p> <!-- Added player/game input -->
        <p><input type="submit" value="Submit"></p>
      </form>
    `);
  }
  export function Mole() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
        .text 
        {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .game-board
        {
          display: grid;
          grid-template-columns: repeat(3, 100px);
          gap: 20px;
        }
        .mole
        {
          width: 100px;
          height: 100px;
          background-color: brown;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .active
        {
          background: blue;
        }
        .btn 
        {
          background-color:#B570D8;
          text-align: center;
          font-size: 30px;
          font-weight: bold;
          border: none;
          padding: 5px 30px;
          display: inline-block;
          cursor: pointer;
          text-decoration: none;
          outline: none;
          color: #fff;
          background-color: #04AA6D;
          border: none;
          border-radius: 8px;
          box-shadow: 0 3px #999;
          margin-right:10px;
        }
        .btn:hover
        {
          background-color: #3e8e41
        }
        .btn:active
        {
          background-color: #3e8e41;
          box-shadow: 0 3px #666;
          transform: translateY(2px);
        }
      </style>
      </head>
      <body>
        <div class="text">
          <h1>打地鼠</h1>
          <h1>
            <label id="time">time: 60</label>
            <span style="margin: 0 20px;">|</span>
            <label id="grade">grade: 0</label><p id="h"><p>
          </h1>
          <div class="game-board">
            <div class="mole" id="mole1"></div>
            <div class="mole" id="mole2"></div>
            <div class="mole" id="mole3"></div>
            <div class="mole" id="mole4"></div>
            <div class="mole" id="mole5"></div>
            <div class="mole" id="mole6"></div>
            <div class="mole" id="mole7"></div>
            <div class="mole" id="mole8"></div>
            <div class="mole" id="mole9"></div><br>
          </div>
          <p>
            <button id="start" class="btn" onclick=startbtn()>start</button>
            <span style="margin: 0 20px;"></span>
            <button id="stop" class="btn" onclick=stopbtn()>stop</button>         </p>
        </div>
      <script>
        var grade = 0; 
        var time = 60;
        var flag = 0;
        var timer;

        function startbtn() {
          if (flag === 0) {
            flag = 1;
            document.getElementById("h").innerHTML = "Game Started!";
            countdown();
            showMole();
          }
        }

        function stopbtn() {
          if (flag === 1) {
            flag = 0;
            clearTimeout(timer); 
            document.getElementById("h").innerHTML = "Game Stop!";
          }
        }

        function showMole() {
          if (flag === 1) {
            const moles = document.querySelectorAll('.mole');
            moles.forEach(mole => mole.classList.remove('active'));
            const randomMole = moles[Math.floor(Math.random() * moles.length)];
            randomMole.classList.add('active');
            if (time > 0) {
              const randomDelay = Math.floor(Math.random() * 1000) + 400;
              setTimeout(showMole, randomDelay);
            }
          }
        }

        function countdown() {
          if (flag === 1 && time > 0) {
            time -= 1;
            document.getElementById("time").innerHTML = "time: " + time;
            timer = setTimeout(countdown, 1000);
          } else if (time === 0) {
            alert('遊戲結束！最終得分：' + grade);
            flag = 0;

            // 提交分數到後端
            submitScore(grade);
          }
        }

        function submitScore(grade) {
            if (isNaN(grade) || grade < 0) {
              alert('分數無效，請重新嘗試。');
              return;
            }

            const player = "Mole"; 
            fetch('/scoreboard', {
              method: 'POST',
              body: new URLSearchParams({
                score: grade,
                player: player
              }),
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              }
            }).then(response => {
              if (response.ok) {
                window.location.href = `/scoreboard/scoreboard`;
              } else {
                alert('提交分數失敗，請稍後再試。');
              }
            }).catch(error => {
              console.error('提交分數出錯:', error);
              alert('提交分數失敗，請稍後再試。');
            });
          }

        document.querySelectorAll('.mole').forEach(mole => {
          mole.addEventListener('click', () => {
            if (time > 0 && mole.classList.contains('active')) {
              mole.classList.remove('active');
              grade += 1;
              document.getElementById("grade").innerHTML = "grade: " + grade;
            }
          });
        });
      </script>
      </body>
      </html>

    `;
  }
  
  
  

