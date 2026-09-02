// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BELPlatform is ERC721, Ownable {

    enum Role {
        NONE,
        USER,
        MANAGER,
        AUDITOR,
        ADMIN
    }

    struct Identity {
        string did;
        bool active;
        Role role;
    }

    struct Asset {
        string name;
        string metadata;
    }

    mapping(address => Identity) public identities;

    mapping(uint256 => Asset) public assets;

    uint256 private nextTokenId = 1;

    event IdentityCreated(
        address indexed wallet,
        string did
    );
    event AssetTransferred(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to
);
    event RoleAssigned(
        address indexed wallet,
        Role role
    );

    event AssetMinted(
        uint256 indexed tokenId,
        string name,
        address indexed owner
    );

    constructor()
        ERC721("BEL Digital Asset", "BELNFT")
        Ownable(msg.sender)
    {}

    modifier onlyAdmin() {
        require(
            identities[msg.sender].role == Role.ADMIN ||
            msg.sender == owner(),
            "Only admin allowed"
        );
        _;
    }

    function registerIdentity(
        address _user,
        string memory _did
    ) public onlyOwner {

        require(
            !identities[_user].active,
            "Identity already exists"
        );

        identities[_user] = Identity({
            did: _did,
            active: true,
            role: Role.USER
        });

        emit IdentityCreated(_user, _did);
    }

    function assignRole(
        address _user,
        Role _role
    ) public onlyOwner {

        require(
            identities[_user].active,
            "Identity does not exist"
        );

        identities[_user].role = _role;

        emit RoleAssigned(_user, _role);
    }

   function mintAsset(
    address _user,
    string memory _name,
    string memory _metadata
) public returns (uint256) {

    require(
        canMintAsset(msg.sender),
        "No permission to mint"
    );

    require(
        identities[_user].active,
        "Identity does not exist"
    );

    uint256 tokenId = nextTokenId;

    nextTokenId++;

    _safeMint(_user, tokenId);

    assets[tokenId] = Asset({
        name: _name,
        metadata: _metadata
    });

    emit AssetMinted(
        tokenId,
        _name,
        _user
    );

    return tokenId;
}
    function getAsset(
        uint256 _tokenId
    )
        public
        view
        returns (
            string memory,
            string memory,
            address
        )
    {
        require(
            _ownerOf(_tokenId) != address(0),
            "Asset does not exist"
        );

        Asset memory asset = assets[_tokenId];

        return (
            asset.name,
            asset.metadata,
            ownerOf(_tokenId)
        );
    }

    function getIdentity(
        address _user
    )
        public
        view
        returns (
            string memory,
            bool,
            Role
        )
    {
        Identity memory identity = identities[_user];

        return (
            identity.did,
            identity.active,
            identity.role
        );
    }
    function canMintAsset(address _user)
    public
    view
    returns (bool)
{
    return (
        identities[_user].role == Role.ADMIN ||
        _user == owner()
    );
}

function canTransferAsset(address _user)
    public
    view
    returns (bool)
{
    Role role = identities[_user].role;

    return (
        role == Role.ADMIN ||
        role == Role.MANAGER
    );
}

function canViewAudit(address _user)
    public
    view
    returns (bool)
{
    Role role = identities[_user].role;

    return (
        role == Role.ADMIN ||
        role == Role.AUDITOR
    );
}
function transferAsset(
    uint256 _tokenId,
    address _to
) public {

    require(
        canTransferAsset(msg.sender),
        "No permission to transfer"
    );

    address currentOwner = ownerOf(_tokenId);

    require(
        msg.sender == currentOwner ||
        identities[msg.sender].role == Role.ADMIN,
        "Not asset owner"
    );

    safeTransferFrom(
        currentOwner,
        _to,
        _tokenId
    );

    emit AssetTransferred(
        _tokenId,
        currentOwner,
        _to
    );
}
}