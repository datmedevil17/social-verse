var Twitter = artifacts.require("./Twitter.sol");
var Instagram = artifacts.require("./Instagram.sol");
var Profiles = artifacts.require("./Profiles.sol");
var Spotify = artifacts.require("./Spotify.sol");
var TrophyTokens = artifacts.require("./TrophyTokens.sol");

module.exports = function(deployer) {
  deployer.deploy(Twitter);
  deployer.deploy(Instagram);
  deployer.deploy(Profiles);
  deployer.deploy(Spotify);
  deployer.deploy(TrophyTokens);

};
