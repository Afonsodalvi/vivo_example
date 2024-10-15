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
        rastroDid = new RastroDid();
        vm.stopPrank();
    }

    function testCreateChip() public {
        // Setting up test data
        address[] memory users = new address[](2);
        users[0] = user1;
        users[1] = user2;

        uint256[] memory ids = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2;

        bytes memory KYCuser1 = "KYC for user1";
        bytes memory KYCuser2 = "KYC for user2";
        console.logBytes(KYCuser1);

        RastroDid.InfoChip[] memory infos = new RastroDid.InfoChip[](2); // Should match `users` length
        infos[0] = RastroDid.InfoChip({KYC: KYCuser1, user: user1});
        infos[1] = RastroDid.InfoChip({KYC: KYCuser2, user: user2});

        vm.startPrank(owner);
        rastroDid.createChip(users, ids, infos);
        assertEq(rastroDid.ownerOf(1), user1);
        RastroDid.InfoChip memory infoChip = rastroDid.getInfoChip(1);
        RastroDid.InfoChip memory infoChip2 = rastroDid.getInfoChip(2);
        assertEq(infoChip.user, user1);
        assertEq(infoChip.KYC, "KYC for user1");
        assertEq(infoChip2.user, user2);
        assertEq(infoChip2.KYC, "KYC for user2");
        vm.stopPrank();
    }

    function testFailCreateChipWithMismatchArrayLengths() public {
        // Setting up invalid data with mismatched array lengths
        address[] memory users = new address[](3);
        users[0] = user1;

        uint256[] memory ids = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2;

        bytes memory KYCuser1 = "KYC for user1";

        RastroDid.InfoChip[] memory infos = new RastroDid.InfoChip[](1); // Should match `users` length
        infos[0] = RastroDid.InfoChip({KYC: KYCuser1, user: user1});

        vm.startPrank(owner);
        rastroDid.createChip(users, ids, infos); // This should revert with ArrayLengthMismatch
        vm.stopPrank();
    }

    function testBuyChip() public {
        uint256 chipId = 3;
        bytes memory KYCdata = "KYC for user1";

        RastroDid.InfoChip memory info = RastroDid.InfoChip({KYC: KYCdata, user: user1});

        vm.startPrank(user1);
        rastroDid.buyChip{value: costChip}(chipId, info);
        assertEq(rastroDid.ownerOf(chipId), user1);

        RastroDid.InfoChip memory storedInfo = rastroDid.getInfoChip(chipId);
        assertEq(storedInfo.user, user1);
        assertEq(storedInfo.KYC, KYCdata);
        vm.stopPrank();
    }

     function testFailBuyChipWithInsufficientFunds() public {
        uint256 chipId = 4;
        bytes memory KYCdata = "KYC for user1";
        
        RastroDid.InfoChip memory info = RastroDid.InfoChip({KYC: KYCdata, user: user1});

        vm.startPrank(user1);
        rastroDid.buyChip{value: costChip - 0.0001 ether}(chipId, info); // This should revert due to insufficient funds
        vm.stopPrank();
    }

    function testSetAndGetPermission() public {
        uint256 idUser = 1;

        // Set permission and check permission status
        rastroDid.setPermission(true, idUser);
        assertTrue(rastroDid.getPermissionInfo(idUser));

        rastroDid.setPermission(false, idUser);
        assertFalse(rastroDid.getPermissionInfo(idUser));
    }

    function testTransferChipWithPermission() public {
        uint256 chipId = 5;
        bytes memory KYCdata = "KYC for user1";
        bytes memory updatedKYC = "Updated KYC for user1";

        RastroDid.InfoChip memory originalInfo = RastroDid.InfoChip({KYC: KYCdata, user: user1});
        RastroDid.InfoChip memory updatedInfo = RastroDid.InfoChip({KYC: updatedKYC, user: user1});

        // Buy a chip for user1
        vm.startPrank(user1);
        rastroDid.buyChip{value: costChip}(chipId, originalInfo);
        vm.stopPrank();

        // Grant permission for user1's chip transfer
        rastroDid.setPermission(true, chipId);

        // Transfer chip from user1 to user2 with updated KYC
        vm.startPrank(user1);
        rastroDid.transferChip(chipId, user2, updatedInfo);
        assertEq(rastroDid.ownerOf(chipId), user2);

        RastroDid.InfoChip memory storedInfo = rastroDid.getInfoChip(chipId);
        assertEq(storedInfo.user, user1);
        assertEq(storedInfo.KYC, updatedKYC);
        vm.stopPrank();
    }

    function testFailTransferChipWithoutPermission() public {
        uint256 chipId = 6;
        bytes memory KYCdata = "KYC for user1";
        bytes memory updatedKYC = "Updated KYC for user1";

        RastroDid.InfoChip memory originalInfo = RastroDid.InfoChip({KYC: KYCdata, user: user1});
        RastroDid.InfoChip memory updatedInfo = RastroDid.InfoChip({KYC: updatedKYC, user: user1});

        // Buy a chip for user1
        vm.startPrank(user1);
        rastroDid.buyChip{value: costChip}(chipId, originalInfo);
        vm.stopPrank();

        // Attempt to transfer without setting permission
        vm.startPrank(user1);
        //vm.expectRevert(RastroDid.PermissionDenied.selector);
        rastroDid.transferChip(chipId, user2, updatedInfo);
        vm.stopPrank();
    }
}
