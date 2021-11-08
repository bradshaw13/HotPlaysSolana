import youtubeLogo from './assets/youtube-logo.png';
import './App.css';
import { useEffect, useState } from 'react';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import kp from './keypair.json'; 
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

const { SystemProgram, Keypair } = web3;

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}

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
    if(inputValue.length === 0){
      console.log("No gif link given!")
      return
    }
    console.log('Gif link:', inputValue)
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  const onInputChange=(event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createGifAccount = async () => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button 
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    } 
    else {
      return (
      <div className="connected-container">
        <input type="text" placeholder="Enter gif link!" value={inputValue} onChange={onInputChange}/>
        <button className="cta-button submit-gif-button" onClick={sendGif}>Submit</button>
        <div className="gif-grid">
          {gifList.map((item, index) => (
            <div className="gif-item" key={index}>
              <img src={item.gifLink} alt={item.gifLink}/>
            </div>
          ))}
        </div>
      </div>)
    }
}



  useEffect(() => {
    window.addEventListener('load', async(event) => {
      await checkIfWalletIsConnected();
    });
  }, []);

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account)
      setGifList(account.gifList)
    } catch (error) {
      console.log("Error in getGifs: ", error)
      setGifList(null)
    }
  }

  useEffect(() => {
    if(walletAddress){
      console.log('Fetching GIF list...');
      getGifList();
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
