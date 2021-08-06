pragma ton-solidity >=0.43.0;

enum Status {
    Success, ZeroKey, EmptySubscription, InvalidSigningBoxHandle,
    MultisigFailed, LowWalletBalance, InactiveWallet, WalletFrozen
}

interface ISubsManCallbacks {
    function onSubscriptionDeploy(Status status, address addr) external;
}

interface ISubsManCallbacksService {
    function onSubscriptionServiceDeploy(Status status, address addr) external;
}

interface IonQuerySubscriptions {
    function onQuerySubscriptions(uint256[] keys) external;
}

interface IonQuerySubscribers {
    function onQuerySubscribers(uint256[] keys) external;
}
