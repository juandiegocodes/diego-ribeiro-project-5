import React from 'react';


const Gameover = (props) => {
    return (
        <div className="gameover">
            <h2>GAME OVER</h2>
            <p>Hi {props.userInput}!, Your got {props.bank}$ left in your Bank 👑 </p>
            <button onClick={props.playAgainButton} className="tryAgain"> Again?</button>
            <ol className="leaderboard">
            <h3>♠-----High Scores-----♥</h3>
              {props.leaderboard.map((value, key)=>{
                return (
                  <li key={key}>{value}  $</li>             )
              })}
            </ol>
        </div>
    )
}


export default Gameover;