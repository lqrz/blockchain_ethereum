pragma solidity ^0.4.0;


contract Mortal {
    /* Define variable owner of the type address*/
    address owner;

    /* this function is executed at initialization and sets the owner of the contract */
    function Mortal() {
        owner = msg.sender;
    }

    /* Function to recover the funds on the contract */
    function kill() {
        if (msg.sender == owner){
            suicide(owner);
        }
    }
}


contract Helper {
    
    function bytes32ToString(bytes32 x) constant returns (string) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }
    
}


contract Greeter_replier is Mortal{
    
    bytes32 greeting;
    
    function Greeter_replier(bytes32 _greeting){
        greeting = _greeting;
    }
    
    function greet() constant returns (bytes32){
        return greeting;
    }
}


contract Greeter is Mortal, Helper {
    
    // a contract cannot currently read a string that is obtained from another contract.
    // https://forum.ethereum.org/discussion/10602/cannot-pass-string-from-one-contract-into-another-contract
    bytes32 greeting;
    address greeter_replier_address;

    /* this runs when the contract is executed */
    function Greeter(bytes32 _greeting1, bytes32 _greeting2) {
        greeting = _greeting1;
        // circular factory is not allowed.
        greeter_replier_address = new Greeter_replier(_greeting2);
    }

    /* main function */
    function greet() constant returns (string, string) {
        Greeter_replier greeter_replier_contract = Greeter_replier(greeter_replier_address);
        return (bytes32ToString(greeting), bytes32ToString(greeter_replier_contract.greet()));
    }
}