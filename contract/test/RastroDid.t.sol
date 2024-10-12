// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "../src/RastroDid.sol"; // Update the path if needed

contract RastroDidTest is Test {
    RastroDid public rastroDid;
    address public owner = address(0x123);
    address public user1 = address(0x456);
    address public user2 = address(0x789);
    uint256 public costChip = 0.001 ether;

    function setUp() public {
        vm.deal(owner, 10 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);

        vm.startPrank(owner);
        rastroDid = new RastroDid(owner);
        vm.stopPrank();
    }

    function testInitialOwner() public view {
        assertEq(rastroDid.owner(), owner);
    }

    function testCreateChip() public {
        // Setting up test data
        address[] memory users = new address[](1);
        users[0] = user1;

        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;

        bytes32 KYCuser1 = keccak256("KYC for user1");

        RastroDid.InfoChip[] memory infos = new RastroDid.InfoChip[](1); // Should match `users` length
        infos[0] = RastroDid.InfoChip({KYC: KYCuser1, user: user1});

        vm.startPrank(owner);
        rastroDid.createChip(users, ids, infos);
        assertEq(rastroDid.ownerOf(1), user1);
        RastroDid.InfoChip memory infoChip = rastroDid.getInfoChip(1);
        assertEq(infoChip.user, user1);
        assertEq(infoChip.KYC, keccak256("KYC for user1"));
        vm.stopPrank();
    }

    function testFailCreateChipWithMismatchArrayLengths() public {
        // Setting up invalid data with mismatched array lengths
        address[] memory users = new address[](3);
        users[0] = user1;

        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;
        ids[1] = 2;

        bytes32 KYCuser1 = keccak256("KYC for user1");

        RastroDid.InfoChip[] memory infos = new RastroDid.InfoChip[](1); // Should match `users` length
        infos[0] = RastroDid.InfoChip({KYC: KYCuser1, user: user1});

        vm.startPrank(owner);
        rastroDid.createChip(users, ids, infos); // This should revert with ArrayLengthMismatch
        vm.stopPrank();
    }

    function testBuyChip() public {
        uint256 id = 1;

        vm.startPrank(user1);
        rastroDid.buyChip{value: costChip}(id);
        assertEq(rastroDid.ownerOf(id), user1);
        vm.stopPrank();
    }

    function testFailBuyChipWithInsufficientFunds() public {
        uint256 id = 1;

        vm.startPrank(user1);
        rastroDid.buyChip{value: costChip - 0.0001 ether}(id); // This should revert due to insufficient funds
        vm.stopPrank();
    }

    function testSetPermission() public {
        RastroDid.InfoChip memory info = RastroDid.InfoChip({KYC: keccak256("KYC for user1"), user: user1});

        vm.startPrank(owner);
        rastroDid.setPermission(true, info);
        RastroDid.InfoChip memory storedInfo = rastroDid.getPermissionInfo(true);
        assertEq(storedInfo.user, user1);
        assertEq(storedInfo.KYC, keccak256("KYC for user1"));
        vm.stopPrank();
    }

    function testFailTransferChipWithoutPermission() public {
        uint256 id = 1;

        // User buys a chip
        vm.startPrank(user1);
        rastroDid.buyChip{value: costChip}(id);
        vm.stopPrank();

        // Attempt to transfer without permission set
        vm.startPrank(user1);
        rastroDid.transferChip(id, user2); //vm.expectRevert(RastroDid.PermissionDenied.selector);
        vm.stopPrank();
    }

    function testTransferChipWithPermission() public {
        uint256 id = 1;

        // Owner sets transfer permission for user1
        RastroDid.InfoChip memory permissionInfo = RastroDid.InfoChip({KYC: keccak256("KYC for user1"), user: user1});

        vm.startPrank(owner);
        rastroDid.setPermission(true, permissionInfo);
        vm.stopPrank();

        // User1 buys a chip
        vm.startPrank(user1);
        rastroDid.buyChip{value: costChip}(id);
        assertEq(rastroDid.ownerOf(id), user1);

        // User1 transfers chip to User2
        rastroDid.transferChip(id, user2);
        assertEq(rastroDid.ownerOf(id), user2);
        vm.stopPrank();
    }
}
