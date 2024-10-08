import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Instagram = ({ contract, account }) => {
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState({ image: "", caption: "" });

  // Fetch all posts from the contract
  const fetchPosts = async () => {
    if (contract) {
      try {
        const totalPosts = await contract.getPostCount().call();
        const postsArray = [];
        for (let i = 1; i <= totalPosts; i++) {
          const postData = await contract.viewPost(i).call();
          const formattedPost = {
            owner: postData.owner,
            imageHash: postData.imageHash,
            caption: postData.caption,
            tipsReceived: postData.tipsReceived.toString(),
            id: i,
          };
          postsArray.push(formattedPost);
        }
        setPosts(postsArray);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  // Handle file upload to IPFS via Pinata
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            headers: {
              pinata_api_key: '35cb1bf7be19d2a8fa0d',
              pinata_secret_api_key: '2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50',
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const imageUrl = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
        setPost({ ...post, image: imageUrl });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  // Handle uploading post to the smart contract
  const uploadPost = async (e) => {
    e.preventDefault();
    if (!post.image || !post.caption) return alert('Image and caption are required!');

    try {
      const tx = await contract.uploadPost(post.image, post.caption).send({
        from: account,
      });

      if (tx) {
        alert('Post uploaded successfully!');
        fetchPosts(); // Refresh the posts after upload
        setPost({ image: "", caption: "" }); // Reset form
      } else {
        alert('Transaction failed.');
      }
    } catch (error) {
      console.error("Error uploading post:", error);
    }
  };

  // Tip the post owner
  const tipPostOwner = async (postId) => {
    if (contract) {
      try {
        await contract.tipPost(postId).send({ from: account, value: window.tronWeb.toSun(10) });
        fetchPosts(); // Refresh posts after tipping
      } catch (error) {
        console.error("Error tipping post:", error);
      }
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [contract]);

  return (
    <div>
      <button onClick={fetchPosts}>Fetch Posts</button>
      <form onSubmit={uploadPost}>
        <h2>New Post</h2>
        <input
          type="file"
          name="image"
          onChange={handleFileUpload}
          required
        />
        <input
          type="text"
          name="caption"
          placeholder="Enter Caption"
          value={post.caption}
          onChange={handleChange}
          required
        />
        <button type="submit">Upload Post</button>
      </form>

      <h2>Posts</h2>
      <div className="post-list">
        {posts.map((postData, index) => (
          <div key={index} className="post">
            <p><strong>Owner:</strong> {postData.owner}</p>
            <p>{postData.caption}</p>
            <img src={postData.imageHash} alt="Post" />
            <p><strong>Tips Received:</strong> {postData.tipsReceived} SUN</p>
            <button onClick={() => tipPostOwner(postData.id)}>Tip</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instagram;
