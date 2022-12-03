// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract kiritsu is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 public id;

    bytes32 public jobId;
    uint256 private fee;
    struct blocks {
        uint256 stake;
        uint256 gameId;
        uint256 steamId;
        uint256 startTime;
        uint256 endTime;
    }
    struct packaged {
        address sender;
        blocks task;
        uint256 taskId;
    }

    mapping(address => blocks[]) public inChallenge;
    mapping(address => uint256) public failed;
    mapping(bytes32 => packaged) public apiId;

    function task(
        uint256 _time,
        uint256 _appId,
        uint256 _steamid
    ) public payable {
        inChallenge[msg.sender].push(
            blocks(
                msg.value,
                _appId,
                _steamid,
                block.timestamp,
                block.timestamp + _time
            )
        );
    }

    event RequestFirstId(bytes32 indexed requestId, uint256 id);

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        jobId = "ca98366cc7314957b8c012c72f05aeeb";

        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    function requestGameTime(
        string memory _path,
        string memory _api,
        packaged memory _taskDetails
    ) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        req.add("get", _api);

        req.add("path", _path);
        int256 timesAmount = 1**18;
        req.addInt("times", timesAmount);
        bytes32 producedRequestId = sendChainlinkRequest(req, fee);
        apiId[producedRequestId] = _taskDetails;
        return producedRequestId;

        // Sends the request
    }

    function refresh(uint256 idn) public returns (bytes32) {
        packaged memory temp = packaged(
            msg.sender,
            inChallenge[msg.sender][idn],
            idn
        );
        string memory game = string(
            abi.encodePacked(
                "response,games,",
                Strings.toString(temp.task.gameId),
                ",rtime_last_played"
            )
        );
        string memory api = string(
            abi.encodePacked(
                "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=EA45A8AEDC3D19B5837D6FCA71ECD2C8&steamid=",
                Strings.toString(temp.task.steamId),
                "&format=json&include_played_free_games=true"
            )
        );
        return requestGameTime(game, api, temp);
    }

    function fulfill(bytes32 _requestId, uint256 _id)
        public
        recordChainlinkFulfillment(_requestId)
    {
        emit RequestFirstId(_requestId, _id);
        id = _id;
        packaged memory temp = apiId[_requestId];

        if (_id > temp.task.startTime && _id < temp.task.endTime) {
            failed[temp.sender] += temp.task.stake;

            delete inChallenge[temp.sender][temp.taskId];
        } else if (block.timestamp > temp.task.endTime) {
            delete inChallenge[temp.sender][temp.taskId];
            payable(temp.sender).transfer(temp.task.stake);
        }
        delete apiId[_requestId];
    }
}
