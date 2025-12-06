// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPaymentRouter {
    function executeIntent(
        address user,
        address token,
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

contract SubscriptionManager {
    struct Subscription {
        address user;
        address token;
        address to;
        uint256 amount;
        uint256 interval; // seconds
        uint256 nextPaymentTime;
        bool active;
    }

    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed user,
        address indexed to,
        uint256 amount,
        uint256 intervalSeconds
    );

    mapping(uint256 => Subscription) public subscriptions;
    uint256 public subscriptionCount;

    IPaymentRouter public immutable router;

    constructor(address routerAddress) {
        router = IPaymentRouter(routerAddress);
    }

    // ---------------------------------------------------------
    //  Create Subscription
    // ---------------------------------------------------------
    function createSubscription(
        address token,
        address to,
        uint256 amount,
        uint256 intervalSeconds
    ) external returns (uint256) {
        subscriptionCount++;

        subscriptions[subscriptionCount] = Subscription({
            user: msg.sender,
            token: token,
            to: to,
            amount: amount,
            interval: intervalSeconds,
            nextPaymentTime: block.timestamp + intervalSeconds,
            active: true
        });

        emit SubscriptionCreated(
            subscriptionCount,
            msg.sender,
            to,
            amount,
            intervalSeconds
        );

        return subscriptionCount;
    }

    // ---------------------------------------------------------
    // Cancel Subscription
    // ---------------------------------------------------------
    function cancelSubscription(uint256 id) external {
        require(subscriptions[id].user == msg.sender, "Not owner");
        subscriptions[id].active = false;
    }

    // ---------------------------------------------------------
    // AI Agent triggers this
    // ---------------------------------------------------------
    function processSubscription(
        uint256 id,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        Subscription storage sub = subscriptions[id];

        require(sub.active, "Inactive");
        require(block.timestamp >= sub.nextPaymentTime, "Not due");

        // Execute router call (AI-Agent intent)
        router.executeIntent(
            sub.user,
            sub.token,
            sub.to,
            sub.amount,
            deadline,
            v,
            r,
            s
        );

        // Move next payment date
        sub.nextPaymentTime += sub.interval;
    }
}
