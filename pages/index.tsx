import { useContract, useContractRead, useAddress, useOwnedNFTs, ThirdwebNftMedia, Web3Button } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import NFTCard from "../components/NFTCard";
import { BigNumber } from "ethers";
import { useState, useEffect} from "react";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const address = useAddress();

  const meloAddress = "0x3AFc640336C05991492007798c6A9171058FE6a0";
  const stakingAddress = "0x06d6168b5a1cC59Ac0a4b63dFdA493281cc5FeB7";

  const { contract: meloContract } = useContract(meloAddress, "nft-drop");
  const { contract: stakingContract } = useContract(stakingAddress);

  const { data: myMeloNFTs} = useOwnedNFTs(meloContract, address);
  const { data: stakedMeloNFTs } = useContractRead(stakingContract, "getStakeInfo", address);

  async function stakeNFT(nftId: string) {
    if(!address) return;

    const isApproved = await meloContract?.isApproved(
      address,
      stakingAddress
    );

    if(!isApproved) {
      await meloContract?.setApprovalForAll(stakingAddress, true);
    }

    await stakingContract?.call("stake", [nftId])
  }

const [claimableRewards, setClaimableRewards] = useState<BigNumber>();

useEffect(() => {
  if(!stakingContract || !address) return;

  async function loadClaimableRewards() {
    const stakeInfo = await stakingContract?.call("getStakeInfo", address);
    setClaimableRewards(stakeInfo[1]);
  }

  loadClaimableRewards();
}, [address, stakingContract]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Like Melo</h1>
        <Web3Button
        contractAddress={meloAddress}
        action={(meloContract) => meloContract.erc721.claim(1)}
        >Claim Melo</Web3Button>
        <br />
        <h1>My Like Melo:</h1>
        <div>
          {myMeloNFTs?.map((nft) => (
            <div key={nft.metadata.id}>
              <h3>{nft.metadata.name}</h3>
              <ThirdwebNftMedia
               metadata={nft.metadata}
               height="100px"
               width="100px"
              />
              <Web3Button
                contractAddress={stakingAddress}
                action={() => stakeNFT(nft.metadata.id)}
              >Stake Like Melo</Web3Button>
            </div>
          ))}
        </div>
        <h1>Staked Like Melo:</h1>
        <div>
          {stakedMeloNFTs && stakedMeloNFTs[0].map((stakedNFT: BigNumber) => (
            <div key={stakedNFT.toString()}>
              <NFTCard tokenId={stakedNFT.toNumber()} />
            </div>
          ))}
        </div>
        <br />
        <h1>Claimable $STREAK:</h1>
        {!claimableRewards ? "Loading..." : ethers.utils.formatUnits(claimableRewards, 18)}
        <Web3Button
          contractAddress={stakingAddress}
          action={(stakingContract) => stakingContract.call("ClaimRewards")}
        >Claim $STREAK</Web3Button>
      </main>
    </div>
  );
};

export default Home;
