import React, {Component} from 'react';
import axios from 'axios';
import firebase from './components/firebase';
import Header from './components/Header';
import Gameover from './components/Gameover';
import Instructions from './components/Instructions'
import './App.css';

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      gameStart: false,
      deckId: "",
      userdeckValue: 0,
      dealerdeckValue: 0,
      userHandUrls: [],
      dealerHandUrls:[],
      userAceCounter:0,
      dealerAceCounter:0,
      gameEnd: false,
      timer: 120,
      gameOver: false,
      leaderboard:[],
      userInput: "",
      userWon: false,
      dealerWon: false,
      tie:false,
      stay:false,
      bet:false,
      bank:500,
      amountToBet: 0,
      instructions:false
    }
  }

  // This will give us a brand new deck
  newDeck =() => {
    axios({
      method: 'get',
      url:'https://deckofcardsapi.com/api/deck/new/shuffle/',
      responseType: 'json',
      params:{
        deck_count :1
      }
    }).then((res)=>{
      
      this.setState({
       deckId: res.data.deck_id
      })
      this.initialDealer(res.data.deck_id);
      this.initialUser(res.data.deck_id) 
    });
  }
// This will give  1 card to the dealer
  initialDealer =(id) => {
    axios({
      method: 'get',
      url:`https://deckofcardsapi.com/api/deck/${id}/draw/`,
      responseType: 'json',
      params:{
        count:1
      }
    }).then((res)=>{
      let dealerCard1 = res.data.cards[0].value;
      this.pushDealerUrl(res.data.cards[0].image);
      dealerCard1 = parseInt(this.dealerFilterCard(dealerCard1))
      this.setState({
        dealerdeckValue: this.dealerFilterCard(dealerCard1)
      })
    });
  }
// this will give the initial 2 cards to the user
  initialUser =(id) => {
    axios({
      method: 'get',
      url:`https://deckofcardsapi.com/api/deck/${id}/draw/`,
      responseType: 'json',
      params:{
        count:2
      }
    }).then((res)=>{
      let userCard1 = res.data.cards[0].value;
      let userCard2 = res.data.cards[1].value;
      this.pushUserUrl(res.data.cards[0].image);
      this.pushUserUrl(res.data.cards[1].image);
      userCard1 = parseInt(this.userFilterCard(userCard1));
      userCard2 = parseInt(this.userFilterCard(userCard2));
      this.setState({
        userdeckValue: userCard1 + userCard2
      })
      if(this.state.userdeckValue ===21){
        this.stay()
      }
    });
  }
// this will convert J,Q,K & A to numerial values and also will keep track of the dealer A's
  dealerFilterCard = (value) => {
    if (value === "QUEEN" || value === "KING" || value === "JACK") {
      return 10
    }
    else if (value=== "ACE") {
      this.setState({
        dealerAceCounter: this.state.dealerAceCounter + 10
      });
      return 11
    }
    else return value
  }

// this will convert J,Q,K & A to numerial values and also will keep track of the user A's
  userFilterCard = (value) => {
    if (value === "QUEEN" || value === "KING" || value === "JACK") {
      return 10
    }
    else if (value=== "ACE") {
      this.setState({
        userAceCounter: this.state.userAceCounter + 10
      });
      return 11
    }
    else return value
  }
// grabing url for  user cards
  pushUserUrl = (url) => {
    const newpush = [...this.state.userHandUrls]
    newpush.push(url)
    this.setState({
      userHandUrls : newpush
    })
  }

// grabing url for  dealer cards
  pushDealerUrl = (url) => {
    const newpush = [...this.state.dealerHandUrls]
    newpush.push(url)
    this.setState({
      dealerHandUrls : newpush
    })
  }

// user request an extra card
  userRequestCard = (id) => {
    if(this.state.userdeckValue ===21){
      this.stay()
    }
    else {
    axios({
      method: 'get',
      url:`https://deckofcardsapi.com/api/deck/${id}/draw/`,
      responseType: 'json',
      params:{
        count:1
      }
      }).then((res)=>{
        let userCard1 = res.data.cards[0].value;
        this.pushUserUrl(res.data.cards[0].image);
        userCard1 = parseInt(this.userFilterCard(userCard1));
        this.setState({
          userdeckValue: this.state.userdeckValue +  userCard1
        })
        this.checkuser()
      });
    }
  }
