// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title RastroDid
 * @dev A demonstration contract for managing user KYC data and ownership with permission-based mapping and NFT issuance.
 */
contract RastroDid is ERC721, Ownable {
    struct InfoChip {
        bytes32 KYC; // KYC hash representing user data validation
        address user; // Associated user's address
    }

    // Chip cost in wei (0.001 ether)
    uint256 public constant COST_CHIP = 0.001 ether;

    // Mapping from permission status to user InfoChip
    mapping(bool => InfoChip) private usePermit;

    // Mapping from token ID to user InfoChip
    mapping(uint256 => InfoChip) private idUser;

    // Event to notify about chip transfer events
    event ChipTransferred(uint256 indexed chipId, address indexed user);
    event ChipPurchased(uint256 indexed chipId, address indexed buyer);

    // Error indicating array length mismatch in `createChip` function
    error ArrayLengthMismatch();
    // Error indicating a permission requirement violation
    error PermissionDenied();

    /**
     * @dev Constructor that sets the contract owner and initializes the ERC721 token.
     * @param _owner The address of the owner.
     */
    constructor(address _owner) ERC721("Vivo", "NFT_Vivo") Ownable(_owner) {
        transferOwnership(_owner);
    }

    /**
     * @notice Creates and assigns InfoChips and mints NFTs for a list of users.
     * @dev Requires `_users`, `_idUser`, and `info` arrays to have equal lengths.
     *      Mints an NFT for each user with their ID and assigns InfoChip data.
     * @param _users Array of addresses to assign InfoChips to.
     * @param _idUser Array of IDs corresponding to each InfoChip.
     * @param info Array of `InfoChip` structs containing user data.
     */
    function createChip(address[] memory _users, uint256[] memory _idUser, InfoChip[] memory info) external onlyOwner {
        if (_users.length != _idUser.length || _users.length != info.length) {
            revert ArrayLengthMismatch();
        }

        // Store each user info and mint NFTs
        for (uint256 i = 0; i < _idUser.length; i++) {
            idUser[_idUser[i]] = info[i];
            _safeMint(_users[i], _idUser[i]);
        }
    }

    /**
     * @notice Allows a user to buy a chip by minting a new NFT for the sender.
     * @dev Requires a payment equal to `COST_CHIP`.
     * @param _idChip The ID for the new chip (NFT) being purchased.
     */
    function buyChip(uint256 _idChip) external payable {
        require(msg.value >= COST_CHIP, "Incorrect ether amount sent");
        _safeMint(msg.sender, _idChip);
        emit ChipPurchased(_idChip, msg.sender);
    }

    /**
     * @notice Transfers the ownership of a specified chip (NFT).
     * @dev Requires that the caller is the owner of the token.
     *      Only allowed if the caller has permission in `usePermit`.
     * @param chipId The ID of the chip to transfer.
     * @param to The address of the new owner.
     */
    function transferChip(uint256 chipId, address to) external {
        // Check if the permission is active for the caller
        if (usePermit[true].user != msg.sender) revert PermissionDenied();

        // Validate ownership and perform transfer
        require(ownerOf(chipId) == msg.sender, "Only chip owner can transfer.");
        _transfer(msg.sender, to, chipId);
        emit ChipTransferred(chipId, to);
    }

    /**
     * @notice Sets permission for a specific InfoChip.
     * @dev Maps a permission status to a user InfoChip. Only callable by the owner.
     * @param permit The boolean permission to set.
     * @param info The InfoChip struct to associate with the permission.
     */
    function setPermission(bool permit, InfoChip calldata info) external onlyOwner {
        usePermit[permit] = info;
    }

    /**
     * @notice Retrieves the owner of a specified chip (NFT).
     * @param chipId The ID of the chip.
     * @return The address of the chip's owner.
     */
    function getOwnerChip(uint256 chipId) external view returns (address) {
        return ownerOf(chipId);
    }

    /**
     * @notice Retrieves InfoChip data associated with a specific token ID.
     * @param chipId The ID of the chip.
     * @return The InfoChip struct associated with the chip.
     */
    function getInfoChip(uint256 chipId) external view returns (InfoChip memory) {
        return idUser[chipId];
    }

    /**
     * @notice Retrieves InfoChip data associated with a permission status.
     * @param permit The permission status to query.
     * @return The InfoChip struct associated with the permission status.
     */
    function getPermissionInfo(bool permit) external view returns (InfoChip memory) {
        return usePermit[permit];
    }
}
