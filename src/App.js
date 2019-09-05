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
      dealerHandUrls:[]
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
        count:2
      }
    }).then((res)=>{
      console.log(res);
      let dealerCard1 = res.data.cards[0].value;
      let dealerCard2 = res.data.cards[1].value;
      this.pushDealerUrl(res.data.cards[0].image);
      this.pushDealerUrl(res.data.cards[1].image);
      dealerCard1 = parseInt(this.filterCard(dealerCard1))
      dealerCard2 = parseInt(this.filterCard(dealerCard2))
      console.log(this.filterCard(dealerCard1));
      console.log(this.filterCard(dealerCard2));
      console.log(this.state.dealerHandUrls);
      this.setState({
        dealerdeckValue: this.filterCard(dealerCard1) + this.filterCard(dealerCard2)
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
      console.log(res);
      let userCard1 = res.data.cards[0].value;
      let userCard2 = res.data.cards[1].value;
      this.pushUserUrl(res.data.cards[0].image);
      this.pushUserUrl(res.data.cards[1].image);
      userCard1 = parseInt(this.filterCard(userCard1));
      userCard2 = parseInt(this.filterCard(userCard2));
      console.log(this.filterCard(userCard1));
      console.log(this.filterCard(userCard2));
      console.log(this.state.userHandUrls);
      this.setState({
        userdeckValue: userCard1 + userCard2
      })
    });
  }

  filterCard = (value) => {
    if (value === "QUEEN" || value === "KING" || value === "JACK" || value=== "ACE") {
      return 10
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

  requestCard = (id) => {


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
      userCard1 = parseInt(this.filterCard(userCard1));
      console.log(this.state.userHandUrls);
      this.setState({
        userdeckValue: this.state.userdeckValue +  userCard1
      })
      console.log(this.state.userdeckValue);
    });
  }

  startButton = () => {
    this.newDeck();
    this.setState({
      gameStart: true
    })
  }

  checkdeckValue = () => {
    
  }

  render() {
    return (
      <div className="App">
        <div className="dealerHand">
        {this.state.dealerHandUrls.map((url,key)=>{
            return (
              <img src={url} key={key} />             )
          })}
        </div>
        <div className="userHand">
          {this.state.userHandUrls.map((url,key)=>{
            return (
              <img src={url} key={key}/>             )
          })}
        </div>
        {this.state.gameStart ? <button onClick={()=>{this.requestCard(this.state.deckId)}}> Request New Card </button>: <button onClick={this.startButton}> Start</button>}
      </div>
    );
  }
}

export default App;
