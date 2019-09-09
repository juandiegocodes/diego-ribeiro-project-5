import React from 'react';


const Instructions = (props) => {
    return (
        <div className="instructions">
          <h3>Instructions</h3>
          <ul>
            <li> Speed 21 starts with players making bets (You will get 500$ when starting).</li>
            <li>Dealer deals 2 cards to the player and 1 to himself</li>
            <li>Blackjack card values:All cards count their face value in blackjack. Picture cards count as 10 and the ace can count as either 1 or 11.</li>
            <li> Card suits have no meaning in blackjack. The total of any hand is the sum of the card values in the hand.</li>
            <li>Players must decide whether to stand or hit</li>
            <li>The dealer acts last and must hit higher than the user up to 21</li>
            <li>Players win when their hand totals higher than dealer’s hand, or they have 21</li>
            <li>Grow your bank as big as possible in 2 minutes</li>
          </ul>
          <button onClick={props.exitInstructions} >Back</button>
        </div>
    )
}


export default Instructions;