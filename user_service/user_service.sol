pragma solidity ^0.4.0;


contract Service{
    
    string public name;
    
    function Service(string _name){
        name = _name;
    }
    
    function set_debt(address _user_address, uint256 _debt_amount){
        
        // im referencing another contract by its address
        User user = User(_user_address);
        user.set_debt(_debt_amount);
        
    }
}


contract User{
    
    string public name;
    
    struct Service{
        bool active;
        uint last_update;
        uint256 debt; // whenever we deal with Ether, it should be 256.
    }
    
    mapping(address => Service) public services;
    
    function User(string _name){
        name = _name;
    }
    
    function register_service(address _provider_address){
        services[_provider_address] = Service({
                                active: true,
                                last_update: now,
                                debt: 0
                                });
    }
    
    function set_debt(uint256 _debt_amount){
        
        if (services[msg.sender].active){
            services[msg.sender].debt = _debt_amount;
            services[msg.sender].last_update = now;
        }else{
            throw;
        }
    }
    
}