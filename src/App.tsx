
import './App.css';
import {useState} from 'react';
import Poker from './components/Game/Poker';
import GameSettings from './json/gameSettings.json';

function App() {

    const [settings, setSettings] = useState(GameSettings);


    return (
        <div className="App">
            <Poker
                settings = {settings}
            />
        </div>
    );
}

export default App;
