import React, {Component} from 'react';
import axios from 'axios';
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
      gameEnd: false
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
      console.log(this.state.dealerAceCounter);
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
      console.log(this.state.userAceCounter);
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
        console.log(this.state.userdeckValue);
        this.checkdeckValue()
      });
    }
  }

  dealerRequestCard = (id) => {
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
      console.log(this.state.dealerdeckValue);
      if(this.state.dealerdeckValue < this.state.userdeckValue && this.state.dealerdeckValue < 21) {
        this.dealerRequestCard(this.state.deckId);
      }
      else {
        this.checkdeckValue();
      }
    });
  }

  checkdeckValue = () => {
    console.log("running check");
    console.log("acecounter",this.state.userAceCounter);
    if(this.state.userdeckValue >21) {
      if(this.state.userAceCounter > 0) {
        console.log("is happening");
        this.setState({
          userdeckValue: this.state.userdeckValue - this.state.userAceCounter,
          userAceCounter: 0
        })
        console.log("newuserdeck alue",this.state.userdeckValue );
        this.checkdeckValue();
      }
      else {
      this.setState({
        houseScore: this.state.houseScore + 1,
        gameEnd: true
      })
      console.log("dealer win");
      }
    }
    else if(this.state.dealerdeckValue === 21 && this.state.userdeckValue === 21) {
      this.setState({
        houseScore: this.state.houseScore,
        userScore: this.state.userScore,
        gameEnd: true
      })
      console.log("tie");
    }
    else if(this.state.dealerdeckValue === this.state.userdeckValue) {
      this.setState({
        houseScore: this.state.houseScore ,
        userScore: this.state.userScore ,
        gameEnd: true
      })
      console.log("tie");
    }
    else if(this.state.dealerdeckValue >21) {
      if(this.state.dealerAceCounter > 0) {
        console.log("is happening");
        this.setState({
          dealerdeckValue: this.state.dealerdeckValue - this.state.dealerAceCounter,
          dealerAceCounter: 0
        })
        console.log("newuserdeck alue",this.state.dealerdeckValue );
        this.dealerRequestCard(this.state.deckId)
        this.checkdeckValue();
      }
      else {
        this.setState({
          userScore: this.state.userScore + 1,
          gameEnd: true
        })
      console.log("user win");
      }
    }
    else if (this.state.dealerdeckValue > this.state.userdeckValue){
      this.setState({
        houseScore: this.state.houseScore + 1,
        gameEnd: true
      })
      console.log("dealer win");
    }
    else if (this.state.userdeckValue === 21 && this.state.dealerdeckValue < 21) {
      this.dealerRequestCard(this.state.deckId)
    }
  }

  startButton = () => {
    this.newDeck();
    this.setState({
      gameStart: true
    })
  }

  stay = () => {
      this.checkdeckValue()
      this.dealerRequestCard(this.state.deckId)
  }

  nextGame = () => {
    this.setState({
      gameEnd: false,
      userdeckValue: 0,
      dealerdeckValue: 0,
      userAceCounter:0,
      dealerAceCounter:0,
      userHandUrls: [],
      dealerHandUrls:[],

    })
    this.newDeck();

  }

  render() {
    return (
      <div className="App">
        <nav>
          <div>
            <p>Time: </p>
          </div>
          <div>
            <p>House won: {this.state.houseScore}</p>
          </div>
          <div>
            <p>User Won: {this.state.userScore}</p>
          </div>
        </nav>
        <h1>Speed 21</h1>
        <div className="dealerHand">
        {this.state.dealerHandUrls.map((url,key)=>{
            return (
              <img src={url} key={key} alt="poker card" />             )
          })}
        </div>
        <div className="userHand">
          {this.state.userHandUrls.map((url,key)=>{
            return (
              <img src={url} key={key} alt="poker card"/>             )
          })}
        </div>
        {this.state.gameStart ?
          <div>
            <div> 
             <button onClick={()=>{this.userRequestCard(this.state.deckId)}}> Request New Card </button>
             <button onClick={()=>{this.stay()}}> Stay </button>
            </div>
          </div>
           : 
           <button onClick={this.startButton}> Start</button>
        }
        {
          this.state.gameEnd &&  <button onClick={this.nextGame}> Next Game </button>
        }
      </div>
    );
  }
}

export default App;
