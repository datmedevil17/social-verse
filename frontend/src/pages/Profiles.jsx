import React, { useState, useEffect } from "react";
import axios from "axios";

const Profiles = ({ contract, account }) => {
  const [profiles, setProfiles] = useState([]);
  const [profileURI, setProfileURI] = useState("");
  const [currentProfile, setCurrentProfile] = useState(null);

  // Fetch all profiles owned by the current account
  const fetchProfiles = async () => {
    if (contract) {
      try {
        const userProfileIds = await contract
          .getMyProfiles()
          .call({ from: account });
        const profileArray = [];

        for (let i = 0; i < userProfileIds.length; i++) {
          const tokenId = userProfileIds[i];
          const tokenURI = await contract.tokenURI(tokenId).call();
          const profile = { id: tokenId, uri: tokenURI };
          profileArray.push(profile);
        }

        setProfiles(profileArray);

        // Fetch the current active profile
        const activeProfileId = await contract
          .getProfile()
          .call({ from: account });
        setCurrentProfile(activeProfileId);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    }
  };

  // Handle file upload to IPFS via Pinata
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            headers: {
              pinata_api_key: "35cb1bf7be19d2a8fa0d",
              pinata_secret_api_key:
                "2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50",
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const ipfsUrl = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
        setProfileURI(ipfsUrl);
      } catch (error) {
        console.error("Error uploading profile image:", error);
      }
    }
  };

  // Mint a new profile NFT
  const mintProfile = async (e) => {
    e.preventDefault();
    if (!profileURI) return alert("Profile URI is required!");

    try {
      const tx = await contract.mintProfile(profileURI).send({
        from: account,
      });

      if (tx) {
        alert("Profile minted successfully!");
        fetchProfiles(); // Refresh the profiles after minting
        setProfileURI(""); // Reset form
      } else {
        alert("Transaction failed.");
      }
    } catch (error) {
      console.error("Error minting profile:", error);
    }
  };

  // Set a profile as the active profile
  const setActiveProfile = async (profileId) => {
    if (contract) {
      try {
        await contract.setProfile(profileId).send({ from: account });
        setCurrentProfile(profileId);
        alert("Profile set successfully!");
      } catch (error) {
        console.error("Error setting profile:", error);
      }
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [contract]);

  return (
    <div>
      <h2>Mint New Profile</h2>
      <form onSubmit={mintProfile}>
        <input
          type="file"
          name="profile"
          onChange={handleFileUpload}
          required
        />
        <button type="submit">Mint Profile</button>
      </form>

      <h2>Your Profiles</h2>
      <div className="profile-list">
        // Displaying the profiles
        {profiles.map((profile) => (
          <div key={profile.id} className="profile">
            <p>
              <strong>Profile ID:</strong> {profile.id.toString()}
            </p>{" "}
            {/* Convert to string */}
            <img
              src={profile.uri}
              alt={`Profile ${profile.id}`}
              width={100}
              height={100}
            />
            <button onClick={() => setActiveProfile(profile.id)}>
              {currentProfile === profile.id
                ? "Active Profile"
                : "Set as Active Profile"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profiles;
