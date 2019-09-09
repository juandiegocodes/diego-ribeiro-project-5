import React from 'react';


const Header = (props) => {
    return (
    <header className="Header">
        <h1>Speed 21</h1>
        <input type="text" id="playerName"  value={props.value} onChange={props.onChange} placeholder="Enter Your Name" />
        <button onClick={props.onClick}> Start</button> 
      </header>
    )
}


export default Header;