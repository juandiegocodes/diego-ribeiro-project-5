import React, {Component} from 'react';
import axios from 'axios';
import firebase from './firebase';
import './App.css';

class App extends Component {
  constructor(){
    super()
    this.state = {
      gameStart: false,
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
      timer: 1,
      gameOver: false,
      gameOverFb:false,
      leaderboard:[],
      userInput: "",
      userWon: false,
      dealerWon: false,
      tie:false
    }
  }

  componentDidMount() {
    console.log('did mount');
  }

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

  pushUserUrl = (url) => {
    const newpush = [...this.state.userHandUrls]
    newpush.push(url)
    this.setState({
      userHandUrls : newpush
    })
  }
  pushDealerUrl = (url) => {
    const newpush = [...this.state.dealerHandUrls]
    newpush.push(url)
    this.setState({
      dealerHandUrls : newpush
    })
  }

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
        houseScore: this.state.houseScore + 1,
        gameEnd: true,
        dealerWon:true
      })
      console.log("dealer win");
      }
    }
    else if(this.state.userdeckValue ===21 && this.state.dealerdeckValue < 21){
      this.checkdealer();
    }
  }

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
          userScore: this.state.userScore + 1,
          gameEnd: true,
          userWon: true
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
        houseScore: this.state.houseScore + 1,
        gameEnd: true,
        dealerWon: true
      })
      console.log("dealer win");
    }

    else if(this.state.dealerdeckValue < this.state.userdeckValue && this.state.dealerdeckValue <22 && this.state.userdeckValue < 22) {
      this.dealerRequestCard(this.state.deckId)
    }
  }

  startButton = () => {
    this.newDeck();
    this.setState({
      gameStart: true
    })
    this.startTimer();
  }
  stay = () => {
    if(this.state.userdeckValue ===21){
      this.checkuser();
    }
    else{
      console.log("user hand",this.state.userdeckValue);
      this.checkuser();
      this.dealerRequestCard(this.state.deckId)
    }
  }

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
        gameOverFb: true,
        timer : this.state.timer - 0.01
      })
    }
    else {

    }
  }

  startTimer = () => {
    setInterval(this.timerOn ,1000); 
  }

  nextGame = () => {
    console.log('newgame');
    this.setState({
      gameEnd: false,
      userdeckValue: 0,
      dealerdeckValue: 0,
      userAceCounter:0,
      dealerAceCounter:0,
      userHandUrls: [],
      dealerHandUrls:[],
      tie:false,
      dealerWon: false,
      userWon:false

    })
    this.newDeck();
  }

  inputChange = (event) => {
    this.setState({userInput: event.target.value})
  }

  gameisOver = () => {
      const dbRef = firebase.database().ref();
      const userFb= [this.state.userInput,' : ',this.state.totalScore]
      this.setState({
        gameOverFb:false

      })
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

  render() {
    return (
      <div className="App">
        {this.state.gameStart === false && this.state.gameOver === false  && 
        <header className="Header">
          <h1>Speed 21</h1>
          <input type="text" id="playerName" onChange={this.inputChange} value={this.state.userInput} placeholder="Enter Your Name" />
          <button onClick={this.startButton}> Start</button>
        </header>}
        <div className="playing">
          <div className="announcement">
            {this.state.userWon && this.state.gameEnd && this.state.gameOver ===false && <p>User Won!</p>}
            {this.state.dealerWon && this.state.gameEnd &&this.state.gameOver ===false &&<p>Dealer Won!</p>}
            {this.state.tie && this.state.gameEnd && this.state.gameOver ===false&&<p>TIE!</p>}
          </div>
          {this.state.gameStart && this.state.gameOver === false &&
          <div className="gameBoard">
            <nav>
              <div>
                <p>Time: {this.state.timer}</p>
              </div>
              <div>
                <p>House: {this.state.houseScore}</p>
              </div>
              <div>
                <p>User: {this.state.userScore}</p>
              </div>
            </nav>
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
          </div>
          }
          {this.state.gameStart && this.state.gameOver === false && this.state.gameEnd === false &&
            <div className="buttonsBoard">
              <div> 
               <button onClick={()=>{this.userRequestCard(this.state.deckId)}}> Request</button>
               <button onClick={()=>{this.stay()}}> Stay </button>
              </div>
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
        {
          this.state.gameOver && 
          <div className="gameover">
            <h2>GAME OVER</h2>
            <p>Hi! {this.state.userInput} , Your Score is: {this.state.userScore} 👑 </p>
            <h3>♠-----High Scores-----♥</h3>
            <ol className="leaderboard">
              {this.state.leaderboard.map((value, key)=>{
                return (
                  <li key={key}>{value}</li>             )
              })}
            </ol>
          </div>
        }
      </div>
    );
  }
}

export default App;
