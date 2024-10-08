import React, { useState, useEffect } from 'react';

const Twitter = ({ contract, account }) => {
  const [tweets, setTweets] = useState([]);
  const [tweet, setTweet] = useState({ tweet: "" });

  const fetchTweets = async () => {
    if (contract) {
      try {
        const totalTweets = await contract.getTweetCount().call(); // Call the function to get the number of tweets
        const tweetsArray = [];
        for (let i = 1; i <= totalTweets; i++) {
          const tweetData = await contract.viewTweet(i).call(); // Fetch each tweet details
          const formattedTweet = {
            owner: tweetData.owner,
            message: tweetData.message,
            tipsReceived: tweetData.tipsReceived.toString(),
            id: i, // Include ID for liking functionality
          };
          tweetsArray.push(formattedTweet);
        }
        setTweets(tweetsArray);
      } catch (error) {
        console.error("Error fetching tweets:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTweet({ ...tweet, [name]: value });
  };

  const uploadTweet = async (e) => {
    e.preventDefault();
    if (contract) {
      try {
        await contract.uploadTweet(tweet.tweet).send({ from: account });
        fetchTweets(); // Fetch updated tweets after upload
        setTweet({ tweet: "" }); // Reset form fields
      } catch (error) {
        console.error("Error uploading tweet:", error);
      }
    }
  };

  const likeTweet = async (id) => {
    if (contract) {
      try {
        await contract.tipTweetOwner(id).send({ from: account, value: window.tronWeb.toSun(1) }); // Tip 1 TRX
        fetchTweets(); // Fetch updated tweets after tip
      } catch (error) {
        console.error("Error tipping tweet owner:", error);
      }
    }
  };

  return (
    <div>
      <button onClick={fetchTweets}>Fetch Tweets</button>
      <form onSubmit={uploadTweet}>
        <h2>New Tweet</h2>
        <input
          type="text"
          name="tweet"
          placeholder="Enter Tweet"
          value={tweet.tweet}
          onChange={handleChange}
          required
        />
        <button type="submit">Upload Tweet</button>
      </form>
      <h2>Tweets</h2>
      <div className="tweet-list">
        {tweets.map((tweetData, index) => (
          <div key={index} className="tweet">
            <p>
              <strong>Owner:</strong> {tweetData.owner}
            </p>
            <p>{tweetData.message}</p>
            <p>
              <strong>Tips Received:</strong> {tweetData.tipsReceived} SUN
            </p>
            <button onClick={() => likeTweet(tweetData.id)}>
              Tip Owner
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Twitter;
