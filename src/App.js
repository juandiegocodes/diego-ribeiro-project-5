import React, {Component} from 'react';
import axios from 'axios';
import firebase from './firebase';
import Header from './components/Header';
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
      amountToBet: 0
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
      console.log('as de dealer',this.state.dealerAceCounter);
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
      console.log('contando as de usuario',this.state.userAceCounter);
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
        console.log("user hand",this.state.userdeckValue);
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
        console.log("la mano del dealer",this.state.dealerdeckValue);
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
        console.log("is happening usuaario as");
        this.setState({
          userdeckValue: this.state.userdeckValue - this.state.userAceCounter,
          userAceCounter: 0
        })
        console.log("newuserdeck alue",this.state.userdeckValue );
        this.checkuser();
      }
      else {
      this.setState({
        bank: this.state.bank - this.state.amountToBet,
        gameEnd: true,
        dealerWon:true,
        amountToBet:0
      })
      console.log("dealer win");
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
        console.log("is happening de deaker");
        console.log(this.state.dealerAceCounter);
        this.setState({
          dealerdeckValue: this.state.dealerdeckValue - this.state.dealerAceCounter,
          dealerAceCounter: 0
        })
        console.log("newuserdeck alue",this.state.dealerdeckValue );
        this.checkdealer();
      }
      else {
        this.setState({
          bank: parseInt(this.state.bank) + parseInt(this.state.amountToBet),
          gameEnd: true,
          userWon: true,
          amountToBet:0
        })
      console.log("user win");
      }
    }
    else if(this.state.dealerdeckValue === 21 && this.state.userdeckValue === 21) {
      this.setState({
        gameEnd: true,
        tie: true
      })
      console.log("tie");
    }
    else if(this.state.dealerdeckValue === this.state.userdeckValue) {
      this.setState({
        gameEnd: true,
        tie: true
      })
      console.log("tie");
    }
    else if(this.state.dealerdeckValue === this.state.userdeckValue) {
      this.setState({
        gameEnd: true,
        tie:false
      })
      console.log("tie");
    }
    else if (this.state.dealerdeckValue > this.state.userdeckValue){
      this.setState({
        bank: this.state.bank - this.state.amountToBet,
        gameEnd: true,
        dealerWon: true,
        amountToBet:0
      })
      console.log("dealer win");
    }

    else if(this.state.dealerdeckValue < this.state.userdeckValue && this.state.dealerdeckValue <22 && this.state.userdeckValue < 22) {
      this.dealerRequestCard(this.state.deckId)
    }
  }

  // when user clicks the start button
  startButton = () => {
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
      console.log("user hand",this.state.userdeckValue);
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
      console.log("is happening");
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
      console.log("HEYO");
      this.setState({
        timer:0,
        gameisOver:true
      })
    }
    else {
    console.log('newgame');
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
    this.newDeck();
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
        for (let key in data) {
          newFbState.push(data[key])
        }
        const sortedArray = newFbState.sort((a, b) =>  b[2] - a[2]);
        const topTenArray = sortedArray.slice(0,10);
        console.log(sortedArray);
        console.log(topTenArray);
        this.setState ({
          leaderboard: topTenArray,
        })
      });
  }
// play again button
  playAgain = () => {
    console.log('Wholenewgame');
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
      bank:500
    })
    this.newDeck();
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

// render

  render() {
    return (
      <div className="App">
        {this.state.gameStart === false && this.state.gameOver === false  &&
        <Header value={this.state.userInput} onChange={this.inputChange} onClick={this.startButton}/> 
        }
        <div className="playing">
          {this.state.gameStart && this.state.gameOver === false &&
          <div className="gameBoard">
            <div className="globalNav">
              <div className="announcement">
                {this.state.userWon && this.state.gameEnd && this.state.gameOver ===false && <p>User Won!</p>}
                {this.state.dealerWon && this.state.gameEnd &&this.state.gameOver ===false &&<p>Dealer Won!</p>}
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
              <h3>Place your bet Quick!</h3>
              <div className="number">
                <input type="number" min="1" max={this.state.bank} value={this.state.inputValue} onChange={this.updateInputValue}/>
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
              <button onClick={()=>{this.userRequestCard(this.state.deckId)}}>Hit</button>
              <button onClick={()=>{this.stay()}}>Stay</button>
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
          <div className="gameover">
            <h2>GAME OVER</h2>
            <p>Hi {this.state.userInput}!, Your got {this.state.bank}$ left in your Bank 👑 </p>
            <button onClick={this.playAgain} className="tryAgain"> Again?</button>
            <h3>♠-----High Scores-----♥</h3>
            <ol className="leaderboard">
              {this.state.leaderboard.map((value, key)=>{
                return (
                  <li key={key}>{value}  $</li>             )
              })}
            </ol>
          </div>
        }
      </div>
    );
  }
}

export default App;
