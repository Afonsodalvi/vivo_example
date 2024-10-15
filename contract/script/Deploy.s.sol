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
    address smartWallet = address(0x50A6652e4E5156CBbcb14f64Ad9d29627eF69E52);
    //endereco Vivo contract 0x4AdA436E21fadfFB41Dd2e0645BFb2A11e29Fe5c Amoy bytes32
    //endereco Vivo contract 0x6f6b8a35A45103684Ca797595eB372feC933ad7F Amoy
    // endereco Vivo amoy: 0xf5534d349Cf86D8C586c90527519D59362ee986D Amoy easy
    // endereco Vivo contract 0xf5534d349Cf86D8C586c90527519D59362ee986D Holesky

    function run() public {
        config = new HelperConfig();
        (uint256 key) = config.activeNetworkConfig();

        vm.startBroadcast(vm.rememberKey(key));

        vivoTelefonic = new RastroDid();

        console.log("endereco Vivo contract", address(vivoTelefonic));
    }
}
