// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Instagram {
    uint256 private postCount = 0;

    struct Post {
        uint256 id;
        address owner;
        string imageHash; // IPFS hash or URL to the image
        string caption;
        uint256 tipsReceived;
    }

    mapping(uint256 => Post) public posts;

    event PostCreated(uint256 id, string imageHash, string caption, uint256 tipsReceived, address owner);
    event PostTipped(address indexed sender, uint256 postId, uint256 amount);

    function uploadPost(string memory _imageHash, string memory _caption) external {
        require(bytes(_imageHash).length > 0, "Image is required");
        require(bytes(_caption).length > 0, "Caption cannot be empty");

        postCount++;
        posts[postCount] = Post(postCount, msg.sender, _imageHash, _caption, 0);

        emit PostCreated(postCount, _imageHash, _caption, 0, msg.sender);
    }

    function viewPost(uint256 postId) external view returns (Post memory) {
        require(postId > 0 && postId <= postCount, "Post does not exist.");
        return posts[postId];
    }

    // View all posts
    function viewAllPosts() external view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCount);
        for (uint256 i = 1; i <= postCount; i++) {
            allPosts[i - 1] = posts[i];
        }
        return allPosts;
    }

    function tipPost(uint256 postId) external payable {
        require(postId > 0 && postId <= postCount, "Post does not exist.");
        require(msg.value > 0, "Tip amount must be greater than zero.");

        posts[postId].tipsReceived += msg.value;
        payable(posts[postId].owner).transfer(msg.value);

        emit PostTipped(msg.sender, postId, msg.value);
    }

    function getPostCount() external view returns (uint256) {
        return postCount;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
