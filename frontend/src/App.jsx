import { useState } from "react";
import { ethers } from "ethers";
import contractData from "./contracts/BELPlatform.json";
import "./App.css";
const ROLE_NAMES = [
  "NONE",
  "USER",
  "MANAGER",
  "AUDITOR",
  "ADMIN",
];
const CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [assetId, setAssetId] = useState("1");
const [asset, setAsset] = useState(null);
  const [account, setAccount] = useState("");
const [identity, setIdentity] = useState(null);
const [loading, setLoading] = useState(false);
const [auditMessage, setAuditMessage] = useState("");
const [auditEvents, setAuditEvents] = useState([]);
const [roleUserAddress, setRoleUserAddress] = useState("");
const [selectedRole, setSelectedRole] = useState("1");
const [roleMessage, setRoleMessage] = useState("");
const [userAddress, setUserAddress] = useState("");
const [did, setDid] = useState("");
const [assetUserAddress, setAssetUserAddress] = useState("");
const [assetName, setAssetName] = useState("");
const [assetMetadata, setAssetMetadata] = useState("");
const [assetMessage, setAssetMessage] = useState("");
const [mintedTokenId, setMintedTokenId] = useState("");
const [message, setMessage] = useState("");
const [transferTokenId, setTransferTokenId] = useState("1");
const [transferTo, setTransferTo] = useState("");
const [transferMessage, setTransferMessage] = useState("");
const currentRole = identity
  ? Number(identity.role)
  : 0;
const isUser = currentRole === 1;
const isManager = currentRole === 2;
const isAuditor = currentRole === 3;