// dealer request an extra card
  dealerRequestCard = (id) => {
    if (this.state.gameEnd === false) {
      setTimeout(()=>{
      axios({
        method: 'get',
        url:`https://deckofcardsapi.com/api/deck/${id}/draw/`,
        responseType: 'json',
        params:{
          count:1
        }
      }).then((res)=>{
        let dealerCard1 = res.data.cards[0].value;
        this.pushDealerUrl(res.data.cards[0].image);
        dealerCard1 = parseInt(this.dealerFilterCard(dealerCard1));
        this.setState({
          dealerdeckValue: this.state.dealerdeckValue +  dealerCard1
        })
        if(this.state.dealerdeckValue < this.state.userdeckValue && this.state.dealerdeckValue < 21) {
          this.dealerRequestCard(this.state.deckId);
        }
        else {
          this.checkdealer();
        }
      })}
      ,600)
    }
  }

  // checking if user has gone over 21
  checkuser = () => {
    if(this.state.userdeckValue >21) {
      if(this.state.userAceCounter > 0) {
        this.setState({
          userdeckValue: this.state.userdeckValue - this.state.userAceCounter,
          userAceCounter: 0
        })
        this.checkuser();
      }
      else {
      this.setState({
        bank: this.state.bank - this.state.amountToBet,
        gameEnd: true,
        dealerWon:true,
        amountToBet:0
      })
      }
    }
    else if(this.state.userdeckValue ===21 && this.state.dealerdeckValue < 21){
      this.checkdealer();
    }
  }

  // checking if dealer won
  checkdealer =() => {
    if(this.state.dealerdeckValue >21) {
      if(this.state.dealerAceCounter > 0) {
        this.setState({
          dealerdeckValue: this.state.dealerdeckValue - this.state.dealerAceCounter,
          dealerAceCounter: 0
        })
        this.checkdealer();
      }
      else {
        this.setState({
          bank: parseInt(this.state.bank) + parseInt(this.state.amountToBet),
          gameEnd: true,
          userWon: true,
          amountToBet:0
        })
      }
    }
    else if(this.state.dealerdeckValue === 21 && this.state.userdeckValue === 21) {
      this.setState({
        gameEnd: true,
        tie: true
      })
    }
    else if(this.state.dealerdeckValue === this.state.userdeckValue) {
      this.setState({
        gameEnd: true,
        tie: true
      })
    }
    else if(this.state.dealerdeckValue === this.state.userdeckValue) {
      this.setState({
        gameEnd: true,
        tie:false
      })
    }
    else if (this.state.dealerdeckValue > this.state.userdeckValue){
      this.setState({
        bank: this.state.bank - this.state.amountToBet,
        gameEnd: true,
        dealerWon: true,
        amountToBet:0
      })
    }

    else if(this.state.dealerdeckValue < this.state.userdeckValue && this.state.dealerdeckValue <22 && this.state.userdeckValue < 22) {
      this.dealerRequestCard(this.state.deckId)
    }
  }

  // when user clicks the start button
  startButton = () => {
    if (this.state.userInput ==="") {
      this.setState({
        userInput: 'Guest'
      })
    }
    this.setState({
      gameStart: true,
      bet:true
    })
    this.startTimer();
  }

  // when user clicks stay
  stay = () => {
    this.setState({
      stay: true
    })
    if(this.state.userdeckValue ===21){
      this.checkuser();
    }
    else{
      this.checkuser();
      this.dealerRequestCard(this.state.deckId)
    }
  }
// timer function
  timerOn = () => {
    if (this.state.timer > 0 ) {
      this.setState({
        timer : this.state.timer - 1
      })
    }
    else if (this.state.timer === 0) {
      this.gameisOver();
      this.setState({
        gameOver : true,
        timer : this.state.timer - 0.01
      })
    }
    else {

    }
  }
// start timer
  startTimer = () => {
    setInterval(this.timerOn ,1000); 
  }
// when user advance to enxt game
  nextGame = () => {
    if(this.state.bank <1) {
      this.setState({
        timer:0,
        gameisOver:true
      })
    }
    else {
    this.setState({
      stay:false,
      gameEnd: false,
      userdeckValue: 0,
      dealerdeckValue: 0,
      userAceCounter:0,
      dealerAceCounter:0,
      userHandUrls: [],
      dealerHandUrls:[],
      tie:false,
      dealerWon: false,
      userWon:false,
      bet:true
    })
  }
  }
// keep track of user name
  inputChange = (event) => {
    this.setState({userInput: event.target.value})
  }
// keeps track of amount bet
  updateInputValue =(evt) => {
    this.setState({
      amountToBet: evt.target.value
    });
  }
// time is over or bank is over
  gameisOver = () => {
    this.setState({
      bet:false
    })
      const dbRef = firebase.database().ref();
      const userFb= [this.state.userInput,' : ',this.state.bank]
      dbRef.push(userFb);
      dbRef.on('value', (response) => {
        const newFbState = [];
        const data =response.val();
        for (let item in data) {
          newFbState.push(data[item])
        }
        const sortedArray = newFbState.sort((a, b) =>  b[2] - a[2]);
        const topTenArray = sortedArray.slice(0,10);
        this.setState ({
          leaderboard: topTenArray,
        })
      });
  }
