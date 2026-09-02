# BEL Blockchain Platform

A blockchain-based platform for decentralized identity management, role-based access control, and digital asset ownership management.

## Features

- Blockchain-based identity management
- Decentralized Identifier (DID) support
- Role-Based Access Control (RBAC)
- Admin, Manager, Auditor, and User roles
- Digital asset minting using ERC-721 NFTs
- Digital asset ownership verification
- Authorized asset transfer
- Blockchain-based audit history
- MetaMask wallet integration
- React-based user interface

## Architecture

```text
React Frontend
      |
      v
   MetaMask
      |
      v
   ethers.js
      |
      v
BELPlatform.sol
      |
      +-- Identity Management
      +-- Role Management
      +-- Digital Assets
      +-- Ownership
      +-- Asset Transfer
      +-- Audit Events
      |
      v
 Hardhat Local
 Blockchain