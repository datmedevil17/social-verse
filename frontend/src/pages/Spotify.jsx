import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Spotify = ({ contract, account }) => {
  const [tracks, setTracks] = useState([]);
  const [track, setTrack] = useState({ audio: "", artist: "" });

  // Fetch all tracks from the contract
  const fetchTracks = async () => {
    if (contract) {
      try {
        const totalTracks = await contract.getTrackCount().call();
        const tracksArray = [];
        for (let i = 1; i <= totalTracks; i++) {
          const trackData = await contract.viewTrack(i).call();
          const formattedTrack = {
            owner: trackData.owner,
            audio: trackData.audio,
            artist: trackData.artist,
            tipsReceived: trackData.tipsReceived.toString(),
            id: i,
          };
          tracksArray.push(formattedTrack);
        }
        setTracks(tracksArray);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setTrack({ ...track, [e.target.name]: e.target.value });
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

        const audioUrl = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
        setTrack({ ...track, audio: audioUrl });
      } catch (error) {
        console.error("Error uploading audio:", error);
      }
    }
  };

  // Handle uploading track to the smart contract
  const uploadTrack = async (e) => {
    e.preventDefault();
    if (!track.audio || !track.artist) return alert('Audio and artist name are required!');

    try {
      const tx = await contract.uploadTrack(track.audio, track.artist).send({
        from: account,
      });

      if (tx) {
        alert('Track uploaded successfully!');
        fetchTracks(); // Refresh tracks after upload
        setTrack({ audio: "", artist: "" }); // Reset form
      } else {
        alert('Transaction failed.');
      }
    } catch (error) {
      console.error("Error uploading track:", error);
    }
  };

  // Tip the track owner
  const tipTrackOwner = async (trackId) => {
    if (contract) {
      try {
        await contract.tipTrack(trackId).send({ from: account, value: window.tronWeb.toSun(10) });
        fetchTracks(); // Refresh tracks after tipping
      } catch (error) {
        console.error("Error tipping track:", error);
      }
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [contract]);

  return (
    <div>
      <button onClick={fetchTracks}>Fetch Tracks</button>
      <form onSubmit={uploadTrack}>
        <h2>New Track</h2>
        <input
          type="file"
          name="audio"
          onChange={handleFileUpload}
          required
        />
        <input
          type="text"
          name="artist"
          placeholder="Enter Artist Name"
          value={track.artist}
          onChange={handleChange}
          required
        />
        <button type="submit">Upload Track</button>
      </form>

      <h2>Tracks</h2>
      <div className="track-list">
        {tracks.map((trackData, index) => (
          <div key={index} className="track">
            <p><strong>Owner:</strong> {trackData.owner}</p>
            <p>{trackData.artist}</p>
            <audio controls>
              <source src={trackData.audio} type="audio/mpeg" />
            </audio>
            <p><strong>Tips Received:</strong> {trackData.tipsReceived} SUN</p>
            <button onClick={() => tipTrackOwner(trackData.id)}>Tip</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Spotify;
