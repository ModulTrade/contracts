pragma solidity ^0.4.14;


import './OracleOwnable.sol';


contract SellProposal is OracleOwnable {
    enum ProposalStates {Created, Paid, Delivery, Closed, Canceled}

    address public seller;

    address public buyer;

    uint public id;

    string public title;

    string public details;

    uint public price;

    string public currency;

    uint public units;

    uint public total;

    uint public validUntil;

    ProposalStates public state;

    string public deliveryId;

    event CreatedEvent(uint _id, ProposalStates _state);

    event PaidEvent(uint _id, ProposalStates _state, address _buyer);

    event DeliveryEvent(uint _id, ProposalStates _state, string _deliveryId);

    event ClosedEvent(uint _id, ProposalStates _state, address _seller, uint _amount);

    event CanceledEvent(uint _id, ProposalStates _state, address _buyer, uint _amount);

    function SellProposal(
    address _seller,
    uint _id,
    string _title,
    string _details,
    uint _price,
    string _currency,
    uint _units,
    uint _total,
    uint _validUntil
    ) {
        seller = _seller;
        id = _id;
        title = _title;
        details = _details;
        price = _price;
        currency = _currency;
        units = _units;
        total = _total;
        validUntil = _validUntil;
        state = ProposalStates.Created;
        CreatedEvent(id, state);
    }

    function() payable {
        purchase();
    }

    function purchase() payable {
        require(state == ProposalStates.Created);
        require(msg.value >= total);
        state = ProposalStates.Paid;
        buyer = msg.sender;
        PaidEvent(id, state, buyer);
    }

    function delivery(string _deliveryId) onlyOracleOrOwner {
        require(state == ProposalStates.Paid);
        deliveryId = _deliveryId;
        state = ProposalStates.Delivery;
        DeliveryEvent(id, state, deliveryId);
    }

    function close() onlyOracleOrOwner {
        require(state == ProposalStates.Delivery);
        state = ProposalStates.Closed;
        seller.transfer(this.balance);
        ClosedEvent(id, state, seller, this.balance);
    }

    function cancel() onlyOracleOrOwner {
        require(state != ProposalStates.Closed);
        if (this.balance > 0 && buyer != address(0)) {
            buyer.transfer(this.balance);
        }
        state = ProposalStates.Canceled;
        CanceledEvent(id, state, buyer, this.balance);
    }
}