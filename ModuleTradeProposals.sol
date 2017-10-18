pragma solidity ^0.4.14;


import './Ownable.sol';
import './SellProposal.sol';


contract ModuleTradeProposals is Ownable {

  mapping (address => address[]) public sellerSellProposals;

  mapping (uint => address) public sellProposalListAddress;

  address[] public sellProposals;

  event NewSellProposalEvent (SellProposal _proposal, address _seller, uint _id);

  function ModuleTradeProposals() {
  }


  function createSellProposal(
  address seller,
  uint id,
  string title,
  string details,
  uint price,
  string currency,
  uint units,
  uint total,
  uint validUntil
  ) onlyOwner {
    SellProposal sellProposal = new SellProposal(seller, id, title, details, price, currency, units, total, validUntil);
    sellProposal.setOracle(owner);

    sellerSellProposals[seller].push(sellProposal);
    sellProposalListAddress[id] = sellProposal;
    sellProposals.push(sellProposal);

    NewSellProposalEvent(sellProposal, seller, id);
  }

  function getSellProposalsBySeller(address seller) constant returns (address[]){
    return sellerSellProposals[seller];
  }

  function getSellProposals() constant returns (address[]){
    return sellProposals;
  }

  function getSellProposalById(uint id) constant returns (address){
    return sellProposalListAddress[id];
  }

}