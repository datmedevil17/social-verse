// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Profiles is ERC721URIStorage {
    uint256 public tokenCount; // Tracks the total number of NFTs (profiles) minted
    mapping(address => uint256) public profiles; // Maps each user to their active profile

    event ProfileMinted(address indexed user, uint256 tokenId, string tokenURI);
    event ProfileSet(address indexed user, uint256 tokenId);

    constructor() ERC721("UserProfile", "PROFILE") {}

    
    function mintProfile(string memory _tokenURI) external returns (uint256) {
        tokenCount++; // Increment token count
        _safeMint(msg.sender, tokenCount); // Mint the NFT
        _setTokenURI(tokenCount, _tokenURI); // Set the URI for the token metadata
        setProfile(tokenCount); // Automatically set the minted token as the user's profile
        
        emit ProfileMinted(msg.sender, tokenCount, _tokenURI); // Emit event for profile minted
        return tokenCount;
    }

   
    function setProfile(uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "You must own this profile to set it.");
        profiles[msg.sender] = _tokenId; // Set the provided token as the active profile
        emit ProfileSet(msg.sender, _tokenId); // Emit event for profile set
    }

  
    function getProfile() external view returns (uint256) {
        return profiles[msg.sender]; // Return the active profile for the calling user
    }

    
    function getProfileOf(address _user) external view returns (uint256) {
        return profiles[_user]; // Return the active profile for the specified user
    }

    function getMyProfiles() external view returns (uint256[] memory) {
        uint256 balance = balanceOf(msg.sender); // Get the number of NFTs owned by the user
        uint256[] memory _profileIds = new uint256[](balance); // Create an array to store the token IDs
        uint256 currentIndex = 0;
        
        // Iterate over all minted tokens and check ownership
        for (uint256 i = 1; i <= tokenCount; i++) {
            if (ownerOf(i) == msg.sender) {
                _profileIds[currentIndex] = i;
                currentIndex++;
            }
        }
        return _profileIds;
    }

    function getProfileCount() external view returns (uint256 userProfileCount, uint256 totalProfileCount) {
        userProfileCount = balanceOf(msg.sender); // Return the number of profiles the user owns
        totalProfileCount = tokenCount; // Return the total number of profiles minted
    }
}
