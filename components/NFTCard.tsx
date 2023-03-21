import { FC } from 'react';
import { ThirdwebNftMedia, useContract, useNFT, Web3Button } from "@thirdweb-dev/react";

interface NFTCardProps {
    tokenId: number;
}

const NFTCard: FC<NFTCardProps> = ({ tokenId }) => {
   const meloAddress = "0x3AFc640336C05991492007798c6A9171058FE6a0";
   const stakingAddress = "0x06d6168b5a1cC59Ac0a4b63dFdA493281cc5FeB7";

   const { contract: meloContract } = useContract(meloAddress, "nft-drop");
   const { contract: stakingContract } = useContract(stakingAddress);
   const { data: nft } = useNFT(meloContract, tokenId);

   async function withdraw(nftId: string) {
    await stakingContract?.call("withdraw", [nftId]);
   }

    return (
        <>
           {nft && (
            <div>
                <h3>{nft.metadata.name}</h3>
                 {nft.metadata && (
                    <ThirdwebNftMedia
                        metadata={nft.metadata}
                    />
                 )}
                 <Web3Button
                    contractAddress={stakingAddress}
                    action={() => withdraw(nft.metadata.id)}
                 >Withdraw</Web3Button>
            </div>
           )}
        </>
    )
}
export default NFTCard;