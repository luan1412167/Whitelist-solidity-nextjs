import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import {providers, Contract} from "ethers";
import {useEffect, useRef, useState} from "react";
import {WHITELIST_CONTRACT_ADDRESS, abi} from "../constants";

export default function Home()
{
  const [walletConnected, setwalletConnected] = useState(false);
  const [joinedWhitelist, setjoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    
    const {chainId} = await web3Provider.getNetwork();
    console.log("chainId", chainId)
    if (chainId!==5)
    {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const addAddressToWhitelist = async () => {
    try{
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setjoinedWhitelist(true);
    } catch (err){
      console.log(err);
    }
  };

  const getNumberOfWhitelisted = async () => {
    try{
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err){
      console.error(err);
    }
  };

  const checkIfAddressInWhitelist = async () => {
    try{
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistAddress(address);
      setjoinedWhitelist(_joinedWhitelist);
    } catch (err)
    {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try{
      await getProviderOrSigner();
      setwalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err)
    {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (walletConnected){
      if (joinedWhitelist){
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        )
      }
      else if (loading){
        return <button className={styles.button}>Loading...</button>;
      } else{
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    }
    else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }
  };

  useEffect(()=>{
    if (!walletConnected)
    {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }

  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs</h1>
        <div className={styles.description}>
          Its a NFT collection for developers in Crypto.
        </div>
        <div className={styles.description}>
          {numberOfWhitelisted} have already joined the Whitelist
        </div>
        {renderButton()}
      </div>
      <div>
        <img className={styles.image} src="./crypto-devs.svg"/>
      </div>
    </div>
    <footer className={styles.footer}>
      Made with &#10084; by Crypto Devs
    </footer>
    </div>
  );

}