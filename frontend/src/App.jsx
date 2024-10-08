import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Profiles from './pages/Profiles';
import Spotify from './pages/Spotify';
import Instagram from './pages/Instagram';
import Twitter from './pages/Twitter';
import instaAbi from '../../backend/build/contracts/Instagram.json';
import twitterAbi from '../../backend/build/contracts/Twitter.json';
import profilesAbi from '../../backend/build/contracts/Profiles.json';
import spotifyAbi from '../../backend/build/contracts/Spotify.json';

function App() {
  const [account, setAccount] = useState(null);
  const [isTronLinkInstalled, setIsTronLinkInstalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    instaContract: null,
    twitterContract: null,
    spotifyContract: null,
    profilesContract: null,
  });

  useEffect(() => {
    const checkTronLink = async () => {
      const instaAddress = "TNa1hqyuUA59kVmVS4Dt9AVzFTgTPVnvez";
      const profileAddress = "TW2mt6SsrSeZdARGKocw4vnAwQE7pUtvo3";
      const twitterAddress = "TVXN7vdPFdFJw4C3t6Nbw8UDyr4qz7uE8G";
      const spotifyAddress = "TH9amG27wc8aiX66M9GuEaE2MbWw1BT4T7";

      if (window.tronWeb && window.tronWeb.ready) {
        setIsTronLinkInstalled(true);
        setAccount(window.tronWeb.defaultAddress.base58);

        const instaContract = tronWeb.contract(instaAbi.abi, instaAddress);
        const twitterContract = tronWeb.contract(twitterAbi.abi, twitterAddress);
        const spotifyContract = tronWeb.contract(spotifyAbi.abi, spotifyAddress);
        const profilesContract = tronWeb.contract(profilesAbi.abi, profileAddress);

        setState({
          instaContract: instaContract,
          twitterContract: twitterContract,
          spotifyContract: spotifyContract,
          profilesContract: profilesContract,
        });

        setTimeout(checkTronLink, 1000);
      }

      setLoading(false);
    };

    checkTronLink();
  }, []);

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/profiles">Profiles</Link></li>
            <li><Link to="/spotify">Spotify</Link></li>
            <li><Link to="/instagram">Instagram</Link></li>
            <li><Link to="/twitter">Twitter</Link></li>
            <li className='address'>Connected Account : {account}</li>
          </ul>
        </nav>
        <h1>home</h1>

        <Routes>
          <Route path="/profiles" element={<Profiles contract={state.profilesContract} account={account} />} />
          <Route path="/spotify" element={<Spotify contract={state.spotifyContract} account={account}/>} />
          <Route path="/instagram" element={<Instagram contract={state.instaContract} account={account}/>} />
          <Route path="/twitter" element={<Twitter contract={state.twitterContract} account={account} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
