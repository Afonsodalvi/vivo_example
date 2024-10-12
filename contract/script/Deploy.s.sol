pragma solidity ^0.8.20;

/// -----------------------------------------------------------------------
/// Imports
/// -----------------------------------------------------------------------

import {Script, console} from "forge-std/Script.sol";
import {RastroDid} from "../src/RastroDid.sol"; // Update the path if needed
import {HelperConfig} from "../../../script/HelperConfig.s.sol";

contract Deploy is Script {
    HelperConfig public config;
    RastroDid public vivoTelefonic;

    function run() public {
        config = new HelperConfig();
        (uint256 key) = config.activeNetworkConfig();

        vm.startBroadcast(vm.rememberKey(key));

        // address smartWallet = colocar aquio endereco do dono do contrato;

        vivoTelefonic = new RastroDid(address(0));

        console.log("endereco Vivo contract", address(vivoTelefonic));
    }
}
