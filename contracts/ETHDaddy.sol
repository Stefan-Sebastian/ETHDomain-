//SPDX-License-Identifier: UNLINCESED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ETHDaddy is ERC721{

	//track the owner...
	address public owner;

	//track the max supply..
	uint256 public maxSupply;

	//track the total supply..
	uint256 public totalSupply;

	//Track all the domains creted..
	mapping(uint256 => Domain) public domains;

	//Initialize state variable..
	constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol){

		owner = msg.sender;

	}

	struct Domain{

		string name;
		uint256 cost;
		bool isOwned;
	}

	//Only owner can call the list function..
	modifier onlyOwner {
		require(msg.sender == owner, 'Only owner can call this method');
		_;
	}

	

	//Owner lists the domain..
	function list(string memory _name, uint256 _cost) public onlyOwner{

		//Update domains..
		maxSupply++;
		domains[maxSupply] = Domain(_name, _cost, false);
	}


	function mint(uint256 _id) public payable {

		require(_id != 0, 'Invalid ID');
		require(_id <= maxSupply, 'ID DOES NOT EXIST');
		require(domains[_id].isOwned == false, 'DOMAIN ALREADY OWNED');
		require(msg.value >= domains[_id].cost, 'INSUFFCIENT BALANCE');

		_safeMint(msg.sender, _id);

		totalSupply++;

		domains[_id].isOwned = true;
	}

	//Get the domain struct..
	function getDomain(uint256 _id) public view returns(Domain memory){

		return domains[_id];
	}

	//Get the balance of the contract..
	function getBalance() public view returns(uint256){
		return address(this).balance;
	}

	//Withdraw funds..
	function withdraw() public onlyOwner {

		(bool success, ) = owner.call{value: address(this).balance}("");
		require(success);
	}

}
















