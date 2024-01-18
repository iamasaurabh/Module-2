import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import { formatUnits } from "ethers/lib/utils"

const defaultPassword = "meta";
const securityQuestion = "who is the best learn and earn platform";
const correctAnswer = "metacrafters";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [password, setPassword] = useState("");
  const [showRecoveryButton, setShowRecoveryButton] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [passwordRecovered, setPasswordRecovered] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Once the wallet is set, get a reference to the deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balanceInWei = await atm.getBalance();
        const balanceInEth = formatUnits(balanceInWei, "ether");
  
        setBalance(parseFloat(balanceInEth)); // Convert to a float if needed
      } catch (error) {
        console.error("Error fetching balance:", error.message);
      }
    }
  };
  
  

  const deposit = async () => {
    if (password !== defaultPassword) {
      setShowRecoveryButton(true);
      return;
    }
  
    if (atm) {
      try {
        let tx = await atm.deposit(ethers.utils.parseEther("100")); // Deposit 100 ETH
        await tx.wait();
        setTransactionStatus("Deposit successful!");
  
        // Update balance after a successful deposit
        getBalance();
      } catch (error) {
        setTransactionStatus("Deposit failed: " + error.message);
      }
    }
  };
  

  const withdraw = async () => {
    if (password !== defaultPassword) {
      setShowRecoveryButton(true);
      return;
    }

    if (atm) {
      try {
        let tx = await atm.withdraw(ethers.utils.parseEther("100")); // Withdraw 100 ETH
        await tx.wait();
        setTransactionStatus("Withdrawal successful!");
        getBalance();
      } catch (error) {
        setTransactionStatus("Withdrawal failed: " + error.message);
      }
    }
  };

  const recoverPassword = () => {
    setShowSecurityQuestion(true);
    setShowRecoveryButton(false);
  };

  const checkSecurityAnswer = () => {
    if (securityAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      setPasswordRecovered(true);
    } else {
      alert("Incorrect answer to security question");
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return (
        <div>
          <button onClick={connectAccount}>Please connect your MetaMask wallet</button>
        </div>
      );
    }

    if (showRecoveryButton) {
      return (
        <div>
          <button onClick={recoverPassword}>Forgot Password</button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input
          type="password"
          placeholder="Enter password for transactions"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={deposit}>Deposit 100 ETH</button>
        <button onClick={withdraw}>Withdraw 100 ETH</button>
        <p>{transactionStatus}</p>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {showSecurityQuestion && (
        <div>
          <p>Security Question: {securityQuestion}</p>
          <input
            type="text"
            placeholder="Answer to security question"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
          />
          <button onClick={checkSecurityAnswer}>Submit Answer</button>
        </div>
      )}
      {passwordRecovered ? (
        <p>Password recovered. The default password is: {defaultPassword}</p>
      ) : (
        initUser()
      )}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #4caf50; /* Green background */
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }
      `}</style>
    </main>
  );
}
