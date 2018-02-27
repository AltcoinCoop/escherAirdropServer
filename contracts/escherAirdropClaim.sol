pragma solidity ^0.4.10;

contract EscherAirdrop {
    event onClaim(address indexed claimer);

    mapping(address => uint) public claims;
    address[] public claimers;
    uint public endBlock;
    uint public startBlock;

    function EscherAirdrop(uint _startBlock, uint _endBlock) public {
        startBlock = _startBlock;
        endBlock = _endBlock;
    }

    function claim() public {
        require(endBlock == 0 || block.number <= endBlock);
        require(block.number >= startBlock);

        if (claims[msg.sender] == 0) {
            claimers.push(msg.sender);
        }
        claims[msg.sender] = 1;
        onClaim(msg.sender);
    }

    function claimersCount() constant public returns(uint) {
        return claimers.length;
    }

    function getClaimers(uint offset, uint limit) constant public returns(address[] _claimers) {
        if (offset < claimers.length) {
            uint count = 0;
            uint resultLength = claimers.length - offset > limit ? limit : claimers.length - offset;
            _claimers = new address[](resultLength);
            for(uint i = offset; (i < claimers.length) && (count < limit); i++) {
                _claimers[count] = claimers[i];
                count++;
            }

            return(_claimers);
        }
    }
}
