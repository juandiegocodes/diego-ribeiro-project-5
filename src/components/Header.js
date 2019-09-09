import React from 'react';


const Header = (props) => {
    return (
    <header className="Header">
        <h1>Speed 21</h1>
        <label htmlFor="mainInput" className="sr-only">Enter Your Name</label>
        <input name="mainInput" type="text" id="playerName"  value={props.tracking} onChange={props.trackingChanges} placeholder="Enter Your Name" />
        <div className="startButtons">
            <button onClick={props.startClicked}> Start</button>
            <button onClick={props.instructionsClicked}> How?</button>
        </div>
      </header>
    )
}

export default Header;