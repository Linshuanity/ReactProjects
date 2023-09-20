import {
  Button,
  useTheme,
} from "@mui/material";
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import FlexBetween from "components/FlexBetween";
import { Typography }from '@mui/material'
import { useEffect, useState } from 'react';
import Web3 from 'web3';

const WalletConnectComponent = ({holding}) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(holding);

  const { palette } = useTheme();

  useEffect(() => {
    // 檢查用戶是否安裝了 Web3 錢包
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // 啟用以太坊帳戶連接
      window.ethereum.enable().then(accounts => {
        setAccount(accounts[0]);
      }).catch(error => {
        console.error('Failed to enable account connection:', error);
      });
    } else {
      console.error('Web3 wallet not detected.');
    }
  }, []);

  const installMetamask = () => {
    window.open('https://metamask.io/download.html', '_blank');
  };

  const connectWallet = () => {
    if (web3) {
      window.ethereum.enable().then(accounts => {
        setAccount(accounts[0]);
      }).catch(error => {
        console.error('Failed to enable account connection:', error);
      });
    } else {
      console.error('Web3 instance not available.');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', height: '3rem'}}>
        <CoronavirusIcon  color="blue"/>
        <Typography style={{margin: '0.5rem'}}>{balance}</Typography>
      </div>
      {account ? (
        <>
          <p>Connected Account: {account}</p>
          <Button
            onClick={disconnectWallet}
            sx={{
              color: palette.background.alt,
              backgroundColor: palette.primary.main,
              borderRadius: "3rem",
            }}
          >
            Disconnect Wallet
          </Button>
        </>
      ) : (
        <>{web3 &&(
          <Button
            onClick={connectWallet}
            sx={{
              color: palette.background.alt,
              backgroundColor: palette.primary.main,
              borderRadius: "3rem",
            }}
          >
            Connect Wallet
          </Button>)}
          {!web3 && (
            <Button
              onClick={installMetamask}
              sx={{
                color: palette.background.alt,
                backgroundColor: palette.primary.main,
                borderRadius: "3rem",
              }}
            >
              Install MetaMask
            </Button>
          )}
        </>
      )}
    </div>
  );
  
};

export default WalletConnectComponent;
