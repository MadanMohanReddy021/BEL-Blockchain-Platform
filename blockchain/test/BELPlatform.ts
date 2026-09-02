import { expect } from "chai";
import hre from "hardhat";

describe("BELPlatform", function () {
    it("should mint a digital asset and assign ownership", async function () {

  const { ethers } = await hre.network.connect();

  const [admin, user] = await ethers.getSigners();

  const BELPlatform =
    await ethers.getContractFactory("BELPlatform");

  const platform =
    await BELPlatform.deploy();

  await platform.waitForDeployment();


  // Create Ravi's identity
  await platform.registerIdentity(
    user.address,
    "did:bel:ravi123"
  );


  // Mint BEL digital asset
  await platform.mintAsset(
    user.address,
    "BEL Training Certificate",
    "Certificate for Cybersecurity Training"
  );


  // Check ownership
  const owner =
    await platform.ownerOf(1);

  expect(owner).to.equal(
    user.address
  );


  // Get asset information
  const asset =
    await platform.getAsset(1);

  expect(asset[0]).to.equal(
    "BEL Training Certificate"
  );

  expect(asset[1]).to.equal(
    "Certificate for Cybersecurity Training"
  );

  expect(asset[2]).to.equal(
    user.address
  );
});
it("should prevent normal users from minting assets", async function () {

  const { ethers } = await hre.network.connect();

  const [admin, user] = await ethers.getSigners();

  const BELPlatform =
    await ethers.getContractFactory("BELPlatform");

  const platform =
    await BELPlatform.deploy();

  await platform.waitForDeployment();

  // Create user identity
  await platform.registerIdentity(
    user.address,
    "did:bel:ravi123"
  );

  // User tries to mint
  await expect(
    platform
      .connect(user)
      .mintAsset(
        user.address,
        "Unauthorized Asset",
        "Test"
      )
  ).to.be.revertedWith(
    "No permission to mint"
  );
});
it("should allow a manager to transfer their asset", async function () {

  const { ethers } = await hre.network.connect();

  const [admin, manager, receiver] =
    await ethers.getSigners();

  const BELPlatform =
    await ethers.getContractFactory("BELPlatform");

  const platform =
    await BELPlatform.deploy();

  await platform.waitForDeployment();

  // Create manager identity
  await platform.registerIdentity(
    manager.address,
    "did:bel:manager123"
  );

  // Create receiver identity
  await platform.registerIdentity(
    receiver.address,
    "did:bel:receiver123"
  );

  // Assign manager role
  await platform.assignRole(
    manager.address,
    2
  );

  // Admin mints asset to manager
  await platform.mintAsset(
    manager.address,
    "BEL Digital Certificate",
    "Cybersecurity Training"
  );

  // Manager transfers asset
  await platform
    .connect(manager)
    .transferAsset(
      1,
      receiver.address
    );

  // Verify new ownership
  expect(
    await platform.ownerOf(1)
  ).to.equal(
    receiver.address
  );
});
it("should prevent normal user from transferring someone else's asset", async function () {

  const { ethers } = await hre.network.connect();

  const [admin, manager, user, receiver] =
    await ethers.getSigners();

  const BELPlatform =
    await ethers.getContractFactory("BELPlatform");

  const platform =
    await BELPlatform.deploy();

  await platform.waitForDeployment();

  await platform.registerIdentity(
    manager.address,
    "did:bel:manager123"
  );

  await platform.registerIdentity(
    user.address,
    "did:bel:user123"
  );

  await platform.registerIdentity(
    receiver.address,
    "did:bel:receiver123"
  );

  await platform.assignRole(
    manager.address,
    2
  );

  await platform.mintAsset(
    manager.address,
    "BEL Certificate",
    "Test certificate"
  );

  await expect(
    platform
      .connect(user)
      .transferAsset(
        1,
        receiver.address
      )
  ).to.be.revertedWith(
    "No permission to transfer"
  );
});

  it("should create a user identity", async function () {

    const { ethers } = await hre.network.connect();

    const [admin, user] = await ethers.getSigners();

    const BELPlatform =
      await ethers.getContractFactory("BELPlatform");

    const platform =
      await BELPlatform.deploy();

    await platform.waitForDeployment();

    await platform.registerIdentity(
      user.address,
      "did:bel:ravi123"
    );

    const identity =
      await platform.getIdentity(user.address);

    expect(identity[0]).to.equal(
      "did:bel:ravi123"
    );

    expect(identity[1]).to.equal(true);

    expect(identity[2]).to.equal(1);
  });


  it("should allow admin to assign a role", async function () {

    const { ethers } = await hre.network.connect();

    const [admin, user] = await ethers.getSigners();

    const BELPlatform =
      await ethers.getContractFactory("BELPlatform");

    const platform =
      await BELPlatform.deploy();

    await platform.waitForDeployment();

    await platform.registerIdentity(
      user.address,
      "did:bel:ravi123"
    );

    await platform.assignRole(
      user.address,
      2
    );

    const identity =
      await platform.getIdentity(user.address);

    expect(identity[2]).to.equal(2);
  });


  it("should prevent non-admin from creating identities", async function () {

    const { ethers } = await hre.network.connect();

    const [admin, user] = await ethers.getSigners();

    const BELPlatform =
      await ethers.getContractFactory("BELPlatform");

    const platform =
      await BELPlatform.deploy();

    await platform.waitForDeployment();

    await expect(
  platform
    .connect(user)
    .registerIdentity(
      user.address,
      "did:bel:hacker"
    )
).to.be.revertedWithCustomError(
  platform,
  "OwnableUnauthorizedAccount"
);
  });

});