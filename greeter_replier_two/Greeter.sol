pragma solidity ^0.4.8;


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
            selfdestruct(owner);
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
    
    mapping(bytes32=>bytes32) greeting_reply_dict;
    
    function Greeter_replier(){
    	greeting_reply_dict["op1"] = "Hi. How are you?";
    	greeting_reply_dict["op2"] = "Doing good";
    	greeting_reply_dict["op3"] = "Bye";
    }
    
    function greet(bytes32 _greeting) constant returns (bytes32){
        return greeting_reply_dict[_greeting];
    }
}


contract Greeter is Mortal, Helper {
    
    // a contract cannot currently read a string that is obtained from another contract.
    // https://forum.ethereum.org/discussion/10602/cannot-pass-string-from-one-contract-into-another-contract
    address greeter_replier_address;
    mapping(bytes32=>bytes32) greeting_dict;

    /* this runs when the contract is executed */
    function Greeter() {
        // circular factory is not allowed.
        greeter_replier_address = new Greeter_replier();

    	greeting_dict["op1"] = "Hello";
    	greeting_dict["op2"] = "Great. You?";
    	greeting_dict["op3"] = "Goodbye";
    }

    /* main function */
    function greet(bytes32 _greeting) constant returns (string, string) {
        Greeter_replier greeter_replier_contract = Greeter_replier(greeter_replier_address);
        return (bytes32ToString(greeting_dict[_greeting]), bytes32ToString(greeter_replier_contract.greet(_greeting)));
    }

    function say_something() returns (string){
        return "Something!";
    }
}