# blockchain_ethereum

Repo with some toy examples on Solidity.

### Ether_vote
Allows people to vote on projects. Votes get stored on the Blockchain. The webapp server watches Blockchain events and transmits them to the client using Socket.io.

### greeter
Contains a simple inheritance example.

### greeter_replier
A case where a contract creates another contract and calls it.
TBN: there is no circular instantiation in Solidity. There is no string concatenation. A function can return multiple values.

### user_service
A user has many services. The service sets the debt for the user.
TBN: Shows how to use a dict of contracts (they are indexed by address). Shows how to call another contract's function.
