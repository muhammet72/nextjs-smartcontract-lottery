import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

const LotteryEntrance = () => {
  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
  // These get re-rendered every time due to our connect button!
  const chainId = parseInt(chainIdHex)
  //console.log(`ChainId is ${chainId}`)
  const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
  const [entranceFee, setEntranceFee] = useState("0")
  const [NumPlayers, setNumPlayers] = useState("0")
  // const [numberOfPlayers, setNumberOfPlayers] = useState("0")
  const [RecentWinner, setRecentWinner] = useState("0")

  const dispatch = useNotification()

  const {
    runContractFunction: enterLottery,
    data: enterTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress, // specify network id
    functionName: "enterLottery",
    params: {},
    msgValue: entranceFee,
  })

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress, // specify network id
    functionName: "getEntranceFee",
    params: {},
  })
  const { runContractFunction: getNumPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress, // specify network id
    functionName: "getNumPlayers",
    params: {},
  })
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress, // specify network id
    functionName: "getRecentWinner",
    params: {},
  })

  async function updateUIValues() {
    // Another way we could make a contract call:
    // const options = { abi, contractAddress: raffleAddress }
    // const fee = await Moralis.executeFunction({
    //     functionName: "getEntranceFee",
    //     ...options,
    // })
    const entranceFeeFromCall = (await getEntranceFee()).toString()
    const numPlayersFromCall = (await getNumPlayers()).toString()
    const recentWinnerFromCall = await getRecentWinner()
    setEntranceFee(entranceFeeFromCall)
    setNumPlayers(numPlayersFromCall)
    setRecentWinner(recentWinnerFromCall)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues()
    }
  }, [isWeb3Enabled])

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    })
  }

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1)
      updateUIValues()
      handleNewNotification(tx)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="p-5">
      <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
      {lotteryAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async () =>
              await enterLottery({
                // onComplete:
                // onError:
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }
            disabled={isLoading || isFetching}
          >
            {/* Enter Lottery */}
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              "Enter Lottery"
            )}
          </button>
          Entrance Fee : Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          <div>The current number of players is: {NumPlayers}</div>
          <div>The most previous winner was: {RecentWinner}</div>
        </div>
      ) : (
        <div>No lottery Addresses</div>
      )}
    </div>
  )
}

export default LotteryEntrance