// play again button
  playAgain = () => {
    this.setState({
      deckId: "",
      userdeckValue: 0,
      dealerdeckValue: 0,
      userHandUrls: [],
      dealerHandUrls:[],
      userAceCounter:0,
      dealerAceCounter:0,
      userScore:0,
      houseScore:0,
      totalScore:0,
      gameEnd: false,
      timer: 100,
      gameOver: false,
      leaderboard:[],
      userWon: false,
      dealerWon: false,
      tie:false,
      stay:false,
      bank:500,
      bet:true
    })
  }
// bet functions
  startBet =() => {
    this.setState({
      bet:true
    })
  }
  placeBet =() => {
    if(this.state.amountToBet > this.state.bank) {
      this.setState({
        amountToBet: this.state.bank
      })
    }
    else if (this.state.amountToBet < 1) {
      this.setState({
        amountToBet: 1
      })
    }
    this.setState({
      stay:false,
      gameEnd: false,
      userdeckValue: 0,
      dealerdeckValue: 0,
      userAceCounter:0,
      dealerAceCounter:0,
      userHandUrls: [],
      dealerHandUrls:[],
      tie:false,
      dealerWon: false,
      userWon:false,
      bet:false
    });

    this.newDeck();
  }
// instructions button pressed
  instructionsButton = () => {
    this.setState({
      instructions:true
    })
  }
// exit instructions
  backInstructionsButton = () => {
    this.setState({
      instructions:false
    })
  }

// render

  render() {
    return (
      <div className="wrapper">
        {this.state.gameStart === false && this.state.gameOver === false && this.state.instructions === false &&
        <Header tracking={this.state.userInput} trackingChanges={this.inputChange} startClicked={this.startButton}
        instructionsClicked={this.instructionsButton}/> 
        }
        {this.state.gameStart === false && this.state.gameOver === false && this.state.instructions &&
          <Instructions exitInstructions={this.backInstructionsButton}/>
        }
        <div className="playing">
          {this.state.gameStart && this.state.gameOver === false &&
          <div className="gameBoard">
            <div className="globalNav">
              <div className="announcement">
                {this.state.userWon && this.state.gameEnd && this.state.gameOver ===false && <p>User  Win!</p>}
                {this.state.dealerWon && this.state.gameEnd &&this.state.gameOver ===false &&<p>Dealer Win!</p>}
                {this.state.tie && this.state.gameEnd && this.state.gameOver ===false&&<p>TIE!</p>}
              </div>
              <nav>
                <div>
                  <p>{this.state.timer}s</p>
                </div>
                <div>
                  <p>Bank: {this.state.bank}</p>
                </div>
              </nav>
            </div>
            {this.state.gameStart && this.state.gameOver === false && this.state.gameEnd === false && this.state.stay === false && this.state.bet &&<div className="betDiv">
              <h3>Place your bet quickly!</h3>
              <div className="number">
                <label htmlFor="numInput" className="sr-only">Enter Your amount to bet</label>
                <input type="number" min="0" placeholder="$100" max={this.state.bank} step="50" value={this.state.inputValue} onChange={this.updateInputValue}/>
                <button onClick={()=>{this.placeBet()}}>Bet</button>
              </div>
            </div>
            }
            { this.state.gameStart && this.state.gameOver === false && this.state.bet ===false &&
              <div className="cards">
                <div className="dealerHand">
                {this.state.dealerHandUrls.map((url,key)=>{
                    return (
                      <figure>
                        <img src={url} key={key} alt="poker card" /> 
                      </figure>            )
                  })}
                </div>
                <div className="userHand">
                  {this.state.userHandUrls.map((url,key)=>{
                    return (
                      <figure>
                        <img src={url} key={key} alt="poker card"/> 
                      </figure>            )
                  })}
                </div>
              </div>
            }
            {this.state.gameStart && this.state.gameOver === false && this.state.gameEnd === false && this.state.stay === false && this.state.bet===false &&
            <div className="buttonsBoard">
              <button className="buttonStay" onClick={()=>{this.stay()}}>Stay</button>
              <h3>{this.state.userInput}</h3>
              <button className="buttonHit" onClick={()=>{this.userRequestCard(this.state.deckId)}}>Hit</button>
            </div>
            }
            {
              this.state.gameEnd && this.state.gameOver === false  && 
              <div className="buttonsBoard">
                <div> 
                  <button onClick={this.nextGame} className="next"> Next</button>
                </div> 
              </div>
            }           
          </div>
          }
        </div>
        {
          this.state.gameOver && 
          <Gameover userInput={this.state.userInput} bank={this.state.bank} playAgainButton={this.playAgain} leaderboard={this.state.leaderboard}/>
        }
      </div>
    );
  }
}

export default App;
