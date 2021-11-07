import youtubeLogo from './assets/youtube-logo.png';
import './App.css';
import { useEffect, useState } from 'react';

// Constants
const TWITTER_HANDLE = 'ShannonSharpe';

const TEST_GIFS = [
  'https://media.giphy.com/media/l1J9wkNvsbyiMICBi/giphy.gif',
  'https://media.giphy.com/media/l0HlTgeWIqq5wZMKA/giphy.gif',
  'https://media.giphy.com/media/lrf5jEbnpVUek/giphy.gif',
  'https://media.giphy.com/media/8Eup943BRqxbO/giphy.gif',
  'https://media.giphy.com/media/NvLzDSmFEGY6c/giphy.gif',
  'https://media.giphy.com/media/bHziZDDGEwdugOH7b5/giphy.gif'
]

const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const YOUTUBE_LINK = 'https://www.youtube.com/watch?v=3SHCHkYbQWU';

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana){
        if(solana.isPhantom){
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true});
          console.log('Connected with Public Key:', response.publicKey.toString());

          setWalletAddress(response.publicKey.toString());
        }
      }
      else {
        alert('Solana object not found! get a Phantom Wallet 👻');
      }
    }catch (error){
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana){
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const sendGif = async () => {
    if (inputValue.length > 0){
      console.log('Gif link:', inputValue);
    }
    else{
      console.log('Empty input. Try again');
    }
  };

  const onInputChange=(event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const renderNotConnectedContainer = () => (
    <button 
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
      <input type="text" placeholder="Enter gif link!" value={inputValue} onChange={onInputChange}/>
      <button className="cta-button submit-gif-button" onClick={sendGif}>Submit</button>
      <div className="gif-grid">
        {gifList.map(gif => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif}/>
          </div>
        ))}
      </div>
    </div>
  );



  useEffect(() => {
    window.addEventListener('load', async(event) => {
      await checkIfWalletIsConnected();
    });
  }, []);

  useEffect(() => {
    if(walletAddress){
      console.log('Fetching GIF list...');

      //Call Solana program here

      setGifList(TEST_GIFS);
      
    }
  }, [walletAddress]);
  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
        <iframe src="https://giphy.com/embed/WR9j3mH5yVVO89DkY7" width="480" height="270" frameBorder="0" className="giphy-embed" allowFullScreen title='unique'></iframe>

          <p className="header">⛩️ Fire Portal</p>
          <p className="sub-text">
            View your Hot Plays in the metaverse 🔥
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <a href={YOUTUBE_LINK} target="_blank" rel="noreferrer"><img alt=" Shannon speaking the truth" className="twitter-logo" src={youtubeLogo} /></a>
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Shoutout to the king of hot takes @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
