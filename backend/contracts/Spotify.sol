// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Spotify {
    uint256 private trackCount = 0; 
    struct Track {
        uint256 id;
        address owner;
        string audio; // URI of the audio file
        string artist; // Artist name
        uint256 tipsReceived; // Amount of tips received
    }

    mapping(uint256 => Track) public tracks;

    event TrackUploaded(uint256 id, string audio, string artist, uint256 tipsReceived, address owner);
    event TrackTipped(address indexed sender, uint256 trackId, uint256 amount);

    // Upload new track
    function uploadTrack(string memory _audio, string memory _artist) external {
        require(bytes(_audio).length > 0, "Audio file is required.");
        require(bytes(_artist).length > 0, "Artist name is required.");

        trackCount++;
        tracks[trackCount] = Track(trackCount, msg.sender, _audio, _artist, 0);

        emit TrackUploaded(trackCount, _audio, _artist, 0, msg.sender);
    }

    // View a specific track by its ID
    function viewTrack(uint256 trackId) external view returns (Track memory) {
        require(trackId > 0 && trackId <= trackCount, "Track does not exist.");
        return tracks[trackId];
    }

    // View all tracks uploaded on the platform
    function viewAllTracks() external view returns (Track[] memory) {
        Track[] memory allTracks = new Track[](trackCount);
        for (uint256 i = 1; i <= trackCount; i++) {
            allTracks[i - 1] = tracks[i];
        }
        return allTracks;
    }

    // Tip the creator of a track
    function tipTrack(uint256 trackId) external payable {
        require(trackId > 0 && trackId <= trackCount, "Track does not exist.");
        require(msg.value > 0, "Tip amount must be greater than zero.");

        tracks[trackId].tipsReceived += msg.value;
        payable(tracks[trackId].owner).transfer(msg.value);

        emit TrackTipped(msg.sender, trackId, msg.value);
    }

    // Get the total number of tracks
    function getTrackCount() external view returns (uint256) {
        return trackCount;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
