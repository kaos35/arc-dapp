// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Basit, stack-safe Allowance Vault
// Kullanıcı → Router → Hedef adres için limit koyar
contract AllowanceVault {
    struct Rule {
        uint256 maxPerTx;      // Bir işlemde en fazla
        uint256 maxDaily;      // Günlük limit
        uint256 maxMonthly;    // Aylık limit
        uint256 lastDay;       // Son gün (timestamp)
        uint256 spentToday;    // Bugün harcanan
        uint256 spentMonth;    // Bu ay harcanan
    }

    address public router; // PaymentRouter’ın adresi

    mapping(address => mapping(address => Rule)) public rules;
    // owner → target → rule

    constructor(address _router) {
        router = _router;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "Only router");
        _;
    }

    // Kullanıcı bir hedef adres için limit belirler
    function setRule(
        address target,
        uint256 maxPerTx,
        uint256 maxDaily,
        uint256 maxMonthly
    ) external {
        rules[msg.sender][target] = Rule({
            maxPerTx: maxPerTx,
            maxDaily: maxDaily,
            maxMonthly: maxMonthly,
            lastDay: block.timestamp,
            spentToday: 0,
            spentMonth: 0
        });
    }

    // Router ödeme yapmak ister → limitleri kontrol eder
    function checkAndConsume(
        address owner,
        address target,
        uint256 amount
    ) external onlyRouter {

        Rule storage r = rules[owner][target];

        require(amount <= r.maxPerTx, "Over per-tx limit");

        // Yeni gün mü?
        if (block.timestamp - r.lastDay >= 1 days) {
            r.lastDay = block.timestamp;
            r.spentToday = 0;
        }

        // Günlük limit
        require(r.spentToday + amount <= r.maxDaily, "Over daily limit");

        // Aylık limit
        require(r.spentMonth + amount <= r.maxMonthly, "Over monthly limit");

        // Tüket
        r.spentToday += amount;
        r.spentMonth += amount;
    }
}
