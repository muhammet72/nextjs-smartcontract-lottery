import { ConnectButton } from "web3uikit"
import React from "react"

const Header = () => {
  return (
    <div>
      Decentralized Lottery
      <ConnectButton moralisAuth={false} />
    </div>
  )
}

export default Header