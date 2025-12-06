// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ==========================================================
       PAYMENT ROUTER — AI-AGENT INTENT BASED TRANSFERS
       Arc Testnet için optimize edilmiş sürüm (V2)
       → AllowanceVault entegrasyonlu
    ==========================================================
*/

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

import "./AllowanceVault.sol";

contract PaymentRouter {
    // Kullanıcı → nonce
    mapping(address => uint256) public nonces;

    // AllowanceVault referansı
    AllowanceVault public allowanceVault;

    // EIP712 Tip Hash
    bytes32 public constant INTENT_TYPEHASH = keccak256(
        "PaymentIntent(address user,address token,address to,uint256 amount,uint256 nonce,uint256 deadline)"
    );

    // Domain Separator
    bytes32 public DOMAIN_SEPARATOR;

    // ----------------------------------------------------------
    // CONSTRUCTOR - yeni sürüm (V2)
    // ----------------------------------------------------------
    constructor(address _allowanceVault) {
        allowanceVault = AllowanceVault(_allowanceVault);

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("ArcPaymentRouter")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // ======================================================
    // MAIN: Intent Execute + Limit Kontrolü (AllowanceVault)
    // ======================================================
    function executeIntent(
        address user,
        address token,
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp <= deadline, "Intent expired");

        uint256 currentNonce = nonces[user];

        // Struct hash
        bytes32 structHash = keccak256(
            abi.encode(
                INTENT_TYPEHASH,
                user,
                token,
                to,
                amount,
                currentNonce,
                deadline
            )
        );

        // Digest
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        // Recover signature
        address recovered = ecrecover(digest, v, r, s);
        require(recovered == user, "Invalid signature");

        // Nonce artır
        nonces[user]++;

        // ================================================
        // ⭐ LIMIT KONTROLÜ (AllowanceVault)
        // ================================================
        allowanceVault.checkAndConsume(user, to, amount);

        // ================================================
        // TOKEN TRANSFERİ
        // ================================================
        require(
            IERC20(token).transfer(to, amount),
            "Token transfer failed"
        );
    }
}
