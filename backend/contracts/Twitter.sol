// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Twitter {
    uint256 private tweetCount = 0; 
    struct Content {
        uint256 id;
        address owner;
        string message; 
        uint256 tipsReceived;
    }
    mapping(uint256 => Content) public tweets;

    event TweetCreated(uint256 id, string message, uint256 tipsReceived, address owner);
    event TweetTipped(address indexed sender, uint256 tweetId, uint256 amount);

    function uploadTweet(string memory _message) external {
        require(bytes(_message).length > 0, "Cannot pass empty message");

        tweetCount++;
        tweets[tweetCount] = Content(tweetCount, msg.sender, _message, 0);

        emit TweetCreated(tweetCount, _message, 0, msg.sender);
    }

    function viewTweet(uint256 tweetId) external view returns (Content memory) {
        require(tweetId > 0 && tweetId <= tweetCount, "Tweet does not exist.");
        return tweets[tweetId];
    }

    // View all tweets
    function viewAllTweets() external view returns (Content[] memory) {
        Content[] memory allTweets = new Content[](tweetCount);
        for (uint256 i = 1; i <= tweetCount; i++) {
            allTweets[i - 1] = tweets[i];
        }
        return allTweets;
    }

    function tipTweet(uint256 tweetId) external payable {
        require(tweetId > 0 && tweetId <= tweetCount, "Tweet does not exist.");
        require(msg.value > 0, "Tip amount must be greater than zero.");

        tweets[tweetId].tipsReceived += msg.value;
        payable(tweets[tweetId].owner).transfer(msg.value);

        emit TweetTipped(msg.sender, tweetId, msg.value);
    }
    function getTweetCount() external view returns (uint256) {
        return tweetCount;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