const isAdmin =
  currentRole === 4 ||
  account?.toLowerCase() ===
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
async function loadAuditHistory() {
  try {
    setLoading(true);
    setAuditMessage("");
    setAuditEvents([]);

    const provider = new ethers.BrowserProvider(
      window.ethereum
    );

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractData.abi,
      provider
    );

    const identityEvents = await contract.queryFilter(
      contract.filters.IdentityCreated()
    );

    const roleEvents = await contract.queryFilter(
      contract.filters.RoleAssigned()
    );

    const mintEvents = await contract.queryFilter(
      contract.filters.AssetMinted()
    );

    const transferEvents = await contract.queryFilter(
      contract.filters.AssetTransferred()
    );

    const events = [];

    for (const event of identityEvents) {
      events.push({
        type: "Identity Created",
        details: `Wallet: ${event.args[0]}, DID: ${event.args[1]}`
      });
    }

    for (const event of roleEvents) {
      events.push({
        type: "Role Assigned",
        details: `Wallet: ${event.args[0]}, Role: ${event.args[1].toString()}`
      });
    }

    for (const event of mintEvents) {
      events.push({
        type: "Asset Minted",
        details: `Token ID: ${event.args[0].toString()}, Name: ${event.args[1]}, Owner: ${event.args[2]}`
      });
    }

    for (const event of transferEvents) {
      events.push({
        type: "Asset Transferred",
        details: `Token ID: ${event.args[0].toString()}, From: ${event.args[1]}, To: ${event.args[2]}`
      });
    }

    setAuditEvents(events);

  } catch (error) {
    console.error(error);

    setAuditMessage(
      error.reason ||
      error.shortMessage ||
      error.message
    );
  } finally {
    setLoading(false);
  }
}
async function transferAsset() {
  if (!transferTokenId || !transferTo) {
    alert("Enter token ID and recipient address");
    return;
  }

  try {
    setLoading(true);
    setTransferMessage("");

    const provider = new ethers.BrowserProvider(
      window.ethereum
    );

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractData.abi,
      signer
    );

    setTransferMessage(
      "Waiting for MetaMask confirmation..."
    );

    const tx = await contract.transferAsset(
      Number(transferTokenId),
      transferTo
    );

    setTransferMessage(
      "Transfer submitted. Waiting for confirmation..."
    );

    await tx.wait();

    setTransferMessage(
      "Asset successfully transferred!"
    );

  } catch (error) {
    console.error(error);

    setTransferMessage(
      error.reason ||
      error.shortMessage ||
      error.message
    );
  } finally {
    setLoading(false);
  }
}
async function getAssetDetails() {
  try {
    setAssetMessage("");
    setAsset(null);

    const provider = new ethers.BrowserProvider(
      window.ethereum
    );

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractData.abi,
      provider
    );

    const result = await contract.getAsset(
      Number(assetId)
    );

    setAsset({
      name: result[0],
      metadata: result[1],
      owner: result[2],
    });

  } catch (error) {
    console.error(error);

    setAssetMessage(
      error.reason ||
      error.shortMessage ||
      "Asset does not exist"
    );
  }
}
async function mintAsset() {
  if (!assetUserAddress || !assetName || !assetMetadata) {
    alert("Please fill all asset details");
    return;
  }

  try {
    setLoading(true);
    setAssetMessage("");

    const provider = new ethers.BrowserProvider(
      window.ethereum
    );

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractData.abi,
      signer
    );

    setAssetMessage("Waiting for MetaMask confirmation...");

    const tx = await contract.mintAsset(
      assetUserAddress,
      assetName,
      assetMetadata
    );

    setAssetMessage(
      "Asset transaction submitted. Waiting for confirmation..."
    );

    const receipt = await tx.wait();

    // Find AssetMinted event
    let tokenId = "";

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);

        if (parsed && parsed.name === "AssetMinted") {
          tokenId = parsed.args[0].toString();
          break;
        }
      } catch {
        // Ignore logs that don't belong to our contract
      }
    }

    setMintedTokenId(tokenId);
    setAssetMessage("Digital asset successfully minted!");

  } catch (error) {
    console.error(error);

    setAssetMessage(
      error.reason ||
      error.shortMessage ||
      error.message
    );
  } finally {
    setLoading(false);
  }
}
async function assignRole() {
  if (!roleUserAddress) {
    alert("Enter user wallet address");
    return;
  }

  try {
    setLoading(true);
    setRoleMessage("");

    const provider = new ethers.BrowserProvider(
      window.ethereum
    );

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractData.abi,
      signer
    );

    const tx = await contract.assignRole(
      roleUserAddress,
      Number(selectedRole)
    );

    setRoleMessage(
      "Role transaction submitted. Waiting for confirmation..."
    );

    await tx.wait();

    setRoleMessage("Role successfully assigned!");

  } catch (error) {
    console.error(error);

    setRoleMessage(
      error.reason ||
      error.shortMessage ||
      error.message
    );
  } finally {
    setLoading(false);
  }
}
async function registerIdentity() {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  if (!userAddress || !did) {
    alert("Enter wallet address and DID");
    return;
  }

  try {
    setLoading(true);
    setMessage("");

    const provider = new ethers.BrowserProvider(
      window.ethereum
    );

    // Get the MetaMask signer
    const signer = await provider.getSigner();

    // Contract connected with signer = can send transactions
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractData.abi,
      signer
    );

    // Send transaction
    const tx = await contract.registerIdentity(
      userAddress,
      did
    );

    setMessage("Transaction submitted. Waiting for confirmation...");

    // Wait for blockchain confirmation
    await tx.wait();

    setMessage("Identity successfully registered!");

    // Read the newly created identity
    const result = await contract.getIdentity(userAddress);

    setIdentity({
      did: result[0],
      active: result[1],
      role: result[2].toString(),
    });

  } catch (error) {
    console.error(error);

    setMessage(
      error.reason ||
      error.shortMessage ||
      error.message
    );
  } finally {
    setLoading(false);
  }
}
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      setLoading(true);

      // Connect MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const wallet = accounts[0];
      setAccount(wallet);

      // Create provider
      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      // Connect to BEL smart contract
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractData.abi,
        provider
      );

      // Read identity from blockchain
      const result = await contract.getIdentity(wallet);
      

    setIdentity({
  did: result[0],
  active: result[1],
  role: result[2].toString(),
});

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="app">

    {/* ================= HEADER ================= */}
    <header className="header">
      <div className="header-content">

        <div className="brand">

          <div className="brand-logo">
            B
          </div>

          <div>
            <h1>BEL Blockchain Platform</h1>
            <p>
              Decentralized Identity & Digital Asset Management
            </p>
          </div>

        </div>

      </div>
    </header>


    {/* ================= MAIN ================= */}
    <div className="container">

      {!account ? (

        /* ================= CONNECT WALLET ================= */

        <div className="connect-area">

          <h2>Welcome to BEL Blockchain</h2>

          <p>
            Connect your MetaMask wallet to access
            the decentralized BEL platform.
          </p>

          <button
            className="connect-button"
            onClick={connectWallet}
          >
            🔗 Connect MetaMask
          </button>

        </div>

      ) : (

        <>

          {/* ================= WALLET + IDENTITY ================= */}

          <div className="top-grid">

            {/* WALLET */}

            <div className="info-card">

              <h2>🔐 Wallet Connected</h2>

              <div className="wallet-address">
                {account}
              </div>

            </div>


            {/* IDENTITY */}

            {identity && (

              <div className="info-card">

                <h2>🪪 Blockchain Identity</h2>

                <div className="identity-grid">

                  <div className="identity-item">

                    <span className="identity-label">
                      DID
                    </span>

                    <span className="identity-value">
                      {identity.did || "Not registered"}
                    </span>

                  </div>


                  <div className="identity-item">

                    <span className="identity-label">
                      Role
                    </span>

                    <span className="role-badge">
                      {ROLE_NAMES[Number(identity.role)]}
                    </span>

                  </div>


                  <div className="identity-item">

                    <span className="identity-label">
                      Status
                    </span>

                    <span className="identity-value">
                      {identity.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                </div>

              </div>

            )}

          </div>


          {loading && (
            <div className="success-message">
              Reading blockchain...
            </div>
          )}


          {/* ================= DASHBOARD ================= */}

          <div className="dashboard-grid">


            {/* ==================================================
                ADMIN - REGISTER IDENTITY
            ================================================== */}

            {isAdmin && (

              <div className="card">

                <div className="card-header">

                  <div className="card-icon">
                    🪪
                  </div>

                  <div>
                    <h2>
                      Register BEL Identity
                    </h2>
                  </div>

                </div>

                <p className="card-description">
                  Create a decentralized identity for
                  a BEL platform user.
                </p>


                <div className="form-group">

                  <label className="form-label">
                    User Wallet Address
                  </label>

                  <input
                    type="text"
                    placeholder="0x..."
                    value={userAddress}
                    onChange={(e) =>
                      setUserAddress(e.target.value)
                    }
                    className="form-input"
                  />

                </div>


                <div className="form-group">

                  <label className="form-label">
                    Decentralized ID
                  </label>

                  <input
                    type="text"
                    placeholder="did:bel:ravi123"
                    value={did}
                    onChange={(e) =>
                      setDid(e.target.value)
                    }
                    className="form-input"
                  />

                </div>


                <button
                  className="btn btn-primary"
                  onClick={registerIdentity}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : "Register Identity"}
                </button>


                {message && (
                  <div className="success-message">
                    {message}
                  </div>
                )}

              </div>

            )}


            {/* ==================================================
                ADMIN - ROLE MANAGEMENT
            ================================================== */}

            {isAdmin && (

              <div className="card">

                <div className="card-header">

                  <div className="card-icon">
                    🛡️
                  </div>

                  <div>
                    <h2>
                      Role Management
                    </h2>
                  </div>

                </div>

                <p className="card-description">
                  Assign blockchain-based roles to
                  registered BEL users.
                </p>


                <div className="form-group">

                  <label className="form-label">
                    Registered User Wallet
                  </label>

                  <input
                    type="text"
                    placeholder="0x..."
                    value={roleUserAddress}
                    onChange={(e) =>
                      setRoleUserAddress(e.target.value)
                    }
                    className="form-input"
                  />

                </div>


                <div className="form-group">

                  <label className="form-label">
                    Select Role
                  </label>

                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value)
                    }
                    className="form-select"
                  >

                    <option value="1">
                      USER
                    </option>

                    <option value="2">
                      MANAGER
                    </option>

                    <option value="3">
                      AUDITOR
                    </option>

                    <option value="4">
                      ADMIN
                    </option>

                  </select>

                </div>


                <button
                  className="btn btn-primary"
                  onClick={assignRole}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : "Assign Role"}
                </button>


                {roleMessage && (
                  <div className="success-message">
                    {roleMessage}
                  </div>
                )}

              </div>

            )}


            {/* ==================================================
                ADMIN - MINT ASSET
            ================================================== */}

            {isAdmin && (

              <div className="card">

                <div className="card-header">

                  <div className="card-icon">
                    🏭
                  </div>

                  <div>
                    <h2>
                      Digital Asset Management
                    </h2>
                  </div>

                </div>

                <p className="card-description">
                  Create a blockchain-backed digital
                  certificate or asset.
                </p>


                <div className="form-group">

                  <label className="form-label">
                    Owner Wallet Address
                  </label>

                  <input
                    type="text"
                    placeholder="0x..."
                    value={assetUserAddress}
                    onChange={(e) =>
                      setAssetUserAddress(e.target.value)
                    }
                    className="form-input"
                  />

                </div>


                <div className="form-group">

                  <label className="form-label">
                    Asset Name
                  </label>

                  <input
                    type="text"
                    placeholder="BEL Digital Certificate"
                    value={assetName}
                    onChange={(e) =>
                      setAssetName(e.target.value)
                    }
                    className="form-input"
                  />

                </div>


                <div className="form-group">

                  <label className="form-label">
                    Asset Metadata
                  </label>

                  <textarea
                    placeholder="Enter certificate or asset information..."
                    value={assetMetadata}
                    onChange={(e) =>
                      setAssetMetadata(e.target.value)
                    }
                    className="form-textarea"
                  />

                </div>


                <button
                  className="btn btn-primary"
                  onClick={mintAsset}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : "Mint Digital Asset"}
                </button>


                {assetMessage && (
                  <div className="success-message">
                    {assetMessage}
                  </div>
                )}


                {mintedTokenId && (

                  <div className="success-message">

                    <strong>
                      Asset Minted Successfully
                    </strong>

                    <br />

                    Token ID: {mintedTokenId}

                  </div>

                )}

              </div>

            )}


            {/* ==================================================
                EVERYONE - ASSET OWNERSHIP
            ================================================== */}

            {account && (

              <div className="card">

                <div className="card-header">

                  <div className="card-icon">
                    📦
                  </div>

                  <div>
                    <h2>
                      Digital Asset Ownership
                    </h2>
                  </div>

                </div>

                <p className="card-description">
                  Verify digital asset ownership directly
                  from the blockchain.
                </p>


                <div className="form-group">

                  <label className="form-label">
                    Token ID
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Enter Token ID"
                    value={assetId}
                    onChange={(e) =>
                      setAssetId(e.target.value)
                    }
                    className="form-input"
                  />

                </div>


                <button
                  className="btn btn-primary"
                  onClick={getAssetDetails}
                >
                  🔍 Verify Ownership
                </button>


                {assetMessage && (
                  <div className="success-message">
                    {assetMessage}
                  </div>
                )}


                {asset && (

                  <div className="asset-result">

                    <h3>
                      🔗 {asset.name}
                    </h3>


                    <div className="asset-detail">

                      <strong>
                        Token ID
                      </strong>

                      <span className="asset-value">
                        {assetId}
                      </span>

                    </div>


                    <div className="asset-detail">

                      <strong>
                        Owner
                      </strong>

                      <span className="asset-value">
                        {asset.owner}
                      </span>

                    </div>


                    <div className="asset-detail">

                      <strong>
                        Metadata
                      </strong>

                      <span className="asset-value">
                        {asset.metadata}
                      </span>

                    </div>

                  </div>

                )}

              </div>

            )}


            {/* ==================================================
                MANAGER / ADMIN - TRANSFER
            ================================================== */}

            {account &&
              (isManager || isAdmin) && (

              <div className="card">

                <div className="card-header">

                  <div className="card-icon">
                    🔄
                  </div>

                  <div>
                    <h2>
                      Transfer Digital Asset
                    </h2>
                  </div>

                </div>

                <p className="card-description">
                  Transfer an asset to another authorized
                  BEL wallet.
                </p>


                <div className="form-group">

                  <label className="form-label">
                    Token ID
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Enter Token ID"
                    value={transferTokenId}
                    onChange={(e) =>
                      setTransferTokenId(e.target.value)
                    }
                    className="form-input"
                  />

                </div>


                <div className="form-group">

                  <label className="form-label">
                    Recipient Wallet
                  </label>

                  <input
                    type="text"
                    placeholder="0x..."
                    value={transferTo}
                    onChange={(e) =>
                      setTransferTo(e.target.value)
                    }
                    className="form-input"
                  />

                </div>


                <button
                  className="btn btn-primary"
                  onClick={transferAsset}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : "Transfer Asset"}
                </button>


                {transferMessage && (

                  <div className="success-message">
                    {transferMessage}
                  </div>

                )}

              </div>

            )}


            {/* ==================================================
                AUDITOR
            ================================================== */}

            {account && isAuditor && (

              <div className="card full-width">

                <div className="card-header">

                  <div className="card-icon">
                    🔎
                  </div>

                  <div>
                    <h2>
                      Auditor Dashboard
                    </h2>
                  </div>

                </div>

                <p className="card-description">
                  Review blockchain activity and verify
                  platform transactions.
                </p>


                <div className="role-badge">
                  AUDITOR ACCESS
                </div>


                <br />
                <br />


                <button
                  className="btn btn-primary"
                  onClick={loadAuditHistory}
                  disabled={loading}
                >
                  {loading
                    ? "Loading..."
                    : "View Blockchain History"}
                </button>


                {auditMessage && (

                  <div className="error-message">
                    {auditMessage}
                  </div>

                )}


                {auditEvents.map((event, index) => (

                  <div
                    className="audit-event"
                    key={index}
                  >

                    <h3>
                      {event.type}
                    </h3>

                    <p>
                      {event.details}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>

        </>

      )}

    </div>


    {/* ================= FOOTER ================= */}

    <footer className="footer">

      BEL Blockchain Platform
      {" • "}
      Decentralized & Secure Digital Infrastructure

    </footer>

  </div>
);
}

export default App;