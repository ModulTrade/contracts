const Web3 = require('web3');
const web3 = new Web3();


const SellProposal = artifacts.require('./SellProposal.sol');
const ModuleTradeProposals = artifacts.require('./ModuleTradeProposals.sol');
const owner = '0x1440cbef11f6055efd8597d8398e2ddf6d9c40b7';
const buyer = '0x39f0ca3d145a916746d57f8f86a485716abbdb39';
const proposal = {
  seller: '0xd2c4e747f1b92546d99ee52638d400a05dd60be9',
  id: '37',
  title: 'Title',
  details: 'detail string',
  price: web3.toWei(0.02, 'ether'),
  currency: 'ETH',
  units: 100,
  total: web3.toWei(0.02 * 100, 'ether'),
  validUntil: Math.floor(Date.now() / 1000)
};
let proposalAddress;
contract('ModultradeProposals', () => {
  it('create SellProposal contract', () => {
    return ModuleTradeProposals.deployed()
      .then((moduletradeProposals) => moduletradeProposals.createSellProposal(
        proposal.seller,
        proposal.id,
        proposal.title,
        proposal.details,
        proposal.price,
        proposal.currency,
        proposal.units,
        proposal.total,
        proposal.validUntil,
        {from: owner}
        )
      )
      .then((result) => {
        assert.ok(Boolean(result && result.tx), 'empty transaction hash');
        const newSellProposalEvent = Array.from(result.logs).find((log) => log.event === 'NewSellProposalEvent');
        assert.ok(Boolean(newSellProposalEvent), 'NewSellProposalEvent');
        return newSellProposalEvent && newSellProposalEvent.args;
      })
      .then((args) => {
        proposalAddress = args && args['_proposal'];
        assert.ok(Boolean(proposalAddress), 'ProposalAddress');
      });
  });

  it('get SellProposals By Seller', () => {
    return ModuleTradeProposals.deployed()
      .then(instance => instance.getSellProposalsBySeller.call(proposal.seller))
      .then(result => {
        assert.ok(result && result.length, 'SellProposals not found');
      });
  });

  it('get SellProposals', () => {
    return ModuleTradeProposals.deployed()
      .then(instance => instance.getSellProposals.call())
      .then(result => {
        assert.ok(result && result.length, 'SellProposals not found');
      });
  });

  it('get SellProposal By Id', () => {
    return ModuleTradeProposals.deployed()
      .then(instance => instance.getSellProposalById.call(proposal.id))
      .then(result => {
        assert.ok(result && result === proposalAddress, 'SellProposal not found');
      });
  });

  it('SellProposal contract', () => {
    return Promise.resolve(SellProposal.at(proposalAddress))
      .then((sellProposal) => {
        return Promise.all([
          sellProposal.seller.call(),
          sellProposal.title.call(),
          sellProposal.total.call(),
          sellProposal.validUntil.call()
        ]);
      })
      .then((result) => {
        assert.equal(result[0], proposal.seller, 'seller');
        assert.equal(result[1], proposal.title, 'title');
        assert.equal(result[2], proposal.total, 'total');
        assert.equal(result[3], proposal.validUntil, 'validUntil');
      });
  });

  it('buy SellProposal (send ether)', () => {
    return Promise.resolve(SellProposal.at(proposalAddress))
      .then((instance) => {
        return instance.send(proposal.total, {from: buyer});
      })
      .then((result) => {
        const paidEvent = Array.from(result.logs).find((log) => log.event === 'PaidEvent');
        assert.ok(Boolean(paidEvent), 'PaidEvent');
        return paidEvent && paidEvent.args;
      });
  });

  it('delivery SellProposal', () => {
    return Promise.resolve(SellProposal.at(proposalAddress))
      .then((instance) => {
        return instance.delivery('DHL: 0000-0000-000', {from: owner});
      })
      .then((result) => {
        const deliveryEvent = Array.from(result.logs).find((log) => log.event === 'DeliveryEvent');
        assert.ok(Boolean(deliveryEvent), 'DeliveryEvent');
        return deliveryEvent && deliveryEvent.args;
      });
  });

  it('close SellProposal', () => {
    return Promise.resolve(SellProposal.at(proposalAddress))
      .then((instance) => {
        return instance.close({from: owner});
      })
      .then((result) => {
        const closedEvent = Array.from(result.logs).find((log) => log.event === 'ClosedEvent');
        assert.ok(Boolean(closedEvent), 'ClosedEvent');
        return closedEvent && closedEvent.args;
      });
  });

  it('create SellProposal && cancel', () => {
    return ModuleTradeProposals.deployed()
      .then((moduletradeProposals) => moduletradeProposals.createSellProposal(
        proposal.seller,
        proposal.id,
        proposal.title,
        proposal.details,
        proposal.price,
        proposal.currency,
        proposal.units,
        proposal.total,
        proposal.validUntil,
        {from: owner}
        )
      )
      .then((result) => {
        const event = Array.from(result.logs).find((log) => log.event === 'NewSellProposalEvent');
        assert.ok(Boolean(event), 'NewSellProposalEvent');
        return event && event.args && event.args['_proposal'] || Promise.reject('ProposalAddress');
      })
      .then((address) => {
        return SellProposal.at(address);
      })
      .then((instance) => {
        return instance.cancel({from: owner});
      })
      .then((result) => {
        const canceledEvent = Array.from(result.logs).find((log) => log.event === 'CanceledEvent');
        assert.ok(Boolean(canceledEvent), 'CanceledEvent');
        return canceledEvent && canceledEvent.args;
      });
  });
});