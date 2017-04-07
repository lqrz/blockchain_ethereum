pragma solidity ^0.4.8;

contract EtherVote {

    event LogVote(string project, bool vote, address voter_address);

    function vote(string project, bool vote) {
        LogVote(project, vote, msg.sender);
    }

    function () {
    	throw;
    }
}